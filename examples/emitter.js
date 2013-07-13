var Client = require("../monobrow-client-node/monobrow-client").Client;
var emitter = new Client({
	host: "localhost",
	port: 8889
});

var interval;

emitter.on(Client.STATE_CHANGE, function(state, previousState) {

	if (state === Client.CONNECTED) {

		interval = setInterval(function() {

			if (emitter.state !== Client.CONNECTED) {
				// clearing the interval will essentially kill this process
				clearInterval(interval);
				return;
			}

			emitter.sendMessage("nfoo", { bar: new Date().getTime() });

		}, 1000);
	}
});



emitter.connect();