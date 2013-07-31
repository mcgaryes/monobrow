/**
 * @module MonobrowClient
 */
(function(_) {

	// scoping reference
	var root = this;

	// ============================================================
	// === Events =================================================
	// ============================================================

	/**
	 *
	 */
	var Events = {

		/**
		 * Holds all references to event types, callbacks, contexts and configurations.
		 * @property _eventMap
		 * @type Object
		 * @private
		 */
		_eventMap: undefined,

		/**
		 * Checks to see if an event is registered to this object with the passed type.
		 * @method has
		 * @param {String} type
		 * @param {String} type
		 */
		has: function(type, callbackRef) {
			if (type === undefined || this._eventMap === undefined || this._eventMap[type] === undefined) {
				return false;
			}
			return true;
		},

		/**
		 * Removes an event to the object.
		 * @method off
		 * @param {String} type
		 * @param {Function} callback
		 */
		off: function(type, callbackRef) {
			if (this.has(type)) {
				for (var i = 0; i < this._eventMap[type].length; i++) {
					var item = this._eventMap[type][i];
					if (callbackRef) {
						if (item.callback === callbackRef) {
							this._eventMap[type] = this._eventMap[type].splice(i, 0);
						}
					} else {
						if (item.configurable === true) {
							this._eventMap[type] = this._eventMap[type].splice(i, 0);
						}
					}
				}
			} else {
				delete this._eventMap;
			}
		},

		/**
		 * Attaches an event to the object.
		 * @method on
		 * @param {String} type
		 * @param {Function} callback
		 * @param {Object} context
		 */
		on: function(type, callback, context) {
			if (this._eventMap === undefined) {
				this._eventMap = {};
			}
			if (this._eventMap[type] === undefined) {
				this._eventMap[type] = [];
			}
			this._eventMap[type].push({
				callback: callback,
				context: context
			});
		},

		/**
		 * Removes an event from the object.
		 * @method off
		 * @param {String} type
		 * @param {Function} callback
		 */
		trigger: function(type, data) {
			if (!this.has(type)) {
				return;
			}
			for (var i = 0; i < this._eventMap[type].length; i++) {
				var item = this._eventMap[type][i];
				if (item.callback !== null) {
					item.callback.call(item.context, data);
				}
			}
		}
	};

	// ============================================================
	// === Client Constants =======================================
	// ============================================================

	/**
	 *
	 */
	var Constants = {

		// ============================================================
		// === Client Events ==========================================
		// ============================================================

		/**
		 * State change event fired on a state change of the client.
		 * @property STATE_CHANGE_EVENT
		 * @type String
		 * @static
		 */
		EVENT_STATE_CHANGE: "stateChangeEvent",

		/**
		 * A connection was just ADDED to the same server this client is
		 * listening to. This relationship is denoted as a sibling relationship.
		 * @property SIBLING_ADDED_EVENT
		 * @type String
		 * @static
		 */
		EVENT_SIBLING_ADDED: "siblingAddedEvent",

		/**
		 * A connection was just REMOVED to the same server this client is
		 * listening to. This relationship is denoted as a sibling relationship.
		 * @property SIBLING_REMOVED_EVENT
		 * @type String
		 * @static
		 */
		EVENT_SIBLING_REMOVED: "siblingRemovedEvent",

		// ============================================================
		// === Client States ==========================================
		// ============================================================

		/**
		 * The client is connected to the remote socket server.
		 * @property STATE_CONNECTED
		 * @type String
		 * @static
		 */
		STATE_INITIALIZED: "initialized",

		/**
		 * The client is connected to the remote socket server.
		 * @property STATE_CONNECTED
		 * @type String
		 * @static
		 */
		STATE_CONNECTED: "connected",

		/**
		 * The client has diconnected from the remote socket server.
		 * @property STATE_DISCONNECTED
		 * @type String
		 * @static
		 */
		STATE_DISCONNECTED: "disconnected",

		/**
		 * The client has encountered an error connecting to the remote socket server.
		 * @property STATE_ERROR
		 * @type String
		 * @static
		 */
		STATE_ERROR: "error"

	};

	// ============================================================
	// === Client =================================================
	// ============================================================

	/**
	 *
	 */
	var MonobrowClient = root.MonobrowClient = function($options) {
		_.extend(this, $options);
		this.__initialize();
	};

	MonobrowClient.prototype = Object.create(Events, {

		// ============================================================
		// === Public Properties ======================================
		// ============================================================

		/**
		 * Public getter for the current state of the client.
		 * @property state
		 * @type String
		 */
		state: {
			get: function() {
				return this._state;
			}
		},

		/**
		 * Public getter for the previous state of the client.
		 * @property previousState
		 * @type String
		 */
		previousState: {
			get: function() {
				return this._previousState;
			}
		},

		/**
		 * The address the client is pointing as
		 * @property address
		 * @type String
		 */
		address: {
			get: function() {

				var host = this.host;
				if (_.isUndefined(host)) {
					host = "localhost";
				}

				if (_.isUndefined(this.port)) {
					return host;
				}

				return host + ":" + this.port;
			}
		},

		/**
		 * The total number of siblings a client has. A sibling is considered any
		 * connection that sits beside this client on the server (so another connection
		 * to the same server).
		 * @property totalSiblings
		 * @type Number
		 */
		totalSiblings: {
			get: function() {
				// subtract ourselves from the total
				return this._totalSiblings - 1;
			}
		},

		// ============================================================
		// === Public Methods =========================================
		// ============================================================

		connect: {
			value: function() {
				// create and connect to a new socket
				var socket = this._socket = new WebSocket("ws://" + this.host + ":" + this.port);

				var delegate = this;

				// add event listeners to socket
				socket.onopen = function(e) {
					delegate.__handleSocketConnect(e);
				};
				socket.onmessage = function(e) {
					delegate.__handleSocketData(e);
				};
				socket.onerror = function(e) {
					delegate.__handleSocketError(e);
				};
				socket.onclose = function(e) {
					delegate.__handleSocketClose(e);
				};
			}
		},

		/**
		 *
		 */
		disconnect: {
			value: function($code, $reason) {
				throw new Error("Manual Disconnect Not Yet Implememnted");
				/*
				this._socket.close(1000,"Just because");
				this._previousState = this._state;
				this._state = MonobrowClient.STATE_DISCONNECTED;
				this.trigger(MonobrowClient.STATE_CHANGE, this._state, this._previousState);
				*/
			}
		},

		/**
		 * Emits a message to the server the client is connected to.
		 * @method emit
		 * @param {String} type The type of event being triggered
		 * @param {Object} data *Optional* - The data you want to pass as the body of the event
		 */
		sendMessage: {
			value: function(type, data) {
				if (this._state === MonobrowClient.STATE_CONNECTED) {
					if (!_.isUndefined(type)) {
						if (_.isString(type)) {
							try {
								this._socket.send(JSON.stringify({
									type: type,
									data: JSON.stringify(data)
								}));
							} catch (e) {
								console.error(e.message);
							}
						} else {
							console.warn("Message not sent. Type must be a string.");
						}
					} else {
						console.warn("Message not sent. You must specify at least a type.");
					}
				} else {
					console.warn("Message not sent. Client must be connected to emit a message.");
				}
			}
		},

		// ============================================================
		// === Private Methods ========================================
		// ============================================================

		__initialize: {
			value: function() {
				console.log("MonobrowClient initialize");
			}
		},

		/**
		 * This method is just used for logging purposes. If an error occurs
		 * the close method is called immediately after and we'll handle
		 * triggering the state change there, not here.
		 * @method __handleSocketError
		 * @param {Object} e Socket error object
		 * @private
		 */
		__handleSocketError: {
			value: function(e) {
				console.log("MonobrowClient Error: " + e);
				/*
				if (e.code === "EADDRNOTAVAIL") {
					Logger.error("Server not available at " + this.address + ".");
				} else if (e.code === "ECONNREFUSED") {
					Logger.error("The connection to " + this.address + " was refused.");
				} else if (e.code === "ENOENT") {
					Logger.error("Domain does not exist or lookup failure.");
				} else {
					Logger.error(e.code);
				}
				*/
			}
		},

		/**
		 * Handler functionality for when the client socket instance connects to the server.
		 * @method __handleSocketConnect
		 * @private
		 */
		__handleSocketConnect: {
			value: function() {
				console.log("MonobrowClient connection established.");
				this._previousState = this._state;
				this._state = MonobrowClient.STATE_CONNECTED;
				this.trigger(MonobrowClient.STATE_CHANGE, this._state, this._previousState);
			}
		},

		/**
		 * Handler functionality for when the client socket instance recieves data from
		 * the server. This is the single entry point for data and the data recieved is only
		 * handled if structured correctly with a `type` and `data` attribute on the
		 * incoming data object.
		 * @method __handleSocketData
		 * @param {Buffer} data The raw data sent from the server
		 * @private
		 */
		__handleSocketData: {
			value: function(e) {

				try {

					// need to handle multiple messages that may be attached to the same write
					var messages = String($data).split("~~~");

					// itterate through all of the messages and emit the appropriate event
					for (var i = 0; i < messages.length; i++) {

						if (messages[i] === "") {
							// this is an empty message that we will not use
							return;
						}

						var message = JSON.parse(messages[i]);
						var type;
						var body;

						if (message.hasOwnProperty("type")) {

							// assign the data type to the event
							type = message.type;
						}

						if (message.hasOwnProperty("data")) {

							// if the incoming data has a data attribute assign it to our body property
							body = message.data;
						}

						if (type) {

							if (body) {

								// emit the message with both a type and body
								this.trigger(type, body);
							} else {

								// emit the message with only a type, so essential the body is
								// null (in some clients) or undefined
								this.trigger(type);
							}

						} else {

							// if we didnt have a type then we're simply going to log the issue
							Logger.error("Could not process incoming data, it doesn't appear to have a 'type'.");
						}
					}
				} catch (error) {
					// if we couldnt perform any of the above functionality the report the error incurred
					console.error(error.message);
				}
			}
		},

		/**
		 * Handler functionality for when the socket connection is closed. Fires a
		 * state error state change event if the socket was closed due to error. If there
		 * was no error then the handler dispatches a disconnected state change event.
		 * @method __handleSocketClose
		 * @param {Object} error Socket error object
		 * @private
		 */
		__handleSocketClose: {
			value: function(e) {
				if (this._socket.readyState === 1) {
					this._previousState = this._state;
					console.log("MonobrowClient disconnected from " + this.address + ".");
					this._state = MonobrowClient.STATE_DISCONNECTED;
					this.trigger(MonobrowClient.STATE_CHANGE, this._state, this._previousState);
				}
			}
		}
	});

	// add constants to the client object
	_.extend(MonobrowClient, Constants);

}).call(this, _);