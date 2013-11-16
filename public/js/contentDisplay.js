(function(markmon){
    "use strict";

    var WrappedDomTree = markmon.WrappedDomTree;

    var curHTML = "";
    var dom = document.createElement("div");
    dom.className = "content";
    document.body.appendChild(dom);


    var lastChange = document.createElement("span");
    lastChange.className = "last-change-marker";

    var tree  = new WrappedDomTree(dom, true);

    var oriNode, spanNode;
    var isChangingTextNode = false;
    function removeLastChangeMarker(){
        if(!lastChange.parentElement) return;
        lastChange.parentElement.removeChild(lastChange);
        if(isChangingTextNode){
            var container = spanNode.parentElement;
            var ind = [].indexOf.call(container.childNodes, spanNode);
            container.removeChild(spanNode);
            if(ind === container.childNodes.length){
                container.appendChild(oriNode);
            } else {
                container.insertBefore(oriNode, container.childNodes[ind]);
            }
        }
    }

    function addLastChangeMarker(r){
        if(r.possibleReplace && !r.possibleReplace.cur.innerHTML && !r.possibleReplace.prev.innerHTML){
            isChangingTextNode = true;
            var ori = r.possibleReplace.prev.data,
                now = r.possibleReplace.cur.data;
            var l1 = ori.length - 1, l2 = now.length - 1;
            while(l1 && l2 && ori.charAt(l1) === now.charAt(l2)){
                l1--;
                l2--;
            }
            l2++;
            oriNode = r.possibleReplace.cur;
            var container = oriNode.parentElement;
            var ind = [].indexOf.call(container.childNodes, oriNode);
            container.removeChild(oriNode);
            spanNode = document.createElement("span");
            var before = document.createTextNode(now.substr(0, l2)),
                after = document.createTextNode(now.substr(l2, now.length - l2));
            spanNode.appendChild(before);
            spanNode.appendChild(lastChange);
            spanNode.appendChild(after);
            if(ind === container.childNodes.length){
                container.appendChild(spanNode);
            } else {
                container.insertBefore(spanNode, container.childNodes[ind]);
            }
        } else {
            isChangingTextNode = false;
            var ind = [].indexOf.call(r.last.parentElement.childNodes, r.last) + 1;
            if(ind === r.last.parentElement.childNodes.length){
                r.last.parentElement.appendChild(lastChange);
            } else {
                r.last.parentElement.insertBefore(lastChange, r.last.parentElement.childNodes[ind]);
            }
        }
        r.lastChange = lastChange;
    }

    markmon.contentDisplay = {
        // update the dom by only delete and insert and return a list of nodes
        // that are inserted and the last node for highlighting
        htmlStr: "",
        update: function(htmlStr){
            if(htmlStr === this.htmlStr) return;
            this.htmlStr = htmlStr;
            var newDom = document.createElement("div");
            newDom.innerHTML = htmlStr;
            removeLastChangeMarker();
            var newTree = new WrappedDomTree(newDom);
            var r = tree.diffTo(newTree);
            newTree.removeSelf();
            addLastChangeMarker(r);
            return r;
        }
    };
})(window.markmon ? window.markmon : window.markmon = {});