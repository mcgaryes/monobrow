var Client = require("../monobrow-client-node/monobrow-client").Client;
var client = new Client({
	host: "127.0.0.1",
	port: 8889
});

var interval;

client.on(Client.STATE_CHANGE, function(state) {
	if (state === Client.CONNECTED) {
		console.log("Client connected.");
		interval = setInterval(function() {
			client.sendMessage("custom", {
				foo: "bar"
			});
		}, 1000);
	} else if (state === Client.DISCONNECTED) {
		console.log("Client disconnected.");
		clearInterval(interval);
	}
});

client.connect();