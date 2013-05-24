var Client = require("../monobrow-node-client/monobrow-client").Client;
var listener = new Client({ host: "localhost", port: 8889 });

listener.on("customMessage", function(data) {
	console.log(data);
});

listener.on("ws-foo",function(data){
	console.log(data);
});

listener.connect();