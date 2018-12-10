# websocket-mockup
Mockup for websocket server and w3c websocket

## Install
```
npm i --save-dev websocket-mockup
```
## API

### WebSocketServerMockup

- constructor(params)

Create a new websocket server mockup. You can pass a `param.host` to be able to create different servers.

- Promise<WebsocketMockup> connect(url,protocols)

Will create a new websocket mockup in open state connected to this server

- Event: request

Event when a new websocket request is done, same API as the websocket server.

### Websocket

This is a shim of the W3C WebSocket intrface. It will connect to the WebSocketServerMockup which `host` matches the url host portion or to the default (`*`) one.
	
## Example

```
const {WebSocketServer,WebSocket} = require ("websocket-mockup");

const server = new WebSocketServer ({
	host: "example.com"
});

server.on ("request", (request) => {
	//Get protocol
	const protocol = request.requestedProtocols[0];

	//Accept the connection
	const connection = request.accept (protocol, request.origin);

	console.log ((new Date ()) + ' Connection accepted.');
	connection.on ('message', function (message) {
		if (message.type === 'utf8')
		{
			console.log ('Received Message: ' + message.utf8Data);
			connection.sendUTF (message.utf8Data);
		} else if (message.type === 'binary') {
			console.log ('Received Binary Message of ' + message.binaryData.length + ' bytes');
			connection.sendBytes (message.binaryData);
		}
	});
	connection.on ('close', function (reasonCode, description) {
		console.log ((new Date ()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
	});
});

const ws = new WebSocket("wss://example.com");

ws.onopen	= (event) => {
	console.log("opened");
	ws.send("hi!");
};
ws.onclosed	= (event) => console.log("closed");
ws.onerror	= (event) => console.log(event);
ws.onmessage	= (event) => {
	console.log("message: "+event.data);
	ws.close();
};
```