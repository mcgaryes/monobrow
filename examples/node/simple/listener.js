var Client = require("../../../clients/node/monobrow-client");

var listener = new Client();
listener.connect();

listener.on(Client.DATA,function(data){
	console.log(data.toString());
});