package monobrow.events
{
	import flash.events.Event;
	
	public class MBBroadcastEvent extends Event
	{
		public var data:Object;	
		public function MBBroadcastEvent($type:String, $data:Object=null, $bubbles:Boolean=false, $cancelable:Boolean=false)
		{
			super($type, $bubbles, $cancelable);
			data = $data;
		}
	}
}