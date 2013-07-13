var Monobrow = require("../monobrow-server/monobrow");

var server = new Monobrow.Server({
	host:"localhost",
	port:8889
});

server.start();