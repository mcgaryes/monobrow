var _ = require("underscore");
var EventEmitter = require("events").EventEmitter;
var net = require('net');
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
            return this.host + ":" + this.port;
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
                    throw "You must pass a host and a port";
                } else {
                    this._socket.connect(this.port, this.host);
                }
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
                this.__handleSocketClose();
                this._socket.unref();
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
                    }
                }
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
                delegate.__handleSocketClose(e);
            });

            this._socket.on("connect", function() {
                delegate.__handleSocketConnect();
            });

            this._socket.on("data", function(data) {
                delegate.__handleSocketData(data);
            });

            this._socket.on("close", function(hasError) {
                if (!hasError) delegate.__handleSocketClose();
            });

        }
    },

    /**
     * Handler functionality for when the client socket instance connects to the server.
     * @method __handleSocketConnect
     * @private
     */
    __handleSocketConnect: {
        value: function() {
            this._previousState = this._state;
            this._state = Client.CONNECTED;
            this.emit(Client.STATE_CHANGE, undefined, this._state);
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

            // need to handle multiple messages that may be attached to the same write
            var messages = String($data).split("~~~");

            // itterate through all of the messages and emit the appropriate event
            for (var i = 0; i < messages.length; i++) {
                if (messages[i] === "") return;
                var message = JSON.parse(messages[i]);
                var type = message.type;
                var body = message.data;
                if (type) this.emit(type, body);
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
        value: function(err) {
            this._previousState = this._state;
            this._state = Client.DISCONNECTED;
            if (!err) {
                this.emit(Client.STATE_CHANGE, undefined, this._state);
            } else {
                var error = {
                    code: err.code
                };
                if (err.code === "EADDRNOTAVAIL") {
                    error.message = "Server not available at " + this.address + ".";
                } else if (err.code === "ECONNREFUSED") {
                    error.message = "The connection to " + this.address + " was refused.";
                } else if (err.code === "ENOENT") {
                    error.message = "Domain does not exist or lookup failure.";
                } else {
                    error.message = err.code;
                }
                this.emit(Client.STATE_CHANGE, error, this._state);
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
Client.STATE_CHANGE = "stateChange";


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