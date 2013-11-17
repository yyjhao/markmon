var prevContent = null;
var socket = io.connect(location.origin);
function domDiff(a, b){
    if(!a) return b;
    if(!b) return a;
    if(a == b) return null;
    if(a.data || b.data){
        if(!a.data || !b.data) return a;
        if(a.data == b.data) return null;
        return a;
    }
    if(a.innerHTML == b.innerHTML) return null;
    for(var i = 0; i < a.childNodes.length; i++){
        var d = domDiff(a.childNodes[i], b.childNodes[i]);
        if(d) return d;
    }
    if(a.childNodes.length != b.childNodes.length) return a.childNodes[a.childNodes.length - 1];
    return null;
}
var prevData = "";
socket.on("content", function(data){
    if(prevData == data.html) return;
    prevData = data.html;
    if(prevContent){
        console.log(prevContent);
        document.body.removeChild(prevContent);
    }
    var content = document.createElement("div");
    content.className = "content";
    content.innerHTML = data.html;
    document.body.appendChild(content);
    MathJax.Hub.Typeset(content, function(){
        if(prevContent){
            var diffElm = domDiff(content, prevContent);
            console.log(content, prevContent, diffElm);
            if(diffElm){
                while(!diffElm.innerHTML)diffElm = diffElm.parentElement;
                console.log(diffElm);
                setTimeout(function(){
                    window.scrollTo(0, diffElm.offsetTop - window.innerHeight / 2 |0);
                }, 10);
            }
        }
        prevContent = content;
    });
});