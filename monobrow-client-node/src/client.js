var _ = require("underscore");
var EventEmitter = require("events").EventEmitter;
var net = require('net');
var Logger = require("./logger");
var Util = require("util");
var Constants = require("./constants");

/**
 * Client for connecting to a Monobrow server.
 * @class Client
 * @constructor
 */
var Client = module.exports = function(options) {

    // initialize the client
    this.__initialize();

    // extend our instance with the passed options
    _.extend(this, options);
};

Client.prototype = Object.create(EventEmitter.prototype, {

    // ============================================================
    // === Public Properties ======================================
    // ============================================================

    /**
     * Public getter for the current state of the client.
     * @property state
     * @type String
     */
    state: {
        get: function() {
            return this._state;
        }
    },

    /**
     * Public getter for the previous state of the client.
     * @property previousState
     * @type String
     */
    previousState: {
        get: function() {
            return this._previousState;
        }
    },

    /**
     * The address the client is pointing as
     * @property address
     * @type String
     */
    address: {
        get: function() {

            var host = this.host;
            if (_.isUndefined(host)) {
                host = "localhost";
            }

            if (_.isUndefined(this.port)) {
                return host;
            }

            return host + ":" + this.port;
        }
    },

    /**
     * The total number of siblings a client has. A sibling is considered any
     * connection that sits beside this client on the server (so another connection
     * to the same server).
     * @property totalSiblings
     * @type Number
     */
    totalSiblings: {
        get: function() {
            // subtract ourselves from the total
            return this._totalSiblings - 1;
        }
    },

    // ============================================================
    // === Public Methods =========================================
    // ============================================================

    /**
     * Connects the client to the remote socket server.
     * @method connect
     */
    connect: {
        value: function() {
            if (this._state !== Client.STATE_CONNECTED) {
                if (_.isUndefined(this.port) && _.isUndefined(this.host)) {
                    Logger.error("Client must specify at least a port");
                } else {
                    //  if (_.isUndefined(this.port)) {
                    //  this._socket.connect();
                    // } else {

                    this._socket.connect(this.port, this.host);
                }
            } else {
                Logger.warn("Client is already connected to the server.");
            }
        }
    },

    /**
     * Diconnects the client from the remote socket server.
     * @method disconnect
     */
    disconnect: {
        value: function() {
            if (this._state === Client.STATE_CONNECTED) {
                throw "Disconnect not yet implemented.";
            }
        }
    },

    /**
     * Emits a message to the server the client is connected to.
     * @method emit
     * @param {String} type The type of event being triggered
     * @param {Object} data *Optional* - The data you want to pass as the body of the event
     */
    trigger: {
        value: function(type, data) {
            if (this._state === Client.STATE_CONNECTED) {
                if (!_.isUndefined(type)) {
                    if (_.isString(type)) {
                        try {
                            this._socket.write(JSON.stringify({
                                type: type,
                                data: JSON.stringify(data)
                            }));
                        } catch (e) {
                            Logger.error(e.message);
                        }
                    } else {
                        Logger.warn("Message not sent. Type must be a string.");
                    }
                } else {
                    Logger.warn("Message not sent. You must specify at least a type.");
                }
            } else {
                Logger.warn("Message not sent. Client must be connected to emit a message.");
            }
        }
    },

    // ============================================================
    // === Public Methods =========================================
    // ============================================================

    /**
     * Initialization functionality for the client instance. Sets its initial
     * state and creates and adds event listeners to a new socket.
     * @method __initialize
     * @private
     */
    __initialize: {
        value: function() {

            this._state = Client.STATE_INITIALIZED;

            // create the socket server we'll use to connect to the server with
            this._socket = net.Socket();

            // assing a delegate for use with the listener callbacks
            var delegate = this;

            // add listeners for the socket instance
            this._socket.on("error", function(e) {
                delegate.__handleSocketError(e);
            });

            this._socket.on("connect", function() {
                delegate.__handleSocketConnect();
            });

            this._socket.on("data", function(data) {
                delegate.__handleSocketData(data);
            });

            this._socket.on("close", function(hasError) {
                delegate.__handleSocketClose(hasError);
            });

        }
    },

    /**
     * This method is just used for logging purposes. If an error occurs
     * the close method is called immediately after and we'll handle
     * triggering the state change there, not here.
     * @method __handleSocketError
     * @param {Object} e Socket error object
     * @private
     */
    __handleSocketError: {
        value: function(e) {
            if (e.code === "EADDRNOTAVAIL") {
                Logger.error("Server not available at " + this.address + ".");
            } else if (e.code === "ECONNREFUSED") {
                Logger.error("The connection to " + this.address + " was refused.");
            } else if (e.code === "ENOENT") {
                Logger.error("Domain does not exist or lookup failure.");
            } else {
                Logger.error(e.code);
            }
        }
    },

    /**
     * Handler functionality for when the client socket instance connects to the server.
     * @method __handleSocketConnect
     * @private
     */
    __handleSocketConnect: {
        value: function() {
            Logger.log("Client connected to " + this.address + ".");
            this._previousState = this._state;
            this._state = Client.STATE_CONNECTED;
            this.emit(Client.STATE_CHANGE, this._state, this._previousState);
        }
    },

    /**
     * Handler functionality for when the client socket instance recieves data from
     * the server. This is the single entry point for data and the data recieved is only
     * handled if structured correctly with a `type` and `data` attribute on the
     * incoming data object.
     * @method __handleSocketData
     * @param {Buffer} data The raw data sent from the server
     * @private
     */
    __handleSocketData: {
        value: function($data) {

            try {

                // test multiple message at once
                // data = '{"type":"dataEvent","data":"{}"}{"type":"someothertype","data":"{}"}';

                // smart content data
                //data = '{"type":"smartAnalysisDidUpdate","data":"{\"predominantGender\":0,\"predominantEmotion\":1,\"totalFaces\":2,\"predominantAge\":0}"}';

                // need to handle multiple messages that may be attached to the same write
                var clean = String($data).replace(/\s+/gi, '');
                var types = clean.match(/\"type\":/g);
                var messages = [];
                if (types && types.length > 1) {
                    messages = clean.match(/\{(.*?)"\}/g);
                } else {
                    messages.push(clean);
                }

                // itterate through all of the messages and emit the appropriate event
                for (var i = 0; i < messages.length; i++) {

                    var data = JSON.parse(messages[i]);
                    var type;
                    var body;
                    var pBody;

                    if (data.hasOwnProperty("type")) {
                        // assign the data type to the event
                        type = data.type;
                    }

                    if (data.hasOwnProperty("data")) {
                        // if the incoming data has a data attribute assign it to our body property
                        body = data.data;
                        pBody = JSON.parse(body);
                    }

                    if (type) {
                        if (type === "myidis") {
                            this.cid = pBody.cid;
                        } else if (type === "clientAdded") {
                            this._totalSiblings = pBody.total;
                            this.emit(Client.SIBLING_ADDED_EVENT, pBody.cid);
                        } else if (type === "clientRemoved") {
                            this._totalSiblings = pBody.total;
                            this.emit(Client.SIBLING_REMOVED_EVENT, pBody.cid);
                        } else {
                            if (body) {
                                // emit the message with both a type and body
                                this.emit(type, body);
                            } else {
                                // emit the message with only a type, so essential the body is
                                // null (in some clients) or undefined
                                this.emit(type);
                            }
                        }
                    } else {
                        // if we didnt have a type then we're simply going to log the issue
                        Logger.error("Could not process incoming data, it doesn't appear to have a 'type'.");
                    }
                }
            } catch (e) {
                // if we couldnt perform any of the above functionality the report the error incurred
                Logger.error(e.message);
            }
        }
    },

    /**
     * Handler functionality for when the socket connection is closed. Fires a
     * state error state change event if the socket was closed due to error. If there
     * was no error then the handler dispatches a disconnected state change event.
     * @method __handleSocketClose
     * @param {Object} error Socket error object
     * @private
     */
    __handleSocketClose: {
        value: function(hasError) {
            this._previousState = this._state;
            if (hasError) {
                this._state = Client.STATE_ERROR;
                this.emit(Client.STATE_CHANGE, this._state, this._previousState);
            } else {
                Logger.log("Client disconnected from " + this.address + ".");
                this._state = Client.STATE_DISCONNECTED;
                this.emit(Client.STATE_CHANGE, this._state, this._previousState);
            }
        }
    }
});

// extend client with constants
_.extend(Client,Constants);