var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let list = document.querySelector(".challenge-list");
let frame = document.getElementById("frame");
let codeCont = document.querySelector(".code-cont");
back.onmousedown = function () {
    back.style.pointerEvents = "none";
    overlay.textContent = "";
};
// From Jaredcheeda, https://stackoverflow.com/questions/7381974/which-characters-need-to-be-escaped-in-html
function escapeMarkup(dangerousInput) {
    const dangerousString = String(dangerousInput);
    const matchHtmlRegExp = /["'&<>]/;
    const match = matchHtmlRegExp.exec(dangerousString);
    if (!match) {
        return dangerousInput;
    }
    const encodedSymbolMap = {
        '"': '&quot;',
        '\'': '&#39;',
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };
    const dangerousCharacters = dangerousString.split('');
    const safeCharacters = dangerousCharacters.map(function (character) {
        return encodedSymbolMap[character] || character;
    });
    const safeString = safeCharacters.join('');
    return safeString;
}
let sel;
let curChallengeName = "JS Challenges </>"; //old: View JS Challenge Code
let pageLoadFileIndex = -1;
function replaceIFrameSrc(f, src) {
    let newFrame = document.createElement("iframe");
    newFrame.className = f.className;
    newFrame.id = f.id;
    newFrame.setAttribute("frameborder", "0");
    frame = newFrame;
    newFrame.src = src;
    f.replaceWith(newFrame);
    // frame.parentElement.replaceChild(newFrame,frame);
}
let defaultTitle = curChallengeName;
document.title = defaultTitle;
let folderReg = new Map();
let fileReg = new Map();
function registerFolder(name, date) {
    let div = document.createElement("div");
    div.innerHTML = `
        <div class="list-div no-hover">
            <div class="icon-btn" style="width:fit-content">
                <div class="icon-open material-symbols-outlined">chevron_right</div>
                <div>${name}</div>
            </div>
            <div class="challenge-date">${date}</div>
        </div>
        <div class="none"></div>
    `;
    div.classList.add("folder-cont");
    list.appendChild(div);
    let button = div.children[0];
    let details = div.children[1];
    let icon = div.querySelector(".icon-open");
    folderReg.set(name, details);
    let open = false;
    button.onclick = function () {
        open = !open;
        if (open) {
            div.classList.add("open");
            details.classList.remove("none");
            icon.style.rotate = "90deg";
        }
        else {
            div.classList.remove("open");
            details.classList.add("none");
            icon.style.rotate = "0deg";
        }
    };
    button.click();
}
function registerProject(name, date, files, htmlOverride, folder) {
    let div = document.createElement("div");
    // let i = list.children.length+1;
    let i = fileReg.size + 1;
    div.innerHTML = `
        <div>${name}</div>
        <div class="challenge-date">${date}</div>
        <div class="material-symbols-outlined">javascript</div>
        <!--<div>${i}</div>-->
    `;
    div.classList.add("list-div");
    if (folder) {
        let folderDiv = folderReg.get(folder);
        if (!folderDiv) {
            console.warn("An error occurred: folder '" + folder + "' was not found in the folder registry.");
        }
        else
            folderDiv.appendChild(div);
    }
    else
        list.appendChild(div);
    fileReg.set(i - 1, div);
    div.onclick = function (e, isBare = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (true)
                for (const [key, value] of fileReg) {
                    value.classList.remove("sel");
                }
            codeCont.textContent = "";
            if (!isBare) {
                let mainCont = document.querySelector(".main");
                for (let i = 1; i < mainCont.children.length; i++) {
                    let c = mainCont.children[i];
                    if (c.classList.contains("fade-in-anim")) {
                        c.classList.remove("fade-in-anim");
                        setTimeout(() => {
                            c.classList.add("fade-in-anim");
                            c.style.opacity = "0";
                        }, 0);
                    }
                    else {
                        c.classList.add("fade-in-anim");
                        c.style.opacity = "0";
                    }
                }
            }
            if (sel == div) {
                document.title = defaultTitle;
                sel = null;
                let url1 = new URL(location.href);
                url1.searchParams.delete("index");
                history.pushState("", "", url1.href);
                replaceIFrameSrc(frame, "");
                // location.search = "?"+url1.searchParams.toString();
                return;
            }
            curChallengeName = "Challenge " + i + " - " + name;
            document.title = curChallengeName;
            div.classList.add("sel");
            sel = div;
            let url1 = new URL(location.href);
            url1.searchParams.set("index", (i - 1).toString());
            if (!isBare) {
                history.pushState("", "", url1.href);
                // location.search = "?"+url1.searchParams.toString();
            }
            if (true)
                for (const file of files) {
                    let div2 = document.createElement("div");
                    let text = yield (yield fetch("files/" + i + "/" + file)).text();
                    let ogText = text;
                    let ext = file.split(".")[1];
                    if (ext == "html") {
                        if (htmlOverride) {
                            text = escapeMarkup(htmlOverride);
                            ogText = htmlOverride;
                        }
                        else
                            text = escapeMarkup(text);
                    }
                    div2.innerHTML = `
                <div class="file-title">
                    <div>${file}</div>
                    <button class="copy-code">Copy Code</button>
                </div>
                <pre><code class="language-${ext}">${text}</code></pre>
            `;
                    codeCont.appendChild(div2);
                    let copyCode = div2.querySelector(".copy-code");
                    if (copyCode)
                        copyCode.onclick = function () {
                            navigator.clipboard.writeText(ogText);
                            copyCode.textContent = "Copied!";
                            setTimeout(() => {
                                copyCode.textContent = "Copy Code";
                            }, 1000);
                        };
                    // setTimeout(()=>{
                    Prism.highlightElement(div2.children[1].children[0], null, null);
                    // },0);
                }
            if (true)
                setTimeout(() => {
                    replaceIFrameSrc(frame, "files/" + i + "/index.html");
                }, 0);
        });
    };
    if (pageLoadFileIndex == i - 1)
        div.click();
}
// registry
registerFolder("Timer", "9/27/23");
registerProject("Timer", "9/27/23", ["main.js", "index.html"], `<!-- A Basic Example of a Timer -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>1 - Timer - Lv 1</title>
</head>
<body>
    <p id="time-left">60</p>
    <p>Seconds Remaining</p>

    <script src="main.js"></script>
</body>
</html>`, "Timer");
registerProject("Ex: Timer Widget", "10/4/23", ["index.html", "style.css"], `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

    <!-- Need to "link" our style.css file -->
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <!-- Create a container for our timer -->
    <div class="timer">

        <!-- This shows the actual time -->
        <div class="time">1 : 0 0</div>

        <!-- Container for the main buttons -->
        <div class="mainButtons">
            <button>Reset</button>
            <button>Start</button>
        </div>
        <!-- This is a "horizontal rule" or a vertical line to separate the two sections -->
        <hr>

        <!-- Container to hold minute options -->
        <div>
            <span class="label">Minutes</span>
            <button>v</button>
            <button>^</button>
        </div>

        <!-- Container to hold second options -->
        <div>
            <span class="label">Seconds</span>
            <button>v</button>
            <button>^</button>
        </div>
        
    </div>
</body>
</html>`, "Timer");
let b_fullscreen = document.getElementById("fullscreen");
b_fullscreen.onclick = function () {
    frame.requestFullscreen();
};
// registerProject("Timer","9/27/23",["main.js","index.html"]);
let dd_view = document.querySelector(".dd-view");
registerDropdown(dd_view, [
    "JS Challenges",
    "Examples / Tutorials"
], (i) => {
});
// Header
let nav_list = document.querySelector(".nav-list");
let nav_challenges = document.querySelector(".nav-challenges");
let nav_tutorials = document.querySelector(".nav-tutorials");
let mainCont = document.querySelector(".main-cont");
let main_js = document.querySelector(".main-js");
function clearNavMains() {
    for (let i = 0; i < nav_list.children.length; i++) {
        let e = nav_list.children[i];
    }
}
// nav_tutorials.onclick = function(){
// main_js.classList.add("hide");
// main_tut.classList.remove("hide");
// };
// async function writeToCodeFile(move:MovementType){
//     let file = await createCodeFile("","js","TestFile.js");
//     let text = 
// `function start(){
//     console.log("hello");
// }`;
//     for(let i = 0; i < text.length; i++){
//         let c = text[i];
//         file.ref.textContent += c;
//         if(realTimeColorUpdate) Prism.highlightElement(file,null,null);
//         await wait(40); //40
//     }
//     // testFile.textContent = ;
//     if(!realTimeColorUpdate) Prism.highlightElement(file,null,null);
// }
// genHeaderList();
// function updateState(isBare=false){
//     let url = new URL(location.href);
//     pageLoadFileIndex = parseInt(url.searchParams.get("index"));
//     for(let i = 0; i < list.children.length; i++){
//         let c = list.children[i];
//         c.classList.remove("sel");
//     }
//     let fileDiv = fileReg.get(pageLoadFileIndex);
//     if(!fileDiv){
//         console.warn("An error occurred: File with the index '"+pageLoadFileIndex+"' was not found in the file registry, correcting...");
//         replaceIFrameSrc(frame,"");
//         codeCont.textContent = "";
//     }
//     else{
//         // @ts-ignore
//         fileDiv.onclick(null,isBare);
//         if(fileDiv.parentElement.parentElement.classList.contains("folder-cont")){
//             if(!fileDiv.parentElement.parentElement.classList.contains("open")) (fileDiv.parentElement.parentElement.children[0] as HTMLElement).click();
//         }
//     }
// }
// updateState(true);
// window.addEventListener("popstate",e=>{
//     updateState(true);
// });
showMainCont();
//# sourceMappingURL=main.js.map