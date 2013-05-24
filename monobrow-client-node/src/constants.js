module.exports = {

	/**
	 * State change event fired on a state change of the client.
	 * @property STATE_CHANGE_EVENT
	 * @type String
	 * @static
	 * @for Client
	 */
	STATE_CHANGE_EVENT: "stateChangeEvent",

	/**
	 * The data event is fired when incoming data is recognized. The data
	 * passed is the raw buffer. Call toString on the data to get the string
	 * representation of the data.
	 * @property DATA_EVENT
	 * @type String
	 * @static
	 * @for Client
	 */
	DATA_EVENT: "dataEvent",

	/**
	 * A connection was just ADDED to the same server this client is
	 * listening to. This relationship is denoted as a sibling relationship.
	 * @property SIBLING_ADDED_EVENT
	 * @type String
	 * @static
	 * @for Client
	 */
	SIBLING_ADDED_EVENT: "siblingAddedEvent",

	/**
	 * A connection was just REMOVED to the same server this client is
	 * listening to. This relationship is denoted as a sibling relationship.
	 * @property SIBLING_REMOVED_EVENT
	 * @type String
	 * @static
	 * @for Client
	 */
	SIBLING_REMOVED_EVENT: "siblingRemovedEvent",

	/**
	 * The client is connected to the remote socket server.
	 * @property STATE_CONNECTED
	 * @type String
	 * @static
	 * @for Client
	 */
	STATE_INITIALIZED: "initialized",

	/**
	 * The client is connected to the remote socket server.
	 * @property STATE_CONNECTED
	 * @type String
	 * @static
	 * @for Client
	 */
	STATE_CONNECTED: "connected",

	/**
	 * The client has diconnected from the remote socket server.
	 * @property STATE_DISCONNECTED
	 * @type String
	 * @static
	 * @for Client
	 */
	STATE_DISCONNECTED: "disconnected",

	/**
	 * The client has encountered an error connecting to the remote socket server.
	 * @property STATE_ERROR
	 * @type String
	 * @static
	 * @for Client
	 */
	STATE_ERROR: "error"
};