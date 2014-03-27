(function(markmon){
    "use strict";

    var TwoDArray = markmon.util.TwoDArray;

    var curHash = 0;
    var hashTo = {};

    var WrappedDomTree = markmon.WrappedDomTree = function(dom, clone, rep){
        if(clone){
            this.shownTree = new WrappedDomTree(dom, false, this);
            this.dom = dom.cloneNode(true);
        } else {
            this.dom = dom;
            this.rep = rep;
        }
        this.clone = clone;
        this.hash = curHash++;
        hashTo[this.hash] = this;
        this.isText = dom.nodeType === 3;
        this.tagName = dom.tagName;
        this.className = dom.className;
        this.textData = dom.data;
        this.diffHash = {};
        if(this.isText){
            this.size = 1;
        } else {
            rep = this.rep;
            this.children = [].map.call(this.dom.childNodes, function(dom, ind){
                return new WrappedDomTree(dom, false, rep ? rep.children[ind] : null);
            });
            this.size = this.children.length ? this.children.reduce(function(prev, cur){
                return prev + cur.size;
            }, 0) : 0;
            if(!this.size) this.size = 1;
        }
    };

    WrappedDomTree.prototype = {
        diffTo: function(otherTree){
            if(this.clone){
                return this.shownTree.diffTo(otherTree);
            }
            var operations = this.rep.diff(otherTree).operations;

            var indexShift = 0;

            var last,
                possibleReplace,
                inserted = [],
                r;
            var lastOp,
                lastElmDeleted,
                lastElmInserted;
            if(operations){
                if(operations instanceof Array){
                    operations.forEach(function(op){
                        if(op.type === "d"){
                            if(lastOp && op.tree === lastOp.pos){
                                lastElmDeleted = this.children[op.tree + indexShift].dom;
                            } else {
                                lastElmDeleted = null;
                                lastElmInserted = null;
                            }
                            r = this.remove(op.tree + indexShift);
                            this.rep.remove(op.tree + indexShift);
                            last = r;
                            indexShift--;
                        } else if(op.type === "i"){
                            this.rep.insert(op.pos + indexShift, otherTree.children[op.otherTree]);
                            r = this.insert(op.pos + indexShift, otherTree.children[op.otherTree], this.rep.children[op.pos + indexShift]);
                            lastElmInserted = r;
                            inserted.push(r);
                            last = r;
                            indexShift++;
                        } else {
                            var re = this.children[op.tree + indexShift].diffTo(otherTree.children[op.otherTree]);
                            if(re.last) {
                                last = re.last;
                            }
                            if(re.possibleReplace) {
                                lastElmInserted = re.possibleReplace.cur;
                                lastElmDeleted = re.possibleReplace.prev;
                            }
                            inserted = inserted.concat(re.inserted);
                        }
                        lastOp = op;
                    }.bind(this));
                } else {
                    console.log(operations);
                    throw "invalid operations";
                }
            }
            if(lastOp && lastOp.type != 'i' && lastElmInserted && lastElmDeleted){
                possibleReplace = {
                    cur: lastElmInserted,
                    prev: lastElmDeleted
                };
            }
            return {
                last: last,
                inserted: inserted,
                possibleReplace: possibleReplace
            };
        },
        insert: function(i, tree, rep) {
            var dom = tree.dom.cloneNode(true);
            if(i === this.dom.childNodes.length){
                this.dom.appendChild(dom);
            } else {
                this.dom.insertBefore(dom, this.dom.childNodes[i]);
            }
            var ctree = new WrappedDomTree(dom, false, rep);
            this.children.splice(i, 0, ctree);
            return this.dom.childNodes[i];
        },
        remove: function(i){
            this.dom.removeChild(this.dom.childNodes[i]);
            this.children[i].removeSelf();
            this.children.splice(i, 1);
            return this.dom.childNodes[i - 1];
        },
        diff: function(otherTree){
            if(this.equalTo(otherTree)){
                return {
                    score: 0,
                    operations: null
                };
            }
            if(this.cannotReplaceWith(otherTree)){
                return {
                    score: 1/0,
                    operations: null
                };
            }
            var key = otherTree.hash;
            if(key in this.diffHash) return this.diffHash[key];

            var dp = new TwoDArray(this.children.length + 1, otherTree.children.length + 1);
            var p = new TwoDArray(this.children.length + 1, otherTree.children.length + 1);
            dp.set(0, 0, 0);
            var i, sum;

            sum = 0;
            for(i = 1; i < otherTree.children.length; i++){
                dp.set(0, i, sum);
                p.set(0, i, i - 1);
                sum += otherTree.children[i].size;
            }
            if(otherTree.children.length > 0){
                dp.set(0, otherTree.children.length, sum);
                p.set(0, otherTree.children.length, otherTree.children.length - 1);
            }

            sum = 0;
            for(i = 1; i < this.children.length; i++){
                dp.set(i, 0, sum);
                p.set(i, 0, (i - 1) * p.col);
                sum += this.children[i].size;
            }
            if(this.children.length){
                dp.set(this.children.length, 0, sum);
                p.set(this.children.length, 0, (this.children.length - 1) * p.col);
            }

            var self = this;
            function getScore(i, j, max){
                if(dp.get(i, j) !== undefined){
                    return dp.get(i, j);
                }
                if (max === undefined) {
                    max = 1/0;
                }
                if (max <= 0) {
                    return 1/0;
                }
                var val = getScore(i - 1, j - 1, max - self.children[i - 1].diff(otherTree.children[j - 1]).score) + self.children[i - 1].diff(otherTree.children[j - 1]).score;
                var prev = p.getInd(i - 1, j - 1);

                if (max != 1/0 && val >= max) {
                    dp.set(i, j, val);
                    p.set(i, j, prev);
                    return 1/0;
                }
                var other = getScore(i - 1, j, val - self.children[i - 1].size) + self.children[i - 1].size;
                if(other < val){
                    val = other;
                    prev = p.getInd(i - 1, j);
                    other = getScore(i, j - 1, val - otherTree.children[j - 1].size) + otherTree.children[j - 1].size;
                    if(other < val){
                        val = other;
                        prev = p.getInd(i, j - 1);
                    }

                }
                dp.set(i, j, val);
                p.set(i, j, prev);
                return val;
            }

            var score = getScore(this.children.length, otherTree.children.length);
            var operations = [];

            var cur = p.getInd(this.children.length, otherTree.children.length),
                cr = this.children.length - 1,
                cc = otherTree.children.length - 1;
            while(p.rawGet(cur) !== undefined){
                var prev = p.rawGet(cur),
                    rc = p.get2DInd(prev),
                    pr = rc.r - 1,
                    pc = rc.c - 1;
                if(pr === cr){
                    operations.unshift({
                        type: "i",
                        otherTree: cc,
                        pos: cr + 1
                    });
                } else if(pc === cc) {
                    operations.unshift({
                        type: "d",
                        tree: cr
                    });
                } else {
                    var op = this.children[cr].diff(otherTree.children[cc]).operations;
                    if(op && op.length){
                        operations.unshift({
                            type: "r",
                            tree: cr,
                            otherTree: cc
                        });
                    }
                }
                cur = prev;
                cr = pr;
                cc = pc;
            }

            this.diffHash[key] = {
                score: score,
                operations: operations
            };

            return this.diffHash[key];
        },
        equalTo: function(otherTree){
            return this.dom.isEqualNode(otherTree.dom);
        },
        cannotReplaceWith: function(otherTree){
            return  this.isText ||
                    otherTree.isText ||
                    this.tagName !== otherTree.tagName ||
                    this.className !== otherTree.className ||
                    this.className === "math" ||
                    otherTree.className === "math" ||
                    (this.tagName === "IMG" && !this.dom.isEqualNode(otherTree.dom));
        },
        getContent: function(){
            if(this.dom.outerHTML) return this.dom.outerHTML;
            else return this.textData;
        },
        removeSelf: function(){
            hashTo[this.hash] = null;
            this.children && this.children.forEach(function(c){
                c.removeSelf();
            });
        }
    };

})(window.markmon ? window.markmon : window.markmon = {});