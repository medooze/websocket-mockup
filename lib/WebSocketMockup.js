const WebSocketServerDirectory  = require("./WebSocketServerDirectory");
const WebSocketConnectionMockup	= require("./WebSocketConnectionMockup");
const Yaeti			= require("yaeti");
const URL			= require("url");

//Websocket states
const CONNECTING	= 0;
const OPEN		= 1;
const CLOSING		= 2;
const CLOSED		= 3;

class MessageEvent extends Yaeti.Event
{
	constructor(data)
	{
		super("message");
		
		// Expose W3C read only attributes.
		Object.defineProperties(this, {
			data		: { get: function() { return data;	}, configurable: false, enumerable: true  },
		});
	}
}

class CloseEvent extends Yaeti.Event
{
	constructor(code,reason,wasClean)
	{
		super("close");
		
		// Expose W3C read only attributes.
		Object.defineProperties(this, {
			code		: { get: function() { return code;	}, configurable: false, enumerable: true  },
			reason		: { get: function() { return reason;	}, configurable: false, enumerable: true  },
			wasClean	: { get: function() { return wasClean;	}, configurable: false, enumerable: true  },
		});
	}
}

class WebSocketMockUp extends Yaeti.EventTarget
{
	constructor(url,protocols,params,server)
	{
		super();
		//Store protocols
		this.protocols = protocols;
		
		//Initial state
		this.state = CONNECTING;
		
		//Get remote address
		const remoteAddress = params && params.remoteAddress ? params.remoteAddress : "127.0.0.1";

		// Expose W3C read only attributes.
		Object.defineProperties(this, {
			url		: { get: function() { return url;			}, configurable: false, enumerable: true },
			readyState	: { get: function() { return this.state;		}, configurable: false, enumerable: true  },
			protocol	: { get: function() { return this.serverProtocol;	}, configurable: false, enumerable: true  },
			extensions	: { get: function() { "";				}, configurable: false, enumerable: true  },
			bufferedAmount	: { get: function() { return 0;				}, configurable: false, enumerable: true  },
			remoteAddress	: { get: function() { return remoteAddress;		}, configurable: false, enumerable: true  }
		});
		
		//If wer don't have a server
		if (!server)
			//Get server for the url
			server = WebSocketServerDirectory.find(url);
		
		//Connect Async
		setTimeout(()=>{
			//Check if there is a server for the
			try {
				//Connect
				server.request(this,params);
			} catch(e) {
				//Set state
				this.state = CLOSED;
				//Dispatch
				this.dispatchEvent(new Yaeti.Event("error"));
			}
		},0);
	}
	
	
	send(message)
	{
		setTimeout(()=>{
			//Check message format
			if (typeof message == "string")
				//Send utf8 message
				this.connection.emit("message",{
					utf8Data : message,
					type	 :  "utf8"
				});
			else 
				//Send binary message
				this.connection.emit("message",{
					binaryData : message,
					type	 :  "binary"
				});
		},0);
	}
	
	close(code,reason) 
	{
		switch(this.state) 
		{
			case CONNECTING:
				break;
			case OPEN:
				this.state = CLOSING;
				setTimeout(()=>{
					this.connection.emit("close",code,reason);
					this.state = CLOSED;
				},0);
				break;
			case CLOSING:
			case CLOSED:
			break;
		}
	}
	
	//Server comands
	accept(connection, protocol) 
	{
		//Check state
		if (this.state!=CONNECTING)
			//Error
			throw new Error("Invalid state");
		//Connected
		this.state = OPEN;
		
		//Store the server accepted protocol
		this.serverProtocol = protocol;
		
		//Server connection proxy
		this.connection = new WebSocketConnectionMockup(this);
		
		//Listen for events
		this.connection.on("connection::message",(message)=>{
			//Dispatch
			this.dispatchEvent(new MessageEvent(message));
		});
		
		this.connection.on("connection::close",(code,reason,wasClean)=>{
			switch(this.state) 
			{
				case CONNECTING:
					break;
				case OPEN:
					//Set state
					this.state = CLOSED;
					
					//Dispatch async
					setTimeout(()=>this.dispatchEvent(new CloseEvent(code,reason,wasClean)),0);
					break;
				case CLOSING:
				case CLOSED:
				break;
			}
		});
		
		//Async
		setTimeout(()=>{
			//Create event
			const open = new Yaeti.Event("open");
		
			//Dispatch
			this.dispatchEvent(open);
		});
		
		//Done
		return this.connection;
	}
	
	reject(status,reason)
	{
		//Check state
		if (this.state!=CONNECTING)
			//Error
			throw new Error("Invalid state");
		
		//Set state
		this.state = CLOSED;
		
		//Create error message
		const error = new Yaeti.Event("error");
		
		// Expose W3C read only attributes.
		Object.defineProperties(error, {
			code	: { get: function() { return status;		}, configurable: false, enumerable: true  },
			reason	: { get: function() { return reason;		}, configurable: false, enumerable: true  },
		});
		//Dispatch
		this.dispatchEvent(error);
	}
};

module.exports = WebSocketMockUp;
