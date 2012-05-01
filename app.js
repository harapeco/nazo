
/**
 * Module dependencies.
 */

var express = require('express')
	,routes = require('./routes')
	,io = require('socket.io')
	,util = require('util');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	app.use(express.errorHandler());
});

var socket = io.listen(app);
socket.on('connection', function(client) {
	client.on('message', function(message) {
		client.broadcast.send(message);
	});
});

// Routes

app.get('/', function(req, res){
	res.render('index', {title:'Graffy'});
});

app.listen(3003, function(){
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
