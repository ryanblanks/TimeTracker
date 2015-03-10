var http = require('http');
var express = require('express');
var app = express();
var controllers = require("./controllers");
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');

app.set("view engine", "vash");

//Opt into Services
app.use(session({ 
	secret: 'myNewTimeTrackerSight',
	resave: true,
	saveUninitialized: true
}));
app.use(cookieParser());
app.use(flash());

//set the public static resource folder
app.use(express.static(__dirname + "/public"));

controllers.init(app);

var server = http.createServer(app);

server.listen(1234);