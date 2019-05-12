var http = require('http').createServer(handler);
var io = require('socket.io')(http);
var fs = require('fs');

//we are adding new users to the chat
var newClient = [];

http.listen(2406);

console.log("Chat server listening on port 2406");


function handler(req,res){
	fs.readFile("./index.html", function(err,data){
		if(err){
			res.writeHead(500);
			return res.end("Error loading index.html");
		}else{
			res.writeHead(200);
			res.end(data);
		}
	});
};

io.on("connection", function(socket){
	console.log("We have a connection");
	
	socket.on("intro",function(data){
				
		socket.username = data;
		socket.broadcast.emit("message", timeLog()+": "+socket.username+" has entered the chatroom.");
		socket.emit("message","Welcome, "+socket.username+".");

		newClient.push(socket);
		io.emit("user_List",get_user());

	});

	//message
	socket.on("message", function(data){
		console.log("got message: "+data);
		
		socket.broadcast.emit("message",timeLog()+", "+socket.username+": "+data);
	});

	socket.on("private", function(data){
		console.log("username private " + socket.username);
		console.log("got message: "+data );
		io.emit("message",timeLog()+", "+socket.username+": "+data);

	});

	//disconnect 
	socket.on("disconnect", function(){
		console.log(socket.username+" disconnected");
		io.emit("message", timeLog()+": "+socket.username+" disconnected.");

		newClient = newClient.filter(function(value){  
			return value!==socket;
		});	

		io.emit("user_List",get_user());
	});
	
});

function get_user(){
    var num = [];
    
	for(var i=0;i<newClient.length;i++){
        num.push(newClient[i].username);
        console.log("user " + newClient[i].username + " entered");
    }
    
	return num;
}

function timeLog(){
	return new Date().toLocaleTimeString();
}