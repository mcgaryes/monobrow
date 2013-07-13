var _ = require("underscore");
var EventEmitter = require("events").EventEmitter;
var net = require('net');
var Logger = require("./logger");
var Util = require("util");

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

    // ============================================================
    // === Public Methods =========================================
    // ============================================================

    /**
     * Connects the client to the remote socket server.
     * @method connect
     */
    connect: {
        value: function() {
            if (this._state !== Client.CONNECTED) {

                if (_.isUndefined(this.port) && _.isUndefined(this.host)) {

                    Logger.error("Client must specify at least a port");
                } else {

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
            if (this._state === Client.CONNECTED) {

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
    sendMessage: {
        value: function(type, data) {
            if (this._state === Client.CONNECTED) {

                if (!_.isUndefined(type)) {

                    if (_.isString(type)) {

                        this._socket.write(JSON.stringify({
                            type: type,
                            data: data
                        }));
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

            this._state = Client.INITIALIZED;

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
            this._state = Client.CONNECTED;
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

            //try {

                // need to handle multiple messages that may be attached to the same write
                var clean = String($data).replace(/\s+/gi, '');
                var messages = clean.split("~~~");

                // itterate through all of the messages and emit the appropriate event
                for (var i = 0; i < messages.length; i++) {

                    if (messages[i] === "") {
                        // this is an empty message that we will not use
                        return;
                    }

                    var message = JSON.parse(messages[i]);
                    var type;
                    var body;

                    if (message.hasOwnProperty("type")) {

                        // assign the data type to the event
                        type = message.type;
                    }

                    if (message.hasOwnProperty("data")) {

                        // if the incoming data has a data attribute assign it to our body property
                        body = message.data;
                    }

                    if (type) {

                        if (body) {

                            // emit the message with both a type and body
                            this.emit(type, body);
                        } else {

                            // emit the message with only a type, so essential the body is
                            // null (in some clients) or undefined
                            this.emit(type);
                        }

                    } else {

                        // if we didnt have a type then we're simply going to log the issue
                        Logger.error("Could not process incoming data, it doesn't appear to have a 'type'.");
                    }
                }
            //} catch (e) {

                // if we couldnt perform any of the above functionality the report the error incurred
              //  Logger.error(e.message);
            //}
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
                this._state = Client.ERROR;
                this.emit(Client.STATE_CHANGE, this._state, this._previousState);
            } else {
                Logger.log("Client disconnected from " + this.address + ".");
                this._state = Client.DISCONNECTED;
                this.emit(Client.STATE_CHANGE, this._state, this._previousState);
            }
        }
    }
});

/**
 * State change event fired on a state change of the client.
 * @property CHANGE_EVENT
 * @type String
 * @static
 * @for Client
 */
Client.STATE_CHANGE = "stateChangeEvent";

/**
 * The client is connected to the remote socket server.
 * @property CONNECTED
 * @type String
 * @static
 * @for Client
 */
Client.INITIALIZED = "initialized";

/**
 * The client is connected to the remote socket server.
 * @property CONNECTED
 * @type String
 * @static
 * @for Client
 */
Client.CONNECTED = "connected";

/**
 * The client has diconnected from the remote socket server.
 * @property DISCONNECTED
 * @type String
 * @static
 * @for Client
 */
Client.DISCONNECTED = "disconnected";

/**
 * The client has encountered an error connecting to the remote socket server.
 * @property ERROR
 * @type String
 * @static
 * @for Client
 */
Client.ERROR = "error";