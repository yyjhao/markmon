# markmon

markmon is a pandoc/markdown previewer with fast Mathjax re-rendering.

![markmon](http://yjyao.com/images/markmon.png)

While this is built mainly for pandoc and Mathjax, it should also work for
other markdown parsers in general. Though you should really check out
[pandoc](http://johnmacfarlane.net/pandoc/) if you haven't.

Also note that markmon does not contain a parser itself.

## Features

* Edit markdown in your favorite editor, get update in real-time as you save
* Preview with anything connected to your network, including your mobile devices
* Automatically highlight and scroll to the latest change as the content updates
* Fast Mathjax re-rendering, no more loading messages!
* Support for loading locally referenced assets like images

## Install

```bash
npm install -g markmon
```

## How to use?

```bash
Usage: node ./bin/markmon [filename] --port [num] --command [string] --view [string] --projectdir [path] --stylesheet [path] --help

Options:
  --port        Port to listen to                                                 [default: 3000]
  --command     Command to parse markdown to html                                 [default: "pandoc --mathjax -N -t HTML5"]
  --view        Command to execute after the server is setup                    
  --projectdir  Root directory of your project, useful for local image resources
  --stylesheet  Path to your custom stylesheet                                  
  --help        Get this help message    
```

This will set up a local server at `localhost:[port]`, and you can access the
generated html through your web browsers.

An example of `--view` for Mac OS X is `--view "open
\"http://localhost:3000\""` which opens the page right after the server is set
up.

Note that `& open "http://localhost:3000\"` will not work since it takes some
time to set up the server and parse the markdown document.

`command` must be able to read from `stdin` and output html to `stdout`.

Also the working directory of `command` will be set to the directory of the file,
so commands like `markmon --command "pandoc --mathjax -N -t HTML5  --bibliograph=references.bib"`, where `references.bib` is in the same directory as the file, will work.

You can also separately specify a project directory which will be used to override the working directory.

Moreover, the directory of the file is also added as the static directory
of the server, so the locally referenced images will also be shown correctly.

Moreover, if no file name is specified, markmon will run in _server mode_: it will listen at the port for `PUT` requests of markdown documents and convert them into html  with the command specified, then broadcast the final html snippet  to all sockets. This can be useful for plugins etc.

## How does it work?

It sets up a `node.js` server to watch the markdown file, and parses the file
and sends out converted html segments via socket.io once there's an update.

The frontend then diff the current DOM tree and the new DOM tree and apply a
series of insertions and deletions to update the DOM tree. Then it runs
Mathjax render only on DOM nodes that are inserted. So in general the DOM
update and Mathjax rendering should be fast.

The `diff` algorithm is an optimized and recursive version of the classic
Levenshtein distance algorithm which runs in roughly Nd time, where N is the
length of the document and d is the length of change in terms of the dom
elements. So it is very fast for most cases, even if your document is large.

## Issues

* Only tested on Mac OS X 10.9. The file watcher may be problematic in some systems.

## License

MIT

## Acknowledgments

`style/fabirc_plaid.png` is obtained from [http://subtlepatterns.com](http://subtlepatterns.com)
