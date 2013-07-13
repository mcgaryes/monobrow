package monobrow
{
	
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.events.IOErrorEvent;
	import flash.events.ProgressEvent;
	import flash.events.SecurityErrorEvent;
	import flash.net.Socket;
	
	import monobrow.events.MBBroadcastEvent;
	import monobrow.events.MBSiblingEvent;
	import monobrow.events.MBStateChangeEvent;

	/**
	 * The as 3 version in which to connect to a monobrow socket server.
	 * @author emcgary
	 */	
	[Event(name="stateChangeEvent", type="monobrow.events.MBStateChangeEvent")]
	[Event(name="siblingAdded", type="monobrow.events.MBSiblingEvent")]
	[Event(name="siblingRemoved", type="monobrow.events.MBSiblingEvent")]
	public class Client extends EventDispatcher
	{

		// ============================================================
		// === Private Constants ======================================
		// ============================================================

		private static const CONNECTION_CID:String = "myidis";
		private static const CLIENT_ADDED:String = "clientAdded";
		private static const CLIENT_REMOVED:String = "clientRemoved";
		
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
		public static const STATE_INITIALIZED:String="initialized";
		
		/**
		 * State in which the client has disconnected from the server
		 * or the connection was lost not because of an error.
		 */		
		public static const STATE_DISCONNECTED:String="disconnected";
		
		/**
		 * Any client state that has resulted in an error.
		 */		
		public static const STATE_ERROR:String="error";
		
		/**
		 * State when client is connected to the server.
		 */		
		public static const STATE_CONNECTED:String="connected";

		// ============================================================
		// === Private Properties =====================================
		// ============================================================

		/**
		 * The default port we'll use to connect to the server.
		 * @private
		 */		
		private var _port:uint=5000;
		
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
		private var _state:String=STATE_INITIALIZED;
		
		/**
		 * The previous state of the client.
		 * @default undefined
		 * @private 
		 */		
		private var _previousState:int;
		
		/**
		 * The id assigned by the server to this client instance
		 * @default undefined
		 * @private
		 */
		private var _cid:String;
		
		/**
		 * The total number of siblings that this client has. A sibling is essentially
		 * any other socket connected to this socket's server at the same time.
		 * @default 0
		 * @private
		 */
		private var _totalSiblings:int = 0;

		// ============================================================
		// === Initialization =========================================
		// ============================================================

		/**
		 * Constructor for a client instance. Applies any passed options
		 * and attaches the needed listeners for dispatching. 
		 * @param $options Configuration options to be applied to the client
		 */		
		public function Client($options:Object=null)
		{
			// set properties from defaults
			if($options)
			{
				if($options.hasOwnProperty("host")) _host = $options['host']; 
				if($options.hasOwnProperty("port")) _port = $options['port'];
			}
			
			// create socket connection and attempt to connect
			_socket=new Socket();
			_socket.addEventListener(Event.CONNECT, __handleSocketConnect);
			_socket.addEventListener(Event.CLOSE, __handleSocketClose);
			_socket.addEventListener(IOErrorEvent.IO_ERROR, __handleSocketError);
			//_socket.addEventListener(ProgressEvent.SOCKET_DATA, __handleSocketData);
			_socket.addEventListener(SecurityErrorEvent.SECURITY_ERROR, __handleSecurityError);
		}
		
		/**
		 * Overridden to print meaningful info about the client
		 * @return  
		 */		
		override public function toString():String
		{
			var tmp:Array = [];
			//tmp.push("localAddress: " + _socket.localAddress);
			//tmp.push("localPort: " + _socket.localPort);
			//tmp.push("objectEncoding: " + _socket.objectEncoding);
			//tmp.push("remotePort: " + _socket.remotePort);
			//tmp.push("timeout: " + _socket.timeout);
			return "Client: cid: " + _cid + ", Socket:[" + tmp.join(", ") + "]";
		}
		
		// ============================================================
		// === Public Methods =========================================
		// ============================================================

		/**
		 * Connects the client to the host and port specified in the options passed
		 * throught the instance's constructor.
		 */		
		public function connect($timeout:uint = 20000):void
		{
			if (_state != STATE_CONNECTED) 
			{ 
				_socket.timeout = $timeout;
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
				_socket.close();
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
		public function trigger($type:String,$data:Object = null):void
		{
			if (_state === Client.STATE_CONNECTED) 
			{
				var message:String = JSON.stringify({
					type:$type,
					data:JSON.stringify($data)
				});
				_socket.writeUTFBytes(message);	
				_socket.flush();
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
		 * Returns the cid (client identifer) of this client instance
		 * @return 
		 * @default undefined
		 */		
		public function get cid():String
		{
			return _cid;
		}
		
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
		public function get state():String
		{
			return _state;
		}
		
		/**
		 * The total number of siblings this client has.
		 * @return  
		 */		
		public function get totalSiblings():int
		{
			return _totalSiblings;
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
			trace("Monobrow Client: Client connected to " + _host + ":" + _port + ".");
			_state=STATE_CONNECTED;
			dispatchEvent(new MBStateChangeEvent(_state));
		}

		/**
		 * Thrown when the connection is closed.
		 * @param $e
		 * @private
		 */		
		private function __handleSocketClose($e:Event=null):void
		{
			trace("Monobrow Client: Client disconnected from " + _host + ":" + _port + ".");
			_state=STATE_DISCONNECTED;
			dispatchEvent(new MBStateChangeEvent(_state));
		}

		/**
		 * Thrown on any error other than a security one from the connection.
		 * @param $e
		 * @private
		 */		
		private function __handleSocketError($e:IOErrorEvent=null):void
		{
			trace("Monobrow Client: The client encountered an error.");
			_state=STATE_ERROR;
			dispatchEvent(new MBStateChangeEvent(_state));
		}

		/**
		 * Thrown on a security error from the connection.
		 * @param $e
		 * @private
		 */		
		private function __handleSecurityError($e:Event=null):void
		{
			trace("Monobrow Client: The client encountered a security error.");
			_state=STATE_ERROR;
			dispatchEvent(new MBStateChangeEvent(_state));
		}

		/**
		 * Handler thrown when incoming data is recieved.
		 * @param $e
		 * @private
		 */		
		private function __handleSocketData($e:ProgressEvent=null):void
		{
			/*
			var json:String = _socket.readUTFBytes(_socket.bytesAvailable);						
			var clean:String = json.replace(/\s+/gi, "");
			var totalMessages:int = clean.match(/type/g).length;
			var messages:Array = [];
			if (totalMessages > 1) 
			{
				messages = clean.match(/\{(.*?)"\}/g);
			} 
			else 
			{
				messages.push(clean);
			}
			
			// itterate through all of the messages and emit the appropriate event
			for (var i:int = 0; i < messages.length; i++) 
			{
				
				try
				{
					var data:Object=JSON.parse(messages[i]);
				} 
				catch (e:Error)
				{
					trace("Monobrow Error: " + e.message);
					trace(messages[i]);
					return;
				}
				
				var type:String;
				var body:Object;
				var pBody:Object;
				
				// assign type and body
				if(data.hasOwnProperty("type")) type = data.type;
				if(data.hasOwnProperty("data")) 
				{
					body = data.data;
					pBody = JSON.parse(String(body)); 
				}
				
				if(type)
				{
					// handle all of the reserved events 
					if(type == CONNECTION_CID)
					{
						_cid = pBody.cid;
					} 
					else if(type==CLIENT_ADDED)
					{
						// subtract ourselves (this client instance) from the count
						_totalSiblings = pBody.total - 1;
						dispatchEvent(new MBSiblingEvent(MBSiblingEvent.SIBLING_ADDED,pBody.cid));
					}
					else if(type==CLIENT_REMOVED)
					{
						// subtract ourselves (this client instance) from the count
						_totalSiblings = pBody.total - 1;
						dispatchEvent(new MBSiblingEvent(MBSiblingEvent.SIBLING_REMOVED,pBody.cid));							
					}
					else 
					{
						// send a generic broadcast event for types that we dont know about
						dispatchEvent(new MBBroadcastEvent(type,pBody));
					}
				}
				else
				{
					trace("could not process incoming data");
				}
			}
			*/
		}
	}
}
