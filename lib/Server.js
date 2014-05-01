var path = require("path"),
    fs = require("fs"),
    sys = require("sys"),
    exec = require('child_process').exec,
    express = require("express"),
    chokidar = require("chokidar");
    path = require("path"),
    spawn = require('child_process').spawn,
    mime = require("mime");

module.exports = function(options, callback){
    "use strict";

    var port = options.port,
        filepath = options.filepath,
        command = options.command,
        projectPath = options.projectpath,
        stylesheet = options.stylesheet;

    if (projectPath) {
        projectPath = path.resolve(process.cwd(), projectPath);
    }else if (filepath) {
        projectPath = path.dirname(filepath);
    }

    if (stylesheet) {
        stylesheet = path.resolve(process.cwd(), stylesheet);
    }

    var app = express();

    app.configure(function(){
        app.use(express.bodyParser());
        app.use(app.router);
        app.use(express.static(__dirname + "/../frontend"));
        if (projectPath) {
            console.log("project path", projectPath);
            app.use(express.static(projectPath));
        }
    });

    if (stylesheet) {
        var stylesheetContent = fs.readFileSync(stylesheet),
            type = mime.lookup(stylesheet);
        app.get("/style/style.css", function(req, res) {
            res.setHeader('Content-type', type);
            res.send(stylesheetContent);
        });
    }

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

    app.del('/', function(req, res) {
        process.exit(0);
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