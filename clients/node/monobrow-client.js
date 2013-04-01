(function() {

    "use strict";

    // ============================================================
    // === Requirments ============================================
    // ============================================================

    var color = require("ansi-color").set;
    var fs = require("fs");
    var net = require("net");
    var _ = require("underscore");
    var Backbone = require("backbone");

    // ============================================================
    // === Variables ==============================================
    // ============================================================

    var MonobrowClient = module.exports = {};

    // ============================================================
    // === Logger =================================================
    // ============================================================

    /**
     * Helper prototype for logging manager and server messages,
     * warnings, and errors. Also writes to out and error files if
     * they are specified in the server config
     * @class Logger
     * @constructor
     * @private
     */
    var Logger = function(options) {
        if (options) {
            if (options.out) {
                this._out = options.out;
            }
            if (options.error) {
                this._error = options.error;
            }
        }
    };

    Object.defineProperties(Logger.prototype, {

        /**
         * Getter that grabs and formats the current date and creates
         * a timestamp for use in logging
         * @property _timestamp
         * @type String
         * @for Logger
         * @private
         */
        _timestamp: {
            get: function() {
                var date = new Date();
                var y = date.getFullYear();
                var mo = date.getMonth() > 10 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1);
                var d = date.getDate() > 10 ? date.getDate() : "0" + date.getDate();
                var h = date.getHours() > 10 ? date.getHours() : "0" + date.getHours();
                var mi = date.getMinutes() > 10 ? date.getMinutes() : "0" + date.getMinutes();
                var s = date.getSeconds() > 10 ? date.getSeconds() : "0" + date.getSeconds();
                return y + "." + mo + "." + d + " " + h + ":" + mi + ":" + s;
            }
        },

        /**
         * Console log wrapper that also writes to the out file
         * if it was specified in the server options
         * @method log
         * @param {String} message
         * @for Logger
         */
        log: {
            value: function(message) {
                console.log(color(this._timestamp, "green") + " - " + message);
                if (this._out) {
                    fs.appendFile(this._out, this._timestamp + " - " + message + "\n");
                }
            }
        },

        /**
         * Console warn wrapper that also writes to the out file
         * if it was specified in the server options
         * @method warn
         * @param {String} warning
         * @for Logger
         */
        warn: {
            value: function(warning) {
                console.log(color(this._timestamp, "green") + " - " + color("Warning: ", "yellow+bold") + color(warning, "yellow"));
                if (this._out) {
                    fs.appendFile(this._out, "Warning: " + this._timestamp + " - " + warning + "\n");
                }
            }
        },

        /**
         * Console error wrapper that also writes to the error file
         * if it was specified in the server options
         * @method error
         * @param {String} error
         * @for Logger
         */
        error: {
            value: function(error) {
                console.log(color(this._timestamp, "green") + " - " + color("Error: ", "red+bold") + color(error, "red"));
                if (this._error) {
                    fs.appendFile(this._error, this._timestamp + " - " + error + "\n");
                }
            }
        }
    });

    // ============================================================
    // === Client =================================================
    // ============================================================

    /**
     * Client for connecting to a Monobrow server.
     * @class Client
     * @constructor
     */
    var Client = module.exports = function(options) {

        // create a logger for the client
        var logger = this._logger = new Logger(options);

        // initialize the client
        this.__initialize();

        // extend our instance with the passed options
        _.extend(this, options);

    };

    Client.prototype = Object.create(Backbone.Events, {

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
         * The host the client will connect to
         * @property host
         * @type String
         * @default localhost
         */
        host: {
            value: "localhost",
            writable: true
        },

        /**
         * The port the socket will connect to
         * @property port
         * @type Integer
         * @default 8889
         */
        port: {
            value: 8889,
            writable: true
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
                    this._socket.connect(this.port, this.host);
                } else {
                    this._logger.warn("Client is already connected to the server.");
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
         */
        emit: {
            value: function(message) {
                if (this._state === Client.STATE_CONNECTED) {
                    try {
                        this._socket.write(message);
                    } catch (e) {
                        this._logger.error(e.message);
                    }
                } else {
                    this._logger.warn("Client must be connected to emit a message.");
                }
            }
        },

        // ============================================================
        // === Public Methods =========================================
        // ============================================================

        /**
         *
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
                    this._logger.error("Server not available at " + this.host + ":" + this.port + ".");
                } else if (e.code === "ECONNREFUSED") {
                    this._logger.error("The connection to " + this.host + ":" + this.port + " was refused.");
                }
            }
        },

        /**
         *
         * @method __handleSocketConnect
         * @private
         */
        __handleSocketConnect: {
            value: function() {
                this._logger.log("Client connected to " + this.host + ":" + this.port + ".");
                this._previousState = this._state;
                this._state = Client.STATE_CONNECTED;
                this.trigger(Client.STATE_CHANGE, this._state, this._previousState);
            }
        },

        /**
         *
         * @method __handleSocketData
         * @param {Buffer} data The raw data sent from the server
         * @private
         */
        __handleSocketData: {
            value: function(data) {
                this.trigger(Client.DATA, data);
            }
        },

        /**
         *
         * @method __handleSocketClose
         * @param {Object} error Socket error object
         * @private
         */
        __handleSocketClose: {
            value: function(hasError) {
                this._previousState = this._state;
                if (hasError) {
                    this._state = Client.STATE_ERROR;
                    this.trigger(Client.STATE_CHANGE, this._state, this._previousState);
                } else {
                    this._logger.log("Client disconnected from " + this.host + ":" + this.port + ".");
                    this._state = Client.STATE_DISCONNECTED;
                    this.trigger(Client.STATE_CHANGE, this._state, this._previousState);
                }
            }
        }

    });

    // ============================================================
    // === Events =================================================
    // ============================================================

    /**
     * State change event fired on a state change of the client.
     * @property STATE_CHANGE
     * @type String
     * @static
     */
    Client.STATE_CHANGE = "stateChangeEvent";

    /**
     * The data event is fired when incoming data is recognized. The data
     * passed is the raw buffer. Call toString on the data to get the string
     * representation of the data.
     * @property DATA
     * @type String
     * @static
     */
    Client.DATA = "dataEvent";

    // ============================================================
    // === States =================================================
    // ============================================================

    /**
     * The client is connected to the remote socket server.
     * @property STATE_CONNECTED
     * @type String
     * @static
     */
    Client.STATE_INITIALIZED = "initialized";

    /**
     * The client is connected to the remote socket server.
     * @property STATE_CONNECTED
     * @type String
     * @static
     */
    Client.STATE_CONNECTED = "connected";

    /**
     * The client has diconnected from the remote socket server.
     * @property STATE_DISCONNECTED
     * @type String
     * @static
     */
    Client.STATE_DISCONNECTED = "disconnected";

    /**
     * The client has encountered an error connecting to the remote socket server.
     * @property STATE_ERROR
     * @type String
     * @static
     */
    Client.STATE_ERROR = "error";
}).call(this);
