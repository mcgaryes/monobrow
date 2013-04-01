"use strict";

var Server = require("../../../monobrow").Server;

var server = new Server({
	host:"127.0.0.1",
	port:8890,
	out:"log.out",
	error:"error.out"
});

server.on(Server.CLIENT_DID_CONNECT,function(connection){
	// ...
});

server.on(Server.CLIENT_DID_DISCONNECT,function(connection){
	// ...
});

server.start();