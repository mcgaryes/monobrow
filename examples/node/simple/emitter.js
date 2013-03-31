var Client = require("../../../clients/node/monobrow.client");

var emitter = new Client();
emitter.connect();

emitter.on(Client.STATE_CHANGE,function(state){
	if(state === Client.STATE_CONNECTED) {
		setInterval(function() {
			emitter.emit("foo");
		}, 3000);
	}
});