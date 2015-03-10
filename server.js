var http = require('http');
var express = require('express');
var app = express();
var controllers = require("./controllers");

app.set("view engine", "vash");

//set the public static resource folder
app.use(express.static(__dirname + "/public"));

controllers.init(app);

var server = http.createServer(app);

server.listen(1234);