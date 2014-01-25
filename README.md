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

## Install

```bash
npm install -g markmon
```

## How to use?

```bash
Usage: markmon [filename] --port [num] --command [string] --view [string]

Options:
  --port     Port to listen to                             [default: 3000]
  --command  Command to parse markdown to html             [default: "pandoc --mathjax -N -t HTML5"]
  --view     Command to execute after the server is setup

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

Moreover, the directory of the file is also added as the static directory
of the server, so the locally referenced images will also be shown correctly.

## How does it work?

It sets up a `node.js` server to watch the markdown file, and parses the file
and sends out converted html segments via socket.io once there's an update.

The frontend then diff the current DOM tree and the new DOM tree and apply a
series of insertions and deletions to update the DOM tree. Then it runs
Mathjax render only on DOM nodes that are inserted. So in general the DOM
update and Mathjax rendering should be fast.

## Issues

* Only tested on Mac OS X 10.9. The file watcher may be problematic in some systems.

## License

MIT

## Acknowledgments

`style/fabirc_plaid.png` is obtained from [http://subtlepatterns.com](http://subtlepatterns.com)