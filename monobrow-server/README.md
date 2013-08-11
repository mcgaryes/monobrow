### Overview

Like the left brow sometimes needs to converse with the right, Monobrow aims to serve the same purpose for different technologies. It provides a simple, abstracted, messaging protocol that makes it easy to message from one language/platform to another.

If you're interested their are a number of clients for other languages including:

1. Objective-C
* JavaScript (Web)
* ActionScript (Flex/Flash)

You can see all of these as well as planned future clients at https://github.com/mcgaryes/monobrow.

### Installation

	[project-directory] $ npm install monobrow-server --save

### Implementation

	var Server = require("monobrow-server").Server;
	var server = new Server({
		host:"127.0.0.1",
		port:8889,
		whitelist: ["127.0.0.1"]
	});
	server.start();

### Server States

1. `running` - The server is running on the specified host and port.
* `stopped` - The server has stopped with or without an error.

### Events

There are four events emitted for a server instance. `stageChange`, `clientDidConnect` and `clientDidDisconnect`, `clientWasRejected`. These can be accessed as such:

	...
	server.on(Server.STATE_CHANGE,function(state){
		if(state === Server.RUNNING) {
			console.log("Server is running at " + server.address);
		}
	});

### Examples

Examples available at https://github.com/mcgaryes/monobrow/tree/master/examples.

### Documentation

Full API documentation is available after a build:
	
	[project-directory] $ cd node_modules/monobrow-server/build
	[build] $ grunt
	[build] $ cd ../docs
	[docs] $ open index.html