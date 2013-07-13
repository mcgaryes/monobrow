var Client = require("../monobrow-client-node/monobrow-client").Client;
var listener = new Client({
	host: "localhost",
	port: 8889
});

listener.on("nfoo", function(data) {
	console.log(data);
});

listener.on("wfoo", function(data) {
	console.log(data);
});

listener.on(Client.STATE_CHANGE, function(state, pState) {
	if(state === Client.CONNECTED){
		console.log("connected");
	}
});

listener.connect();