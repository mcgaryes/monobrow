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
			this.trigger(Manager.CONNECTION_MADE,connection);
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
					this.trigger(Manager.CONNECTION_LOST,connection);
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
