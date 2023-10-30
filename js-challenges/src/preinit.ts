let bypassTutorialBlock = localStorage.getItem("bypassTutorialBlock") == "true";

let back = document.createElement("div");
back.className = "back";
let overlay = document.createElement("div");
overlay.className = "overlay";

let header = document.createElement("header");
let _pathname = location.pathname;
header.innerHTML = `
<div class="icon-btn">
    <div class="material-symbols-outlined">terminal</div>
    <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="material-symbols-outlined" style="font-size:50px;line-height:50px;width:50px;height:50px;margin-right:-3px">javascript</span> 
        <span>Challenges _</span>
    </div>

    <!--<div>JS Challenges _</div>-->
</div>
<div class="flx nav-list">
    <a href="index.html" class="nav-link nav-challenges ${_pathname.endsWith("index.html") || !_pathname.includes(".html") ? "cur" : ""}">
        <div class="material-symbols-outlined">exercise</div>
        <div>Challenges</div>
    </a>
    <a href="tutorials.html" class="nav-link nav-tutorials ${_pathname.endsWith("tutorials.html") ? "cur" : ""}">
        <div class="material-symbols-outlined">school</div>
        <div>Tutorials</div>
    </a>
</div>
`;

document.body.appendChild(back);
document.body.appendChild(overlay);
document.body.appendChild(header);

document.addEventListener("DOMContentLoaded",e=>{
    let main = document.querySelector(".main") as HTMLElement;

    // let navType = performance.getEntriesByType("navigation")[0].toJSON();
    // console.log(navType);
    // if(navType.type == "back_forward" || navType.type == "navigate"){
    //     main.style.animation = "BodyInit 0.2s cubic-bezier(0.075, 0.82, 0.165, 1)";
    // }

    if(_pathname.endsWith("tutorials.html")){
        if(bypassTutorialBlock){
            let sc = document.createElement("script");
            sc.src = "out/tutorial.js";
            document.body.appendChild(sc);
        }
        else{
            let mainTutBlock = document.querySelector(".main-guard");
            mainTutBlock.classList.remove("none");
        }
    }
});

window.addEventListener("beforeunload",e=>{
    let mainCont = document.querySelector(".main");
    for(let i = 0; i < mainCont.children.length; i++){
        let c = mainCont.children[i];
        c.classList.add("fade-away");
    }
});