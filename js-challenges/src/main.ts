let list = document.querySelector(".challenge-list");
let frame = document.getElementById("frame") as HTMLIFrameElement;
let codeCont = document.querySelector(".code-cont");
let overlay = document.querySelector(".overlay") as HTMLElement;
let back = document.querySelector(".back") as HTMLElement;

back.onmousedown = function(){
    back.style.pointerEvents = "none";
    overlay.textContent = "";
};

// From Jaredcheeda, https://stackoverflow.com/questions/7381974/which-characters-need-to-be-escaped-in-html
function escapeMarkup (dangerousInput) {
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

let sel:HTMLElement;
let curChallengeName = "View JS Challenge Code";

let pageLoadFileIndex = -1;

function replaceIFrameSrc(f:HTMLElement,src:string){
    let newFrame = document.createElement("iframe");
    newFrame.className = f.className;
    newFrame.id = f.id;
    newFrame.setAttribute("frameborder","0");
    frame = newFrame;
    newFrame.src = src;
    f.replaceWith(newFrame);
    // frame.parentElement.replaceChild(newFrame,frame);
}

function registerProject(name:string,date:string,files:string[],htmlOverride:string){
    let div = document.createElement("div");
    let i = list.children.length+1;
    div.innerHTML = `
        <div>${name}</div>
        <div class="challenge-date">${date}</div>
        <div>${i}</div>
    `;
    list.appendChild(div);

    div.onclick = async function(e,isBare=false){
        function close(){
            codeCont.textContent = "";
            replaceIFrameSrc(frame,"");
            sel.classList.remove("sel");
            sel = null;
            // let url = new URL(location.href);
            // url.searchParams.delete("index");
            // history.replaceState("","",url);
            // history.pushState("","",url);
            curChallengeName = "View JS Challenge Code";
            document.title = curChallengeName;
        }
        if(sel == div){
            close();
            return;
        }
        if(sel) close();

        div.classList.add("sel");
        sel = div;
        let url = new URL(location.href);
        url.searchParams.set("index",(i-1).toString());
        history.pushState("Time: "+Date.now(),"Time: "+Date.now(),url);
        curChallengeName = "Challenge "+i+" - "+name;
        document.title = curChallengeName;

        for(const file of files){
            let div2 = document.createElement("div");
            let text = await (await fetch("files/"+i+"/"+file)).text();
            let ogText = text;
            let ext = file.split(".")[1];
            if(ext == "html"){
                if(htmlOverride){
                    text = escapeMarkup(htmlOverride);
                    ogText = htmlOverride;
                }
                else text = escapeMarkup(text);
            }
            div2.innerHTML = `
                <div class="file-title">
                    <div>${file}</div>
                    <button class="copy-code">Copy Code</button>
                </div>
                <pre><code class="language-${ext}">${text}</code></pre>
            `;
            codeCont.appendChild(div2);

            let copyCode = div2.querySelector(".copy-code") as HTMLElement;
            if(copyCode) copyCode.onclick = function(){
                navigator.clipboard.writeText(ogText);
                copyCode.textContent = "Copied!";
                setTimeout(()=>{
                    copyCode.textContent = "Copy Code";
                },1000);
            };
    
            Prism.highlightElement(div2.children[1].children[0],null,null);
        }

        setTimeout(()=>{
            replaceIFrameSrc(frame,"files/"+i+"/index.html");
        },0);
    };

    if(pageLoadFileIndex == i-1) div.click();
}
let b_fullscreen = document.getElementById("fullscreen");
b_fullscreen.onclick = function(){
    frame.requestFullscreen();
};

// registry

registerProject("Timer","9/27/23",["main.js","index.html"],`<!-- A Basic Example of a Timer -->

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
</html>`);

registerProject("Ex: Timer Widget","10/4/23",["index.html","style.css"],`<!DOCTYPE html>
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
</html>`);

// registerProject("Timer","9/27/23",["main.js","index.html"]);

let dd_view = document.querySelector(".dd-view");
registerDropdown(dd_view,[
    "JS Challenges",
    "Examples / Tutorials"
],(i)=>{
    
});

// Header
let nav_list = document.querySelector(".nav-list");
let nav_challenges = document.querySelector(".nav-challenges") as HTMLElement;
let nav_tutorials = document.querySelector(".nav-tutorials") as HTMLElement;
let mainCont = document.querySelector(".main-cont");

let main_js = document.querySelector(".main-js");
let main_tut = document.querySelector(".main-tut");

function clearNavMains(){
    for(let i = 0; i < nav_list.children.length; i++){
        let e = nav_list.children[i];
        
    }
}
// nav_tutorials.onclick = function(){
    
    // main_js.classList.add("hide");
    // main_tut.classList.remove("hide");
// };
let headerList = [
    {
        name:"Challenges",
        id:"challenges",
        className:"js",
        // off:"0px 100vh"
        off:"-100vh 0px",
        prevURL:null,
        onLoad(){
            document.title = curChallengeName;
            sel = null;
            
            if(this.prevURL){
                // location.href = this.prevURL;
                let url = new URL(this.prevURL);
                let url2 = new URL(location.href);
                let search = url.searchParams.forEach((v,k)=>{
                    url2.searchParams.set(k,v);
                });
                history.replaceState("","",url2.href);
                this.prevURL = null;
            }
            // let url = new URL(location.href);
            // let searchIndex = url.searchParams.get("index");
            // if(searchIndex != null){
            //     list.children[searchIndex]?.click();
            // }
            this.prevURL = location.href;
        },
        onLeave(){
            // this.prevURL = location.href;
        },
        onStart(){
            replaceIFrameSrc(frame,"");
        }
    },
    {
        name:"Tutorials",
        id:"tutorials",
        className:"tut",
        // off:"0px -100vh"
        off:"100vh 0px",
        prevURL:null,
        onLoad(){
            document.title = "JS Tutorials";
            let url = new URL(location.href);
            url.searchParams.delete("index");
            testStartOnLoad();

            this.prevURL = location.href;
        },
        onLeave(){
            
        }
    }
];

let curItem:any;
function genHeaderList(){
    nav_list.textContent = "";
    for(let i = 0; i < mainCont.children.length; i++){
        (mainCont.children[i] as HTMLElement).style.display = "initial";
    }

    for(const item of headerList){
        let a = document.createElement("a");
        a.textContent = item.name;
        let m = document.querySelector(".main-"+item.className);
        (m as HTMLElement).style.setProperty("--off",item.off);

        a.onclick = function(e,isBare=false){
            if(!isBare){
                // let url = new URL(location.href);
                // url.searchParams.set("p",item.id);
                // history.pushState("","",url);
            }

            for(let i = 0; i < mainCont.children.length; i++){
                let e = mainCont.children[i] as HTMLElement;
                // e.style.display = "initial";
                e.classList.add("hide");
            }
            m.classList.remove("hide");
            (m as HTMLElement).style.display = "flex";

            for(let i = 0; i < nav_list.children.length; i++){
                let e = nav_list.children[i];
                e.classList.remove("cur");
            }
            a.classList.add("cur");

            // if(curItem) if(curItem.onLeave) curItem.onLeave();
            curItem = item;
            // item.onLoad();
        };

        nav_list.appendChild(a);

        if(item.onStart) item.onStart();
    }

    let url = new URL(location.href);
    let curPage = url.searchParams.get("p") || "challenges";
    let pageInd = headerList.findIndex(v=>v.id == curPage);
    if(pageInd != -1) (nav_list.children[pageInd] as HTMLElement).click();
}

async function createCodeFile(text:string,ext:string,title:string){
    let codeCont2 = main_tut.querySelector(".code-cont");
    codeCont2.textContent = "";
    
    let div2 = document.createElement("div");
    let ogText = text;
    if(ext == "html"){
        text = escapeMarkup(text);
    }
    div2.innerHTML = `
        <div class="file-title">
            <div>${title}</div>
            <button class="copy-code">Copy Code</button>
        </div>
        <pre><code class="language-${ext}">${text}</code></pre>
    `;
    codeCont2.appendChild(div2);

    let copyCode = div2.querySelector(".copy-code") as HTMLElement;
    if(copyCode) copyCode.onclick = function(){
        navigator.clipboard.writeText(ogText);
        copyCode.textContent = "Copied!";
        setTimeout(()=>{
            copyCode.textContent = "Copy Code";
        },1000);
    };

    Prism.highlightElement(div2.children[1].children[0],null,null);

    return new Project(div2.children[1].children[0] as HTMLElement);
}

enum MovementType{
    abs,
    rel
}

function wait(delay:number){
    return new Promise<void>(resolve=>{
        setTimeout(()=>{
            resolve();
        },delay);
    });
}

let realTimeColorUpdate = true;
let currentFile:Project;
let animateText = true;

class Action{
    delay = 40;
    setDelay(delay:number){
        this.delay = delay;
        return this;
    }
    execute(file:Project){}
}
class ActionMove extends Action{
    constructor(line:number,col:number){
        super();
        this.line = line;
        this.col = col;
    }
    line:number;
    col:number;
}
class ActionMoveRel extends Action{
    constructor(ev:string){
        super();
        this.ev = ev;
    }
    ev:string;
    execute(file: Project): void {
        for(let i = 0; i < this.ev.length; i++){
            let c = this.ev[i];
            if(c == "r") file.moveRight();
            else if(c == "l") file.moveLeft();
            else if(c == "u") file.moveUp();
            else if(c == "d") file.moveDown();
            else if(c == "h") file.moveHome();
            else file.addText(c);
        }
    }
}
class ActionText extends Action{
    constructor(text:string){
        super();
        this.text = text;
    }
    text:string;
    execute(file:Project){
        file.addText(this.text);
    }
}
class Project{
    constructor(ref:HTMLElement){
        this.ref = ref;
    }
    // line = 0;
    // col = 0;
    ind = 0;
    ref:HTMLElement;
    fullText:string = "";

    moveRight(){
        this.ind++;
    }
    moveLeft(){
        this.ind--;
    }
    moveUp(){
        let end = -1;
        for(let i = this.ind-1; i >= 0; i--){
            let c = this.fullText[i];
            if(c == "\n" || i <= 0){
                end = i;
                break;
            }
        }
        if(end == -1){
            this.ind = this.fullText.length-1;
            console.log("...reached end...");
            return;
        }
        let start = this.ind;
        this.ind -= this.ind-end;
        console.log("MOVE UP: ",start,end);
    }
    moveDown(){
        let end = -1;
        for(let i = this.ind+1; i < this.fullText.length; i++){
            let c = this.fullText[i];
            if(c == "\n"){
                end = i;
                break;
            }
        }
        if(end == -1){
            this.ind = this.fullText.length;
            console.log("...reached end...");
            return;
        }
        let start = this.ind;
        this.ind += end-this.ind;
        console.log("START, END:",start,end);
    }
    moveHome(){
        let end = -1;
        for(let i = this.ind-1; i >= -1; i--){
            let c = this.fullText[i];
            if(c == "\n" || i <= 0){
                end = i;
                break;
            }
        }
        if(end == -1){
            this.ind = this.fullText.length;
            console.log("...reached end...");
            return;
        }
        this.ind -= this.ind-end;
        if(end != 0) this.ind++;
    }

    async addText(text:string){
        if(!animateText){
            this.fullText = this.fullText.substring(0,this.ind)+text+this.fullText.substring(this.ind);
            this.ref.textContent = this.fullText;

            this.ind += text.length;

            Prism.highlightElement(this.ref,null,null);
        }
        else{
            let left = this.fullText.substring(0,this.ind);
            let right = this.fullText.substring(this.ind);
            for(let i = 0; i < text.length; i++){
                this.fullText = left+text.substring(0,i+1)+right;
                this.ref.textContent = this.fullText;
                Prism.highlightElement(this.ref,null,null);
                await wait(5);
            }

            this.ind += text.length;
        }
    }
}

async function testStartOnLoad(){
    currentFile = await createCodeFile("","js","TestFile.js");
    
    executeActions(currentFile,[
        // new ActionText("// Line 1\n"),
        // new ActionText("// Line 3\n"),
        // new ActionText("// Line 4\n"),
        // new ActionMoveRel(""),
        // new ActionMoveRel("uu\n"),
        // new ActionText("// Line 2")

        new ActionText("// this is the start of the file\n"),
        new ActionText(`
function start(){

}`
        ),
        new ActionMoveRel("u"),
        new ActionText('\tconsole.log("hello");')
    ]);
}

async function executeActions(file:Project,actions:Action[]){
    if(!file){
        alert("No file was specified");
        return;
    }
    await wait(100);
    for(let i = 0; i < actions.length; i++){
        let action = actions[i];
        action.execute(file);

        await wait(300);
    }
}
async function writeToCodeFile(move:MovementType){
    let file = await createCodeFile("","js","TestFile.js");
    let text = 
`function start(){
    console.log("hello");
}`;
    for(let i = 0; i < text.length; i++){
        let c = text[i];
        file.ref.textContent += c;
        if(realTimeColorUpdate) Prism.highlightElement(file,null,null);
        
        await wait(40); //40
    }
    // testFile.textContent = ;
    
    if(!realTimeColorUpdate) Prism.highlightElement(file,null,null);
}

// genHeaderList();

function updateState(isBare=false){
    let url = new URL(location.href);
    pageLoadFileIndex = parseInt(url.searchParams.get("index"));
    
    for(let i = 0; i < list.children.length; i++){
        let c = list.children[i];
        c.classList.remove("sel");
    }
    if(pageLoadFileIndex != null && pageLoadFileIndex >= 0){
        // @ts-ignore
        (list.children[pageLoadFileIndex] as HTMLElement).onclick(null,isBare);
    }
}
updateState(true);

window.addEventListener("popstate",e=>{
    updateState(true);
});