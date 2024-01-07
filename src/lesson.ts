const d_task = document.querySelector(".d-task");
const d_subTasks = document.querySelector(".d-sub-tasks");

class Balloon{
    constructor(msg:string){
        this.msg = msg;
    }
    msg:string;
}

abstract class TaskSection{
    abstract get():string;
}
class TextTaskSection extends TaskSection{
    constructor(text:string){
        super();
        this.text = text;
    }
    text:string;
    get(): string {
        return this.text;
    }
}
class CodeTaskSection extends TaskSection{
    constructor(code:string,lang:string){
        super();
        this.code = code;
        this.lang = lang;
    }
    code:string;
    lang:string;
    get(): string {
        return `
            <pre class="code"><code class="language-${this.lang}">${escapeMarkup(this.code)}</code></pre>
            <div class="sub-task-btns">
                <button class="b-mark-done">Mark Done</button>
                <button class="b-replay"><div class="material-symbols-outlined">replay</div></button>
            </div>
        `;
    }
}
abstract class Task{
    constructor(title:string){
        this.title = title;
    }
    supertask:LEvent;
    title:string;
    hasStarted = false;
    isFinished = false;

    _preVal:string;
    _preCol:number;
    _preLine:number;
    taskRef:HTMLElement;

    canBeFinished = false;
    _resFinish:(v?:string)=>number|void;
    _prom:Promise<string|void>;

    addToHook(hook:Task[]){
        addHook(hook,this);
    }

    preventContinueIfFail(){
        return false;
    }

    getSections():TaskSection[]{
        return [];
    }
    check(data:any){
        return true;
    }
    async start():Promise<string|void>{
        lesson.loadSubTask(this);
        console.warn(`:: Started Task #${lesson._subTaskNum++} :: #${lesson._taskCount++}`,this.title,);
        let t = this;
        this._prom = new Promise<string|void>(resolve=>{this._resFinish = function(v){
            if(t.canBeFinished){
                resolve(v);
                return 1;
            }
        }});
    }
    async finish():Promise<string|void>{
        this.canBeFinished = true;
        let res = null;
        if(this._prom) res = await this._prom;
        lesson.finishSubTask(this);
        this.isFinished = true;
        hideTutMouse();
        this.cleanup();
        return res;
    }
    cleanup(){}
    async play(){}
    async replay(editor:monaco.editor.IStandaloneCodeEditor){
        // if(!this.canBeFinished) return;
        if(!this.canBeFinished && !this.isFinished) return;
        if(lesson.currentSubTask) lesson.currentSubTask._resFinish("rp_"+this.supertask.tasks.indexOf(this));
        // else // I don't know how I can restart it if it's completely finished 
        return;
        
        let t = this;
        if(!t.canBeFinished) return;
        t.cleanup();
        editor.setValue(t._preVal);
        editor.setPosition({lineNumber:t._preLine,column:t._preCol});
        t.canBeFinished = false;
        t.hasStarted = false;
        t.isFinished = false;
        let list = [...d_subTasks.children];
        let ind = this.supertask.tasks.indexOf(t);
        for(let i = ind; i < list.length; i++){
            d_subTasks.removeChild(list[i]);
            this.supertask.tasks[i].taskRef = null;
        }
        lesson.loadSubTask(t);
        await t.play();
        this.canBeFinished = true;
    }
}
class AddFileTask extends Task{
    constructor(name:string,isRequired:boolean){
        super("Add a file named: "+name);
        this.name = name;
        this.isRequired = isRequired;
    }
    name:string;
    isRequired:boolean;
    preventContinueIfFail(): boolean {
        return this.isRequired;
    }
    async start(){
        super.start();

        let b_tutAddFile = lesson.tut.parent.querySelector(".b-add-file");
        let rect = b_tutAddFile.getBoundingClientRect();
        await showTutMouse();
        await moveTutMouseTo(rect.x+rect.width/2,rect.y+rect.height/2);
        await wait(300);
        await fakeClickButton(b_tutAddFile);
        lesson.tut.createFile(this.name,"");
        await wait(500);

        let b = addBubbleAt(BubbleLoc.add_file,this.title);
        this.addToHook(listenHooks.addFile);
        let res = await this.finish();

        closeBubble(b);
        return res;
    }
    check(name:string){
        return (name == this.name);
    }
}
class AddGenericCodeTask extends Task{
    constructor(code:string,lang:string){
        super("Add the following code:");
        this.code = code;
        this.lang = lang;
    }
    code:string;
    lang:string;
    async play(){
        let editor = lesson.tut.getCurEditor();
        // editor.getSupportedActions().forEach((value: monaco.editor.IEditorAction) => {
        //     console.log(value);
        // });
        lesson.tut.curFile.blockPosChange = false;

        let pos = editor.getPosition();
        await showTutMouse();
        await moveTutMouseTo(58 + pos.column*7.7,115 + pos.lineNumber*16.5);
        await wait(150);
        await hideTutMouse();
        await wait(200);
        let list = document.querySelectorAll(".custom-cursor");
        for(const c of list){
            (c as HTMLElement).style.display = "block";
        }
        for(let i = 0; i < this.code.length; i++){
            editor.updateOptions({readOnly:false});
            editor.trigger("keyboard","type",{
                text:this.code.substring(i,i+1)
            });
            editor.updateOptions({readOnly:true});
            await wait(Math.ceil(30+Math.random()*100));
        }
        for(const c of list){
            (c as HTMLElement).style.display = null;
        }
        pos = editor.getPosition();
        lesson.tut.curFile.curRow = pos.lineNumber;
        lesson.tut.curFile.curCol = pos.column;
        lesson.tut.curFile.blockPosChange = true;
        
        moveTutMouseTo(58 + pos.column*7.7,115 + pos.lineNumber*16.5);

        if(false){
            let b = addBubble(lesson.tut.curFile,"<button>I'm Done</button>");
            b.e.classList.add("small");
            let btn = b.e.querySelector("button");
            btn.addEventListener("click",e=>{
                closeBubble(b);
                this._resFinish();
            });
        }
        if(!lesson._hasShownMarkDoneReminder){
            lesson._hasShownMarkDoneReminder = true;
            let f = lesson.tut.curFile;
            let b = addBubble(f,`Make sure you click "Mark Done" when you're finished copying the code!`,f.curRow,f.curCol,"top");
            this._finishBubble = b;
        }
    }
    async start(){
        super.start();
        
        await this.play();

        return await this.finish();
    }
    _finishBubble:Bubble;
    getSections(){
        return [
            new CodeTaskSection(this.code,this.lang)
        ];
    }
    cleanup(): void {
        // let b_markDone = this.taskRef.querySelector(".b-mark-done") as HTMLButtonElement;
        // b_markDone.disabled = false;
        if(this._finishBubble){
            closeBubble(this._finishBubble);
            this._finishBubble = null;
        }
    }
}
class AddTutorSideText extends Task{
    constructor(text:string,comment:string){
        super(comment);
        this.text = text;
        this.comment = comment;
    }
    text:string;
    comment:string;
    async start(){
        super.start();
        
        let editor = lesson.tut.getCurEditor();
        lesson.tut.curFile.blockPosChange = false;

        let speedScale = 1;
        if(this.text.length < 5) speedScale = 2;

        let pos = editor.getPosition();
        await showTutMouse();
        await moveTutMouseTo(58 + pos.column*7.7,115 + pos.lineNumber*16.5);
        await wait(150);
        await hideTutMouse();
        await wait(200);
        let list = document.querySelectorAll(".custom-cursor");
        for(const c of list){
            (c as HTMLElement).style.display = "block";
        }
        for(let i = 0; i < this.text.length; i++){
            editor.updateOptions({readOnly:false});
            editor.trigger("keyboard","type",{
                text:this.text.substring(i,i+1)
            });
            editor.updateOptions({readOnly:true});
            await wait(Math.ceil((30+Math.random()*100)*speedScale));
        }
        for(const c of list){
            (c as HTMLElement).style.display = null;
        }
        pos = editor.getPosition();
        lesson.tut.curFile.curRow = pos.lineNumber;
        lesson.tut.curFile.curCol = pos.column;
        lesson.tut.curFile.blockPosChange = true;

        moveTutMouseTo(58 + pos.column*7.7,115 + pos.lineNumber*16.5);

        this.canBeFinished = true;
        this._resFinish();
        return await this.finish();
    }
}

let listenHooks = {
    addFile:[] as Task[]
};
let _hookCount = 0;
function addHook(hook:Task[],task:Task){
    hook.push(task);
    console.log("...added hook");
    _hookCount++;
}
function resolveHook(hook:Task[],data:any){
    let list = [...hook];
    let result = 0;
    for(let i = 0; i < list.length; i++){
        let f = list[i];
        if(!f.check(data)){
            console.log("...hook resolve failed check; Unresolved: "+_hookCount);
            if(f.preventContinueIfFail()) result = 1;
            continue;
        }
        if(f._resFinish) f._resFinish();
        else{
            console.warn("Weird, there wasn't a finish for the hook...?");
        }
        hook.splice(hook.indexOf(f),1);
        _hookCount--;
        console.log("...resolved hook; Unresolved: "+_hookCount);
    }
    return result;
}

abstract class LEvent{
    protected constructor(){}
    abstract run():Promise<void>;

    getTasks():TaskSection[]{
        return [];
    }
    getTaskText(){return ""}

    tasks:Task[];
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
        addBubble(lesson.p.curFile,this.text,this.lineno,this.colno);
    }
}
class LE_AddGBubble extends LEvent{
    constructor(lines:string[],loc:BubbleLoc,tasks:Task[]){
        super();
        this.ogLines = lines;
        let text = lines.join("<br><br>").replaceAll("\n","<br><br>");
        this.text = text;
        this.loc = loc;
        this.tasks = tasks;
    }
    ogLines:string[];
    text:string;
    loc:BubbleLoc;
    // tasks:Task[];
    async run(): Promise<void> {
        console.warn(`::: Started SUPER Task #${lesson._taskNum} :::`,this.text);

        let res:()=>void;
        let prom = new Promise<void>(resolve=>{res = resolve});

        let b_confirm = document.createElement("button");
        b_confirm.textContent = "Next";
        
        let b = addBubbleAt(this.loc,this.text);
        b.e.appendChild(document.createElement("br"));
        b.e.appendChild(document.createElement("br"));
        b.e.appendChild(b_confirm);
        b_confirm.addEventListener("click",e=>{
            console.log("click");
            res();
        });
        await prom;

        closeBubble(b);

        let tt = this;
        async function loop(start=0){
            for(let i = start; i < tt.tasks.length; i++){
                let t = tt.tasks[i];
                await wait(300);
                let res = await t.start();
                // new reset stuff
                t._resFinish = null;
                t._prom = null;
                t.canBeFinished = false;
                t.hasStarted = false;
                // t.isFinished = false;
                t.cleanup();
                if(typeof res == "string"){
                    if(res.startsWith("rp_")){
                        let newStart = parseInt(res.replace("rp_",""));
                        let startT = tt.tasks[newStart];
                        
                        let editor = lesson.tut.getCurEditor();
                        editor.setValue(startT._preVal);
                        editor.setPosition({lineNumber:startT._preLine,column:startT._preCol});
                        
                        let list = [...d_subTasks.children];
                        for(let i = newStart; i < list.length; i++){
                            d_subTasks.removeChild(list[i]);
                            tt.tasks[i].taskRef = null;
                        }
                        await loop(newStart);
                        return;
                    }
                }
            }
        }
        await loop(0);
    }
    getTaskText(): string {
        return this.ogLines[this.ogLines.length-1];
    }
}
class RunTasksLEvent extends LEvent{
    constructor(tasks:Task[]){
        super();
        this.tasks = tasks;
    }
    async run(): Promise<void> {
        for(const t of this.tasks){
            await wait(300);
            await t.start();
        }
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
    constructor(title:string,parent:HTMLElement,tutParent:HTMLElement){
        this.p = new Project(title,parent);
        this.tut = new Project("tut_"+title,tutParent,{
            readonly:true,
            disableCopy:true
        });
    }
    events:LEvent[];
    p:Project;
    tut:Project;

    bannerSection:TextArea;
    finalInstance:FinalProjectInstance;

    _taskNum = 0;
    _subTaskNum = 0;
    _taskCount = 0;

    currentTask:LEvent;
    currentSubTask:Task;

    _hasShownMarkDoneReminder = false;

    init(){
        addBannerBubble(this);
        addBannerPreviewBubble(this);

        this.p.init();
        this.tut.init();
    }
    async start(){
        this._taskNum = 0;
        this.clearAllTasks();
        this.currentSubTask = null;

        await wait(350);
        for(const e of this.events){
            for(const t of e.tasks){ // associate super task with sub task
                t.supertask = e;
            }
            this._subTaskNum = 0;
            this.loadTask(e);
            await e.run();
            await wait(300);
        }
    }

    loadTask(e:LEvent){
        this.currentTask = e;
        if(e instanceof LE_AddGBubble){
            if(!e.tasks.length) return;
        }
        this.clearAllTasks();
        this.currentTask = e;
        d_task.innerHTML = `<div>${formatBubbleText(e.getTaskText())}</div>`;
    }
    clearAllTasks(){
        this.currentTask = null;
        // this.currentSubTask = null; // temporary?
        d_task.innerHTML = "";
        d_subTasks.innerHTML = "";
    }
    loadSubTask(t:Task){
        this.currentSubTask = t;
        t.hasStarted = true;
        let editor = lesson.tut.getCurEditor();
        let pos = editor?.getPosition();
        if(t._preVal == null){
            t._preVal = editor?.getValue() || "";
            t._preLine = pos?.lineNumber || 1;
            t._preCol = pos?.column || 1;
        }

        let div = document.createElement("div");
        // div.className = "flx-sb c";
        let ind = lesson.currentTask.tasks.indexOf(t);
        div.innerHTML = `<div class="flx-sb c"><div><span class="l-num">#${ind+1} </span><span>${t.title}</span></div><div class="material-symbols-outlined cb">check_box_outline_blank</div></div>`;
        let sects = t.getSections();
        d_subTasks.appendChild(div);
        for(const s of sects){
            let d = document.createElement("div");
            d.innerHTML = s.get();
            t.taskRef = d;
            div.appendChild(d);
            let code = d.querySelector("code");
            if(code){
                // @ts-ignore
                Prism.highlightElement(code,null,null);
                let markDone = d.querySelector(".b-mark-done") as HTMLButtonElement;
                markDone.addEventListener("click",e=>{
                    if(t._resFinish()) markDone.disabled = true;
                });

                let b_replay = d.querySelector(".b-replay") as HTMLButtonElement;
                b_replay.addEventListener("click",e=>{
                    // replay
                    t.replay(editor);
                });
            }
        }
    }
    finishSubTask(t:Task){
        // this.currentSubTask = null; // temporary?
        let ind = lesson.currentTask.tasks.indexOf(t);
        let c = d_subTasks.children[ind];
        let cb = c.querySelector(".cb");
        cb.textContent = "select_check_box";
    }
}

let lesson:Lesson;
// d_files = document.querySelector(".d-open-files");
main = document.querySelector(".main") as HTMLElement;
// codeCont = document.querySelector(".cont-js");

pane_lesson = document.querySelector(".pane-lesson") as HTMLElement;
pane_tutor_code = document.querySelector(".pane-tutor-code") as HTMLElement;
pane_code = document.querySelector(".pane-code") as HTMLElement;
pane_preview = document.querySelector(".pane-preview") as HTMLElement;

// let bubbles_ov = document.querySelector(".bubbles-overlay") as HTMLElement;
let g_bubbles_ov = document.querySelector(".global-bubble-overlay") as HTMLElement;

let tutMouse = document.createElement("div");
tutMouse.className = "tut-mouse";
document.body.appendChild(tutMouse);
async function hideTutMouse(){
    tutMouse.style.opacity = "0";
    await wait(350);
}
async function showTutMouse(){
    tutMouse.style.opacity = "1";
    await wait(350);
}
async function moveTutMouseTo(x:number,y:number){
    tutMouse.style.left = x+"px";
    tutMouse.style.top = y+"px";
    await wait(350);
}
hideTutMouse();

async function fakeClickButton(e:Element){
    await wait(50);
    e.classList.add("f-hover");
    await wait(150);
    e.classList.remove("f-hover");
    await wait(150);
}

function setupEditor(parent:HTMLElement){
    let d_files = document.createElement("div");
    d_files.className = "d-open-files pane";
    let contJs = document.createElement("div");
    contJs.className = "cont-js cont pane";
    parent.appendChild(d_files);
    parent.appendChild(contJs);

    let add_file = document.createElement("button");
    add_file.className = "b-add-file";
    add_file.innerHTML = "<div class='material-symbols-outlined'>add</div>";
    d_files.appendChild(add_file);
}
function postSetupEditor(project:Project){
    let parent = project.parent;
    project.d_files = parent.querySelector(".d-open-files");
    project.codeCont = parent.querySelector(".cont-js");

    console.log("completed post setup");

    // project.createFile("test.html",`<p>Hello</p>`,"html");
    // project.files[0].open();
    // project.createFile("main.js",`console.log("hello");\nconsole.log("hello");\nconsole.log("hello");\nconsole.log("hello");`,"javascript");
    // project.files[1].open();

    let add_file = parent.querySelector(".b-add-file");
    add_file.addEventListener("click",e=>{
        if(project.isTutor){
            alert("Sorry! You can't add files to the tutor's project!");
            return;
        }
        
        let name = prompt("Enter file name:","index.html");
        if(!name) return;

        project.createFile(name,"");
    });

    // loadEditorTheme();
    
    // project.files[0].d_files;
    // project.files[0].codeCont;
    // project.files[0].bubbles_ov;
}

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
        };
    }
}
async function initLessonPage(){
    setupEditor(pane_tutor_code);
    setupEditor(pane_code);
    
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

    lesson = new Lesson("Lesson 01",pane_code,pane_tutor_code);
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
        new LE_AddGBubble([
            "Hello!",
            "In order to do anything, we first need to create an HTML document."
        ],BubbleLoc.global,[
            new AddFileTask("index.html",false)
        ]),
        new LE_AddGBubble([
            "Cool! Now you have an HTML document!",
            'Note: Using the name "index" for our file name means the browser will automatically pick this page when someone tries to go to your site!',
            "i[So what even is an HTML document and what can we do with it?]"
        ],BubbleLoc.global,[]),
        new LE_AddGBubble([
            "An HTML document defines what is h[in the page.]",
            "For example, this is where you would put b[buttons, text, and images.]",
            "i[Let's try adding a button.]"
        ],BubbleLoc.global,[
            new AddGenericCodeTask("<button>Click Me!</button>","html"),
            new AddTutorSideText("\n\n","Add a few lines to make some space"),
            new AddGenericCodeTask("<button>Click Me 2!</button>","html"),
        ]),
        new LE_AddGBubble([
            "Awesome!"
        ],BubbleLoc.global,[])
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

// let scrollOffset = 0;
type Bubble = {
    e:HTMLElement,
    line:number,
    col:number,
    loc:BubbleLoc,
    file:FFile
};
let bubbles:Bubble[] = [];
function closeBubble(b:Bubble){
    b.e.style.animation = "RemoveBubble forwards 0.15s ease-out";
    b.e.onanimationend = function(){
        b.e.parentElement.removeChild(b.e);
    };
}
function addBubble(file:FFile,text:string="This is a text bubble and some more text here is this and you can do this",line?:number,col?:number,dir?:string){
    if(line == null) line = file.curRow;
    if(col == null) col = file.curCol;
    // let marginOverlayers = document.querySelector(".margin-view-overlays") as HTMLElement;
    // let start = marginOverlayers?.offsetWidth || 64;

    let b = document.createElement("div");
    b.innerHTML = text;
    file.bubbles_ov.appendChild(b);
    // let x = col*10;
    // let y = line*19;
    // x = 0;
    // y = 0;

    let data = {
        e:b,
        line,col,
        loc:BubbleLoc.code,
        file
    } as Bubble;
    bubbles.push(data);

    if(dir) b.classList.add("dir-"+dir);

    // y -= scrollOffset;

    // y += 40;

    b.style.position = "absolute";
    b.classList.add("bubble");
    updateBubble(bubbles.length-1);

    return data;
}
enum BubbleLoc{
    code,
    add_file,
    global
}
function formatBubbleText(text:string){
    while(text.includes("[")){
        let ind = text.indexOf("[");
        let id = text[ind-1];
        let str = `<span class="l-${id}">`;
        text = text.replace(id+"[",str); // replaces just the first instance which is where we're at
    }
    text = text.replaceAll("]","</span>");
    return text;
}
function addBubbleAt(loc:BubbleLoc,text:string){
    let b = document.createElement("div");
    b.innerHTML = formatBubbleText(text);
    g_bubbles_ov.appendChild(b);

    let data = {
        e:b,
        line:0,col:0,
        loc,
        file:lesson.p.curFile
    } as Bubble;
    bubbles.push(data);

    b.style.position = "absolute";
    b.classList.add("bubble");
    updateBubble(bubbles.length-1);

    return data;
}

let dev = {
    skipGetStarted:true
};

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

        setTimeout(()=>{if(dev.skipGetStarted) b_gettingStarted.click();},20);
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
        x = b.col*7.7;
        y = b.line*19;

        x -= b.file.scrollOffsetX;
        y -= b.file.scrollOffset;
        // y += 25;
        y += 88;

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
    else if(b.loc == BubbleLoc.add_file){
        let userAddFile = lesson.p.parent.querySelector(".b-add-file");
        let rect = userAddFile.getBoundingClientRect();
        // x = rect.x + 34;
        // y = rect.y+rect.height+15 - 60 - 52;
        x = rect.x;
        y = rect.y+rect.height+15 - 60;
        b.e.classList.add("dir-top2");
    }

    b.e.style.left = x+"px";
    b.e.style.top = y+"px";
}

// refresh system
b_refresh = document.querySelector(".b-refresh") as HTMLButtonElement;
icon_refresh = document.querySelector(".icon-refresh") as HTMLElement;
iframe = document.querySelector("iframe") as HTMLIFrameElement;
// let _icRef_state = true;
b_refresh.addEventListener("click",e=>{
    let newIF = document.createElement("iframe");
    iframe.replaceWith(newIF);
    iframe = newIF;
    
    icon_refresh.style.rotate = _icRef_state ? "360deg" : "0deg";
    _icRef_state = !_icRef_state;
    
    let file = lesson.p.files.find(v=>v.name == "index.html");
    if(!file){
        alert("No index.html file found! Please create a new file called index.html, this file will be used in the preview.");
        return;
    }
    let text = file.editor.getValue();
    // let file = new File([new Uint8Array([...text].map((v,i)=>v.charCodeAt(i)))],"index.html");
    // let bytes = new Uint8Array([...text].map((v,i)=>text.charCodeAt(i)));
    // console.log(bytes);
    // let file = new Blob([bytes]);

    // let url = URL.createObjectURL(file);

    // let a = document.createElement("a");
    // a.href = url;
    // a.download = "index.html";
    // console.log(a.href);
    // a.click();

    let root = iframe.contentDocument;
    root.open();
    root.write(text);

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
});