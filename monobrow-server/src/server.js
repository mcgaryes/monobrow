var _ = require("underscore");
var EventEmitter = require("events").EventEmitter;
var net = require('net');
var Util = require("util");

var Logger = require("./logger");
var ConnectionManager = require("./connection-manager");
var ServerConstants = require("./constants").ServerConstants;

/**
 * Monobrow server constructor. The server handles the creation of a nodejs socket
 * server as well as as an instance of the monobrow connection manager.
 * @class Server
 * @constructor
 */
var Server = module.exports = function(options) {

	// initialize the server
	this.__initialize(options);

	// extend the instance with the passed options
	_.extend(this, options);
};

Server.prototype = Object.create(EventEmitter.prototype, {

	// ============================================================
	// === Private Getters / Setters ==============================
	// ============================================================

	/**
	 * @property _address
	 * @type String
	 * @private
	 */
	_address: {
		get: function() {
			return this._server.address().address + ":" + this._server.address().port;
		}
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

			// scoped reference of the monobrow server
			var delegate = this;

			// create our socket server for connection clients
			var server = this._server = net.createServer(function(socket) {
				delegate._manager.handleSocketConnection.call(delegate._manager, socket);
			});

			server.on("error", function(e) {
				if (e.code === "EADDRINUSE") {
					Logger.error("The port and host are already in use.");
				}
			});

			// start listening on port and host
			server.listen(this.port, this.host, function() {
				Logger.log("Monobrow server is running on " + delegate._address + ".");
				delegate.emit(Server.STATE_CHANGE, Server.RUNNING);
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

			// create manager
			var manager = this._manager = new ConnectionManager();

			// add event listeners that will in turn dispatch events of their own
			manager.on(ConnectionManager.CONNECTION_MADE, function(connection) {
				delegate.emit(Server.CLIENT_DID_CONNECT);
			});

			manager.on(ConnectionManager.CONNECTION_LOST, function(connection) {
				delegate.emit(Server.CLIENT_DID_DISCONNECT, connection);
			});

			delegate.emit(Server.STATE_CHANGE, Server.INITIALIZED);
		}
	}
});

// extend the server with the server constants
_.extend(Server, ServerConstants);