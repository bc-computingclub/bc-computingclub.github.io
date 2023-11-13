console.log("Initializing tutorial engine");
let main_tut = document.querySelector(".main-tut");

enum MovementType{
    abs,
    rel
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
    async execute(file:Project){}
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
    async execute(file: Project){
        for(let i = 0; i < this.ev.length; i++){
            let c = this.ev[i];
            if(c == "r") await file.moveRight();
            else if(c == "l") await file.moveLeft();
            else if(c == "u") await file.moveUp();
            else if(c == "d") await file.moveDown();
            else if(c == "h") await file.moveHome();
            else await file.addText(c);
        }
    }
}
class ActionText extends Action{
    constructor(text:string){
        super();
        this.text = text;
    }
    text:string;
    async execute(file:Project){
        await file.addText(this.text);
    }
}
class ActionComment extends Action{
    constructor(text:string,lines=1){
        super();
        this.text = text;
        this.lines = lines;
    }
    text:string;
    lines:number;
    async execute(file: Project): Promise<void> {
        for(let i = 0; i < this.lines; i++){
            await file.moveUp();
        }
        await file.addText(this.text);
        for(let i = 0; i < this.lines; i++){
            await file.moveDown();
        }
    }
}
class ActionIndent extends Action{
    constructor(mode:"set"|"reset"|"add",value:number){
        super();
        this.mode = mode;
        this.value = value;
    }
    mode:string;
    value:number;
    async execute(file: Project): Promise<void> {
        switch(this.mode){
            case "set":
                file.indent = this.value;
                break;
            case "reset":
                file.indent = 0;
                break;
            case "add":
                file.indent += this.value;
                break;
        }
    }
}
class Project{
    constructor(ref:HTMLElement,ta:HTMLTextAreaElement){
        this.ref = ref;
        this.area = ref.parentElement?.nextElementSibling as HTMLTextAreaElement;
        this.ta = ta;
    }
    // line = 0;
    // col = 0;
    ind = 0;
    ref:HTMLElement;
    area:HTMLTextAreaElement;
    ta:HTMLTextAreaElement;
    fullText:string = "";
    indent = 0;

    async moveRight(){
        this.ind++;
    }
    async moveLeft(){
        this.ind--;
    }
    async moveUp(){
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
    async moveDown(){
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
    async moveHome(){
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
        let before = text;
        if(text[0] != "\n"){
            let tmp = "";
            for(let i = 0; i < this.indent; i++){
                tmp += "\t";
            }
            text = tmp+text;
        }
        for(let i = 0; i < text.length-1; i++){
            let char = text[i];
            let nextChar = text[i+1];
            // if(char == "\n" && nextChar != "\n"){
            if(char == "\n"){
                let tmp = "";
                for(let i = 0; i < this.indent; i++){
                    tmp += "\t";
                }
                text = text.substring(0,i+1)+tmp+text.substring(i+1);
                i += this.indent;
            }
        }
        console.log("text",`[${before.replaceAll("\t","\\t").replaceAll("\n","\\n")}]`,`[${text.replaceAll("\t","\\t").replaceAll("\n","\\n")}]`);
        this.area?.focus();

        if(!animateText){
            this.fullText = this.fullText.substring(0,this.ind)+text+this.fullText.substring(this.ind);
            this.ref.textContent = this.fullText;

            this.ind += text.length;

            this.ta.value = this.fullText;
            Prism.highlightElement(this.ref,null,null);
            if(this.area){
                this.area.selectionStart = this.ind;
                this.area.selectionEnd = this.ind;
            }
        }
        else{
            let left = this.fullText.substring(0,this.ind);
            let right = this.fullText.substring(this.ind);
            for(let i = 0; i < text.length; i++){
                this.fullText = left+text.substring(0,i+1)+right;
                this.ref.textContent = this.fullText;
                this.ta.value = this.fullText;
                Prism.highlightElement(this.ref,null,null);
                if(this.area){
                    this.area.selectionStart = this.ind+text.length;
                    this.area.selectionEnd = this.ind+text.length;
                }
                await wait(5);
            }

            this.ind += text.length;
        }
    }
}

// 

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
            // testStartOnLoad();

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
        <div class="codeDiv">
            <pre><code class="language-${ext}">${text}</code></pre>
            <textarea></textarea>
        </div>
    `;
    codeCont2.appendChild(div2);
    let ta = div2.querySelector("textarea");

    let copyCode = div2.querySelector(".copy-code") as HTMLElement;
    if(copyCode) copyCode.onclick = function(){
        navigator.clipboard.writeText(ogText);
        copyCode.textContent = "Copied!";
        setTimeout(()=>{
            copyCode.textContent = "Copy Code";
        },1000);
    };

    ta.value = text;
    Prism.highlightElement(div2.children[1].children[0].children[0],null,null);

    return new Project(div2.children[1].children[0].children[0] as HTMLElement,ta);
}

async function executeActions(file:Project,actions:Action[]){
    if(!file){
        alert("No file was specified");
        return;
    }
    await wait(100);
    for(let i = 0; i < actions.length; i++){
        let action = actions[i];
        await action.execute(file);

        await wait(100);
    }
}