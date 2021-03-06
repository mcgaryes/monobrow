### Overview

Like the left brow sometimes needs to converse with the right, Monobrow aims to serve the same purpose for different technologies. It provides a simple, abstracted, messaging protocol that makes it easy to message from one language/platform to another.

### Dependencies

	1. underscore.js

### Implementation
	
	<script type="text/javascript" src="underscore.js"></script>
	<script type="text/javascript" src="monobrow-client.js"></script>
	...
	var client = new Client({
		host:"127.0.0.1",
		port:8889
	});
	client.connect();

### Client State Events

	client.on(Client.STATE_CHANGE,function(state,previousState){
		if(state === "connected") {
			...
		}
	});

1. `initialized` - Initialization complete.
* `connected` - The client has connected to the client
* `disconnected` - The client has disconnected with or without an error.
* `error` - There was an error with the client.

### Messaging

Messages for monobrow are sent from one client to another. By design messages are not recieved by the client that sends them. 

To send messages use the `sendMessage` method that takes a type and a message object. Objects are run through `JSON.strigify`, so you'll need to keep that in mind.

	...
	client.sendMessage("message-type",{
		foo:"bar"
	});

To recieve messages in a client you'll use an `on` message handler, as messages are recieved just like events.

	...
	client.on("message-type",function(data){
		console.log(data.foo); // "bar"
	});