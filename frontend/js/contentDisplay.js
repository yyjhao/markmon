(function(markmon){
    "use strict";

    var WrappedDomTree = markmon.WrappedDomTree,
        changeHighlighter = markmon.changeHighlighter;

    var curHTML = "";
    var dom = document.createElement("div");
    dom.className = "content";
    document.body.appendChild(dom);

    var tree  = new WrappedDomTree(dom, true);

    markmon.contentDisplay = {
        // update the dom by only delete and insert and return a list of nodes
        // that are inserted and the last node for highlighting
        htmlStr: "",
        update: function(htmlStr){
            if(htmlStr === this.htmlStr) return;
            var firstTime = this.htmlStr === "";
            this.htmlStr = htmlStr;
            var newDom = document.createElement("div");
            newDom.className = 'content';
            newDom.innerHTML = htmlStr;
            changeHighlighter.removeMarker();
            var newTree = new WrappedDomTree(newDom);
            window.newTree = newTree;
            window.oldTree = tree;
            console.time("diff");
            console.profile("pdiff");
            var r = tree.diffTo(newTree);
            console.timeEnd("diff");
            console.profileEnd("pdiff");
            newTree.removeSelf();
            if(firstTime){
                r.possibleReplace = null;
                r.last = null;
                return r;
            }
            if(r.possibleReplace){
                changeHighlighter.addMarkerTo(r.possibleReplace.cur, r.possibleReplace.prev);
            } else {
                changeHighlighter.addMarkerTo(r.last);
            }
            return r;
        }
    };
})(window.markmon ? window.markmon : window.markmon = {});