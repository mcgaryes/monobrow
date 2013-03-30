// ============================================================
// === Client =================================================
// ============================================================

/**
 *
 */
var Client = module.exports = function(options) {

    var host = this._host = options && options.host ? options.host : "localhost";
    var port = this._port = options && options.port ? options.port : 8889;

    this._connected = false;
    this._socket = net.Socket();
    var delegate = this;
    
    this._socket.on("end", function() {
        delegate._connected = false;
        delegate.reconnect();
    });

    this._socket.on("error", function() {
        delegate._connected = false;
        delegate.reconnect();
    });

    this._socket.on("data",function(data){
        delegate.trigger(Client.DATA,data);
    });

    this._socket.on("connect", function() {
        this._state = Client.STATE_CONNECTED;
        delegate._connected = true;
        delegate.trigger(Client.STATE_CHANGE,this._state);
    });
};

Client.prototype = Object.create(Backbone.Events, {
    state:{

    },
    connect: {
        value: function() {
            if (!this._connected) {
                this._socket.connect(this._port, this._host);
            }
        }
    },
    reconnect: {
        value: function() {
            if (!this._connected) {
                console.log("Client attempting to reconnect to http://" + this._host + ":" + this._port);
                clearTimeout(this._timeout);
                this._timeout = undefined;
                var delegate = this;
                this._timeout = setTimeout(function() {
                    delegate.connect();
                }, 1000);
            }
        }
    },
    emit: {
        value: function(message) {
            if (this._connected) {
                this._socket.write(message);
            }
        }
    }
});

Client.STATE_CHANGE = "stateChangeEvent";
Client.DATA = "dataEvent";

Client.STATE_CONNECTED = "connected";
Client.STATE_DISCONNECTED = "disconnected";
Client.STATE_ERROR = "error";