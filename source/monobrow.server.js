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
