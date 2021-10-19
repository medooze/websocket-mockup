const EventEmitter		= require("events").EventEmitter;
const WebSocketServerDirectory  = require("./WebSocketServerDirectory");
const WebSocketMockup		= require("./WebSocketMockup");
const WebSocketRequestMockup	= require("./WebSocketRequestMockup");

class WebSocketServerMockup extends EventEmitter
{
	constructor(params)
	{
		super();
		//Get host param
		this.host = params && params.host ? params.host : "*";
		//Add to directory
		WebSocketServerDirectory.set(this.host, this);
	}
	
	connect(url,protocols)
	{
		return new Promise((resolve,reject)=>{
			//Create mockup websocket
			const websocket = new WebSocketMockup(url,protocols,this);
			//Set handlers
			websocket.addEventListener("open", ()=>resolve(websocket));
			websocket.addEventListener("error",(error)=>reject(error));
		});
	}
	
	request(websocket)
	{
		//Emit
		this.emit("request",new WebSocketRequestMockup(websocket,{
			host			: this.host,
			remoteAddress		: "127.0.0.1",
		}));
	}
	
	stop()
	{
		//Remove from directory
		WebSocketServerDirectory.set(this.host, this);
	}
};

module.exports = WebSocketServerMockup;