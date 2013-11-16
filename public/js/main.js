(function(markmon){
    var highlighter = document.querySelector(".highlighter");
    var socket = io.connect(location.origin);
    socket.on("content", function(data){
        console.log("got data");
        var r = markmon.contentDisplay.update(data.html);
        console.log(r);
        if(!r) return;
        r.inserted = r.inserted.map(function(elm){
            while(!elm.innerHTML) elm = elm.parentElement;
            return elm;
        });
        if(r.possibleReplace){
            r.last = r.possibleReplace.cur;
        }
        var diffElm = r.last;
        if(diffElm){
            while(!diffElm.innerHTML)diffElm = diffElm.parentElement;
        }
        MathJax.Hub.Typeset(r.inserted, function(){
            if(diffElm){
                console.log(diffElm);
                setTimeout(function(){
                    highlighter.style.top = diffElm.offsetTop + diffElm.offsetHeight + "px";
                    window.scrollTo(0, diffElm.offsetTop + diffElm.offsetHeight - window.innerHeight / 2 |0);
                }, 10);
            }
        });
    });
})(window.markmon ? window.markmon : window.markmon = {});