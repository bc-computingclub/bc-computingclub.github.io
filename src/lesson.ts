class Balloon{
    constructor(msg:string){
        this.msg = msg;
    }
    msg:string;
}

class Lesson{
    constructor(title:string){
        this.p = new Project(title);
    }

    p:Project;
}

let lesson:Lesson;
d_files = document.querySelector(".d-open-files");
main = document.querySelector(".main") as HTMLElement;
codeCont = document.querySelector(".cont-js");

pane_lesson = document.querySelector(".pane-lesson") as HTMLElement;
pane_code = document.querySelector(".pane-code") as HTMLElement;
pane_preview = document.querySelector(".pane-preview") as HTMLElement;

let bubbles_ov = document.querySelector(".bubbles-overlay") as HTMLElement;

class PromptLoginMenu extends Menu{
    constructor(){
        super("You Are Not Logged In","");
    }
    load(): void {
        super.load();
        this.body.innerHTML = `
            <div class="flx-v">
                <div>In order to access lessons and save your progress you must log in.</div>
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
    lesson.p.createFile("index.html",`<html>
    <head>
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
        <div>Hello</div>

        <script src="script.js"></script>
    </body>
</html>`,"html");
    lesson.p.createFile("style.css",`body{
    color:royalblue;
}`,"css");
    lesson.p.createFile("script.js",`console.log("page loaded!");\nconsole.log("page loaded!");\nconsole.log("page loaded!");\nconsole.log("page loaded!");\nconsole.log("page loaded!");\nconsole.log("page loaded!");\nconsole.log("page loaded!");\nconsole.log("page loaded!");\nconsole.log("page loaded!");\nconsole.log("page loaded!");\nconsole.log("page loaded!");\nconsole.log("page loaded!");\nconsole.log("page loaded!");\n`,"javascript");

    lesson.p.files[0].open();
    lesson.p.files[1].open();
    lesson.p.files[2].open();

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
    col:number
}[] = [];
function addBubble(line:number,col:number){
    // let marginOverlayers = document.querySelector(".margin-view-overlays") as HTMLElement;
    // let start = marginOverlayers?.offsetWidth || 64;

    let b = document.createElement("div");
    b.textContent = "This is a text bubble and some more text here is this and you can do this";
    bubbles_ov.appendChild(b);
    // let x = col*10;
    // let y = line*19;
    // x = 0;
    // y = 0;

    bubbles.push({
        e:b,
        line,col
    });

    // y -= scrollOffset;

    // y += 40;

    b.style.position = "absolute";
    b.classList.add("bubble");
    updateBubble(bubbles.length-1);
}
addBubble(10,20);

function updateBubbles(){
    for(let i = 0; i < bubbles.length; i++){
        updateBubble(i);
    }
}
function updateBubble(i:number){
    let b = bubbles[i];
    let x = b.col*7.7;
    let y = b.line*19;

    y -= scrollOffset;
    y += 25;

    let start = 64 + 22 - 7.7;
    x += start;

    b.e.style.left = (x)+"px";
    b.e.style.top = (y)+"px";
}