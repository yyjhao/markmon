(function(markmon){
    var WrappedDomTree = markmon.WrappedDomTree;

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
            this.htmlStr = htmlStr;
            var newDom = document.createElement("div");
            newDom.innerHTML = htmlStr;
            var newTree = new WrappedDomTree(newDom);
            var r = tree.diffTo(newTree);
            newTree.removeSelf();
            return r;
        }
    };
})(window.markmon ? window.markmon : window.markmon = {});