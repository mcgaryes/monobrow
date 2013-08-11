var Client = require("../monobrow-client-node/monobrow-client").Client;
var client = new Client({
	host: "127.0.0.1",
	port: 8889
});

client.on(Client.STATE_CHANGE,function(err, state){
	if(state === Client.CONNECTED) {
		console.log("Client is connected.");
	} else if (state === Client.DISCONNECTED) {
		if(err) {
			console.log(err.message);
		} else {
			console.log("Client is disconnected.");
		}
	}
});

client.on("custom", function(data) {
	console.log(data);
});

client.connect();

setTimeout(function(){
	// client.disconnect();
}, 3000);