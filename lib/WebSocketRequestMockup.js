const EventEmitter		= require("events").EventEmitter;
const HttpMocks			= require("node-mocks-http");
const URL			= require("url");

class WebSocketRequestMockup extends EventEmitter
{
	constructor(websocket,params)
	{
		super();
		this.websocket			= websocket;
		this.httpRequest		= HttpMocks.createRequest();
		this.host			= params.host;
		this.resourceURL		= URL.parse(websocket.url,this.host=="*" ? true : "wss://"+this.host);
		this.resource			= this.resourceURL.path,
		this.remoteAddress		= params.remoteAddress || "127.0.0.1";
		this.webSocketVersion		= 13;
		this.origin			= "";
		this.requestedExtensions	= [];
		this.requestedProtocols		= Array.isArray(websocket.protocols) ? websocket.protocols : [websocket.protocols]; 
	}
	
	accept(protocol,origin)
	{
		//Store origin
		this.origin = origin;
		//Accept ws
		const connection =  this.websocket.accept(protocol,origin);
		//Fire event
		this.emit("requestAccepted",connection);
		//Return it
		return connection;
	}
	
	reject(status,reason)
	{
		//Reject ws
		this.websocket.reject(status,reason);
		//Fire event
		this.emit("requestRejected");
	}
	
}

module.exports = WebSocketRequestMockup;