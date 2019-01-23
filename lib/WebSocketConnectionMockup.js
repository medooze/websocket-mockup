const EventEmitter		= require("events").EventEmitter;

class WebSocketServerConnectionMockup extends EventEmitter
{
	constructor(websocket)
	{
		super();
		this.websocket = websocket;
	}
	
	send(data)
	{
		this.sendUTF(data.toString());
	}
	
	sendUTF(message)
	{
		this.emit("connection::message",message);
	}
	
	sendBytes(message)
	{
		this.emit("connection::message",message);
	}

	ping()
	{
		setTimeout(()=>this.emit("pong"),0);
	}
	
	pong()
	{
		
	}
	
	close(reasonCode,description) 
	{
		this.emit("connection::close",reasonCode,description);
	}
	
	drop(reasonCode,description)
	{
		this.emit("connection::close",reasonCode,description);
	}
	
}

module.exports = WebSocketServerConnectionMockup;