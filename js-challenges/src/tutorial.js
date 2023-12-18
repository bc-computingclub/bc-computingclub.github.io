console.log("Loading tutorials...");
showMainCont();
async function testStartOnLoad() {
    currentFile = await createCodeFile("", "js", "TestFile.js");
    if (false)
        executeActions(currentFile, [
            // new ActionText("// Line 1\n"),
            // new ActionText("// Line 3\n"),
            // new ActionText("// Line 4\n"),
            // new ActionMoveRel(""),
            // new ActionMoveRel("uu\n"),
            // new ActionText("// Line 2")
            new ActionText("// this is the start of the file\n"),
            new ActionText(`
function start(){

}`),
            new ActionMoveRel("uu"),
            new ActionIndent("set", 1),
            new ActionText('\nconsole.log("hello");'),
            new ActionText('\n\nconsole.log("hello");'),
            new ActionComment('\n// test comment'),
            new ActionText('\n\nlet a = 123;'),
            new ActionText(`
if(true){
}`),
            new ActionMoveRel("u\n"),
            new ActionIndent("add", 1),
            new ActionText('console.log("inside");'),
            new ActionText('\nconsole.log("inside 2");'),
        ]);
    else if (false)
        executeActions(currentFile, [
            // new ActionText("// Line 1\n"),
            // new ActionText("// Line 3\n"),
            // new ActionText("// Line 4\n"),
            // new ActionMoveRel(""),
            // new ActionMoveRel("uu\n"),
            // new ActionText("// Line 2")
            new ActionText("// this is the start of the file\n"),
            new ActionText(`
function start(){

}`),
            new ActionMoveRel("uu"),
            new ActionIndent("set", 1),
            new ActionText('\nconsole.log("hello");'),
            new ActionText('\n\nconsole.log("hello");'),
            new ActionComment('\n// test comment'),
            new ActionText('\n\nlet a = 123;'),
            new ActionText(`
if(true){
}`),
            new ActionMoveRel("u\n"),
            new ActionIndent("add", 1),
            new ActionText('console.log("inside");'),
            new ActionText('\nconsole.log("inside 2");'),
        ]);
    else
        executeActions(currentFile, [
            new ActionText("// start of file"),
            new ActionText("\n// start of file"),
            new ActionText("\n// start of file"),
            new ActionText("\n// start of file"),
            new ActionText("\n// start of file"),
            new ActionText("\n// start of file"),
        ]);
}
testStartOnLoad();
// 
class Section {
    constructor(title) {
        this.title = title;
        this.list = [];
        this.path = [];
    }
    title;
    list;
    path;
    addLesson(l) {
        this.list.push(l);
        return this;
    }
    addSection(s) {
        this.list.push(s);
        // s.path.push(...this.path);
        // s.path.push(this,s);
        return this;
    }
    buildHome() {
        function add(s, path) {
            s.path.push(...path, s);
            for (const a of s.list) {
                if (a instanceof Section) {
                    add(a, [...s.path]);
                }
            }
        }
        add(this, []);
        return this;
    }
}
class Lesson {
    constructor(title) {
        this.title = title;
    }
    title;
}
function updateLessonCrumbs() {
    lCrumbs.textContent = "";
    if (!curSection)
        return;
    for (const s of curSection.path) {
        let d = document.createElement("div");
        d.textContent = s.title;
        lCrumbs.appendChild(d);
        d.onmousedown = function () {
            selectSection(s);
        };
    }
}
let home = new Section("Home");
let curSection = null;
home.addSection(new Section("Intro")
    .addLesson(new Lesson("Getting Started"))
    .addSection(new Section("Project 1")
    .addLesson(new Lesson("Lesson 1"))
    .addLesson(new Lesson("Lesson 2"))
    .addLesson(new Lesson("Lesson 3")))).buildHome();
function selectSection(s) {
    curSection = s;
    updateLessonCrumbs();
    loadProgList();
}
function selectLesson(l) {
    console.log("selected lesson: " + l.title);
}
// Progress Panel
let selectMenu = document.querySelector(".select-menu");
let progList = document.querySelector(".lesson-list");
let lCrumbs = document.querySelector(".lesson-crumbs");
let main0 = document.querySelector(".main0");
let main = (main0.classList.contains("main") ? main0 : main0.querySelector(".main"));
function openProgSelectMenu() {
    selectMenu.classList.remove("none");
    main.classList.add("blur");
}
function closeProgSelectMenu() {
    selectMenu.classList.add("none");
    main.classList.remove("blur");
}
function createProgSection(s) {
    let div = document.createElement("div");
    div.classList.add("section");
    div.textContent = s.title;
    progList.appendChild(div);
    div.onmousedown = function () {
        selectSection(s);
    };
    createProgDivFinalize(div);
}
function createProgLesson(l) {
    let div = document.createElement("div");
    div.textContent = l.title;
    progList.appendChild(div);
    div.onmousedown = function () {
        selectLesson(l);
    };
    createProgDivFinalize(div);
}
function createProgDivFinalize(div) {
    let i = progList.children.length;
    console.log("I : " + i);
    div.style.opacity = "0";
    div.onanimationend = function () {
        div.style.opacity = null;
    };
    setTimeout(function () {
        div.style.animation = "ShowLesson 0.2s ease-out";
    }, i * 50); //20
}
function loadProgList() {
    progList.textContent = "";
    if (curSection)
        for (let i = 0; i < curSection.list.length; i++) {
            let a = curSection.list[i];
            if (a instanceof Lesson)
                createProgLesson(a);
            else if (a instanceof Section)
                createProgSection(a);
        }
}
selectSection(home);
loadProgList();
openProgSelectMenu();
//# sourceMappingURL=tutorial.js.map