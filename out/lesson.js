class Balloon {
    constructor(msg) {
        this.msg = msg;
    }
    msg;
}
class TaskSection {
}
class TextTaskSection extends TaskSection {
    constructor(text) {
        super();
        this.text = text;
    }
    text;
    get() {
        return this.text;
    }
}
class CodeTaskSection extends TaskSection {
    constructor(code) {
        super();
        this.code = code;
    }
    code;
    get() {
        return `
            <div class="code-block"><pre>${this.code}</pre></div>
        `;
    }
}
class Task {
    constructor(title) {
        this.title = title;
    }
    title;
    hasStarted = false;
    isFinished = false;
    _resFinish;
    _prom;
    addToHook(hook) {
        addHook(hook, this);
    }
    preventContinueIfFail() {
        return false;
    }
    getSections() {
        return [];
    }
    check(data) {
        return true;
    }
    async start() {
        lesson.currentSubTask = this;
        this.hasStarted = true;
        console.warn(`:: Started Task #${lesson._subTaskNum++} :: #${lesson._taskCount++}`, this.title);
        this._prom = new Promise(resolve => { this._resFinish = resolve; });
    }
    async finish() {
        if (this._prom)
            await this._prom;
        lesson.currentSubTask = null;
        this.isFinished = true;
    }
}
class AddFileTask extends Task {
    constructor(name, isRequired) {
        super("Add a file named: " + name);
        this.name = name;
        this.isRequired = isRequired;
    }
    name;
    isRequired;
    preventContinueIfFail() {
        return this.isRequired;
    }
    async start() {
        super.start();
        let b = addBubbleAt(BubbleLoc.add_file, this.title);
        this.addToHook(listenHooks.addFile);
        await this.finish();
        closeBubble(b);
    }
    check(name) {
        return (name == this.name);
    }
}
class AddGenericCodeTask extends Task {
    constructor(code) {
        super("Add this piece of code...");
        this.code = code;
    }
    code;
    async start() {
        super.start();
        // 
        await this.finish();
    }
    getSections() {
        return [
            new CodeTaskSection(this.code)
        ];
    }
}
let listenHooks = {
    addFile: []
};
let _hookCount = 0;
function addHook(hook, task) {
    hook.push(task);
    console.log("...added hook");
    _hookCount++;
}
function resolveHook(hook, data) {
    let list = [...hook];
    let result = 0;
    for (let i = 0; i < list.length; i++) {
        let f = list[i];
        if (!f.check(data)) {
            console.log("...hook resolve failed check; Unresolved: " + _hookCount);
            if (f.preventContinueIfFail())
                result = 1;
            continue;
        }
        f._resFinish();
        hook.splice(hook.indexOf(f), 1);
        _hookCount--;
        console.log("...resolved hook; Unresolved: " + _hookCount);
    }
    return result;
}
class LEvent {
    constructor() { }
    getTasks() {
        return [];
    }
}
class LE_AddBubble extends LEvent {
    constructor(text, lineno, colno) {
        super();
        this.text = text;
        this.lineno = lineno;
        this.colno = colno;
    }
    text;
    lineno;
    colno;
    async run() {
        addBubble(this.lineno, this.colno, this.text);
    }
}
class LE_AddGBubble extends LEvent {
    constructor(lines, loc, tasks) {
        super();
        let text = lines.join("<br><br>").replaceAll("\n", "<br><br>");
        this.text = text;
        this.loc = loc;
        this.tasks = tasks;
    }
    text;
    loc;
    tasks;
    async run() {
        console.warn(`::: Started SUPER Task #${lesson._taskNum} :::`, this.text);
        let res;
        let prom = new Promise(resolve => { res = resolve; });
        let b_confirm = document.createElement("button");
        b_confirm.textContent = "Okay";
        let b = addBubbleAt(this.loc, this.text);
        b.e.appendChild(document.createElement("br"));
        b.e.appendChild(document.createElement("br"));
        b.e.appendChild(b_confirm);
        b_confirm.addEventListener("click", e => {
            console.log("click");
            res();
        });
        await prom;
        closeBubble(b);
        for (const t of this.tasks) {
            await wait(300);
            await t.start();
        }
    }
}
class RunTasksLEvent extends LEvent {
    constructor(tasks) {
        super();
        this.tasks = tasks;
    }
    tasks;
    async run() {
        for (const t of this.tasks) {
            await wait(300);
            await t.start();
        }
    }
}
class FileInstance {
    constructor(filename, text) {
        this.filename = filename;
        this.text = text;
    }
    filename;
    text;
}
class FinalProjectInstance {
    constructor(files) {
        this.files = files;
    }
    files;
}
class TextArea {
    constructor(sects) {
        this.sects = sects;
    }
    sects;
}
class Lesson {
    constructor(title, parent, tutParent) {
        this.p = new Project(title, parent);
        this.tut = new Project("tut_" + title, tutParent, {
            readonly: true,
            disableCopy: true
        });
    }
    events;
    p;
    tut;
    bannerSection;
    finalInstance;
    _taskNum = 0;
    _subTaskNum = 0;
    _taskCount = 0;
    currentTask;
    currentSubTask;
    init() {
        addBannerBubble(this);
        addBannerPreviewBubble(this);
        this.p.init();
        this.tut.init();
    }
    async start() {
        this._taskNum = 0;
        this.currentTask = null;
        this.currentSubTask = null;
        await wait(350);
        for (const e of this.events) {
            this._subTaskNum = 0;
            this.currentTask = e;
            await e.run();
        }
    }
}
let lesson;
// d_files = document.querySelector(".d-open-files");
main = document.querySelector(".main");
// codeCont = document.querySelector(".cont-js");
pane_lesson = document.querySelector(".pane-lesson");
pane_tutor_code = document.querySelector(".pane-tutor-code");
pane_code = document.querySelector(".pane-code");
pane_preview = document.querySelector(".pane-preview");
// let bubbles_ov = document.querySelector(".bubbles-overlay") as HTMLElement;
let g_bubbles_ov = document.querySelector(".global-bubble-overlay");
function setupEditor(parent) {
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
function postSetupEditor(project) {
    let parent = project.parent;
    project.d_files = parent.querySelector(".d-open-files");
    project.codeCont = parent.querySelector(".cont-js");
    console.log("completed post setup");
    project.createFile("test.html", `<p>Hello</p>`, "html");
    project.files[0].open();
    project.createFile("main.js", `console.log("hello");\nconsole.log("hello");\nconsole.log("hello");\nconsole.log("hello");`, "javascript");
    project.files[1].open();
    let add_file = parent.querySelector(".b-add-file");
    add_file.addEventListener("click", e => {
        if (project.isTutor) {
            alert("Sorry! You can't add files to the tutor's project!");
            return;
        }
        let name = prompt("Enter file name:", "index.html");
        if (!name)
            return;
        project.createFile(name, "");
    });
    // loadEditorTheme();
    // project.files[0].d_files;
    // project.files[0].codeCont;
    // project.files[0].bubbles_ov;
}
class PromptLoginMenu extends Menu {
    constructor() {
        super("You Are Not Logged In", "");
    }
    load() {
        super.load(5);
        this.body.innerHTML = `
            <div class="flx-v">
                <div>In order to access lessons and save your progress you must log in.</div>
                <br>
                <button>Log In</button>
            </div>
        `;
        let button = this.body.children[0].querySelector("button");
        button.onclick = function () {
            closeAllMenus();
            new LogInMenu().load();
        };
    }
}
async function initLessonPage() {
    setupEditor(pane_tutor_code);
    setupEditor(pane_code);
    await waitForUser();
    if (g_user == null) { // not logged in
        // alert("You are not logged in, please log in");
        new PromptLoginMenu().load();
        return;
    }
    else
        console.log("...user was logged in...");
    // @ts-ignore
    require.config({ paths: { vs: "/lib/monaco/min/vs" } });
    await new Promise(resolve => {
        // @ts-ignore
        require(['vs/editor/editor.main'], function () {
            resolve();
        });
    });
    lesson = new Lesson("Lesson 01", pane_code, pane_tutor_code);
    lesson.bannerSection = new TextArea([
        new TextSection("What Will We Be Doing in This Lesson?", [
            "Want to start coding?",
            "Well, before we can add any logic or fancy visuals, we first have to make an HTML page.",
            "An HTML Page is like a document where you create all the visual parts of the page like buttons or text.",
            // "In this tutorial we'll look at how to make a basic HTML or website page.<br>Nothing too fancy but a start of the core structure."
        ]),
        new TextSection("What Will We Learn?", [
            "How to setup a basic HTML page",
            'How to add a "Header" and "Paragraph" element to your page'
        ])
    ]);
    lesson.finalInstance = new FinalProjectInstance([
        new FileInstance("index.html", `
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
        ], BubbleLoc.global, [
            new AddFileTask("index.html", false)
        ]),
        new LE_AddGBubble([
            "Cool! Now you have an HTML document!",
            'Note: Using the name "index" for our file name means the browser will automatically pick this page when someone tries to go to your site!',
            "i[So what even is an HTML document and what can we do with it?]"
        ], BubbleLoc.global, []),
        new LE_AddGBubble([
            "An HTML document defines what is h[in the page.]",
            "For example, this is where you would put b[buttons, text, and images.]",
            "i[Let's try adding a button.]"
        ], BubbleLoc.global, [
            new AddGenericCodeTask("<button>Click Me!</button>")
        ])
        // new LE_AddBubble("Hello!",2,0),
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
onResize = function (isFirst = false, who) {
    let remainingWidth = innerWidth - pane_lesson.offsetWidth - 15;
    if (isFirst) {
        pane_code.style.width = (remainingWidth / 2) + "px";
        pane_preview.style.width = (remainingWidth / 2) + "px";
    }
    else {
        // if(who == )
        pane_preview.style.width = (remainingWidth - pane_code.offsetWidth) + "px";
    }
    main.style.height = (innerHeight - 60) + "px";
    if (lesson?.p.hasEditor())
        lesson.p.getCurEditor().layout();
};
onResize();
initLessonPage();
let bubbles = [];
function closeBubble(b) {
    b.e.style.animation = "RemoveBubble forwards 0.15s ease-out";
    b.e.onanimationend = function () {
        b.e.parentElement.removeChild(b.e);
    };
}
function addBubble(line, col, text = "This is a text bubble and some more text here is this and you can do this") {
    // let marginOverlayers = document.querySelector(".margin-view-overlays") as HTMLElement;
    // let start = marginOverlayers?.offsetWidth || 64;
    let b = document.createElement("div");
    b.innerHTML = text;
    lesson.p.curFile.bubbles_ov.appendChild(b);
    // let x = col*10;
    // let y = line*19;
    // x = 0;
    // y = 0;
    bubbles.push({
        e: b,
        line, col,
        loc: BubbleLoc.code,
        file: lesson.p.curFile
    });
    // y -= scrollOffset;
    // y += 40;
    b.style.position = "absolute";
    b.classList.add("bubble");
    updateBubble(bubbles.length - 1);
}
var BubbleLoc;
(function (BubbleLoc) {
    BubbleLoc[BubbleLoc["code"] = 0] = "code";
    BubbleLoc[BubbleLoc["add_file"] = 1] = "add_file";
    BubbleLoc[BubbleLoc["global"] = 2] = "global";
})(BubbleLoc || (BubbleLoc = {}));
function addBubbleAt(loc, text) {
    let b = document.createElement("div");
    b.innerHTML = text;
    g_bubbles_ov.appendChild(b);
    let data = {
        e: b,
        line: 0, col: 0,
        loc,
        file: lesson.p.curFile
    };
    bubbles.push(data);
    b.style.position = "absolute";
    b.classList.add("bubble");
    updateBubble(bubbles.length - 1);
    return data;
}
let dev = {
    skipGetStarted: true
};
class BannerMenu extends Menu {
    constructor(text, lesson) {
        super("Welcome!");
        this.text = text;
        this.lesson = lesson;
    }
    text;
    lesson;
    canClose() {
        return false;
    }
    load() {
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
        let b_gettingStarted = this.body.querySelector(".b-getting-started");
        let t = this;
        b_gettingStarted.onclick = function () {
            closeAllMenus();
            lesson.start();
        };
        setTimeout(() => { if (dev.skipGetStarted)
            b_gettingStarted.click(); }, 20);
    }
}
function loadIFrameSimpleMode(iframe, inst) {
    let newIF = document.createElement("iframe");
    iframe.replaceWith(newIF);
    iframe = newIF;
    // icon_refresh.style.rotate = _icRef_state ? "360deg" : "0deg";
    // _icRef_state = !_icRef_state;
    // let htmlText = project.files[0].editor.getValue();
    let indexHTML = inst.files.find(v => v.filename == "index.html");
    if (!indexHTML) {
        alert("Err: could not find index.html to load");
        return;
    }
    let root = iframe.contentDocument;
    root.open();
    root.write(indexHTML.text);
    let scripts = iframe.contentDocument.scripts;
    let newScriptList = [];
    for (const c of scripts) {
        let div = document.createElement("div");
        div.textContent = c.src;
        c.replaceWith(div);
        newScriptList.push(div);
    }
    for (const c of newScriptList) {
        // if(!c.hasAttribute("src")) continue;
        // let src = c.src.replace(location.ancestorOrigins[0]+"/editor","");
        // c.innerHTML = project.files.find(v=>+"/"+v.name == src)?.editor.getValue();
        let sc = document.createElement("script");
        sc.innerHTML = project.files[2].editor.getValue();
        c.replaceWith(sc);
    }
    let styles = iframe.contentDocument.querySelectorAll("link");
    for (const c of styles) {
        let st = document.createElement("style");
        st.innerHTML = project.files[1].editor.getValue();
        c.replaceWith(st);
    }
}
class BannerPreviewMenu extends Menu {
    constructor(lesson) {
        super("What We'll Be Making");
        this.lesson = lesson;
    }
    lesson;
    load() {
        super.load();
        this.menu.classList.add("menu-banner-preview");
        this.body.innerHTML = `
            <iframe></iframe>
        `;
        let iframe = this.body.querySelector("iframe");
        loadIFrameSimpleMode(iframe, this.lesson.finalInstance);
    }
}
class TextSection {
    constructor(header, lines) {
        this.header = header;
        this.lines = lines;
    }
    header;
    lines;
}
function addBannerBubble(lesson) {
    let textarea = lesson.bannerSection;
    let text = "";
    for (const s of textarea.sects) {
        text += "<div class='section'>";
        text += `<h3>${s.header}</h3><br>`;
        for (const l of s.lines) {
            text += `<div>${l}</div><br>`;
        }
        text += "</div>";
    }
    new BannerMenu(text, lesson).load();
}
function addBannerPreviewBubble(lesson) {
    new BannerPreviewMenu(lesson).load();
}
// addBubble(10,20);
function updateBubbles() {
    for (let i = 0; i < bubbles.length; i++) {
        updateBubble(i);
    }
}
function updateBubble(i) {
    let b = bubbles[i];
    let x = 0;
    let y = 0;
    if (b.loc == BubbleLoc.code) {
        x = b.col * 7.7;
        y = b.line * 19;
        y -= b.file.scrollOffset;
        y += 25;
        let start = 64 + 22 - 7.7;
        x += start;
    }
    else if (b.loc == BubbleLoc.global) {
        x = innerWidth * 0.5;
        y = innerHeight * 0.45 - 100;
        b.e.classList.add("centered");
        b.e.classList.add("no-callout");
        b.e.classList.add("global");
    }
    else if (b.loc == BubbleLoc.add_file) {
        let userAddFile = lesson.p.parent.querySelector(".b-add-file");
        let rect = userAddFile.getBoundingClientRect();
        x = rect.x;
        y = rect.y + rect.height + 15 - 60;
        b.e.classList.add("dir-top");
    }
    b.e.style.left = x + "px";
    b.e.style.top = y + "px";
}
//# sourceMappingURL=lesson.js.map