(function() {

    "use strict";

    // ============================================================
    // === Requirments ============================================
    // ============================================================

    /**
     * We're using ANSI-Color specifically for use with the Logger.
     * @property color
     * @type Object
     */
    var color = require("ansi-color").set;

    /**
     * We're including the fs library specifically for writing
     * to our error and log files.
     * @property fs
     * @type Object
     */
    var fs = require("fs");

    /**
     * @property _
     * @type Object
     */
    var _ = require("underscore");

    /**
     * We'll use Backbone for Backbone.Events
     * @property Backbone
     * @type Object
     */
    var Backbone = require("backbone");

    // ============================================================
    // === Variables ==============================================
    // ============================================================

    /**
     * @namespace Monobrow
     */
    var Monobrow = module.exports = {};

    /**
     * @property Constants
     * @type Object
     * @static
     */
    var Constants = {};

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
         * @private
         */
        _timestamp: {
            get: function() {

                var date = new Date();
                var y = date.getUTCFullYear();
                var mo = date.getUTCMonth() >= 10 ? date.getUTCMonth() + 1 : "0" + (date.getUTCMonth() + 1);
                var d = date.getUTCDate() >= 10 ? date.getUTCDate() : "0" + date.getUTCDate();
                var h = date.getUTCHours() >= 10 ? date.getUTCHours() : "0" + date.getUTCHours();
                var mi = date.getUTCMinutes() >= 10 ? date.getUTCMinutes() : "0" + date.getUTCMinutes();
                var s = date.getUTCSeconds() >= 10 ? date.getUTCSeconds() : "0" + date.getUTCSeconds();

                return y + "." + mo + "." + d + " " + h + ":" + mi + ":" + s;
            }
        },

        /**
         * Console log wrapper that also writes to the out file
         * if it was specified in the server options
         * @method log
         * @param {String} message
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
         * @method log
         * @param {String} warning
         */
        warn: {
            value: function(warning) {
                console.log(color(this._timestamp, "green") + " - " + color(warning, "yellow"));
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
         */
        error: {
            value: function(error) {
                console.log(color(this._timestamp, "green") + " - " + color(error, "red"));
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
    // === Server =================================================
    // ============================================================

    /**
     * @class Server
     * @constructor
     */
    var Server = Monobrow.Server = function(options) {

        // create logger
        var logger = this._logger = new Logger(options);

        // create manager
        this._manager = new Manager({
            logger: logger
        });

        _.extend(this, options);
    };

    Server.prototype = Object.create(Backbone.Events, {

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
        }
    });

}).call(this);
