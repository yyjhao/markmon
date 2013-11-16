#!/usr/bin/env node

var path = require("path"),
    fs = require("fs"),
    sys = require("sys"),
    exec = require('child_process').exec;

var configFile = process.argv[2] || "config.json",
    configPath = path.resolve(__dirname, configFile),
    projectPath = path.dirname(configPath);

var config, projectPath;

try{
    config = JSON.parse(fs.readFileSync(configPath));
} catch(e){
    console.log(e);
    console.log(configFile);
    console.log("Error loading config file");
    process.exit();
}


var filepath = path.resolve(projectPath, config.file),
    port = 3000 || config.port,
    command = config.command;

var express = require("express");

var app = express();

var server = require("http").createServer(app);
var io = require("socket.io").listen(server);

app.configure(function(){
    app.use(express.bodyParser());
    app.use(express.static("public"));
    app.use(express.static(projectPath));
    app.use(app.router);
});

server.listen(port);
console.log("Listening on", port);

var lastInfo;

fs.watch(filepath, function(curr, prev) {
    console.log("file changed");
    exec(command + " < " + filepath, {
            cwd: projectPath
        }, function (error, stdout, stderr) {
            lastInfo = { html: stdout, error: stderr };
            io.sockets.emit("content", lastInfo);
            sys.print('stdout: ' + stdout);
            sys.print('stderr: ' + stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
});

io.sockets.on("connection", function(socket){
    socket.emit("content", lastInfo);
});