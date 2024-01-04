class Balloon{
    constructor(msg:string){
        this.msg = msg;
    }
    msg:string;
}

abstract class LEvent{
    constructor(){}
    abstract run():Promise<void>;
    end:()=>Promise<void>;
}
class LE_AddBubble extends LEvent{
    constructor(text:string,lineno:number,colno:number){
        super();
        this.text = text;
        this.lineno = lineno;
        this.colno = colno;
    }
    text:string;
    lineno:number;
    colno:number;
    async run(): Promise<void> {
        addBubble(this.lineno,this.colno,this.text);

        if(this.end) await this.end();
    }
}
class LE_AddGBubble extends LEvent{
    constructor(text:string,loc:BubbleLoc){
        super();
        text = text.replaceAll("\n","<br><br>");
        this.text = text;
        this.loc = loc;
    }
    text:string;
    loc:BubbleLoc;
    async run(): Promise<void> {
        addBubbleAt(this.loc,this.text);

        if(this.end) await this.end();
    }
}

class FileInstance{
    constructor(filename:string,text:string){
        this.filename = filename;
        this.text = text;
    }
    filename:string;
    text:string;
}
class FinalProjectInstance{
    constructor(files:FileInstance[]){
        this.files = files;
    }
    files:FileInstance[];
}
class TextArea{
    constructor(sects:TextSection[]){
        this.sects = sects;
    }
    sects:TextSection[];
}

class Lesson{
    constructor(title:string){
        this.p = new Project(title);
    }
    events:LEvent[];
    p:Project;

    bannerSection:TextArea;
    finalInstance:FinalProjectInstance;

    init(){
        addBannerBubble(this);
        addBannerPreviewBubble(this);
    }
    async start(){
        await wait(350);
        for(const e of this.events){
            await e.run();
        }
    }
}

let lesson:Lesson;
d_files = document.querySelector(".d-open-files");
main = document.querySelector(".main") as HTMLElement;
codeCont = document.querySelector(".cont-js");

pane_lesson = document.querySelector(".pane-lesson") as HTMLElement;
pane_code = document.querySelector(".pane-code") as HTMLElement;
pane_preview = document.querySelector(".pane-preview") as HTMLElement;

let bubbles_ov = document.querySelector(".bubbles-overlay") as HTMLElement;
let g_bubbles_ov = document.querySelector(".global-bubble-overlay") as HTMLElement;

class PromptLoginMenu extends Menu{
    constructor(){
        super("You Are Not Logged In","");
    }
    load(): void {
        super.load(5);
        this.body.innerHTML = `
            <div class="flx-v">
                <div>In order to access lessons and save your progress you must log in.</div>
                <br>
                <button>Log In</button>
            </div>
        `;
        let button = this.body.children[0].querySelector("button");
        button.onclick = function(){
            closeAllMenus();
            new LogInMenu().load();
        };}
}
async function initLessonPage(){
    await waitForUser();
    
    if(g_user == null){ // not logged in
        // alert("You are not logged in, please log in");
        new PromptLoginMenu().load();
        return;
    }
    else console.log("...user was logged in...");

    // @ts-ignore
    require.config({paths:{vs:"/lib/monaco/min/vs"}});
    await new Promise<void>(resolve=>{
        // @ts-ignore
        require(['vs/editor/editor.main'], function () {
            resolve();
        });
    });

    lesson = new Lesson("Lesson 01");
    lesson.bannerSection = new TextArea([
        new TextSection("What Will We Be Doing in This Lesson?",[
            "Want to start coding?",
            "Well, before we can add any logic or fancy visuals, we first have to make an HTML page.",
            "An HTML Page is like a document where you create all the visual parts of the page like buttons or text.",
            // "In this tutorial we'll look at how to make a basic HTML or website page.<br>Nothing too fancy but a start of the core structure."
        ]),
        new TextSection("What Will We Learn?",[
            "How to setup a basic HTML page",
            'How to add a "Header" and "Paragraph" element to your page'
        ])
    ]);
    lesson.finalInstance = new FinalProjectInstance([
        new FileInstance("index.html",`
<html>
<body>
        <h1>This is a heading, hello there!</h1>
        <p>This is a paragraph.</p>
</body>
</html>
`)
    ]);
    lesson.events = [
        new LE_AddGBubble("Hello!\nIn order to do anything we first need to create an HTML document.",BubbleLoc.global),
        // new LE_AddBubble("Hello!",10,10),
    ];

    // lesson.p.createFile("index.html");
//     lesson.p.createFile("index.html",`<html>
//     <head>
//         <link rel="stylesheet" href="style.css">
//     </head>
//     <body>
//         <div>Hello</div>

//         <script src="script.js"></script>
//     </body>
// </html>`,"html");
//     lesson.p.createFile("style.css",`body{
//     color:royalblue;
// }`,"css");
//     lesson.p.createFile("script.js",`console.log("page loaded!");\nconsole.log("page loaded!");\nconsole.log("page loaded!");\nconsole.log("page loaded!");\nconsole.log("page loaded!");\nconsole.log("page loaded!");\nconsole.log("page loaded!");\nconsole.log("page loaded!");\nconsole.log("page loaded!");\nconsole.log("page loaded!");\nconsole.log("page loaded!");\nconsole.log("page loaded!");\nconsole.log("page loaded!");\n`,"javascript");

    // lesson.p.files[0].open();
    // lesson.p.files[1].open();
    // lesson.p.files[2].open();

    lesson.init();

    onResize(true);
}

onResize = function(isFirst=false,who?:HTMLElement){
    let remainingWidth = innerWidth - pane_lesson.offsetWidth - 15;
    if(isFirst){
        pane_code.style.width = (remainingWidth/2)+"px";
        pane_preview.style.width = (remainingWidth/2)+"px";
    }
    else{
        // if(who == )
        pane_preview.style.width = (remainingWidth-pane_code.offsetWidth)+"px";
    }
    
    main.style.height = (innerHeight - 60)+"px";
    if(lesson?.p.hasEditor()) lesson.p.getCurEditor().layout();
};
onResize();

initLessonPage();

// 

let scrollOffset = 0;
let bubbles:{
    e:HTMLElement,
    line:number,
    col:number,
    loc:BubbleLoc
}[] = [];
function addBubble(line:number,col:number,text:string="This is a text bubble and some more text here is this and you can do this"){
    // let marginOverlayers = document.querySelector(".margin-view-overlays") as HTMLElement;
    // let start = marginOverlayers?.offsetWidth || 64;

    let b = document.createElement("div");
    b.innerHTML = text;
    bubbles_ov.appendChild(b);
    // let x = col*10;
    // let y = line*19;
    // x = 0;
    // y = 0;

    bubbles.push({
        e:b,
        line,col,
        loc:BubbleLoc.code
    });

    // y -= scrollOffset;

    // y += 40;

    b.style.position = "absolute";
    b.classList.add("bubble");
    updateBubble(bubbles.length-1);
}
enum BubbleLoc{
    code,
    add_file,
    global
}
function addBubbleAt(loc:BubbleLoc,text:string){
    let b = document.createElement("div");
    b.innerHTML = text;
    g_bubbles_ov.appendChild(b);

    bubbles.push({
        e:b,
        line:0,col:0,
        loc
    });

    b.style.position = "absolute";
    b.classList.add("bubble");
    updateBubble(bubbles.length-1);
}

class BannerMenu extends Menu{
    constructor(text:string,lesson:Lesson){
        super("Welcome!");
        this.text = text;
        this.lesson = lesson;
    }
    text:string;
    lesson:Lesson;

    canClose(): boolean {
        return false;
    }
    load(): void {
        super.load();
        this.menu.classList.add("menu-lesson-banner");
        this.menu.style.width = "90%";
        this.menu.style.height = "max-content";
        this.menu.style.maxWidth = "600px";
        // this.menu.style.minWidth = "400px";
        this.body.innerHTML = `
            <div>${this.text}</div>
            <div class="d-getting-started"><button class="b-getting-started">Get Started</button></div>
        `;
        let b_gettingStarted = this.body.querySelector(".b-getting-started") as HTMLButtonElement;
        let t = this;
        b_gettingStarted.onclick = function(){
            closeAllMenus();
            lesson.start();
        };
    }
}

function loadIFrameSimpleMode(iframe:HTMLIFrameElement,inst:FinalProjectInstance){
    let newIF = document.createElement("iframe");
    iframe.replaceWith(newIF);
    iframe = newIF;
    
    // icon_refresh.style.rotate = _icRef_state ? "360deg" : "0deg";
    // _icRef_state = !_icRef_state;
    
    // let htmlText = project.files[0].editor.getValue();
    let indexHTML = inst.files.find(v=>v.filename == "index.html");
    if(!indexHTML){
        alert("Err: could not find index.html to load");
        return;
    }
    
    let root = iframe.contentDocument;
    root.open();
    root.write(indexHTML.text);

    let scripts = iframe.contentDocument.scripts;
    let newScriptList = [];
    for(const c of scripts){
        let div = document.createElement("div");
        div.textContent = c.src;
        c.replaceWith(div);
        newScriptList.push(div);
    }
    for(const c of newScriptList){
        // if(!c.hasAttribute("src")) continue;
        // let src = c.src.replace(location.ancestorOrigins[0]+"/editor","");
        // c.innerHTML = project.files.find(v=>+"/"+v.name == src)?.editor.getValue();
        let sc = document.createElement("script");
        sc.innerHTML = project.files[2].editor.getValue();
        c.replaceWith(sc);
    }

    let styles = iframe.contentDocument.querySelectorAll("link");
    for(const c of styles){
        let st = document.createElement("style");
        st.innerHTML = project.files[1].editor.getValue();
        c.replaceWith(st);
    }
}

class BannerPreviewMenu extends Menu{
    constructor(lesson:Lesson){
        super("What We'll Be Making");
        this.lesson = lesson;
    }
    lesson:Lesson;

    load(): void {
        super.load();
        this.menu.classList.add("menu-banner-preview");
        this.body.innerHTML = `
            <iframe></iframe>
        `;
        let iframe = this.body.querySelector("iframe");
        loadIFrameSimpleMode(iframe,this.lesson.finalInstance);
    }
}

class TextSection{
    constructor(header:string,lines:string[]){
        this.header = header;
        this.lines = lines;
    }
    header:string;
    lines:string[];
}
function addBannerBubble(lesson:Lesson){
    let textarea = lesson.bannerSection;
    let text = "";
    for(const s of textarea.sects){
        text += "<div class='section'>";
        text += `<h3>${s.header}</h3><br>`;
        for(const l of s.lines){
            text += `<div>${l}</div><br>`;
        }
        text += "</div>";
    }
    new BannerMenu(text,lesson).load();
}
function addBannerPreviewBubble(lesson:Lesson){
    new BannerPreviewMenu(lesson).load();
}

// addBubble(10,20);

function updateBubbles(){
    for(let i = 0; i < bubbles.length; i++){
        updateBubble(i);
    }
}
function updateBubble(i:number){
    let b = bubbles[i];
    let x = 0;
    let y = 0;

    if(b.loc == BubbleLoc.code){
        let x = b.col*7.7;
        let y = b.line*19;

        y -= scrollOffset;
        y += 25;

        let start = 64 + 22 - 7.7;
        x += start;
    }
    else if(b.loc == BubbleLoc.global){
        x = innerWidth*0.5;
        y = innerHeight*0.45-100;
        b.e.classList.add("centered");
        b.e.classList.add("no-callout");
        b.e.classList.add("global");
    }

    b.e.style.left = x+"px";
    b.e.style.top = y+"px";
}