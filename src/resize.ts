/**
 * Resize Lib
 * by Claeb
 */

function setCursor(cur:string){
    document.body.style.cursor = cur;
}
function endCursor(...curs:string[]){
    if(curs.includes(document.body.style.cursor)) document.body.style.cursor = "default";
}

// global vars

let resizes = document.querySelectorAll(".resize") as NodeListOf<HTMLElement>;
let dragging:{elm:HTMLElement,call:(v:number,amt:number)=>void};
let dragDir = "";
let dragSx = 0;
let dragSy = 0;
let dragSw = 0;
let dragSh = 0;

let resizeListeners = {
    // "bottom-pane":(v:number,amt:number)=>{
    //     bottomPanelHeight = v;
    //     applyNewSizing();
    // } // <- Example
    "*":(v:number,amt:number)=>{
        onResize();
    }
};

for(const a of resizes){
    if(!a.hasAttribute("resize")) continue;
    let list = a.getAttribute("resize").split(" ");
    for(const dir of list){
        a.style.position = "relative";
        let d = document.createElement("div");
        d.className = "resize "+dir;
        a.appendChild(d);

        // css
        a.style.position = "relative";
        a.style.minWidth = "150px";
        a.style.minHeight = "150px";
        d.setAttribute("style",{
            r:`
                right:-5px; 
                width:10px;
                height:100%;
                cursor:ew-resize;
            `,
            l:`
                left:-5px;
                width:10px;
                height:100%;
                cursor:ew-resize;
            `,
            d:`
                bottom:-5px;
                height:10px;
                width:100%;
                cursor:ns-resize;
            `,
            u:`
                top:-5px;
                height:10px;
                width:100%;
                cursor:ns-resize;
            `
        }[dir]);
        d.style.position = "absolute";
        d.style.opacity = "0";
        d.style.zIndex = "9999999";
        // 
        
        d.onmousedown = function(e){
            dragging = {elm:a,call:resizeListeners[a.id] || resizeListeners["*"]};
            dragDir = dir;
            dragSx = e.clientX;
            dragSy = e.clientY;
            dragSw = a.offsetWidth;
            dragSh = a.offsetHeight;
            let iframes = document.querySelectorAll("iframe");
            for(const c of iframes){
                c.style.pointerEvents = "none";
            }
        };
    }
}

// listeners

document.addEventListener("mousemove",e=>{
    if(dragging){
        let dx = e.clientX-dragSx;
        let dy = e.clientY-dragSy;
        if(dragDir == "r"){
            setCursor("ew-resize");
            dragging.elm.style.width = (dragSw+dx)+"px";
            if(dragging.call) dragging.call(dragging.elm.offsetWidth,dragSw+dx);
        }
        else if(dragDir == "l"){
            setCursor("ew-resize");
            dragging.elm.style.width = (dragSw-dx)+"px";
            if(dragging.call) dragging.call(dragging.elm.offsetWidth,dragSw-dx);
        }
        if(dragDir == "d"){
            setCursor("ns-resize");
            dragging.elm.style.height = (dragSh+dy)+"px";
            if(dragging.call) dragging.call(dragging.elm.offsetHeight,dragSh+dy);
        }
        else if(dragDir == "u"){
            setCursor("ns-resize");
            dragging.elm.style.height = (dragSh-dy)+"px";
            if(dragging.call) dragging.call(dragging.elm.offsetHeight,dragSh-dy);
        }
    }
});
document.addEventListener("mouseup",e=>{
    if(dragging){
        dragging = null;
        endCursor("ew-resize","ns-resize");
        let iframes = document.querySelectorAll("iframe");
        for(const c of iframes){
            c.style.pointerEvents = "revert";
        }
    }
});
document.addEventListener("dragstart",e=>{
    if(dragging){
        e.preventDefault();
    }
});