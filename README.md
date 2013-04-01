### Installation

<pre>$ npm install monobrow --save</pre>

### Implementation

The focus of this project was to make it very simple to create and connect to a socket server from a number of different clients.... that being said the implementation is dead simple.

* Create a server to connect to...

	<pre>
	var Server = require("monobrow").Server;
	var server = new Server();
	server.start();
	</pre>

* Create a client and connect it to the server...

	* In NodeJS...

		<pre>
		var Client = require("monobrow.client");
		var client = new Client();
		client.connect();
		</pre>

	* In ActionScript 3.0...

		<pre>
		import monobrow.Client;
		var client:Client = new Client();
		client.connect();
		</pre>

You can see a full list of supported clients and their respective libraries in the [clients](https://github.com/mcgaryes/monobrow/tree/master/clients) directory of this repository.

### API Documentation

For full [API documentation](https://github.com/mcgaryes/monobrow/wiki), including the Monobrow server as well as the various clients please see the wiki of the repository.

### Clients In The Works

* Processing
* Objective-C
* C++
* JavaScript (Browser)
