package monobrow.events
{
	import flash.events.Event;

	/**
	 * @author emcgary 
	 */	
	public class MBStateChangeEvent extends Event
	{

		/**
		 * 
		 */		
		public static const STATE_CHANGE:String="stateChangeEvent";

		/**
		 * 
		 */		
		public var state:String;

		/**
		 * 
		 * @param $state
		 * @param $bubbles
		 * @param $cancelable
		 */		
		public function MBStateChangeEvent($state:String, $bubbles:Boolean=false, $cancelable:Boolean=false)
		{
			super(STATE_CHANGE, $bubbles, $cancelable);
			state=$state;
		}
	}
}
