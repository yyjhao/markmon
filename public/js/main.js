(function(markmon){
    Math.easeOutCirc = function (t, b, c, d) {
        t /= d;
        t--;
        return c * Math.sqrt(1 - t*t) + b;
    };

    var scroller = markmon.scroller = {
        scrollTimer: 0,
        stepTime: 10,
        scorllTo: function(y){
            clearTimeout(this.scrollTimer);
            if(y === window.scrollY) return;
            this.time = 200;
            this.tick = (y - window.scrollY) / this.time * 10;
            this.step = 0;
            this.allSteps = this.time / 10;
            this.ori = window.scrollY;
            this.des = y;
            this.scroll();
        },
        scroll: function(){
            this.step++;
            var pos = Math.easeOutCirc(this.step, this.ori, this.step * this.tick, this.allSteps);
            window.scrollTo(0, pos | 0);
            if(Math.abs(this.des - pos) > 2) {
                this.scrollTimer = setTimeout(this.scroll, 10);
            }
        }
    };

    scroller.scroll = scroller.scroll.bind(scroller);

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
                    scroller.scorllTo(line - window.innerHeight / 2 | 0);
                }, 10);
            }
        });
    });
})(window.markmon ? window.markmon : window.markmon = {});