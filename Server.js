var path = require("path"),
    fs = require("fs"),
    sys = require("sys"),
    exec = require('child_process').exec,
    express = require("express");

module.exports = function(port, filepath, command, callback){
    "use strict";

    var projectPath = path.dirname(filepath);

    var app = express();

    app.configure(function(){
        app.use(express.bodyParser());
        app.use(express.static("public"));
        app.use(express.static(projectPath));
        app.use(app.router);
    });

    var server = require("http").createServer(app);
    var io = require("socket.io").listen(server);

    io.set('log level', 2);

    function parse(callback){
        exec(command + " < " + filepath, {
            cwd: projectPath
        }, function(error, stdout, stderr){
            if(error){
                console.log("exec error:", error);
            } else {
                callback({
                    html: stdout,
                    error: stderr
                });
            }
        });
    }

    var lastResult;

    fs.watch(filepath, function(curr, prev) {
        console.log("file changed");
        parse(function(result){
            lastResult = result;
            io.sockets.emit("content", lastResult);
        });
    });

    io.sockets.on("connection", function(socket){
        socket.emit("content", lastResult);
    });

    parse(function(result){
        lastResult = result;
        server.listen(port);
        console.log("Listening on", port);
        callback();
    });
};