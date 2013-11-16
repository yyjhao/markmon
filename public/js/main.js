(function(markmon){
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
        var diffElm = r.last;
        if(diffElm){
            while(!diffElm.innerHTML)diffElm = diffElm.parentElement;
        }
        MathJax.Hub.Typeset(r.inserted, function(){
            if(diffElm){
                console.log(diffElm);
                setTimeout(function(){
                    window.scrollTo(0, diffElm.offsetTop - window.innerHeight / 2 |0);
                }, 10);
            }
        });
    });
})(window.markmon ? window.markmon : window.markmon = {});