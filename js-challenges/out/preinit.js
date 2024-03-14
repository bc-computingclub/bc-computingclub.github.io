var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        <span><span class="title-main">challenges</span> _</span>
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
document.addEventListener("DOMContentLoaded", e => {
    if (_pathname.endsWith("tutorials.html")) {
        if (bypassTutorialBlock) {
            let sc2 = document.createElement("script");
            sc2.src = "out/tutorial_engine.js";
            document.body.appendChild(sc2);
            sc2.onload = function () {
                let sc = document.createElement("script");
                sc.src = "out/tutorial.js";
                document.body.appendChild(sc);
            };
        }
        else {
            let mainTutBlock = document.querySelector(".main-guard");
            mainTutBlock.classList.remove("none");
        }
    }
});
window.addEventListener("beforeunload", e => {
    let mainCont = document.querySelector(".main");
    for (let i = 0; i < mainCont.children.length; i++) {
        let c = mainCont.children[i];
        c.classList.add("fade-away");
    }
});
const titleMain = document.querySelector(".title-main");
function initTitleMain() {
    let text = (_pathname.endsWith("/tutorials.html") ? "tutorials" : "challenges");
    titleMain.textContent = text;
    let arr = text.split("");
    let list = "abcdefghijklmnopqrstuvwxyz";
    for (let i = 0; i < text.length; i++) {
        let time = 0;
        let ind = list.indexOf(arr[i]);
        let startInd = ind;
        let startSpeedMult = (Math.random() + 1) * 50;
        function change() {
            return __awaiter(this, void 0, void 0, function* () {
                if (ind == startInd && time != 0) {
                    titleMain.textContent = arr.join("");
                    return;
                }
                time++;
                ind += 2;
                ind %= list.length;
                arr[i] = list[ind];
                titleMain.textContent = arr.join("");
                let speed = Math.cos(time / list.length * Math.PI) * startSpeedMult + i * i / 30;
                yield wait(speed);
                change();
            });
        }
        setTimeout(() => {
            change();
        }, i * 50); //40
    }
}
initTitleMain();
function showMainCont() {
    let mainCont3 = document.querySelector(".main0");
    mainCont3.classList.remove("none", "hide");
    let mainCont2 = (mainCont3.classList.contains("main") ? mainCont3 : mainCont3.querySelector(".main"));
    for (let i = 1; i < mainCont2.children.length; i++) {
        let c = mainCont2.children[i];
        c.classList.add("fade-in-anim");
        c.onanimationend = function () {
            c.classList.remove("fade-in-anim");
            c.style.opacity = "1";
        };
    }
}
//# sourceMappingURL=preinit.js.map