### Overview

Like the left brow sometimes needs to converse with the right, Monobrow aims to serve the same purpose for different technologies. It provides a simple, abstracted, messaging protocol that makes it easy to message from one language/platform to another.

If you're interested their are a number of clients for other languages including:

1. Objective-C
*. JavaScript (Web)
*. ActionScript (Flex/Flash)

You can see all of these as well as planned future clients at https://github.com/mcgaryes/monobrow.

### Installation

	[project-directory] $ npm install monobrow-client --save

### Implementation

	var Client = require("monobrow-client").Client;
	var client = new Client({
		host:"127.0.0.1",
		port:8889
	});
	client.connect();

### Client State Events

	...
	client.on(Client.STATE_CHANGE,function(state,previousState){
		if(state === Client.CONNECTED) {
			...
		}
	});

1. `connected` - The client has connected to the client
* `disconnected` - The client has disconnected with or without an error.

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


### Examples

Examples available at https://github.com/mcgaryes/monobrow/tree/master/examples.

### Documentation

Full API documentation is available after a build:
	
	[project-directory] $ cd node_modules/monobrow-server/build
	[build] $ grunt
	[build] $ cd ../docs
	[docs] $ open index.html