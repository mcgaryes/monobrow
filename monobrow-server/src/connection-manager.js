var _ = require("underscore");
var EventEmitter = require("events").EventEmitter;

var Logger = require("./logger");
var Connection = require("./connection");
var ConnectionManagerConstants = require("./constants").ConnectionManagerConstants;

/**
 * Manages connections for the socket server.
 * @class ConnectionManager
 * @constructor
 */
var ConnectionManager = module.exports = function(options) {
	ConnectionManager.counter = 0;
	this._connections = [];
	this.options = options;
	_.extend(this, _.pick(this.options, []));
};

ConnectionManager.prototype = Object.create(EventEmitter.prototype, {

	// ============================================================
	// === Public Methods =========================================
	// ============================================================

	/**
	 * Called when a socket trys to connect to the server.
	 * @method handleSocketConnection
	 * @param {net.Socket} socket
	 */
	handleSocketConnection: {
		value: function(socket) {

			// if we'll allow the socket to connect or not
			if (!this.__isConnectionAllowed(socket)) {
				socket.error();
				var remoteAddress = socket.remoteAddress + ":" + socket.remotePort;
				Logger.error("Monobrow refused connection from " + remoteAddress);
				return;
			}

			var delegate = this;

			// create new connection object with
			var connection = new Connection({
				socket: socket
			});

			// connection made
			this.__addConnection(connection);

			// listen for data from emitter
			connection.on("data", function($buffer) {
				delegate.broadcast($buffer);
			});

			connection.on("error", function($e) {
				Logger.error($e.toString());
			});

			// connection closed
			connection.on("close", function($hadError) {
				delegate.__removeConnection(connection);
			});

		}
	},

	/**
	 * Broadcasts a message to all connections.
	 * @method broadcast
	 * @param {Object} message
	 */
	broadcast: {
		value: function($buffer, $omits) {
			_.each(this._connections, function(connection) {

				if (_.isUndefined($omits)) {
					connection.sendMessage(String($buffer));
				} else {
					_.each($omits, function(omit, index) {
						if (omit !== connection.cid) {
							connection.sendMessage(String($buffer));
						}
					});
				}
			});
		}
	},

	// ============================================================
	// === Private Methods ========================================
	// ============================================================

	/**
	 * Checks to see if the connection should be allowed
	 * or not. This is based on whitelisted domains and IP
	 * addresses in the server config.
	 * @method __isConnectionAllowed
	 * @param {Connection} connection
	 * @return Boolean Whether the connection is allowed or not
	 * @private
	 */
	__isConnectionAllowed: {
		value: function(connection) {
			return true;
		}
	},

	/**
	 * Adds a connection from the manager.
	 * @method __addConnection
	 * @param {Connection} connection
	 * @private
	 */
	__addConnection: {
		value: function(connection) {

			// assign and send message with cid to new connection
			// connection.sendMessage({ type: "myidis", data: { cid: connection.cid } });*/

			// broadcast that their has been a sibling added to the server
			// that each connection is on
			// this.broadcast(JSON.stringify({
			// type: "clientAdded",
			// data: JSON.stringify({
			// total: this._connections.length,
			// cid: connection.cid
			// })
			// }), [connection.cid]);

			this._connections.push(connection);
			Logger.log("Connection added. " + this._connections.length + " total connection(s).");
			this.emit(ConnectionManager.CONNECTION_MADE, connection);

		}
	},

	/**
	 * Removes a connection from the manager.
	 * @method __removeConnection
	 * @param {Connection} connection
	 * @private
	 */
	__removeConnection: {
		value: function(connection) {
			this._connections = _.filter(this._connections, function(c, index) {
				if (c.remotePort === connection.remotePort) {
					Logger.log("Connection removed. " + (this._connections.length - 1) + " total connection(s) remaining.");
					this.emit(ConnectionManager.CONNECTION_LOST, connection);
					this.broadcast({
						type: "clientRemoved",
						data: JSON.stringify({
							total: this._connections.length - 1,
							cid: connection.cid
						})
					}, [c.cid]);
				}
				return c.remotePort !== connection.remotePort;
			}, this);
		}
	}
});

_.extend(ConnectionManager, ConnectionManagerConstants);