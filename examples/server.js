var Server = require("../monobrow-server").Server;
var server = new Server({
	host: "127.0.0.1",
	port: 8889,
	whitelist: ["127.0.0.1"]
});

server.on(Server.STATE_CHANGE, function(err, state) {
	if (state === Server.RUNNING) {
		console.log("Server is running at " + server.address);
	} else if (state === Server.STOPPED) {
		if (!err) {
			console.log("Server was stopped");
		} else {
			console.log("Server was stopped with error.");
		}
	}
});

server.on(Server.CLIENT_DID_CONNECT, function(connection) {
	console.log("Connection made from " + connection.remoteAddress + ". Total Connections: " + server.totalConnections);
});

server.on(Server.CLIENT_DID_DISCONNECT, function(connection) {
	console.log("Connection lost from " + connection.remoteAddress + ". Total Connections: " + server.totalConnections);
});

server.on(Server.CLIENT_WAS_REJECTED, function(connectionAddress) {
	console.log("Connection was rejected. Client Address: " + connectionAddress);
});

server.start();