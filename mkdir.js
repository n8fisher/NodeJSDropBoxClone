#!/usr/bin/env node --use_strict

require('./helper')

let _ = require('lodash');
let fs = require('fs').promise
let co = require('co')
let dir = process.argv[2]

let startDir =process.cwd()

let mkdir = co.wrap(function*  (paths) {
	for (let curToken of paths){
		if(curToken=="." || curToken =="/"){
			continue	
		}
		let dir = yield fs.mkdir(curToken)
		process.chdir(curToken)
	}	
	process.chdir(startDir)
  })


mkdir = co.wrap(mkdir)
function* main(){
	//Split input into an array
	//pass array to the function
	let paths = dir.split("/")
	mkdir(paths)
}

module.exports = main