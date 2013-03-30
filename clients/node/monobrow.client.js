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
     * We're including the fs library specifically for writing
     * to our error and log files.
     * @property fs
     * @type Object
     */
    var net = require("net");

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
    // === Client =================================================
    // ============================================================

    /**
     *
     */
    var Client = module.exports = function(options) {

        var host = this._host = options && options.host ? options.host : "localhost";
        var port = this._port = options && options.port ? options.port : 8889;

        this._connected = false;
        this._socket = net.Socket();
        var delegate = this;

        this._socket.on("end", function() {
            delegate._connected = false;
            delegate.reconnect();
        });

        this._socket.on("error", function() {
            delegate._connected = false;
            delegate.reconnect();
        });

        this._socket.on("data", function(data) {
            delegate.trigger(Client.DATA, data);
        });

        this._socket.on("connect", function() {
            this._state = Client.STATE_CONNECTED;
            delegate._connected = true;
            delegate.trigger(Client.STATE_CHANGE, this._state);
        });
    };

    Client.prototype = Object.create(Backbone.Events, {
        state: {

        },
        connect: {
            value: function() {
                if (!this._connected) {
                    this._socket.connect(this._port, this._host);
                }
            }
        },
        reconnect: {
            value: function() {
                if (!this._connected) {
                    console.log("Client attempting to reconnect to http://" + this._host + ":" + this._port);
                    clearTimeout(this._timeout);
                    this._timeout = undefined;
                    var delegate = this;
                    this._timeout = setTimeout(function() {
                        delegate.connect();
                    }, 1000);
                }
            }
        },
        emit: {
            value: function(message) {
                if (this._connected) {
                    this._socket.write(message);
                }
            }
        }
    });

    Client.STATE_CHANGE = "stateChangeEvent";
    Client.DATA = "dataEvent";

    Client.STATE_CONNECTED = "connected";
    Client.STATE_DISCONNECTED = "disconnected";
    Client.STATE_ERROR = "error";
}).call(this);
