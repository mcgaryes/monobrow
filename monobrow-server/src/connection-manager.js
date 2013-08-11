// ============================================================
// === Imports ================================================
// ============================================================

var _ = require("underscore");
var EventEmitter = require("events").EventEmitter;
var Connection = require("./connection");

// ============================================================
// === Connection Manager =====================================
// ============================================================

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
	// === Public Getters / Setters ===============================
	// ============================================================

	totalConnections: {
		get: function() {
			return this._connections.length;
		}
	},

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
				var address = socket.remoteAddress + ":" + socket.remotePort;
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
			connection.on(Connection.EVENT_DATA, function($buffer) {
				delegate.broadcast($buffer, [connection.cid]);
			});

			// connection error
			connection.on(Connection.EVENT_ERROR, function($e) {
				delegate.__removeConnection(connection);
			});

			// connection closed
			connection.on(Connection.EVENT_CLOSE, function($hadError) {
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
			this._connections.push(connection);
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
			var connectionToRemove;
			this._connections = _.filter(this._connections, function(c, index) {
				if (c.remotePort === connection.remotePort) connectionToRemove = connection;
				return c.remotePort !== connection.remotePort;
			}, this);
			if (!_.isUndefined(connectionToRemove)) {
				this.emit(ConnectionManager.CONNECTION_LOST, connection);
			}
		}
	}
});

// ============================================================
// === Connection Manager Constants ===========================
// ============================================================

/**
 * @property CONNECTION_MADE
 * @for ConnectionManager
 * @static
 */
ConnectionManager.CONNECTION_MADE = "connectionMadeEvent";

/**
 * @property CONNECTION_LOST
 * @for ConnectionManager
 * @static
 */
ConnectionManager.CONNECTION_LOST = "connectionLostEvent";