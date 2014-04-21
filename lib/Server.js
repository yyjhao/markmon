var path = require("path"),
    fs = require("fs"),
    sys = require("sys"),
    exec = require('child_process').exec,
    express = require("express"),
    chokidar = require("chokidar");
    path = require("path"),
    spawn = require('child_process').spawn;

module.exports = function(port, filepath, command, callback, projectPath){
    "use strict";

    if (!projectPath && filepath) {
        projectPath = path.dirname(filepath);
    }

    var app = express();

    app.configure(function(){
        app.use(express.bodyParser());
        app.use(express.static(__dirname + "/../frontend"));
        if (projectPath) {
            app.use(express.static(projectPath));
        }
        app.use(app.router);
    });

    var server = require("http").createServer(app);
    var io = require("socket.io").listen(server);

    io.set('log level', 2);

    function done() {
        server.listen(port);
        console.log("Listening on", port);
        callback();
    }

    var lastResult = {
        html: ""
    };

    io.sockets.on("connection", function(socket){
        socket.emit("content", lastResult);
    });

    if (!filepath) {
        app.put('/', function(req, res) {
            var c = command.split(" ");
            var renderer = spawn(c[0], c.slice(1, c.length));
            var newHTML = "";
            req.on('data', function(chunk){
                renderer.stdin.write(chunk);
            });
            req.on('end', function(){
                renderer.stdin.end();
                res.writeHead(200);
                res.end();
            });
            renderer.stdout.on('data', function(data) {
                newHTML += data;
            });
            renderer.stderr.on('data', function(data) {
                console.log(data + "");
            })
            renderer.on('close',function(ecode){
                lastResult = {
                    html: newHTML
                };
                io.sockets.emit('content', lastResult);
            });
        });
        done();
    } else {

        var parse = function(callback){
            exec(command + " < " + '"' + filepath + '"', {
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

        var watcher = chokidar.watch(filepath, {ignored: /[\/\\]\./, persistent: true});
        watcher.on("change", function(fpath) {
            console.log("file changed");
            parse(function(result){
                lastResult = result;
                io.sockets.emit("content", lastResult);
            });
        });

        parse(function(result){
            lastResult = result;
            done();
        });
    }
};