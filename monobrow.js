(function() {

    "use strict";

    // ============================================================
    // === Requirments ============================================
    // ============================================================

    var color = require("ansi-color").set;
    var fs = require("fs");
    var _ = require("underscore");
    var Backbone = require("backbone");

    // ============================================================
    // === Variables ==============================================
    // ============================================================

    var Monobrow = module.exports = {};

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
    // === Manager ================================================
    // ============================================================

    /**
     * Manages connections for the socket server.
     * @class Manager
     * @constructor
     * @private
     */
    var Manager = function(options) {
        this._connections = [];
        this.options = options;
        _.extend(this, _.pick(this.options, ["logger"]));
    };

    Manager.prototype = Object.create(Backbone.Events, {

        /**
         * Called when a socket trys to connect to the server.
         * @method onConnection
         * @param {net.Socket} connection
         */
        onConnection: {
            value: function(connection) {

                // if we'll allow the connection or not
                if (!this.isConnectionAllowed(connection)) {
                    connection.error();
                    var remoteAddress = connection.remoteAddress + ":" + connection.remotePort;
                    this.logger.error("Monobrow refused connection from " + remoteAddress);
                    return;
                }

                var delegate = this;

                // connection made
                this.addConnection(connection);

                // listen for data from emitter
                connection.on("data", function(buffer) {
                    // here we need to determain if there is anyway that we can
                    // just send data to certain connections ? I honestly think it would
                    // be more benificial just to send it to everyone.
                    // emit to all
                    delegate.broadcast(buffer);
                });

                connection.on("error", function(error) {
                    delegate.logger.error(error.toString());
                });

                // connection closed
                connection.on("close", function(hadError) {
                    delegate.removeConnection(connection);
                });

            }
        },

        /**
         * Checks to see if the connection should be allowed
         * or not. This is based on whitelisted domains and IP
         * addresses in the server config.
         * @method isConnectionAllowed
         * @param {net.Socket} connection
         * @return Boolean Whether the connection is allowed or not
         */
        isConnectionAllowed: {
            value: function(connection) {
                return true;
            }
        },

        /**
         * Adds a connection from the manager.
         * @method addConnection
         * @param {net.Socket} connection
         */
        addConnection: {
            value: function(connection) {
                this._connections.push(connection);
                this.logger.log("Connection added. " + this._connections.length + " total connection(s).");
                this.trigger(Manager.CONNECTION_MADE, connection);
            }
        },

        /**
         * Removes a connection from the manager.
         * @method removeConnection
         * @param {net.Socket} connection
         */
        removeConnection: {
            value: function(connection) {
                this._connections = _.filter(this._connections, function(c, index) {
                    if (c.remotePort === connection.remotePort) {
                        this.logger.log("Connection removed. " + (this._connections.length - 1) + " total connection(s) remaining.");
                        this.trigger(Manager.CONNECTION_LOST, connection);
                    }
                    return c.remotePort !== connection.remotePort;
                }, this);
            }
        },

        /**
         * Broadcasts a message to all connections.
         * @method broadcast
         * @param {String} message
         */
        broadcast: {
            value: function(message) {
                // this.logger.log("Broadcasting message to " + this._connections.length + " connections.");
                _.each(this._connections, function(connection) {
                    connection.write(message);
                });
            }
        }
    });

    // ============================================================
    // === Manager Events =========================================
    // ============================================================

    /**
     * @property CONNECTION_MADE
     * @type String
     * @static
     */
    Manager.CONNECTION_MADE = "connectionMadeEvent";

    /**
     * @property CONNECTION_LOST
     * @type String
     * @static
     */
    Manager.CONNECTION_LOST = "connectionLostEvent";

    // ============================================================
    // === Server =================================================
    // ============================================================

    /**
     * @class Server
     * @constructor
     */
    var Server = Monobrow.Server = function(options) {

        // initialize the server
        this.__initialize(options);

        // extend the instance with the passed options
        _.extend(this, options);
    };

    Server.prototype = Object.create(Backbone.Events, {

        // ============================================================
        // === Public Properties ======================================
        // ============================================================

        /**
         * The host the socket server will start up on
         * @property host
         * @type String
         * @default localhost
         */
        host: {
            value: "localhost",
            writable: true
        },

        /**
         * The port the socket server will start up on
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
         * Starts the TCP server on the specified port and host
         * @method start
         */
        start: {
            value: function() {

                var net = require('net');
                var manager = this._manager;
                var delegate = this;

                // create our socket server for connection clients
                var server = net.createServer(function(connection) {
                    manager.onConnection.call(manager, connection);
                });

                // start listening on port and host
                server.listen(this.port, this.host, function() {
                    delegate._logger.log("Monobrow server is running on " + delegate.host + ":" + delegate.port + ".");
                });
            }
        },

        // ============================================================
        // === Private Methods ========================================
        // ============================================================

        /**
         * Initialized the server instance
         * @method __initialize
         * @param {Object} options The options passed through the constructor
         * @private
         */
        __initialize: {
            value: function(options) {

                // delegate reference for scoping
                var delegate = this;

                // create logger
                var logger = this._logger = new Logger(options);

                // create manager
                var manager = this._manager = new Manager({
                    logger: logger
                });

                // add event listeners that will in turn dispatch events of their own
                manager.on(Manager.CONNECTION_MADE, function(connection) {
                    delegate.trigger(Server.CLIENT_DID_CONNECT, connection);
                });

                manager.on(Manager.CONNECTION_LOST, function(connection) {
                    delegate.trigger(Server.CLIENT_DID_DISCONNECT, connection);
                });
            }
        }
    });

    // ============================================================
    // === Server Events ==========================================
    // ============================================================

    /**
     * @property CLIENT_DID_CONNECTED
     * @type String
     * @static
     */
    Server.CLIENT_DID_CONNECT = "clientDidConnect";

    /**
     * @property CLIENT_DID_DISCONNECT
     * @type String
     * @static
     */
    Server.CLIENT_DID_DISCONNECT = "clientDidDisconnect";

}).call(this);
