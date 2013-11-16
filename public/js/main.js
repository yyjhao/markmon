(function(markmon){
    var highlighter = document.querySelector(".highlighter");
    var socket = io.connect(location.origin);
    socket.on("content", function(data){
        console.log("got data");
        var r = markmon.contentDisplay.update(data.html);
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
                    var line = r.lastChange.offsetTop + r.lastChange.offsetHeight;
                    highlighter.style.top = line + "px";
                    window.scrollTo(0, line - window.innerHeight / 2 |0);
                }, 10);
            }
        });
    });
})(window.markmon ? window.markmon : window.markmon = {});