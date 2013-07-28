### Overview

Like the left brow sometimes needs to converse with the right, Monobrow aims to serve the same purpose for different technologies. It provides a simple, abstracted, messaging protocol that makes it easy to message from one language/platform to another.

### Installation

	[project-directory] $ npm install monobrow-server --save

### Implementation

	var Server = require("monobrow-server").Server;
	var server = new Server({
		host:"127.0.0.1",
		port:8889
	});
	server.start();

### Server States

1. `initialized` - Initialization complete.
* `running` - The server is running on the specified host and port.
* `stopped` - The server has stopped with or without an error.

### Events

There are three events emitted for a server instance. `stageChange`, `clientDidConnect` and `clientDidDisconnect`. These can be accessed as such:

	...
	server.on(Server.STATE_CHANGE,function(state){
		if(state === "initialized") {
			...
		}
	});

### Documentation

Full source documentation is available within the `node_modules/monobrow-server/docs` directory.