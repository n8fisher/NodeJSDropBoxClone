
require('./helper')
let utils = require('./common')
let mkd = require('./mkdir')

let co = require('co')
let fs = require('fs').promise
let nssocket = require('nssocket')
let net = require('net')
let JsonSocket = require('json-socket')

let express = require('express')
let morgan = require('morgan')
let trycatch = require('trycatch')
let wrap = require('co-express')
let bodyParser = require('simple-bodyparser')
//let bodyParser = require('body-parser')
let path = require('path')
let mime = require('mime-types')
//let stat = require('stat')


var base_dir='files'

function* remove(req, res) {
	let filePath = path.join(__dirname, base_dir, req.url)
	let data = yield fs.unlink(filePath)
	res.end()
}

function* head(req,res){
    let data = yield fs.readFile(filePath)
    res.contentType(mime.lookup('text') )
    res.setHeader('Content-Length', res.body.length)
    res.end()
}

function* update(req, res) {
	let filePath = path.join(__dirname, base_dir, req.url)
	let data = yield fs.writeFile(filePath, req.body)
	res.end()
}

function* post(req, res) {
    res.
    res.end()
}

function* put(filePath, body_data) {
    let fileh = yield fs.open(filePath, "wx")
    if(fileh){
        let result = yield fs.writeFile(filePath, body_data)
        return result
    }
}

function* putIfAbsent(path, data) {
    let stat = yield fs.stat(filePath)
    if (stat && isFile()) {
        let putit = yield  put(path,data)
    }
}

function* doPut(req, res) {
    let filePath = path.join(__dirname, base_dir, req.url)
    if(req.body){
        let pia = yield putIfAbsent(filePath, req.body)
    }
}


function* createDirHTTP(req, res) {
    let filePath = path.join(__dirname, base_dir, req.url)
    mkd.mkdir(filePath)
    res.end()
}

function* createDir(dir) {
    mkd.mkdir(dir)
    res.end()
}


function* getFile(fileName) {
    let filePath = path.join(__dirname, base_dir, fileName)
    console.log("Fetching:" + filePath)
    let data = yield fs.readFile(filePath)
    return data
}

function* doGet(req, res) {
	let data = yield getFile(req.url)
    if(data){
        res.contentType(mime.lookup('text') )
        res.setHeader('Content-Length', data.length)
        res.end(data)
    }else{
        res.writeHead(500)
        res.end()
    }
    
}


function* main() {
    let app = express()
    app.use(morgan('dev'))
    app.use((req, res, next) => {
        trycatch(next, e => {
            console.log(e.stack)
            res.writeHead(500)
            res.end(e.stack)
        })
    })

    app.head('*', wrap(head))
    app.get('*', wrap(doGet))
    app.put('*', wrap(doPut))
    app.post('*', bodyParser(), wrap(update))
    app.del('*', wrap(remove))	

    let port = 8000
    app.listen(port)
    console.log('LISTENING @ http://127.0.0.1:8000')
   
    
    var server = net.createServer();
    server.listen(port+1);
    server.on('connection', function(socket) { //This is a standard net.Socket
    socket = new JsonSocket(socket); //Now we've decorated the net.Socket to be a JsonSocket
    socket.on('message', function (message) {
        let result = {}
        switch(message.method) {
            case "GET":
                console.log("Getting")
                let file = getFile(message.path)
                result.data = file
                result.type = "file"
                break
            case "PUT":
                console.log("Putting")
                putIfAbsent(message.path, message.data)
                result.status = "success"
                break
            case "PUT":
                console.log("Updatig")
                overwrite(message.path, message.data)
                result.status = "success"
                break
            case "DELETE":
                console.log("Removing")
                remove(message.path)
                result.status = "success"
                break
            case "MKDIR":
                console.log("Make dir")
                mkdir(message.path)
                result.status = "success"
                break
            default:
                console.log("ERROR, dropbox method not found: " + message.method)
        }
        socket.sendEndMessage(result);
    })
})

    console.log('TCP SERVER @ 127.0.0.1:8001')

}

module.exports = main	
