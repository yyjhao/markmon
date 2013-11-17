#!/usr/bin/env node

var path = require("path"),
    sys = require("sys"),
    fs = require("fs"),
    Server = require("./Server");

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

var server = Server(port, filepath, command);