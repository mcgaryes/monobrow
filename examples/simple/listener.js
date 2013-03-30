var Client = require("../../clients/node/monobrow.client");

var listener = new Client();
listener.connect();

listener.on(Client.STATE_CHANGE,function(state){
	console.log(state);
});

listener.on(Client.DATA,function(data){
	console.log(data.toString());
});