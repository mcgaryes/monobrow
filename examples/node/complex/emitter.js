var Client = require("../../../clients/node/monobrow.client");

var interval;
var counter = 0;
var reconnect;
var maxTries = 3;

var emitter = new Client({
	id:"emitter" + Math.round(Math.random()*1000),
	host:"127.0.0.1",
	port:8890,
	out:"emitter.log.out",
	error:"emitter.error.out"
});

emitter.connect();

emitter.on(Client.STATE_CHANGE,function(state, previousState){

	if(state === Client.STATE_CONNECTED) {

		counter = 0;
		interval = setInterval(function() {
			if(emitter.state === Client.STATE_CONNECTED) {
				emitter.emit(emitter.id + " - " +  String(new Date().getTime()));
			} else {
				clearInterval(interval);
			}
		}, 1000);

	} else if (state === Client.STATE_ERROR || state === Client.STATE_DISCONNECTED) {

		if(previousState === Client.STATE_INITIALIZED || previousState === Client.STATE_CONNECTED) {
			console.log("Will attempt to reconnect " + maxTries + " times...");
		}
		
		setTimeout(function(){
			if(counter < maxTries) {
				console.log("Attempting to reconnect to the server...");
				emitter.connect();
				counter++;
			} else {
				console.log("To many tries. Will not try to reconnect again.")
			}
		}, 3000);
	}

});