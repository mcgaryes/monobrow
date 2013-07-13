package monobrow.events
{
	import flash.events.Event;

	/**
	 * 
	 * @author emcgary
	 */	
	public class MBDataEvent extends Event
	{
		
		/**
		 * 
		 */		
		public static const DATA:String="dataEvent";

		/**
		 * 
		 */		
		public var data:Object;

		/**
		 * 
		 * @param $data
		 * @param $bubbles
		 * @param $cancelable
		 */
		public function MBDataEvent($data:Object=null, $bubbles:Boolean=false, $cancelable:Boolean=false)
		{
			super(DATA, $bubbles, $cancelable);
			data=$data;
		}
	}
}
