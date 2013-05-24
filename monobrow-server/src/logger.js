var color = require("ansi-color").set;
var _ = require("underscore");
var net = require('net');
var fs = require('fs');

/**
 * Helper prototype for logging manager and server messages,
 * warnings, and errors. Also writes to out and error files if
 * they are specified in the server config
 * @class Logger
 * @constructor
 */
var Logger = function(options) {
	if (Logger.instance) {
		return Logger.sharedInstance;
	}
	Logger.sharedInstance = this;
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

module.exports = new Logger();