(function(markmon){
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
})(window.markmon ? window.markmon : window.markmon = {});