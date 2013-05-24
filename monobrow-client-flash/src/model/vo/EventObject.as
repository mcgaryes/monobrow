package monobrow.model.vo
{
	public class EventObject
	{
		
		public var type:String;
		public var data:String;
		
		public function EventObject($data:Object)
		{
			if($data.hasOwnProperty("type") && $data.isOfType("String")) 
			{
				type = $data.type;
			}
			
			if($data.hasOwnProperty("data")) 
			{
				try 
				{
					var dataStr:Object = JSON.stringify($data.data);
					data = dataStr;
				} 
				catch(e:Error) 
				{
					trace("could not process the data");
				}
			}
		}
	}
}