"use strict";

var Server = require("../../monobrow.server.js").Server;

var server = new Server({
	host:"127.0.0.1",
	port:8890,
	out:"log.out",
	error:"error.out"
});

server.start();