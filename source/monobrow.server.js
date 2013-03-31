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
	 */
	__initialize:{
		value:function(options){
			
			// delegate reference for scoping
			var delegate = this;

			// create logger
			var logger = this._logger = new Logger(options);

			// create manager
			var manager = this._manager = new Manager({
				logger: logger
			});

			// add event listeners that will in turn dispatch events of their own
			manager.on(Manager.CONNECTION_MADE,function(connection){
				delegate.trigger(Server.CLIENT_DID_CONNECT,connection);
			});

			manager.on(Manager.CONNECTION_LOST,function(connection){
				delegate.trigger(Server.CLIENT_DID_DISCONNECT,connection);
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
