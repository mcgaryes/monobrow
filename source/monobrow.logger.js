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
