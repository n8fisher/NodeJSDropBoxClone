
require('./helper')
let mkd = require('./mkdir')

let co = require('co')
let fs = require('fs').promise
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
	let filePath = path.join(__dirname, 'files', req.url)
	let data = yield fs.writeFile(filePath, req.body)
	res.end()
}

function* post(req, res) {
    res.
    res.end()
}

function* create(req, res) {
    let filePath = path.join(__dirname, 'files', req.url)
	let data = yield fs.open(filePath, "wx")
	if(req.body){
		let result = yield fs.writeFile(filePath, req.body)
	}
	res.end()
}

function* createDIR(req, res) {
    let filePath = path.join(__dirname, 'files', req.url)
    let data = yield fs.open(filePath, "wx")
    if(req.body){
        let result = yield fs.writeFile(filePath, req.body)
    }
    res.end()
}


function* getFile(fileName) {
    let filePath = path.join(__dirname, base_dir, fileName)
    console.log("Fetching:" + filePath)
    let data = yield fs.readFile(filePath)
    return data
}

function* get(req, res) {
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
    app.get('*', wrap(get))
    app.put('*', wrap(create))
    app.post('*', bodyParser(), wrap(update))
    app.del('*', wrap(remove))	

    let port = 8000
    app.listen(port)
    console.log('LISTENING @ http://127.0.0.1:${port}')

}

module.exports = main	
