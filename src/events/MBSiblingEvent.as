package monobrow.events
{
	import flash.events.Event;
	
	public class MBSiblingEvent extends Event
	{
		
		public static const SIBLING_ADDED:String="siblingAdded";
		public static const SIBLING_REMOVED:String="siblingRemoved";
		
		public var cid:String;
		
		public function MBSiblingEvent($type:String, $cid:String=null, $bubbles:Boolean=false, $cancelable:Boolean=false)
		{
			super($type, bubbles, cancelable);
			cid = $cid;
		}
	}
}