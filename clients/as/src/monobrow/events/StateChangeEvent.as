package monobrow.events
{
	import flash.events.Event;

	/**
	 * @author emcgary 
	 */	
	public class StateChangeEvent extends Event
	{

		/**
		 * 
		 */		
		public static const STATE_CHANGE:String="stateChangeEvent";

		/**
		 * 
		 */		
		public var state:int;

		/**
		 * 
		 * @param $state
		 * @param $bubbles
		 * @param $cancelable
		 */		
		public function StateChangeEvent($state:int=0, $bubbles:Boolean=false, $cancelable:Boolean=false)
		{
			super(STATE_CHANGE, $bubbles, $cancelable);
			state=$state;
		}
	}
}
