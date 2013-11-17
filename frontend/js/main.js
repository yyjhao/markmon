(function(markmon){
    var highlighter = document.querySelector(".highlighter"),
        scroller = markmon.scroller,
        contentDisplay = markmon.contentDisplay;

    var socket = io.connect(location.origin);
    socket.on("content", function(data){
        console.log("got data");
        var r = contentDisplay.update(data.html);
        console.log(r);
        if(!r) return;
        r.inserted = r.inserted.map(function(elm){
            while(elm && !elm.innerHTML) elm = elm.parentElement;
            return elm;
        }).filter(function(elm){
            return !!elm;
        });
        MathJax.Hub.Typeset(r.inserted, function(){
            if(r.lastChange){
                setTimeout(function(){
                    var line = r.lastChange.getBoundingClientRect().bottom + window.scrollY;
                    highlighter.style.top = line + "px";
                    scroller.scorllTo(line - window.innerHeight / 2 | 0);
                }, 10);
            }
        });
    });
})(window.markmon ? window.markmon : window.markmon = {});