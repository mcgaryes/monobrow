package monobrow
{
	
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.events.IOErrorEvent;
	import flash.events.ProgressEvent;
	import flash.events.SecurityErrorEvent;
	import flash.net.Socket;
	
	import monobrow.events.DataEvent;
	import monobrow.events.StateChangeEvent;

	/**
	 * The as 3 version in which to connect to a monobrow socket server.
	 * @author emcgary
	 */	
	[Event(name="stateChangeEvent", type="monobrow.events.StateChangeEvent")]
	[Event(name="dataEvent", type="monobrow.events.DataEvent")]
	public class Client extends EventDispatcher
	{

		// ============================================================
		// === Public Methods =========================================
		// ============================================================

		/**
		 * The string associated with a state change event dispatched from the client. 
		 */		
		private static const STATE_CHANGE_EVENT:String="stateChangeEvent";
		
		/**
		 * The string associated with a data event dispatched from the client.
		 */		
		private static const DATA_EVENT:String="dataEvent";

		/**
		 * The default state of the client.
		 */		
		public static const STATE_INITIALIZED:int=0;
		
		/**
		 * State in which the client has disconnected from the server
		 * or the connection was lost not because of an error.
		 */		
		public static const STATE_DISCONNECTED:int=1;
		
		/**
		 * Any client state that has resulted in an error.
		 */		
		public static const STATE_ERROR:int=2;
		
		/**
		 * State when client is connected to the server.
		 */		
		public static const STATE_CONNECTED:int=3;

		// ============================================================
		// === Private Properties =====================================
		// ============================================================

		/**
		 * The default port we'll use to connect to the server.
		 * @private
		 */		
		private var _port:uint=8889;
		
		/**
		 * The default host we'll use to connect to the server.
		 * @private
		 */		
		private var _host:String="localhost";
		
		/**
		 * The socket instance we'll be connecting to the server with.
		 * @private
		 */		
		private var _socket:Socket;
		
		/**
		 * The current state of the client.
		 * @default STATE_INITIALIZED
		 * @private
		 */		
		private var _state:int=STATE_INITIALIZED;
		
		/**
		 * The previous state of the client.
		 * @default undefined
		 * @private 
		 */		
		private var _previousState:int;

		// ============================================================
		// === Initialization =========================================
		// ============================================================

		/**
		 * Constructor for a client instance. Applies any passed options
		 * and attaches the needed listeners for dispatching. 
		 * @param $options Configuration options to be applied to the client
		 */		
		public function Client($options:Object)
		{
			// set properties from defaults
			if($options.hasOwnProperty("host")) _host = $options['host']; 
			if($options.hasOwnProperty("port")) _port = $options['port'];
			
			// create socket connection and attempt to connect
			_socket=new Socket();
			_socket.addEventListener(Event.CONNECT, __handleSocketConnect);
			_socket.addEventListener(Event.CLOSE, __handleSocketClose);
			_socket.addEventListener(IOErrorEvent.IO_ERROR, __handleSocketError);
			_socket.addEventListener(ProgressEvent.SOCKET_DATA, __handleSocketResponse);
			_socket.addEventListener(SecurityErrorEvent.SECURITY_ERROR, __handleSecurityError);
		}

		// ============================================================
		// === Public Methods =========================================
		// ============================================================

		/**
		 * Connects the client to the host and port specified in the options passed
		 * throught the instance's constructor.
		 */		
		public function connect():void
		{
			if (_state != STATE_CONNECTED) 
			{
				_socket.connect(_host, _port);
			} 
			else 
			{
				trace("Monobrow Client Warning: Client is already connected to the server.");
			}
		}
		
		/**
		 * Disconnects the client from the server it is currently connected to.
		 */		
		public function disconnect():void
		{
			if (this._state === Client.STATE_CONNECTED) 
			{
				throw "Disconnect not yet implemented.";
			}
			else 
			{
				trace("Monobrow Client Warning: You must be connected to disconnect.");
			}
		}
		
		/**
		 * Emits a message to the server that the client is connected to.
		 * @param $message
		 */		
		public function emit($message:String=""):void
		{
			if (_state === Client.STATE_CONNECTED) 
			{
				try 
				{
					_socket.writeUTF($message);
				} 
				catch ($e:Error) 
				{
					trace("Monobrow Client Error: " + $e.message);
				}
			} 
			else 
			{
				trace("Monobrow Client Warning: Client must be connected to emit a message.");
			}	
		}
		
		// ============================================================
		// === Getters/Setters ========================================
		// ============================================================
		
		/**
		 * Returns the previous state of the client.
		 * @return 
		 * @default undefined
		 */		
		public function get previousState():int
		{
			return _previousState;
		}
		
		/**
		 * Returns the current state of the connection.
		 * @return 
		 * @default STATE_INITIALIZED
		 */		
		public function get state():int
		{
			return _state;
		}
		
		// ============================================================
		// === Event Handlers =========================================
		// ============================================================

		/**
		 * Thrown when a connection is made.
		 * @param $e Event
		 * @private
		 */		
		private function __handleSocketConnect($e:Event=null):void
		{
			_state=STATE_CONNECTED;
			dispatchEvent(new StateChangeEvent(_state));
		}

		/**
		 * Thrown when the connection is closed.
		 * @param $e
		 * @private
		 */		
		private function __handleSocketClose($e:Event=null):void
		{
			_state=STATE_DISCONNECTED;
			dispatchEvent(new StateChangeEvent(_state));
		}

		/**
		 * Thrown on any error other than a security one from the connection.
		 * @param $e
		 * @private
		 */		
		private function __handleSocketError($e:IOErrorEvent=null):void
		{
			_state=STATE_ERROR;
			dispatchEvent(new StateChangeEvent(_state));
		}

		/**
		 * Thrown on a security error from the connection.
		 * @param $e
		 * @private
		 */		
		private function __handleSecurityError($e:Event=null):void
		{
			_state=STATE_ERROR;
			dispatchEvent(new StateChangeEvent(_state));
		}

		/**
		 * Handler thrown when incoming data is recieved.
		 * @param $e
		 * @private
		 */		
		private function __handleSocketResponse($e:ProgressEvent=null):void
		{
			try
			{
				var data:Object=_socket.readUTFBytes(_socket.bytesAvailable);
				dispatchEvent(new DataEvent(data));
			}
			catch ($e:Error)
			{
				trace($e);
			}
		}

	}
}
