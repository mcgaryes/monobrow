module.exports = {

	ServerConstants: {

		/**
		 * @property INITIALIZED
		 * @for Server
		 * @static
		 */
		INITIALIZED: 0,

		/**
		 * @property RUNNING
		 * @for Server
		 * @static
		 */
		RUNNING: 1,

		/**
		 * @property STOPPED
		 * @for Server
		 * @static
		 */
		STOPPED: 2,

		/**
		 * @property STATE_CHANGE
		 * @for Server
		 * @static
		 */
		STATE_CHANGE: "stageChange",

		/**
		 * @property CLIENT_DID_CONNECT
		 * @for Server
		 * @static
		 */
		CLIENT_DID_CONNECT: "clientDidConnect",

		/**
		 * @property CLIENT_DID_DISCONNECT
		 * @for Server
		 * @static
		 */
		CLIENT_DID_DISCONNECT: "clientDidDisconnect"
	},

	ConnectionManagerConstants: {

		/**
		 * @property CONNECTION_MADE
		 * @for ConnectionManager
		 * @static
		 */
		CONNECTION_MADE: "connectionMadeEvent",

		/**
		 * @property CONNECTION_LOST
		 * @for ConnectionManager
		 * @static
		 */
		CONNECTION_LOST: "connectionLostEvent"
	},
	
	ConnectionConstants: {

		/**
		 * @property WEB_SOCKET
		 * @for Connection
		 * @static
		 */
		WEB_SOCKET: "websocket",

		/**
		 * @property SOCKET
		 * @for Connection
		 * @static
		 */
		SOCKET: "socket"
	}
};