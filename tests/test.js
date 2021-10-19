const tap			= require("tap");
const WebSocketServer		= require ("../lib/WebSocketServerMockup");
const WebSocketServerDirectory	= require ("../lib/WebSocketServerDirectory");
const WebSocket			= require ("../lib/WebSocketMockup");

tap.test("Server",async function(suite){
	
	suite.test("open+close",function(test){
		//Init dir
		WebSocketServerDirectory.clear();
		//Create server
		const server = new WebSocketServer ({
			host: "test1.com"
		});

		server.on ("request", (request) => {
			//Get protocol
			const protocol = request.requestedProtocols[0];

			//Accept the connection
			const connection = request.accept (protocol, request.origin);
			//Wait for close
			connection.on ('close', function (reasonCode, description) {
				test.same(reasonCode,1);
				test.same(description,"closed");
				server.stop();
				test.end();
			});
		});

		//Websocket
		const ws = new WebSocket("wss://test1.com");

		//Events
		ws.onopen	= (event) => {
			ws.close(1,"closed");
		};
		ws.onclosed	= (event) => test.fail();
		ws.onerror	= (event) => test.fail();
		ws.onmessage	= (event) => test.fail();
	});
	
	suite.test("connect",function(test){
		//Init dir
		WebSocketServerDirectory.clear();
		//Create server
		const server = new WebSocketServer ({
			host: "test3.com"
		});

		server.on ("request", (request) => {
			//Get protocol
			const protocol = request.requestedProtocols[0];

			//Accept the connection
			const connection = request.accept (protocol, request.origin);
			//Wait for close
			connection.on ('close', function (reasonCode, description) {
				test.same(reasonCode,1);
				test.same(description,"closed");
				server.stop();
				test.end();
			});
		});

		//Do async
		(async()=>{
			try {
				//Websocket
				const ws = await server.connect("/test");
				//Close
				ws.close(1,"closed");
				ws.onerror	= (event) => test.fail();
				ws.onmessage	= (event) => test.fail();
			} catch (e) {
				test.fail();
			}
		})();
	});


	suite.test("connect reject",function(test){
		test.plan(3);
		//Init dir
		WebSocketServerDirectory.clear();
		//Create server
		const server = new WebSocketServer ({
			host: "test3b.com"
		});

		server.on ("request", (request) => {
			//Get protocol
			const protocol = request.requestedProtocols[0];

			//Accept the connection
			const connection = request.reject (400, "rejected");
		});

		//Do async
		(async()=>{
			try {
				//Websocket
				const ws = await server.connect("/test");
				test.fail();
			} catch (e) {
				test.ok(e);
				test.same(e.code,400);
				test.same(e.reason,"rejected");
			}
		})();
	});
	
	suite.test("open+server close",function(test){
		//Init dir
		WebSocketServerDirectory.clear();
		test.plan(1);
		//Create server
		const server = new WebSocketServer ({
			host: "test2.com"
		});

		server.on ("request", (request) => {
			//Get protocol
			const protocol = request.requestedProtocols[0];

			//Accept the connection
			const connection = request.accept (protocol, request.origin);
			//Close
			connection.close();
		});

		//Websocket
		const ws = new WebSocket("wss://test2.com");

		//Events
		ws.onopen	= (event) => test.pass();
		ws.onclosed	= (event) => {
			test.pass();
			server.close();
			test.end();
		};
		ws.onerror	= (event) => test.fail();
		ws.onmessage	= (event) => test.fail();
	});
	
	suite.test("default",function(test){
		//Init dir
		WebSocketServerDirectory.clear();
		//Create server
		const server = new WebSocketServer();

		server.on ("request", (request) => {
			//Get protocol
			const protocol = request.requestedProtocols[0];

			//Accept the connection
			const connection = request.accept (protocol, request.origin);
			//Wait for close
			connection.on ('close', function (reasonCode, description) {
				test.same(reasonCode,1);
				test.same(description,"closed");
				server.stop();
				test.end();
			});
		});

		//Websocket
		const ws = new WebSocket("/relative");

		//Events
		ws.onopen	= (event) => {
			ws.close(1,"closed");
		};
		ws.onclosed	= (event) => test.fail();
		ws.onerror	= (event) => test.fail();
		ws.onmessage	= (event) => test.fail();
	});
	
	suite.test("not found",function(test){
		//Init dir
		WebSocketServerDirectory.clear();
		//Websocket
		const ws = new WebSocket("wss://notfound.com");

		//Events
		ws.onopen	= (event) => test.fail();
		ws.onclosed	= (event) => test.fail();
		ws.onerror	= (event) => {
			test.pass();
			test.end();
		};
		ws.onmessage	= (event) => test.fail();
	});
	
	suite.test("rejected",function(test){
		//Init dir
		WebSocketServerDirectory.clear();
		test.plan(2);
		//Create server
		const server = new WebSocketServer ({
			host: "rejected.com"
		});

		server.on ("request", (request) => {
			//Get protocol
			const protocol = request.requestedProtocols[0];

			//Accept the connection
			const connection = request.reject(403,"Forbidden");
		});

		//Websocket
		const ws = new WebSocket("wss://rejected.com");

		//Events
		ws.onopen	= (event) => test.pass();
		ws.onclosed	= (event) => test.fail();
		ws.onerror	= (event) => {
			test.same(event.code,403);
			test.same(event.reason,"Forbidden");
			test.end();
		};
		ws.onmessage	= (event) => test.fail();
	});
	
	suite.test("echo",function(test){
		//Init dir
		WebSocketServerDirectory.clear();
		test.plan(4);
		//Create server
		const server = new WebSocketServer ({
			host: "echo.com"
		});

		server.on ("request", (request) => {
			//Get protocol
			const protocol = request.requestedProtocols[0];

			//Accept the connection
			const connection = request.accept (protocol, request.origin);
			
			//Echo
			connection.on('message', function (message) {
				if (message.type === 'utf8')
					connection.sendUTF (message.utf8Data);
				else if (message.type === 'binary')
					connection.sendBytes (message.binaryData);
			});
			//Wait for close
			connection.on ('close', function (reasonCode, description) {
				test.pass();
				server.stop();
				test.end();
			});
		});

		//Websocket
		const ws = new WebSocket("wss://echo.com");

		//Events
		ws.onopen	= (event) => {
			ws.send("hi");
			ws.send(new ArrayBuffer(2));
			test.pass();
		};
		ws.onclosed	= (event) => test.fail();
		ws.onerror	= (event) => test.fail();
		let count = 0;
		ws.onmessage	= (event) => {
			test.ok(event.data);
			if (count++)
				ws.close();
		};
	});
	
	suite.end();
	
});
