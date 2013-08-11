// ============================================================
// === Imports ================================================
// ============================================================

var _ = require("underscore");
var EventEmitter = require("events").EventEmitter;
var net = require('net');
var Util = require("util");
var ConnectionManager = require("./connection-manager");

// ============================================================
// === Server =================================================
// ============================================================

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
	// === Public Getters / Setters ===============================
	// ============================================================

	totalConnections:{
		get:function(){
			return this._manager.totalConnections;
		}
	},

	// ============================================================
	// === Private Getters / Setters ==============================
	// ============================================================

	/**
	 * @property address
	 * @type String
	 * @private
	 */
	address: {
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
				if (e.code === "EADDRINUSE") delegate.emit(Server.ERROR, e);
			});

			// start listening on port and host
			server.listen(this.port, this.host, function() {
				delegate.emit(Server.STATE_CHANGE, Server.RUNNING);
			});

		}
	},

	/**
	 * Starts the TCP server on the specified port and host
	 * @method stop
	 */
	stop:function(){
		throw "'stop' method is not implemented yet.";
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

// ============================================================
// === Server Constants =======================================
// ============================================================

/**
 * @property INITIALIZED
 * @for Server
 * @static
 */
Server.INITIALIZED = "initialized";

/**
 * @property RUNNING
 * @for Server
 * @static
 */
Server.RUNNING = "running";

/**
 * @property STOPPED
 * @for Server
 * @static
 */
Server.STOPPED = "stopped";

/**
 * @property ERROR
 * @for Server
 * @static
 */
Server.ERROR = "error";

/**
 * @property STATE_CHANGE
 * @for Server
 * @static
 */
Server.STATE_CHANGE = "stageChange";

/**
 * @property CLIENT_DID_CONNECT
 * @for Server
 * @static
 */
Server.CLIENT_DID_CONNECT = "clientDidConnect";

/**
 * @property CLIENT_DID_DISCONNECT
 * @for Server
 * @static
 */
Server.CLIENT_DID_DISCONNECT = "clientDidDisconnect";