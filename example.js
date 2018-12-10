const WebSocketServer = require ("../lib/WebSocketServerMockup");
const WebSocket = require ("../lib/WebSocketMockup");

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
