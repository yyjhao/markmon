(function(markmon){
    markmon.util = {};
    markmon.util.TwoDArray = function(r, c){
        this._arr = new Array(r * c);
        // this._arr = {};
        this.row = r;
        this.col = c;
    };

    markmon.util.TwoDArray.prototype = {
        getInd: function(r, c){
            return r * this.col + c;
        },
        get2DInd: function(ind){
            return {
                r: ind / this.col | 0,
                c: ind % this.col
            };
        },
        get: function(r, c){
            return this._arr[this.getInd(r, c)];
        },
        set: function(r, c, val){
            this._arr[r * this.col + c] = val;
        },
        rawGet: function(ind){
            return this._arr[ind];
        }
    };

    Math.easeOutCirc = function (t, b, c, d) {
        t /= d;
        t--;
        return c * Math.sqrt(1 - t*t) + b;
    };

})(window.markmon ? window.markmon : window.markmon = {});