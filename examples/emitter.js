var Client = require("../monobrow-node-client/monobrow-client").Client;
var emitter = new Client({
	host: "localhost",
	port: 8889
});

var interval;

emitter.on(Client.STATE_CHANGE, function(state, previousState) {

	if (state === Client.STATE_CONNECTED) {

		interval = setInterval(function() {

			if (emitter.state !== Client.STATE_CONNECTED) {
				// clearing the interval will essentially kill this process
				clearInterval(interval);
				return;
			}

			emitter.trigger("customMessage", "custom-message");

		}, 1000);
	}
});



emitter.connect();