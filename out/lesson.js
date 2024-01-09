const d_task = document.querySelector(".d-task");
const d_subTasks = document.querySelector(".d-sub-tasks");
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
    constructor(code, lang) {
        super();
        this.code = code;
        this.lang = lang;
    }
    code;
    lang;
    get() {
        return `
            <pre class="code"><code class="language-${this.lang}">${escapeMarkup(this.code)}</code></pre>
            <div class="sub-task-btns">
                <button class="b-mark-done">Mark Done</button>
                <button class="b-replay"><div class="material-symbols-outlined">replay</div></button>
            </div>
        `;
    }
}
class Task {
    constructor(title) {
        this.title = title;
    }
    supertask;
    title;
    hasStarted = false;
    isFinished = false;
    _preVal;
    _preCol;
    _preLine;
    taskRef;
    canBeFinished = false;
    _resFinish;
    _prom;
    finalDelay = 0;
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
        lesson.loadSubTask(this);
        console.warn(`:: Started Task #${lesson._subTaskNum++} :: #${lesson._taskCount++}`, this.title);
        let t = this;
        this._prom = new Promise(resolve => {
            this._resFinish = function (v) {
                if (t.canBeFinished) {
                    resolve(v);
                    return 1;
                }
            };
        });
    }
    async finish() {
        this.canBeFinished = true;
        let res = null;
        if (this._prom)
            res = await this._prom;
        lesson.finishSubTask(this);
        this.isFinished = true;
        hideTutMouse();
        this.cleanup();
        if (this.finalDelay)
            await wait(this.finalDelay);
        return res;
    }
    cleanup() { }
    async play() { }
    async replay(editor) {
        // if(!this.canBeFinished) return;
        if (!this.canBeFinished && !this.isFinished)
            return;
        if (lesson.currentSubTask)
            lesson.currentSubTask._resFinish("rp_" + this.supertask.tasks.indexOf(this));
        // else // I don't know how I can restart it if it's completely finished 
        return;
        let t = this;
        if (!t.canBeFinished)
            return;
        t.cleanup();
        editor.setValue(t._preVal);
        editor.setPosition({ lineNumber: t._preLine, column: t._preCol });
        t.canBeFinished = false;
        t.hasStarted = false;
        t.isFinished = false;
        let list = [...d_subTasks.children];
        let ind = this.supertask.tasks.indexOf(t);
        for (let i = ind; i < list.length; i++) {
            d_subTasks.removeChild(list[i]);
            this.supertask.tasks[i].taskRef = null;
        }
        lesson.loadSubTask(t);
        await t.play();
        this.canBeFinished = true;
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
        let b_tutAddFile = lesson.tut.parent.querySelector(".b-add-file");
        let rect = b_tutAddFile.getBoundingClientRect();
        await showTutMouse();
        await moveTutMouseTo(rect.x + rect.width / 2, rect.y + rect.height / 2);
        await wait(300);
        await fakeClickButton(b_tutAddFile);
        lesson.tut.createFile(this.name, "");
        await wait(500);
        let b = addBubbleAt(BubbleLoc.add_file, this.title);
        this.addToHook(listenHooks.addFile);
        let res = await this.finish();
        closeBubble(b);
        return res;
    }
    check(name) {
        return (name == this.name);
    }
}
class AddGenericCodeTask extends Task {
    constructor(code, lang) {
        super("Add the following code:");
        this.code = code;
        this.lang = lang;
        // this.finalDelay = 2600;
    }
    code;
    lang;
    async play() {
        let editor = lesson.tut.getCurEditor();
        // editor.getSupportedActions().forEach((value: monaco.editor.IEditorAction) => {
        //     console.log(value);
        // });
        lesson.tut.curFile.blockPosChange = false;
        let pos = editor.getPosition();
        await showTutMouse();
        await moveTutMouseTo(58 + pos.column * 7.7, 115 + pos.lineNumber * 16.5);
        await wait(150);
        await hideTutMouse();
        await wait(200);
        let list = document.querySelectorAll(".custom-cursor");
        for (const c of list) {
            c.style.display = "block";
        }
        for (let i = 0; i < this.code.length; i++) {
            editor.updateOptions({ readOnly: false });
            editor.trigger("keyboard", "type", {
                text: this.code.substring(i, i + 1)
            });
            editor.updateOptions({ readOnly: true });
            await wait(Math.ceil(30 + Math.random() * 100));
        }
        for (const c of list) {
            c.style.display = null;
        }
        pos = editor.getPosition();
        lesson.tut.curFile.curRow = pos.lineNumber;
        lesson.tut.curFile.curCol = pos.column;
        lesson.tut.curFile.blockPosChange = true;
        moveTutMouseTo(58 + pos.column * 7.7, 115 + pos.lineNumber * 16.5);
        if (false) {
            let b = addBubble(lesson.tut.curFile, "<button>I'm Done</button>");
            b.e.classList.add("small");
            let btn = b.e.querySelector("button");
            btn.addEventListener("click", e => {
                closeBubble(b);
                this._resFinish();
            });
        }
        if (!lesson._hasShownMarkDoneReminder) {
            lesson._hasShownMarkDoneReminder = true;
            let f = lesson.tut.curFile;
            let b = addBubble(f, `Make sure you click "Mark Done" when you're finished copying the code!`, f.curRow, f.curCol, "top");
            this._finishBubble = b;
        }
    }
    async start() {
        super.start();
        await this.play();
        return await this.finish();
    }
    _finishBubble;
    getSections() {
        return [
            new CodeTaskSection(this.code, this.lang)
        ];
    }
    cleanup() {
        // let b_markDone = this.taskRef.querySelector(".b-mark-done") as HTMLButtonElement;
        // b_markDone.disabled = false;
        if (this._finishBubble) {
            closeBubble(this._finishBubble);
            this._finishBubble = null;
        }
    }
}
class AddTutorSideText extends Task {
    constructor(text, comment) {
        super(comment);
        this.text = text;
        this.comment = comment;
    }
    text;
    comment;
    async start() {
        super.start();
        let editor = lesson.tut.getCurEditor();
        lesson.tut.curFile.blockPosChange = false;
        let speedScale = 1;
        if (this.text.length < 5)
            speedScale = 2;
        let pos = editor.getPosition();
        await showTutMouse();
        await moveTutMouseTo(58 + pos.column * 7.7, 115 + pos.lineNumber * 16.5);
        await wait(150);
        await hideTutMouse();
        await wait(200);
        let list = document.querySelectorAll(".custom-cursor");
        for (const c of list) {
            c.style.display = "block";
        }
        for (let i = 0; i < this.text.length; i++) {
            editor.updateOptions({ readOnly: false });
            editor.trigger("keyboard", "type", {
                text: this.text.substring(i, i + 1)
            });
            editor.updateOptions({ readOnly: true });
            await wait(Math.ceil((30 + Math.random() * 100) * speedScale));
        }
        for (const c of list) {
            c.style.display = null;
        }
        pos = editor.getPosition();
        lesson.tut.curFile.curRow = pos.lineNumber;
        lesson.tut.curFile.curCol = pos.column;
        lesson.tut.curFile.blockPosChange = true;
        moveTutMouseTo(58 + pos.column * 7.7, 115 + pos.lineNumber * 16.5);
        this.canBeFinished = true;
        this._resFinish();
        return await this.finish();
    }
}
class DoRefreshTask extends Task {
    constructor(text, comment) {
        if (!comment)
            comment = text;
        super(comment);
        this.text = text;
        // this.finalDelay = 3000;
    }
    text;
    b;
    async start() {
        super.start();
        this.addToHook(listenHooks.refresh);
        this.b = addBubbleAt(BubbleLoc.refresh, this.text);
        return await this.finish();
    }
    cleanup() {
        closeBubble(this.b);
    }
}
class ClickButtonTask extends Task {
    constructor(btn, text, dir, comment) {
        if (!comment)
            comment = text;
        super(comment);
        this.btn = btn;
        this.dir = dir;
        this.text = text;
    }
    text;
    dir;
    btn;
    async start() {
        super.start();
        let t = this;
        let func = function () {
            t._resFinish();
            t.btn.removeEventListener("click", func);
        };
        this.btn.addEventListener("click", func);
        // let b = addBubbleAt()
        return await this.finish();
    }
}
let listenHooks = {
    addFile: [],
    refresh: []
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
        if (f._resFinish)
            f._resFinish();
        else {
            console.warn("Weird, there wasn't a finish for the hook...?");
        }
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
    getTaskText() { return ""; }
    tasks;
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
        addBubble(lesson.p.curFile, this.text, this.lineno, this.colno);
    }
}
class LE_AddGBubble extends LEvent {
    constructor(lines, loc, tasks) {
        super();
        this.ogLines = lines;
        let text = lines.join("<br><br>").replaceAll("\n", "<br><br>");
        this.text = text;
        this.loc = loc;
        this.tasks = tasks;
    }
    ogLines;
    text;
    loc;
    // tasks:Task[];
    async run() {
        console.warn(`::: Started SUPER Task #${lesson._taskNum} :::`, this.text);
        let res;
        let prom = new Promise(resolve => { res = resolve; });
        let b_confirm = document.createElement("button");
        b_confirm.textContent = "Next";
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
        let tt = this;
        async function loop(start = 0) {
            for (let i = start; i < tt.tasks.length; i++) {
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
                if (typeof res == "string") {
                    if (res.startsWith("rp_")) {
                        let newStart = parseInt(res.replace("rp_", ""));
                        let startT = tt.tasks[newStart];
                        let editor = lesson.tut.getCurEditor();
                        editor.setValue(startT._preVal);
                        editor.setPosition({ lineNumber: startT._preLine, column: startT._preCol });
                        let list = [...d_subTasks.children];
                        for (let i = newStart; i < list.length; i++) {
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
    getTaskText() {
        return this.ogLines[this.ogLines.length - 1];
    }
}
class RunTasksLEvent extends LEvent {
    constructor(tasks) {
        super();
        this.tasks = tasks;
    }
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
    _hasShownMarkDoneReminder = false;
    init() {
        addBannerBubble(this);
        addBannerPreviewBubble(this);
        this.p.init();
        this.tut.init();
    }
    async start() {
        this._taskNum = 0;
        this.clearAllTasks();
        this.currentSubTask = null;
        await restoreLessonFiles(this);
        await wait(350);
        for (const e of this.events) {
            for (const t of e.tasks) { // associate super task with sub task
                t.supertask = e;
            }
            this._subTaskNum = 0;
            this.loadTask(e);
            await e.run();
            await wait(300);
        }
    }
    loadTask(e) {
        this.currentTask = e;
        if (e instanceof LE_AddGBubble) {
            if (!e.tasks.length)
                return;
        }
        this.clearAllTasks();
        this.currentTask = e;
        d_task.innerHTML = `<div>${formatBubbleText(e.getTaskText())}</div>`;
    }
    clearAllTasks() {
        this.currentTask = null;
        // this.currentSubTask = null; // temporary?
        d_task.innerHTML = "";
        d_subTasks.innerHTML = "";
    }
    loadSubTask(t) {
        this.currentSubTask = t;
        t.hasStarted = true;
        let editor = lesson.tut.getCurEditor();
        let pos = editor?.getPosition();
        if (t._preVal == null) {
            t._preVal = editor?.getValue() || "";
            t._preLine = pos?.lineNumber || 1;
            t._preCol = pos?.column || 1;
        }
        let div = document.createElement("div");
        // div.className = "flx-sb c";
        let ind = lesson.currentTask.tasks.indexOf(t);
        div.innerHTML = `<div class="flx-sb c"><div><span class="l-num">#${ind + 1} </span><span>${t.title}</span></div><div class="material-symbols-outlined cb">check_box_outline_blank</div></div>`;
        let sects = t.getSections();
        d_subTasks.appendChild(div);
        for (const s of sects) {
            let d = document.createElement("div");
            d.innerHTML = s.get();
            t.taskRef = d;
            div.appendChild(d);
            let code = d.querySelector("code");
            if (code) {
                // @ts-ignore
                Prism.highlightElement(code, null, null);
                let markDone = d.querySelector(".b-mark-done");
                markDone.addEventListener("click", async (e) => {
                    if (t._resFinish()) {
                        markDone.disabled = true;
                        if (false) { // let's continue bubble
                            await wait(400);
                            let b = addBubble(lesson.tut.curFile, "Let's continue.");
                            await wait(2000);
                            closeBubble(b);
                            await wait(200);
                        }
                    }
                });
                let b_replay = d.querySelector(".b-replay");
                b_replay.addEventListener("click", e => {
                    // replay
                    t.replay(editor);
                });
            }
        }
    }
    finishSubTask(t) {
        // this.currentSubTask = null; // temporary?
        let ind = lesson.currentTask.tasks.indexOf(t);
        let c = d_subTasks.children[ind];
        let cb = c.querySelector(".cb");
        cb.textContent = "select_check_box";
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
let tutMouse = document.createElement("div");
tutMouse.className = "tut-mouse";
document.body.appendChild(tutMouse);
async function hideTutMouse() {
    tutMouse.style.opacity = "0";
    await wait(350);
}
async function showTutMouse() {
    tutMouse.style.opacity = "1";
    await wait(350);
}
async function moveTutMouseTo(x, y) {
    tutMouse.style.left = x + "px";
    tutMouse.style.top = y + "px";
    await wait(350);
}
hideTutMouse();
async function fakeClickButton(e) {
    await wait(50);
    e.classList.add("f-hover");
    await wait(150);
    e.classList.remove("f-hover");
    await wait(150);
}
var EditorType;
(function (EditorType) {
    EditorType[EditorType["none"] = 0] = "none";
    EditorType[EditorType["self"] = 1] = "self";
    EditorType[EditorType["tutor"] = 2] = "tutor";
})(EditorType || (EditorType = {}));
function setupEditor(parent, type) {
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
    if (type != EditorType.none) {
        let label = document.createElement("div");
        label.innerHTML = `<div class="material-symbols-outlined">menu</div><div>${(type == EditorType.tutor ? "TUTOR" : "YOU")}</div>`;
        // label.textContent = (type == EditorType.tutor ? "Tutor's Code" : "Your Code");
        label.className = (type == EditorType.tutor ? "editor-type-tutor" : "editor-type-self");
        d_files.appendChild(label);
    }
}
function postSetupEditor(project) {
    let parent = project.parent;
    project.d_files = parent.querySelector(".d-open-files");
    project.codeCont = parent.querySelector(".cont-js");
    console.log("completed post setup");
    // project.createFile("test.html",`<p>Hello</p>`,"html");
    // project.files[0].open();
    // project.createFile("main.js",`console.log("hello");\nconsole.log("hello");\nconsole.log("hello");\nconsole.log("hello");`,"javascript");
    // project.files[1].open();
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
    setupEditor(pane_tutor_code, EditorType.tutor);
    setupEditor(pane_code, EditorType.self);
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
            new AddGenericCodeTask("<button>Click Me!</button>", "html"),
            new DoRefreshTask("Refresh the preview to see how it looks.", "Refresh the preview"),
            new AddTutorSideText("\n\n", "Add some space"),
            new AddGenericCodeTask(`<button>Click</button>

<div>
<h1>Test</h1>
<p>Test paragrph</p>
</div>\b\b`, "html"),
            new AddFileTask("main.js", false),
            new AddGenericCodeTask('alert("hi");', "javascript"),
            new AddTutorSideText("\n\n", "Add some space"),
            new AddGenericCodeTask('alert("hi");', "javascript"),
        ]),
        new LE_AddGBubble([
            "Awesome!"
        ], BubbleLoc.global, [])
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
    if (!b)
        return;
    b.e.style.animation = "RemoveBubble forwards 0.15s ease-out";
    b.e.onanimationend = function () {
        b.e.parentElement.removeChild(b.e);
    };
}
function addBubble(file, text = "This is a text bubble and some more text here is this and you can do this", line, col, dir) {
    if (line == null)
        line = file.curRow;
    if (col == null)
        col = file.curCol;
    if (dir == null)
        dir = "top";
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
        e: b,
        line, col,
        loc: BubbleLoc.code,
        file
    };
    bubbles.push(data);
    if (dir)
        b.classList.add("dir-" + dir);
    // y -= scrollOffset;
    // y += 40;
    b.style.position = "absolute";
    b.classList.add("bubble");
    updateBubble(bubbles.length - 1);
    return data;
}
var BubbleLoc;
(function (BubbleLoc) {
    BubbleLoc[BubbleLoc["code"] = 0] = "code";
    BubbleLoc[BubbleLoc["add_file"] = 1] = "add_file";
    BubbleLoc[BubbleLoc["global"] = 2] = "global";
    BubbleLoc[BubbleLoc["refresh"] = 3] = "refresh";
})(BubbleLoc || (BubbleLoc = {}));
function formatBubbleText(text) {
    while (text.includes("[")) {
        let ind = text.indexOf("[");
        let id = text[ind - 1];
        let str = `<span class="l-${id}">`;
        text = text.replace(id + "[", str); // replaces just the first instance which is where we're at
    }
    text = text.replaceAll("]", "</span>");
    return text;
}
function addBubbleAt(loc, text) {
    let b = document.createElement("div");
    b.innerHTML = formatBubbleText(text);
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
        x -= b.file.scrollOffsetX;
        y -= b.file.scrollOffset;
        // y += 25;
        y += 88;
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
        // x = rect.x + 34;
        // y = rect.y+rect.height+15 - 60 - 52;
        x = rect.x;
        y = rect.y + rect.height + 15 - 60;
        b.e.classList.add("dir-top2");
    }
    else if (b.loc == BubbleLoc.refresh) {
        let rect = b_refresh.getBoundingClientRect();
        x = rect.x;
        y = rect.y + rect.height + 15 - 60;
        b.e.classList.add("dir-top2");
    }
    b.e.style.left = x + "px";
    b.e.style.top = y + "px";
}
// refresh system
b_refresh = document.querySelector(".b-refresh");
icon_refresh = document.querySelector(".icon-refresh");
iframe = document.querySelector("iframe");
// let _icRef_state = true;
b_refresh.addEventListener("click", e => {
    // http://localhost:3000/lesson/claebcode@gmail.com/j0Il_K7cF6seBhkHAAAB/claebcode@gmail.com/tmp_lesson/
    let file1 = lesson.p.files.find(v => v.name == "index.html");
    if (!file1) {
        alert("No index.html file found! Please create a new file called index.html, this file will be used in the preview.");
        return;
    }
    iframe.src = "http://localhost:3000/lesson/" + g_user.sanitized_email + "/" + socket.id + "/" + g_user.sanitized_email + "/tmp_lesson";
    resolveHook(listenHooks.refresh, null);
    return;
    let newIF = document.createElement("iframe");
    iframe.replaceWith(newIF);
    iframe = newIF;
    icon_refresh.style.rotate = _icRef_state ? "360deg" : "0deg";
    _icRef_state = !_icRef_state;
    let file = lesson.p.files.find(v => v.name == "index.html");
    if (!file) {
        alert("No index.html file found! Please create a new file called index.html, this file will be used in the preview.");
        return;
    }
    resolveHook(listenHooks.refresh, null);
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
});
// key events
document.addEventListener("keydown", async (e) => {
    if (!e.key)
        return;
    let k = e.key.toLowerCase();
    if (menusOpen.length) {
        if (k == "escape") {
            closeAllMenus();
        }
        return;
    }
    if (e.ctrlKey) {
        if (k == "r") {
            console.log("ASD");
            e.preventDefault();
            await uploadLessonFiles(lesson);
            b_refresh.click();
        }
        else if (k == "s") {
            uploadLessonFiles(lesson);
            e.preventDefault();
        }
    }
});
setTimeout(() => {
    iframe.addEventListener("keydown", e => {
        console.log("asd");
        e.preventDefault();
    });
}, 3000);
//# sourceMappingURL=lesson.js.map