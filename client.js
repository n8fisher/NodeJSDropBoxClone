
require('./helper')
let co = require('co')
let fs = require('fs').promise
let nssocket = require('nssocket')
let path = require('path')
var net = require('net'),
    JsonSocket = require('json-socket');

let port = 8001; 
let host = '127.0.0.1';

let argv = require('yargs').argv



function* runCmd(path,type,method){
	let payload = { "method": method,                          
    				"path": path,
    				"type": type,                               
    				"updated": 14278518333                    
					}
	
	
	let socket = new JsonSocket(new net.Socket()) //Decorate a standard net.Socket with JsonSocket
	socket.connect(port, host)
	socket.on('connect', function() { //Don't send until we're connected
    	socket.sendMessage(payload)
    	socket.on('message', function(message) {
    		console.log(message.data)
        	console.log(message.path)
    	});
	});
  
}



function* main() {
	let command = argv.cmd
	yield runCmd(argv.path, "file", command)
}


module.exports = main	

