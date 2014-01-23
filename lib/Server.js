var path = require("path"),
    fs = require("fs"),
    sys = require("sys"),
    exec = require('child_process').exec,
    express = require("express"),
    chokidar = require("chokidar");
    path = require("path");

module.exports = function(port, filepath, command, callback){
    "use strict";

    var projectPath = path.dirname(filepath);

    var app = express();

    app.configure(function(){
        app.use(express.bodyParser());
        app.use(express.static(__dirname + "/../frontend"));
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

    var watcher = chokidar.watch(filepath, {ignored: /[\/\\]\./, persistent: true});
    watcher.on("change", function(fpath) {
<<<<<<< HEAD
        console.log("file changed");
=======
    console.log("file changed");
>>>>>>> bfd755b3d1c73c4d585131da14e3ca403f6b36bb
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