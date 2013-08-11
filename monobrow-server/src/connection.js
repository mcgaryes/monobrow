// ============================================================
// === Imports ================================================
// ============================================================

var _ = require("underscore");
var EventEmitter = require("events").EventEmitter;
var Crypto = require("crypto");

// ============================================================
// === Connection =============================================
// ============================================================

/**
 * The Connection object helps with the reading and sending of messages between
 * various types of sockets connections that may attempt to connect to the server
 * the connection belongs to.
 * @class Connection
 * @constructor
 */
var Connection = module.exports = function($options) {
	this._cid = "cid" + Connection._cidCounter++;
	this._socket = $options.socket;
	_.extend(this, _.omit($options, ["socket"]));
	this.__initialize();
};

Connection.prototype = Object.create(EventEmitter.prototype, {

	// ============================================================
	// === Public Properties ======================================
	// ============================================================

	/**
	 * The public getter for the connection instances cid
	 * @property cid
	 * @type String
	 */
	cid: {
		get: function() {
			return this._cid;
		}
	},

	/**
	 * The remote port associated with the connections socket object
	 * @property remotePort
	 * @type String
	 */
	remotePort: {
		get: function() {
			return this._socket.remotePort;
		}
	},

	/**
	 * The type of socket connection of the connection instance
	 * @property type
	 * @type String
	 * @default SOCKET
	 */
	type: {
		value: Connection.TYPE_SOCKET,
		writable: true
	},

	// ============================================================
	// === Private Properties =====================================
	// ============================================================

	/**
	 * Reference to the socket for the connection instance.
	 * @property _socket
	 * @type net.Socket
	 * @private
	 */
	_socket: {
		value: undefined,
		writable: true
	},

	/**
	 * The private property connection id for the connection instance.
	 * @property _cid
	 * @type String
	 * @private
	 */
	_cid: {
		value: undefined,
		writable: true
	},

	// ============================================================
	// === Public Methods =========================================
	// ============================================================

	/**
	 * Send a message to the connection instance.
	 * @method sendMessage
	 * @param {String} $msg
	 */
	sendMessage: {
		value: function($msg) {
			if (this.type !== Connection.TYPE_WEB_SOCKET) {
				try {
					this._socket.write($msg + "~~~");
				} catch(e) {
					console.log(e);
				}
			} else {
				var payload = new Buffer($msg + "~~~", "utf8");
				this._socket.write(this.__encodeMessage(payload));
			}
		}
	},

	/**
	 * Closes the socket for the connection
	 * @method close
	 */
	close: {
		value: function() {
			throw new Error("Connection close method not yet implemented.");
			//this._socket.close();
		}
	},

	// ============================================================
	// === Private Methods ========================================
	// ============================================================

	/**
	 * Connection initialization functionality.
	 * @method __initialize
	 * @private
	 */
	__initialize: {
		value: function() {

			if (_.isUndefined(this._socket)) return;

			var delegate = this;

			this._socket.on("data", function($buffer) {
				var data = String($buffer);
				if (data.search("WebSocket") !== -1) {
					delegate.type = Connection.TYPE_WEB_SOCKET;
					delegate.__completeWebSocketHandshake(data);
				} else {
					var buffer = $buffer;
					// send out the content to all the clients
					if (delegate.type === Connection.TYPE_WEB_SOCKET) {
						buffer = delegate.__processWebSocketBuffer($buffer);
					}
					delegate.emit(Connection.EVENT_DATA, buffer);
				}
			});

			this._socket.on("error", function(error) {
				delegate.emit(Connection.EVENT_ERROR, error);
			});

			// connection closed
			this._socket.on("close", function(hadError) {
				delegate.emit(Connection.EVENT_CLOSE, hadError);
			});

		}
	},

	/**
	 * Completion functionality for the web socket handshake sequence.
	 * @method __completeWebSocketHandshake
	 * @param {String} $data
	 * @private
	 */
	__completeWebSocketHandshake: {
		value: function($data) {

			var clean = $data.replace(/\s+/gm, "");
			var pattern = /Sec-WebSocket-Key(.*)(?=Sec-WebSocket-Version)/g;
			var secWsKey = clean.match(pattern)[0].split(":")[1];
			var magicString = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
			var hash = Crypto.createHash('SHA1').update(secWsKey + magicString).digest('base64');
			var handshake = "HTTP/1.1 101 Web Socket Protocol Handshake\r\n" +
				"Upgrade: WebSocket\r\n" +
				"Connection: Upgrade\r\n" +
				"Sec-WebSocket-Accept: " + hash + "\r\n" +
				"\r\n";

			this._socket.write(handshake);
		}
	},

	/**
	 * Encoding functionality for web socket messages.
	 * @method __encodeMessage
	 * @param {String} $msg
	 * @private
	 */
	__encodeMessage: {
		value: function($msg) {
			var payload = $msg;
			var buf;
			// first byte: fin and opcode
			var b1 = 0x80 | 1;
			// always send message as one frame (fin)

			// Second byte: mask and length part 1
			// Followed by 0, 2, or 8 additional bytes of continued length
			var b2 = 0; // server does not mask frames
			var length = payload.length;
			if (length < 126) {
				buf = new Buffer(payload.length + 2 + 0);
				// zero extra bytes
				b2 |= length;
				buf.writeUInt8(b1, 0);
				buf.writeUInt8(b2, 1);
				payload.copy(buf, 2);
			} else if (length < (1 << 16)) {
				buf = new Buffer(payload.length + 2 + 2);
				// two bytes extra
				b2 |= 126;
				buf.writeUInt8(b1, 0);
				buf.writeUInt8(b2, 1);
				// add two byte length
				buf.writeUInt16BE(length, 2);
				payload.copy(buf, 4);
			} else {
				buf = new Buffer(payload.length + 2 + 8);
				// eight bytes extra
				b2 |= 127;
				buf.writeUInt8(b1, 0);
				buf.writeUInt8(b2, 1);
				// add eight byte length
				// note: this implementation cannot handle lengths greater than 2^32
				// the 32 bit length is prefixed with 0x0000
				buf.writeUInt32BE(0, 2);
				buf.writeUInt32BE(length, 6);
				payload.copy(buf, 10);
			}
			return buf;
		}
	},

	/**
	 * Processing functionality for web socket messages.
	 * @method __processWebSocketBuffer
	 * @param {Buffer} $buffer
	 * @private
	 */
	__processWebSocketBuffer: {
		value: function($buffer) {

			var buf = $buffer;

			if (buf.length < 2) {
				// insufficient data read
				return null;
			}

			var idx = 2;

			var b1 = buf.readUInt8(0);
			var fin = b1 & 0x80;
			var opcode = b1 & 0x0f; // low four bits
			var b2 = buf.readUInt8(1);
			var mask = b2 & 0x80;
			var length = b2 & 0x7f; // low 7 bits

			if (length > 125) {
				if (buf.length < 8) {
					// insufficient data read
					return null;
				}

				if (length === 126) {
					length = buf.readUInt16BE(2);
					idx += 2;
				} else if (length === 127) {
					// discard high 4 bits because this server cannot handle huge lengths
					var highBits = buf.readUInt32BE(2);
					if (highBits !== 0) console.log("close the server?");
					length = buf.readUInt32BE(6);
					idx += 8;
				}
			}

			if (buf.length < idx + 4 + length) return null;

			var maskBytes = buf.slice(idx, idx + 4);
			idx += 4;
			var payload = buf.slice(idx, idx + length);
			payload = this.__unmaskPayload(maskBytes, payload);

			return payload;
		}
	},

	/**
	 * Unmasking functionality for web socket messages.
	 * @method __unmaskPayload
	 * @param {Array} $maskBytes
	 * @param {String} $data
	 * @private
	 */
	__unmaskPayload: {
		value: function($maskBytes, $data) {
			var payload = new Buffer($data.length);
			for (var i = 0; i < $data.length; i++) {
				payload[i] = $maskBytes[i % 4] ^ $data[i];
			}
			return payload;
		}
	},

	/**
	 * Frame handling functionality for web socket messages. Currently
	 * only supports utf8 payloads.
	 * @method __handleFrame
	 * @param (Number} $opcode
	 * @private
	 */
	__handleFrame: {
		value: function($opcode, $buffer) {
			var payload = $buffer.toString("utf8");
			this.emit("data", $opcode, payload);
		}
	}
});

/**
 * @property _cidCounter
 * @for Connection
 * @private
 */
Connection._cidCounter = 0;

// ============================================================
// === Connection Constants ===================================
// ============================================================

/**
 * @property TYPE_WEB_SOCKET
 * @for Connection
 * @static
 */
Connection.TYPE_WEB_SOCKET = "websocket";

/**
 * @property TYPE_SOCKET
 * @for Connection
 * @static
 */
Connection.TYPE_SOCKET = "socket";

/**
 * @property EVENT_ERROR
 * @for Connection
 * @static
 */
Connection.EVENT_ERROR = "errorEvent";

/**
 * @property EVENT_DATA
 * @for Connection
 * @static
 */
Connection.EVENT_DATA = "dataEvent";

/**
 * @property EVENT_CLOSE
 * @for Connection
 * @static
 */
Connection.EVENT_CLOSE = "closeEvent";

/**
 * @property EVENT_FLAGGED_FOR_REMOVAL
 * @for Connection
 * @static
 */
Connection.EVENT_FLAGGED_FOR_REMOVAL = "flaggedForRemovalEvent";