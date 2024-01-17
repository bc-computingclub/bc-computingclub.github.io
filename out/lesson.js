PAGE_ID = PAGEID.lesson;
const d_currentTasks = document.querySelector(".d-current-tasks");
const d_task = document.querySelector(".d-task");
const d_subTasks = document.querySelector(".d-sub-tasks");
const b_imDone = d_lesson_confirm.querySelector(".b-im-done");
const b_replay = d_lesson_confirm.querySelector(".b-replay");
const b_goBackStep = d_lesson_confirm.querySelector(".b-go-back-step");
d_lesson_confirm.classList.remove("none");
function getTypeSpeed(textLen) {
    let speedScale = 1;
    if (textLen < 5)
        speedScale = 2;
    return Math.ceil((30 + Math.random() * 100) * speedScale);
}
b_imDone.addEventListener("click", e => {
    if (lesson.currentSubTask) {
        lesson.currentSubTask._resFinish();
        b_imDone.disabled = true;
    }
});
b_replay.addEventListener("click", e => {
    if (lesson.currentSubTask) {
        lesson.currentSubTask.replay(lesson.tut.getCurEditor()); // this needs to be fixed later; need to store on task _preTutFile and _prePFile to switch back to
        // ^^^ this has now been fixed but needs more fixing, need to store temporary state each time? uses a lot of ram but hmm
    }
});
b_goBackStep.addEventListener("click", e => {
    if (lesson.currentSubTask) {
        let ind = lesson.currentTask.tasks.indexOf(lesson.currentSubTask);
        let startInd = ind;
        if (ind <= 0)
            return;
        let t;
        while (ind >= 0) {
            ind--;
            t = lesson.currentTask.tasks[ind];
            if (t instanceof AddTutorSideText)
                continue;
            if (t.requiresDoneConfirm)
                break;
        }
        let ct = lesson.currentTask.tasks[startInd - 1];
        if (ct instanceof AddFileTask) {
            ct.file.editor.setValue("");
            ct.file.editor.setPosition(ct.file.editor.getPosition().with(1, 1));
        }
        t.replay(lesson.tut.getCurEditor()); // ^^^
    }
});
async function hideLessonConfirm() {
    await wait(50);
    d_lesson_confirm.style.opacity = "0";
    await wait(1500);
}
async function showLessonConfirm() {
    let preTask = lesson.currentTask;
    let preSubTask = lesson.currentSubTask;
    // await wait(2000);
    await wait(1000);
    if (lesson.currentTask != preTask || lesson.currentSubTask != preSubTask) {
        console.warn("Canceled opening LessonConfirm, task/subtask changed in the middle of opening");
        return;
    }
    d_lesson_confirm.style.opacity = "1";
    await wait(500);
}
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
    _prePFile;
    _preTutFile;
    taskRef;
    canBeFinished = false;
    _resFinish;
    _prom;
    finalDelay = 0;
    requiresDoneConfirm = true;
    preState;
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
        if (this.requiresDoneConfirm)
            showLessonConfirm();
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
        this.requiresDoneConfirm = false; // you have to do the step in order to continue
    }
    name;
    isRequired;
    b;
    alreadyHas = false;
    file;
    preventContinueIfFail() {
        return this.isRequired;
    }
    async start() {
        super.start();
        this.alreadyHas = false;
        let b_tutAddFile = lesson.tut.parent.querySelector(".b-add-file");
        let rect = b_tutAddFile.getBoundingClientRect();
        let tarBtn = b_tutAddFile;
        await showTutMouse();
        let r2 = tutMouse.getBoundingClientRect();
        let text2 = "Let's create " + this.name;
        let existingFile = lesson.tut.files.find(v => v.name == this.name);
        let goesBack = false;
        if (existingFile) {
            text2 = "Let's go back to " + this.name;
            let fileElm = lesson.tut.d_files.children[lesson.tut.files.indexOf(existingFile)];
            rect = fileElm.getBoundingClientRect();
            tarBtn = fileElm;
            goesBack = true;
        }
        let b2 = addBubbleAt(BubbleLoc.xy, text2, "top", {
            x: r2.x + r2.width / 2 + 17,
            y: r2.y + r2.height / 2 - 22,
            click: true
        });
        await b2.clickProm;
        await moveTutMouseTo(rect.x + rect.width / 2, rect.y + rect.height / 2);
        await wait(300);
        await fakeClickButton(tarBtn);
        if (existingFile) {
            existingFile.open();
            lesson.tut.curFile = existingFile;
        }
        this.file = lesson.tut.createFile(this.name, "");
        await wait(500);
        let alreadyFoundFile = lesson.p.files.find(v => v.name == this.name);
        if (!alreadyFoundFile) {
            this.b = addBubbleAt(BubbleLoc.add_file, this.title);
            this.addToHook(listenHooks.addFile);
        }
        else if (!goesBack) {
            this.b = addBubbleAt(BubbleLoc.add_file, "Oh! I see you already have a " + this.name + " file! I'll switch you to it.", null, { click: true });
            await this.b.clickProm;
            await wait(100);
            alreadyFoundFile.open();
            await wait(300);
            this.canBeFinished = true;
            this._resFinish();
        }
        else {
            await wait(300);
            this.canBeFinished = true;
            this._resFinish();
        }
        let res = await this.finish();
        return res;
    }
    check(name) {
        return (name == this.name);
    }
    cleanup() {
        closeBubble(this.b);
    }
}
class SubMsg {
    constructor() {
    }
}
class AddGenericCodeTask extends Task {
    constructor(code, lang, submsgs = []) {
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
        await wait(250);
        let r2 = tutMouse.getBoundingClientRect();
        let preText = "Let's add some code here.";
        if (!lesson._hasShownFollowAlong) {
            preText += "<br><br>i[Follow along! But feel free to make your own changes and experiment!]";
            lesson._hasShownFollowAlong = true;
        }
        let b2 = addBubbleAt(BubbleLoc.xy, preText, "top", {
            x: r2.x + r2.width / 2 + 17,
            y: r2.y + r2.height / 2 - 22,
            click: true
        });
        await b2.clickProm;
        await wait(150);
        await hideTutMouse();
        await wait(200);
        let list = document.querySelectorAll(".custom-cursor");
        for (const c of list) {
            c.style.display = "block";
        }
        for (let i = 0; i < this.code.length; i++) {
            let key = this.code.substring(i, i + 1);
            if (key == "\x05") {
                await wait(250);
                continue;
            }
            else if (key == "\x01") {
                let pos = editor.getPosition();
                editor.setPosition(pos.with(pos.lineNumber, pos.column - 1));
                continue;
            }
            else if (key == "\x02") {
                let pos = editor.getPosition();
                editor.setPosition(pos.with(pos.lineNumber, pos.column + 1));
                continue;
            }
            editor.updateOptions({ readOnly: false });
            editor.trigger("keyboard", "type", {
                text: key
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
            await wait(getTypeSpeed(this.text.length));
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
        await wait(500);
        // this.addToHook(listenHooks.refresh); // since you may want to look at the preview for a while, this should require the "I'm Done" instead
        this.b = addBubbleAt(BubbleLoc.refresh, this.text);
        console.log(11);
        await waitForQuickHook(listenHooks.refresh);
        console.log(22);
        this.cleanup();
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
class PonderBoardTask extends Task {
    constructor(title) {
        super(title);
        this.requiresDoneConfirm = false;
    }
    async start() {
        super.start();
        await wait(250);
        let r2 = tutMouse.getBoundingClientRect();
        let b2 = addBubbleAt(BubbleLoc.xy, this.title, "top", {
            x: r2.x + r2.width / 2 + 17,
            y: r2.y + r2.height / 2 - 22,
            click: true
        });
        await b2.clickProm;
        lesson.board.init();
        let b = lesson.board;
        b.show();
        await this.finish();
    }
    cleanup() {
        lesson.board.exit();
    }
}
class TmpTask extends Task {
    constructor() {
        super("");
        this.requiresDoneConfirm = false;
    }
    async start() {
        let t = this;
        this._prom = new Promise(resolve => {
            this._resFinish = function (v) {
                if (t.canBeFinished) {
                    resolve(v);
                    return 1;
                }
            };
        });
        console.log(":::: has started");
        return await this.finish();
    }
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
        b_confirm.innerHTML = "<div>Next</div><div class='material-symbols-outlined'>mouse</div>";
        b_confirm.classList.add("b-confirm");
        let b = addBubbleAt(this.loc, this.text);
        b.e.appendChild(document.createElement("br"));
        b.e.appendChild(document.createElement("br"));
        b.e.appendChild(b_confirm);
        b_confirm.addEventListener("click", e => {
            console.log("click");
            res();
        });
        // TMP
        // b_confirm.click();
        // 
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
                        if (lesson.tut.curFile != startT._preTutFile) {
                            let fileElm = lesson.tut.d_files.children[lesson.tut.files.indexOf(startT._preTutFile)];
                            let rect = fileElm.getBoundingClientRect();
                            await showTutMouse();
                            await moveTutMouseTo(rect.x + rect.width / 2, rect.y + rect.height / 2);
                            await wait(300);
                            await fakeClickButton(fileElm);
                            startT._preTutFile.open();
                            await wait(500);
                        }
                        console.log("INCLUDES? ", lesson.tut.files.includes(startT._preTutFile));
                        lesson.tut.curFile = startT._preTutFile;
                        let editor = lesson.tut.getCurEditor();
                        // let editor = startT._preTutFile.editor;
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
class LessonState {
    constructor() {
    }
    tutFiles;
}
class Rect {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    x;
    y;
    w;
    h;
    get cx() {
        return this.x + this.w / 2;
    }
    get cy() {
        return this.y + this.h / 2;
    }
    get r() {
        return this.x + this.w;
    }
    get b() {
        return this.y + this.h;
    }
    /**
     * old width, old height, new width, new height
     */
    changeUnits(w1, h1, w2, h2) {
        this.x = this.x / w1 * w2;
        this.y = this.y / h1 * h2;
        this.w = this.w / w1 * w2;
        this.h = this.h / h1 * h2;
        return this;
    }
}
class BoardObj {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this._storeTags = [];
    }
    x = 0;
    y = 0;
    opacity = 1;
    _storeTags;
    b;
    extraPad = {
        l: 0,
        r: 0,
        t: 0,
        b: 0
    };
    hasTag(...tags) {
        for (const t of tags) {
            if (this._storeTags.includes(t))
                return true;
        }
        return false;
    }
    addTag(tag) {
        if (!this._storeTags.includes(tag)) {
            this._storeTags.push(...tag.split(" "));
            // let oldObj = this.b.objStore.get(tag);
            // if(oldObj) oldObj.removeTag(tag);
            // this.b.objStore.set(tag,this);
        }
    }
    removeTag(...tags) {
        for (const tag of tags) {
            this._storeTags.splice(this._storeTags.indexOf(tag), 1);
        }
        // if(this.b.objStore.get(tag) == this) this.b.objStore.delete(tag);
    }
    transferTags(to) {
        for (const t of this._storeTags) {
            to.addTag(t);
        }
        this.removeAllTags();
    }
    removeAllTags() {
        let list = [...this._storeTags];
        for (const t of list) {
            this.removeTag(t);
        }
    }
    postRender(_ctx, b) { }
    ;
    async onAdd(b) { }
    ;
    getScreenPos() {
        let b = this.b;
        let x = this.x * b.can.width + b._rect.x;
        let y = this.y * b.can.height + b._rect.y;
        return { x, y };
    }
    getRect() {
        let b = this.b;
        let x = this.x * b.can.width + b._rect.x;
        let y = this.y * b.can.height + b._rect.y;
        let w = 0;
        let h = 0;
        return new Rect(x, y, w, h);
    }
}
class AnchoredBoardObj extends BoardObj {
    constructor(x, y, ha, va) {
        super(x, y);
        this.ha = ha;
        this.va = va;
    }
    ha;
    va;
    getAnchoredPos(w, h) {
        let ctx = this.b.ctx;
        let x = this.x * ctx.canvas.width;
        let y = this.y * ctx.canvas.height;
        if (this.ha == Anchor.CENTER)
            x -= w / 2;
        else if (this.ha == Anchor.END)
            x -= w;
        if (this.va == Anchor.CENTER)
            y -= h / 2;
        else if (this.va == Anchor.END)
            y -= h;
        return { x, y };
    }
}
class BORef {
    constructor(ref) {
        this.ref = ref;
    }
    static fromObj(obj) {
        let b = new BORef(null);
        b.obj = obj;
        return b;
    }
    obj;
    ref;
    unwrap(b) {
        if (this.obj)
            return this.obj;
        // return b.objStore.get(this.ref);
        return b.objs.find(v => v.hasTag(this.ref));
    }
}
class MultiBORef {
    constructor(...refs) {
        this.refs = refs;
    }
    refs;
    objs;
    _with;
    static fromObjs(objs) {
        let d = new MultiBORef(null);
        d.objs = objs;
        return d;
    }
    unwrap(b) {
        let i = 0;
        if (!this.objs)
            this.objs = b.objs.filter(v => {
                let res = v.hasTag(...this.refs);
                if (res) {
                    if (this._with)
                        this._with(v, i);
                    i++;
                    return true;
                }
                return false;
            });
        return this.objs;
    }
    with(f) {
        this._with = f;
        return this;
    }
}
var Anchor;
(function (Anchor) {
    Anchor[Anchor["START"] = 0] = "START";
    Anchor[Anchor["CENTER"] = 1] = "CENTER";
    Anchor[Anchor["END"] = 2] = "END";
})(Anchor || (Anchor = {}));
class BoardEvent {
    constructor() { }
    async finish(autoFinish = false) {
        if (autoFinish)
            this._resFinish();
        await this._prom;
    }
    start() {
        if (this._resFinish)
            this._resFinish();
        this._prom = new Promise(resolve => {
            this._resFinish = resolve;
        });
    }
    _resFinish;
    _prom;
    after(f) {
        f(this);
        return this;
    }
}
class AnchoredBoardEvent extends BoardEvent {
    constructor(ha, va) {
        super();
        this.ha = ha;
        this.va = va;
    }
    ha;
    va;
}
// TextColored
class TC {
    constructor(text, id) {
        this.text = text;
        this.id = id;
    }
    text;
    id;
}
const TC_Cols = {
    0: "gray",
    1: "royalblue",
    2: "dodgerblue",
    3: "white"
};
function getLenTC(tc) {
    let l = 0;
    for (const d of tc) {
        l += d.text.length;
    }
    return l;
}
function getLongestLineLen(lines) {
    let max = 0;
    for (const l of lines) {
        if (l.length > max)
            max = l.length;
    }
    return max;
}
function getLongestLineLenSum(lines) {
    let text = lines.join("");
    lines = text.split("\n");
    let max = 0;
    for (const l of lines) {
        if (l.length > max)
            max = l.length;
    }
    return max;
}
function getLinesOffset(parts) {
    let offset = 0;
    for (const p of parts) {
        offset += p.getOffset();
    }
    return offset;
}
function parseCodeStr(code, colIds, delimiter = "$", f) {
    let parts = code.split(delimiter);
    let ar = [];
    let i = 0;
    for (const p of parts) {
        let obj = new TA_Text(p, colIds[i]);
        ar.push(obj);
        let i_cp = i;
        if (f)
            obj.onAfter = function () {
                f(i_cp, obj);
            };
        i++;
    }
    return ar;
}
function emptyStr(len) {
    let str = "";
    for (let i = 0; i < len; i++) {
        str += " ";
    }
    return str;
}
class TypeAnim {
    constructor(tasks) {
        this.tasks = tasks;
    }
    tasks;
    async run() {
        for (const t of this.tasks) {
            await t.run();
            if (t.onAfter)
                t.onAfter();
        }
    }
}
class TA_Task {
    constructor() {
    }
    partI;
    b;
    e;
    obj;
    getOffset() { return 0; }
    getText() { return ""; }
    onAfter;
}
class TA_ObjBubble extends TA_Task {
    constructor(text, par) {
        super();
        this.text = text;
        this.par = par;
    }
    text;
    par;
    async run() {
        let { x, y } = this.par.getScreenPos();
        let b = addBubbleAt(BubbleLoc.xy, this.text, null, {
            x, y,
            click: true
        });
        await b.clickProm;
    }
}
class TA_Wait extends TA_Task {
    constructor(delay) {
        super();
        this.delay = delay;
    }
    delay;
    async run() {
        await wait(this.delay);
    }
}
class TA_Text extends TA_Task {
    constructor(code, colId) {
        super();
        this.code = code;
        this.colId = colId;
        this.tc = new TC(code, colId);
    }
    code;
    colId;
    tc;
    getOffset() {
        return this.code.length;
    }
    getText() {
        return this.code;
    }
    async run() {
        // for(const d of oldOrder){
        //     let obj = new BO_Text(d,x,y,Anchor.START,this.va);
        //     b.objs.push(obj);
        //     objList.push(obj);
        //     x += amt * d.text.length;
        // }
        // for(const ind of this.newOrder){
        //     await objList[ind].onAdd(b);
        // }
        let obj = new BO_Text(this.tc, this.e.tx, this.e.ty, Anchor.START, Anchor.CENTER);
        this.obj = obj;
        let b = this.b;
        await b.addObj(obj);
        let amt = b.baseFontScale * (b.can.height / b.can.width) * 0.55;
        this.e.tx += amt * this.code.length;
    }
}
class TA_ReplaceText extends TA_Text {
    constructor(ref, code, colId) {
        super(code, colId);
        this.ref = ref;
    }
    ref;
    async run() {
        // let refObj = this.b.objStore.get(this.ref);
        let refObj = this.b.getObjByTag(this.ref);
        let obj = new BO_Text(this.tc, this.e.tx, this.e.ty, Anchor.START, Anchor.CENTER);
        this.obj = obj;
        let b = this.b;
        await b.replaceObj(refObj, obj);
        let amt = b.baseFontScale * (b.can.height / b.can.width) * 0.55;
        this.e.tx += amt * this.code.length;
    }
    getOffset() {
        return 0;
    }
}
class TA_Move extends TA_Task {
    constructor(amtX, amtY) {
        super();
        this.amtX = amtX;
        this.amtY = amtY;
    }
    amtX;
    amtY;
    async run() {
        let b = this.b;
        let amt = b.baseFontScale * (b.can.height / b.can.width) * 0.55;
        this.e.tx += amt * this.amtX;
        this.e.ty += amt * this.amtY;
    }
}
class BE_AddCode extends AnchoredBoardEvent {
    constructor(comment, x, y, ha, va, anim) {
        super(ha, va);
        this.comment = comment;
        this.x = x;
        this.y = y;
        this.anim = anim;
        this.parts = [];
        for (const t of anim.tasks) {
            let text = t.getText();
            if (text) {
                t.partI = this.parts.length;
                this.parts.push(text);
            }
        }
    }
    comment;
    text;
    delimiter;
    x;
    y;
    anim;
    parts;
    tx;
    ty;
    async run(b) {
        this.start();
        if (this.comment)
            await b.waitForBubble(this.comment, 0, 0);
        let x = this.x;
        let y = this.y;
        // let len = getLongestLineLenSum(this.parts);
        let len = getLinesOffset(this.anim.tasks.filter(v => v instanceof TA_Text));
        let amt = b.baseFontScale * (b.can.height / b.can.width) * 0.55;
        if (this.ha == Anchor.CENTER)
            x -= amt * len / 2;
        else if (this.ha == Anchor.END)
            x -= amt * len;
        this.tx = x;
        this.ty = y;
        await this.anim.run();
        this._resFinish();
        await this.finish();
    }
    finalize(b) {
        for (const t of this.anim.tasks) {
            t.b = b;
            t.e = this;
            // if(t.onAfter) t.onAfter();
        }
        return this;
    }
}
class BE_AddText extends AnchoredBoardEvent {
    constructor(comment, text, x, y, ha, va, newOrder) {
        super(ha, va);
        this.comment = comment;
        this.text = text;
        this.x = x;
        this.y = y;
        this.newOrder = newOrder;
    }
    comment;
    text;
    x;
    y;
    newOrder;
    async run(b) {
        this.start();
        await b.waitForBubble(this.comment, 0, 0);
        let x = this.x;
        let y = this.y;
        let len = getLenTC(this.text);
        let amt = b.baseFontScale * (b.can.height / b.can.width) * 0.55;
        if (this.ha == Anchor.CENTER)
            x -= amt * len / 2;
        else if (this.ha == Anchor.END)
            x -= amt * len;
        let order = [...this.text];
        let oldOrder = order;
        if (this.newOrder)
            order = this.newOrder.map((v, i) => {
                return order[v];
            });
        let objList = [];
        for (const d of oldOrder) {
            // await b.addObj(new BO_Text(this.text,this.x,this.y,this.ha,this.va));
            // await b.addObj(new BO_Text(d,x,y,Anchor.START,this.va));
            let obj = new BO_Text(d, x, y, Anchor.START, this.va);
            b.objs.push(obj);
            objList.push(obj);
            x += amt * d.text.length;
        }
        for (const ind of this.newOrder) {
            await objList[ind].onAdd(b);
        }
        this._resFinish();
        await this.finish();
    }
}
class BO_Text extends AnchoredBoardObj {
    constructor(text, x, y, ha, va) {
        super(x, y, ha, va);
        this.d = text;
        this.text = "";
    }
    d;
    text;
    col;
    render(_ctx, b) {
        b.font = "monospace";
        b.applyFont();
        _ctx.fillStyle = this.col;
        let x = this.x * _ctx.canvas.width;
        let y = this.y * _ctx.canvas.height;
        _ctx.fillStyle = TC_Cols[this.d.id];
        let r = _ctx.measureText(this.text);
        let size = b.fontSize;
        if (this.ha == Anchor.CENTER)
            x -= r.width / 2;
        else if (this.ha == Anchor.END)
            x -= r.width;
        if (this.va == Anchor.CENTER)
            y -= size / 2;
        else if (this.va == Anchor.END)
            y -= size;
        let debug = false;
        // if(this.hasTag("tagName")) debug = true;
        if (debug) {
            let r2 = this.getRect(); // DEBUG SHOW OBJ HIT BOX (rect)
            _ctx.fillStyle = "red";
            _ctx.fillRect(r2.x, r2.y, r2.w, r2.h);
            _ctx.fillStyle = TC_Cols[this.d.id];
        }
        _ctx.fillText(this.text, x, y);
    }
    async onAdd(b) {
        for (const c of this.d.text) {
            this.text += c;
            let speed = getTypeSpeed(this.d.text.length);
            if (c == " ")
                speed /= 4;
            await wait(speed);
        }
    }
    getRect() {
        let b = this.b;
        // let ctx = b.ctx;
        // let w = b.paint._ctx.measureText(this.text).width;
        // let w = ctx.measureText(this.text).width;
        let amt = b.baseFontScale * (b.can.height / b.can.width) * 0.55 * b.can.width;
        let w = this.text.length * amt;
        let h = b.fontSize;
        w += this.extraPad.l + this.extraPad.r;
        h += this.extraPad.t + this.extraPad.b;
        let { x, y } = this.getAnchoredPos(w, h);
        x -= this.extraPad.l;
        y -= this.extraPad.t;
        y -= h * 0.75;
        return new Rect(x, y, w, h);
    }
}
class BoardRenderObj extends AnchoredBoardObj {
    constructor(x, y, ha, va) {
        super(x, y, ha, va);
        this.can = document.createElement("canvas");
        this.ctx = this.can.getContext("2d");
    }
    can;
    ctx;
    render(_ctx, b) {
        // let r = this.getRect();
        let { x, y } = this.getAnchoredPos(this.can.width, this.can.height);
        _ctx.drawImage(this.can, x, y);
    }
}
class BO_Circle extends BoardRenderObj {
    constructor(r, padX, padY) {
        super(r.x, r.y, Anchor.CENTER, Anchor.CENTER);
        this.r = r;
        this.padX = padX;
        this.padY = padY;
    }
    r;
    padX;
    padY;
    async onAdd(b) {
        let can = this.can;
        let ctx = this.ctx;
        this.r = this.r.changeUnits(1, 1, b.can.width, b.can.height);
        let r = this.r;
        can.width = this.r.w + this.padX * 4;
        can.height = this.r.h + this.padY * 4;
        // let r = this.getRect();
        // ctx.fillStyle = "rgba(255,0,0,0.3)";
        // ctx.fillRect(0,0,can.width,can.height);
        ////// other
        // ctx.beginPath();
        // ctx.lineWidth = b.fontSize/4;
        // ctx.arc(can.width/2,can.height/2,r.w+this.padX,0,Math.PI*2);
        // ctx.strokeStyle = "white";
        // ctx.stroke();
        let cx = can.width / 2;
        let cy = can.height / 2;
        ctx.lineWidth = b.fontSize / 8;
        ctx.strokeStyle = "white";
        let radX = r.w / 2 + this.padX;
        let radY = r.h / 2 + this.padY;
        radY *= 0.5;
        radY += r.w / 8;
        let lx = cx + radX;
        let ly = cy;
        let delay = 30;
        function draw(x1, y1, x2, y2) {
            ctx.beginPath();
            ctx.lineCap = "round";
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        for (let i = 0; i < Math.PI * 2; i += 0.1) {
            let tx = cx + Math.cos(i) * radX;
            let ty = cy + Math.sin(i) * radY;
            // FAILED attempt at angle guided method
            // let amt = 0.1;
            // let tx = lx+Math.cos(i)*amt*radX - r.w/2;
            // let ty = ly+Math.sin(i)*amt*radY - r.h/2;
            // JITTER
            // let scale = b.getCharWidthInPX();
            // let randSX = scale*0.08;
            // let randSY = scale*0.08;
            // tx += Math.random()*randSX;
            // ty += Math.random()*randSY;
            if (lx == -1) {
                lx = tx;
                ly = ty;
            }
            draw(lx, ly, tx, ty);
            lx = tx;
            ly = ty;
            delay *= 0.9;
            await wait(delay);
        }
        draw(lx, ly, cx + radX, cy);
        // ctx.strokeRect(can.width/2,can.height/2,2,2);
        // ctx.strokeRect(0,0,can.width,can.height);
    }
    render(_ctx, b) {
        let { x, y } = this.getAnchoredPos(this.can.width, this.can.height);
        _ctx.drawImage(this.can, x + this.r.w / 2, y + this.r.h / 2);
        // let r = this.getRect();
        // let r = this.r;
        // let ctx = _ctx;
        // let can = b.can;
        // ctx.beginPath();
        // ctx.lineWidth = b.fontSize/4;
        // ctx.arc(r.cx,r.cy,r.w/2+this.padX,0,Math.PI*2);
        // ctx.strokeStyle = "white";
        // ctx.stroke();
        // Debug
        // ctx.strokeRect(r.cx-1,r.cy-1,2,2);
        // ctx.strokeRect(r.x,r.y,r.w,r.h);
    }
}
class BO_Paint extends BoardObj {
    constructor() {
        super(0, 0);
        this._can = document.createElement("canvas");
        this._can.width = 1280;
        this._can.height = 720;
        this._ctx = this._can.getContext("2d");
        this._ctx.fillStyle = "white";
        this._ctx.strokeStyle = "white";
    }
    _can;
    _ctx;
    render(_ctx, b) {
        let rect = b._rect;
        // tmp
        // this._can.width = b.can.width;
        // this._can.height = b.can.height;
        _ctx.drawImage(this._can, 0, 0, _ctx.canvas.width, _ctx.canvas.height);
    }
    postRender(_ctx, b) {
        // this._ctx.fillRect(20,2,40,40);
        // _ctx.drawImage(this._can,0,0,_ctx.canvas.width,_ctx.canvas.height);
    }
}
class ObjRefBoardEvent extends BoardEvent {
    constructor(refs) {
        super();
        this.refs = (refs instanceof MultiBORef ? refs : new MultiBORef(...refs));
        this.objs = [];
    }
    refs;
    objs;
    _applyToObjs;
    applyToObjs(f) {
        this._applyToObjs = f;
        return this;
    }
    // _onCreateObjs(){
    //     if(this._applyToObjs) for(const o of this.objs){
    //         this._applyToObjs(o);
    //     }
    // }
    // async finish(autoFinish?: boolean): Promise<void> {
    //     this._onCreateObjs();
    //     if(autoFinish) this._resFinish();
    //     await this._prom;
    // }
    async addObj(o, b) {
        this.objs.push(o);
        if (this._applyToObjs)
            this._applyToObjs(o);
        await b.addObj(o);
    }
}
class BE_AddObj extends BoardEvent {
    constructor(obj) {
        super();
        this.obj = obj;
    }
    obj;
    async run(b) {
        this.start();
        await b.addObj(this.obj);
        await this.finish(true);
    }
}
class BE_Wait extends BoardEvent {
    constructor(delay) {
        super();
        this.delay = delay;
    }
    delay;
    async run(b) {
        this.start();
        await wait(this.delay);
        await this.finish(true);
    }
}
class BE_SetOpacity extends ObjRefBoardEvent {
    constructor(refs, opacity, animTime = 500) {
        super(refs);
        this.opacity = opacity;
        this.animTime = animTime;
    }
    opacity;
    animTime;
    async run(b) {
        this.start();
        let objs = this.refs.unwrap(b);
        for (let i = 0; i < objs.length - 1; i++) {
            animateVal(objs[i], "opacity", this.opacity, this.animTime);
        }
        if (objs[0])
            await animateVal(objs.pop(), "opacity", this.opacity, this.animTime);
        await this.finish(true);
    }
}
class BE_GlobalBubble extends BoardEvent {
    constructor(comment) {
        super();
        this.comment = comment;
    }
    comment;
    async run(b) {
        this.start();
        await b.waitForBubble(this.comment, 0, -innerHeight / 5, true);
        await this.finish(true);
    }
}
class BE_CircleObj extends ObjRefBoardEvent {
    constructor(refs) {
        super(refs);
    }
    async run(b) {
        this.start();
        let can = b.paint._can;
        let ctx = b.paint._ctx;
        let objs = this.refs.unwrap(b);
        for (const o of objs) {
            let r = o.getRect().changeUnits(b.can.width, b.can.height, 1, 1);
            let pad = b.getCharWidthInPX() * 2;
            await this.addObj(new BO_Circle(r, pad, pad), b);
        }
        if (false)
            for (const o of objs) {
                ctx.beginPath();
                ctx.lineWidth = 10;
                let r = o.getRect().changeUnits(b.can.width, b.can.height, can.width, can.height);
                ctx.arc(r.cx, r.cy, r.w * 0.5 + b.fontSize * 2, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillRect(r.cx, r.cy, 2, 2);
                ctx.lineWidth = 2;
                ctx.strokeRect(r.x, r.y, r.w, r.h);
            }
        await this.finish(true);
    }
}
class BE_RemoveObj extends ObjRefBoardEvent {
    constructor(refs, fadeOut = true, fadeTime = 500) {
        super(refs);
        this.fadeOut = fadeOut;
        this.fadeTime = fadeTime;
    }
    fadeOut;
    fadeTime;
    async run(b) {
        this.start();
        let objs = this.refs.unwrap(b);
        for (let i = 0; i < objs.length - 1; i++) {
            let o = objs[i];
            if (this.fadeOut)
                animateVal(o, "opacity", 0, this.fadeTime);
        }
        if (objs[0])
            await animateVal(objs[objs.length - 1], "opacity", 0, this.fadeTime);
        for (const o of objs) {
            await b.removeObj(o);
        }
        await this.finish(true);
    }
}
class BE_EndPonder extends BoardEvent {
    async run(b) {
        this.start();
        await b.waitForBubble("Close Ponder Board...", 0, -b._rect.height / 2 + 36, true);
        await b.exit();
        await this.finish(true);
        lesson.currentSubTask._resFinish();
    }
}
async function animateVal(obj, key, newVal, animTime) {
    let val = obj[key];
    let dif = newVal - val;
    if (dif == 0) {
        obj[key] = newVal;
        return;
    }
    let inc = dif / animTime;
    if (inc > 0 && inc < 0.01)
        inc = 0.01;
    else if (inc < 0 && inc > -0.01)
        inc = -0.01;
    let gap = animTime / (Math.abs(dif) / Math.abs(inc));
    let dir = (dif > 0);
    for (let i = val; dir ? i <= newVal : i >= newVal; i += inc) {
        obj[key] = i;
        await wait(gap);
    }
    obj[key] = newVal;
}
class Board {
    constructor() {
        this.objs = [];
        this.events = [];
        let paint = new BO_Paint();
        this.objs.push(paint);
        this.paint = paint;
        // this.objStore = new Map();
    }
    isVisible = false;
    can;
    ctx;
    paint;
    objs;
    _rect;
    fontSize = 16;
    baseFontScale = 1 / 16;
    fontScale = 1;
    font = "Arial";
    applyFont() {
        let can = this.can;
        this.fontSize = can.height * this.baseFontScale * this.fontScale;
        this.ctx.font = this.fontSize + "px " + this.font;
    }
    events;
    _pb;
    async exit() {
        if (!this._pb)
            return;
        closeBubble(this._pb); // ponder bubble
        this._pb = null;
    }
    /**
     * Unit: percent
     */
    getCharWidth() {
        let b = this;
        return b.baseFontScale * (b.can.height / b.can.width) * 0.55;
    }
    getCharWidthInPX() {
        let b = this;
        return b.baseFontScale * (b.can.height / b.can.width) * 0.55 * this.can.width;
    }
    // objStore:Map<string,BoardObj>;
    storeObj(ref, obj) {
        obj.addTag(ref);
        return obj;
    }
    getObjByTag(...tag) {
        return this.objs.find(v => v.hasTag(...tag));
    }
    getAllObjsByTag(...tag) {
        return this.objs.filter(v => v.hasTag(...tag));
    }
    async addObj(o) {
        this.objs.push(o);
        o.b = this;
        await o.onAdd(this);
    }
    async removeObj(b) {
        this.objs.splice(this.objs.indexOf(b), 1);
        b.removeAllTags();
    }
    async replaceObj(from, to) {
        this.objs.splice(this.objs.indexOf(from), 1);
        this.objs.push(to);
        to.b = this;
        from.transferTags(to);
        // if(from._storeTags.length){
        //     to._storeTags = from._storeTags;
        //     from._storeTags = [];
        // }
        await to.onAdd(this);
    }
    async waitForBubble(text, x, y, isCenter = true) {
        let r = this._rect;
        if (isCenter) {
            x += r.width / 2;
            y += r.height / 2;
        }
        x += r.x;
        y += r.y;
        let b = addBubbleAt(BubbleLoc.xy, text, null, {
            x,
            y,
            click: true
        });
        if (isCenter)
            b.e.classList.add("centered", "no-callout");
        await b.clickProm;
        return b;
    }
    async init() {
        this.can = document.createElement("canvas");
        this.ctx = this.can.getContext("2d");
        this.render();
        await wait(1500);
        for (const e of this.events) {
            await e.run(this);
            await wait(300);
        }
    }
    render() {
        let t = this;
        requestAnimationFrame(() => {
            t.render();
        });
        if (!this.isVisible)
            return;
        let ctx = this.ctx;
        let can = ctx.canvas;
        let rect = can.getBoundingClientRect();
        this._rect = rect;
        can.width = rect.width;
        can.height = can.width * 0.5625;
        ctx.fillStyle = "white";
        ctx.strokeStyle = "white";
        this.fontScale = 1;
        this.font = "Arial";
        this.applyFont();
        for (const o of this.objs) {
            ctx.globalAlpha = o.opacity;
            o.render(ctx, this);
        }
        for (const o of this.objs) {
            ctx.globalAlpha = o.opacity;
            o.postRender(ctx, this);
        }
        ctx.globalAlpha = 1;
    }
    wipe() {
        // tmp
        this.objs = [];
    }
    show() {
        this.isVisible = true;
        let b = addBubbleAt(BubbleLoc.global, "");
        b.e.classList.add("board-bubble");
        let cont = document.createElement("div");
        cont.className = "board-cont";
        b.e.innerHTML = "";
        b.e.appendChild(cont);
        cont.appendChild(this.can);
        this._pb = b;
    }
    hide() {
        this.isVisible = false;
    }
}
class Lesson {
    constructor(lid, title, parent, tutParent) {
        this.lid = lid;
        this.p = new Project(title, parent);
        this.tut = new Project("tut_" + title, tutParent, {
            readonly: true,
            disableCopy: true
        });
    }
    lid;
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
    _hasShownMarkDoneReminder = true; //false
    _hasShownFollowAlong = false;
    board;
    getCurrentState() {
        let state = new LessonState();
        state.tutFiles = this.tut.files.map(v => new FileInstance(v.name, v.editor.getValue()));
        // unfinished, not a priority right now, probably going to disable the go back system for now
    }
    init() {
        addBannerBubble(this);
        addBannerPreviewBubble(this);
        this.board = new Board();
        this.board.events = [
            // "Let's take a closer look at this."
            new BE_AddCode(null, 0.5, 0.5, Anchor.CENTER, Anchor.CENTER, new TypeAnim([
                ...parseCodeStr("<$button$>$         $<$/$button$>", [0, 2, 0, 3, 0, 3, 2, 0], "$", (i, t) => {
                    t.obj.addTag([
                        "<>",
                        "tagName fullTag",
                        "<>",
                        "textContent",
                        "<>",
                        "closingTagMark fullTag",
                        "tagName fullTag closingTagName",
                        "<>"
                    ][i]);
                }),
                new TA_Wait(500),
                new TA_Move(-18, 0),
                new TA_ReplaceText("textContent", "Click Me!", 3)
            ])).finalize(this.board),
            new BE_GlobalBubble(`This line adds a button to the page with "Click Me!" as the button's text.\nLet's break down it's structure.`),
            new BE_SetOpacity(["textContent", "fullTag"], 0, 500),
            new BE_Wait(300),
            new BE_CircleObj(new MultiBORef("tagName").with((o, i) => {
                if (i == 1)
                    o.extraPad.l = this.board.getCharWidthInPX();
            })).applyToObjs(o => {
                console.log("AFTER APPLY", o);
                o.addTag("<>_circle");
            }),
            new BE_GlobalBubble(`Notice, we have two groups here.\nTwo sets of "< >"\nThese symbols are called angle brackets.\n`),
            new BE_GlobalBubble(`i[NOTE: This is similar to how you would call $$SB as square brackets, { } as curly braces, and ( ) as parenthesis.]\nAngle Brackets are just grouping symbols like: < some text >`),
            new BE_GlobalBubble(`So what are they even grouping here?`),
            new BE_RemoveObj(["<>_circle"]),
            new BE_SetOpacity(new MultiBORef("fullTag"), 1),
            new BE_GlobalBubble(`In HTML, we use angle brackets to specify what type of element we want in our page.\nFor example, a button!`),
            // vvv - use underline target bubble?
            new BE_GlobalBubble(`Did you notice something special about the second group of angle brackets?\nLet's hide the tag names.`),
            new BE_SetOpacity(new MultiBORef("tagName"), 0),
            new BE_Wait(500),
            new BE_CircleObj(["closingTagMark"]).applyToObjs(o => o.addTag("circle")),
            // new BE_GlobalBubble(`Most elements in HTML need an "opening tag" and a "closing tag".\nThe opening tag is just the tag name (button) surrounded by angle brackets.\nThe closing tag is the same thing but there's a / (slash) just before the tag name.`),
            new BE_GlobalBubble(`Elements need an "opening" and "closing" tag.\nWe can use a / slash in the closing tag to say we're done creating the element.`),
            new BE_RemoveObj(["circle"]),
            new BE_SetOpacity(["tagName"], 1),
            new BE_Wait(250),
            new BE_GlobalBubble(`So what goes in the middle?`),
            new BE_SetOpacity(["textContent"], 1),
            // vvv - use underline target bubble?
            new BE_GlobalBubble("Anything in between the opening and closing tag of the element will be used as text!")
        ];
        this.board.events.push(new BE_EndPonder());
        if (false)
            this.board.events = [
                new BE_AddText("Hello there!", [
                    // new TC("<button>Click Me!</button>",2),
                    new TC("<", 0),
                    new TC("button", 2),
                    new TC(">", 0),
                    new TC("Click Me!", 3),
                    new TC("<", 0),
                    new TC("/", 3),
                    new TC("button", 2),
                    new TC(">", 0),
                ], 0.5, 0.5, Anchor.CENTER, Anchor.CENTER, [
                    0, 1, 2,
                    4, 5, 6, 7,
                    3
                ])
            ];
        this.p.init();
        this.tut.init();
    }
    async start() {
        d_currentTasks.classList.toggle("closed");
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
        b_imDone.disabled = false;
        t.hasStarted = true;
        let editor = lesson.tut.getCurEditor();
        let pos = editor?.getPosition();
        if (t._preVal == null) {
            t._preVal = editor?.getValue() || "";
            t._preLine = pos?.lineNumber || 1;
            t._preCol = pos?.column || 1;
            t._prePFile = lesson.p.curFile;
            t._preTutFile = lesson.tut.curFile;
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
        if (ind != -1) {
            let c = d_subTasks.children[ind];
            let cb = c?.querySelector(".cb");
            if (cb)
                cb.textContent = "select_check_box";
        }
        hideLessonConfirm();
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
    lesson = new Lesson("0001", "Lesson 01", pane_code, pane_tutor_code);
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
            // new AddGenericCodeTask("<button>\x05\x05Click Me!\x05\x05</button>\x05\x01\x01\x05","html"),
            new AddGenericCodeTask("<button>Click Me!</button>", "html"),
            new DoRefreshTask("Refresh the preview to see how it looks.", "Refresh the preview"),
            new PonderBoardTask("Alright, let's look a little closer at this."),
            new AddTutorSideText("\n\n", "Add some space"),
            new AddGenericCodeTask(`<button>Click</button>

<div></div>\x01\x01\x01\x01\x01\x01
<h1>Test</h1>
<p>Test paragrph</p>`, "html"),
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
    BubbleLoc[BubbleLoc["xy"] = 4] = "xy";
})(BubbleLoc || (BubbleLoc = {}));
function formatBubbleText(text, ops) {
    // while(text.includes("[") && text[text.indexOf("[")-1] != "0"){
    while (text.includes("[")) {
        let ind = text.indexOf("[");
        let id = text[ind - 1];
        let str = `<span class="l-${id}">`;
        if (id == "0")
            str = "[]" + str;
        text = text.replace(id + "[", str); // replaces just the first instance which is where we're at
        let cnt = 0;
        for (let i = 0; i < text.length; i++) {
            if (text[i] == "[")
                if (text[i - 1] != "0")
                    cnt++;
        }
        if (cnt == 0)
            break;
    }
    text = text.replaceAll("]", "</span>");
    if (ops) {
        if (ops.click)
            text += "<div class='material-symbols-outlined click-bubble-indicator'>mouse</div>";
    }
    text = text.replaceAll("\n", "<br><br>");
    text = text.replaceAll("$$SB", "[ ]");
    return text;
}
function addBubbleAt(loc, text, dir, ops) {
    let b = document.createElement("div");
    b.innerHTML = formatBubbleText(text, ops);
    g_bubbles_ov.appendChild(b);
    let data = {
        e: b,
        line: 0, col: 0,
        loc,
        file: lesson.p.curFile,
        ops
    };
    bubbles.push(data);
    if (dir)
        b.classList.add("dir-" + dir);
    if (ops)
        if (ops.click) {
            data.clickProm = new Promise(async (res2) => {
                await new Promise(resolve => {
                    data.clickRes = resolve;
                });
                closeBubble(data);
                res2();
            });
            b.onclick = function () {
                data.clickRes();
            };
            b.classList.add("clickable");
        }
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
// @ts-ignore
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
    else if (b.loc == BubbleLoc.xy) {
        x = b.ops.x;
        y = b.ops.y - 60;
    }
    b.e.style.left = x + "px";
    b.e.style.top = y + "px";
}
// refresh system
// b_refresh = document.querySelector(".b-refresh") as HTMLButtonElement;
icon_refresh = document.querySelector(".icon-refresh");
iframe = document.querySelector("iframe");
// let _icRef_state = true;
// b_refresh.addEventListener("click",async e=>{
function ___oldRefresh() {
    // refreshLesson();
    // await uploadLessonFiles(lesson);
    // let file1 = lesson.p.files.find(v=>v.name == "index.html");
    // if(!file1){
    //     alert("No index.html file found! Please create a new file called index.html, this file will be used in the preview.");
    //     return;
    // }
    // iframe.src = serverURL+"/lesson/"+g_user.sanitized_email+"/"+socket.id+"/"+g_user.sanitized_email+"/tmp_lesson";
    // icon_refresh.style.rotate = _icRef_state ? "360deg" : "0deg";
    // _icRef_state = !_icRef_state;
    // resolveHook(listenHooks.refresh,null);
    // return;    
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
    // });
}
;
// key events
document.addEventListener("keydown", async (e) => {
    if (!e.key)
        return;
    let k = e.key.toLowerCase();
    if (e.shiftKey && e.ctrlKey)
        g_waitDelayScale = 0;
    if (menusOpen.length) {
        if (k == "escape") {
            closeAllMenus();
        }
        return;
    }
    if (e.ctrlKey) {
        if (k == "r") {
            e.preventDefault();
            refreshLesson();
        }
        else if (k == "s") {
            e.preventDefault();
            saveLesson();
        }
        else if (k == "g") {
            e.preventDefault();
            d_currentTasks.classList.toggle("closed");
        }
    }
});
document.addEventListener("keyup", e => {
    if (!e.key)
        return;
    let k = e.key.toLowerCase();
    g_waitDelayScale = 1;
});
setTimeout(() => {
    iframe.addEventListener("keydown", e => {
        e.preventDefault();
    });
}, 3000);
//# sourceMappingURL=lesson.js.map