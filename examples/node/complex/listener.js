var Client = require("../../../clients/node/monobrow-client");

var listener = new Client({
	id:"complex-emitter",
	host:"127.0.0.1",
	port:8890,
	out:"emitter.log.out",
	error:"emitter.error.out"
});
listener.connect();

listener.on(Client.DATA,function(data){
	console.log(data.toString());
});