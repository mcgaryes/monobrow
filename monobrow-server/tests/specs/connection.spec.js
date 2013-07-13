var Connection = require("../../src/connection");
var EventEmitter = require("events").EventEmitter;

describe("The connection", function() {

	it("initializes correctly", function() {
		var s = Object.create(EventEmitter.prototype,{});
		var connection = new Connection({
			socket:s
		});
		expect(connection.cid.match(/cid/g).length).toBeGreaterThan(0);
	});

});