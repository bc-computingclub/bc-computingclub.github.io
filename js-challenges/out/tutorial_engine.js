var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
console.log("Initializing tutorial engine");
let main_tut = document.querySelector(".main-tut");
var MovementType;
(function (MovementType) {
    MovementType[MovementType["abs"] = 0] = "abs";
    MovementType[MovementType["rel"] = 1] = "rel";
})(MovementType || (MovementType = {}));
let realTimeColorUpdate = true;
let currentFile;
let animateText = true;
class Action {
    constructor() {
        this.delay = 40;
    }
    setDelay(delay) {
        this.delay = delay;
        return this;
    }
    execute(file) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
class ActionMove extends Action {
    constructor(line, col) {
        super();
        this.line = line;
        this.col = col;
    }
}
class ActionMoveRel extends Action {
    constructor(ev) {
        super();
        this.ev = ev;
    }
    execute(file) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < this.ev.length; i++) {
                let c = this.ev[i];
                if (c == "r")
                    yield file.moveRight();
                else if (c == "l")
                    yield file.moveLeft();
                else if (c == "u")
                    yield file.moveUp();
                else if (c == "d")
                    yield file.moveDown();
                else if (c == "h")
                    yield file.moveHome();
                else
                    yield file.addText(c);
            }
        });
    }
}
class ActionText extends Action {
    constructor(text) {
        super();
        this.text = text;
    }
    execute(file) {
        return __awaiter(this, void 0, void 0, function* () {
            yield file.addText(this.text);
        });
    }
}
class ActionComment extends Action {
    constructor(text, lines = 1) {
        super();
        this.text = text;
        this.lines = lines;
    }
    execute(file) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < this.lines; i++) {
                yield file.moveUp();
            }
            yield file.addText(this.text);
            for (let i = 0; i < this.lines; i++) {
                yield file.moveDown();
            }
        });
    }
}
class ActionIndent extends Action {
    constructor(mode, value) {
        super();
        this.mode = mode;
        this.value = value;
    }
    execute(file) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (this.mode) {
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
        });
    }
}
class Project {
    constructor(ref, ta) {
        var _a;
        // line = 0;
        // col = 0;
        this.ind = 0;
        this.fullText = "";
        this.indent = 0;
        this.ref = ref;
        this.area = (_a = ref.parentElement) === null || _a === void 0 ? void 0 : _a.nextElementSibling;
        this.ta = ta;
    }
    moveRight() {
        return __awaiter(this, void 0, void 0, function* () {
            this.ind++;
        });
    }
    moveLeft() {
        return __awaiter(this, void 0, void 0, function* () {
            this.ind--;
        });
    }
    moveUp() {
        return __awaiter(this, void 0, void 0, function* () {
            let end = -1;
            for (let i = this.ind - 1; i >= 0; i--) {
                let c = this.fullText[i];
                if (c == "\n" || i <= 0) {
                    end = i;
                    break;
                }
            }
            if (end == -1) {
                this.ind = this.fullText.length - 1;
                console.log("...reached end...");
                return;
            }
            let start = this.ind;
            this.ind -= this.ind - end;
            console.log("MOVE UP: ", start, end);
        });
    }
    moveDown() {
        return __awaiter(this, void 0, void 0, function* () {
            let end = -1;
            for (let i = this.ind + 1; i < this.fullText.length; i++) {
                let c = this.fullText[i];
                if (c == "\n") {
                    end = i;
                    break;
                }
            }
            if (end == -1) {
                this.ind = this.fullText.length;
                console.log("...reached end...");
                return;
            }
            let start = this.ind;
            this.ind += end - this.ind;
            console.log("START, END:", start, end);
        });
    }
    moveHome() {
        return __awaiter(this, void 0, void 0, function* () {
            let end = -1;
            for (let i = this.ind - 1; i >= -1; i--) {
                let c = this.fullText[i];
                if (c == "\n" || i <= 0) {
                    end = i;
                    break;
                }
            }
            if (end == -1) {
                this.ind = this.fullText.length;
                console.log("...reached end...");
                return;
            }
            this.ind -= this.ind - end;
            if (end != 0)
                this.ind++;
        });
    }
    addText(text) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let before = text;
            if (text[0] != "\n") {
                let tmp = "";
                for (let i = 0; i < this.indent; i++) {
                    tmp += "\t";
                }
                text = tmp + text;
            }
            for (let i = 0; i < text.length - 1; i++) {
                let char = text[i];
                let nextChar = text[i + 1];
                // if(char == "\n" && nextChar != "\n"){
                if (char == "\n") {
                    let tmp = "";
                    for (let i = 0; i < this.indent; i++) {
                        tmp += "\t";
                    }
                    text = text.substring(0, i + 1) + tmp + text.substring(i + 1);
                    i += this.indent;
                }
            }
            console.log("text", `[${before.replaceAll("\t", "\\t").replaceAll("\n", "\\n")}]`, `[${text.replaceAll("\t", "\\t").replaceAll("\n", "\\n")}]`);
            (_a = this.area) === null || _a === void 0 ? void 0 : _a.focus();
            if (!animateText) {
                this.fullText = this.fullText.substring(0, this.ind) + text + this.fullText.substring(this.ind);
                this.ref.textContent = this.fullText;
                this.ind += text.length;
                this.ta.value = this.fullText;
                Prism.highlightElement(this.ref, null, null);
                if (this.area) {
                    this.area.selectionStart = this.ind;
                    this.area.selectionEnd = this.ind;
                }
            }
            else {
                let left = this.fullText.substring(0, this.ind);
                let right = this.fullText.substring(this.ind);
                for (let i = 0; i < text.length; i++) {
                    this.fullText = left + text.substring(0, i + 1) + right;
                    this.ref.textContent = this.fullText;
                    this.ta.value = this.fullText;
                    Prism.highlightElement(this.ref, null, null);
                    if (this.area) {
                        this.area.selectionStart = this.ind + text.length;
                        this.area.selectionEnd = this.ind + text.length;
                    }
                    yield wait(5);
                }
                this.ind += text.length;
            }
        });
    }
}
// 
let headerList = [
    {
        name: "Challenges",
        id: "challenges",
        className: "js",
        // off:"0px 100vh"
        off: "-100vh 0px",
        prevURL: null,
        onLoad() {
            document.title = curChallengeName;
            sel = null;
            if (this.prevURL) {
                // location.href = this.prevURL;
                let url = new URL(this.prevURL);
                let url2 = new URL(location.href);
                let search = url.searchParams.forEach((v, k) => {
                    url2.searchParams.set(k, v);
                });
                history.replaceState("", "", url2.href);
                this.prevURL = null;
            }
            // let url = new URL(location.href);
            // let searchIndex = url.searchParams.get("index");
            // if(searchIndex != null){
            //     list.children[searchIndex]?.click();
            // }
            this.prevURL = location.href;
        },
        onLeave() {
            // this.prevURL = location.href;
        },
        onStart() {
            replaceIFrameSrc(frame, "");
        }
    },
    {
        name: "Tutorials",
        id: "tutorials",
        className: "tut",
        // off:"0px -100vh"
        off: "100vh 0px",
        prevURL: null,
        onLoad() {
            document.title = "JS Tutorials";
            let url = new URL(location.href);
            url.searchParams.delete("index");
            // testStartOnLoad();
            this.prevURL = location.href;
        },
        onLeave() {
        }
    }
];
let curItem;
function genHeaderList() {
    nav_list.textContent = "";
    for (let i = 0; i < mainCont.children.length; i++) {
        mainCont.children[i].style.display = "initial";
    }
    for (const item of headerList) {
        let a = document.createElement("a");
        a.textContent = item.name;
        let m = document.querySelector(".main-" + item.className);
        m.style.setProperty("--off", item.off);
        a.onclick = function (e, isBare = false) {
            if (!isBare) {
                // let url = new URL(location.href);
                // url.searchParams.set("p",item.id);
                // history.pushState("","",url);
            }
            for (let i = 0; i < mainCont.children.length; i++) {
                let e = mainCont.children[i];
                // e.style.display = "initial";
                e.classList.add("hide");
            }
            m.classList.remove("hide");
            m.style.display = "flex";
            for (let i = 0; i < nav_list.children.length; i++) {
                let e = nav_list.children[i];
                e.classList.remove("cur");
            }
            a.classList.add("cur");
            // if(curItem) if(curItem.onLeave) curItem.onLeave();
            curItem = item;
            // item.onLoad();
        };
        nav_list.appendChild(a);
        if (item.onStart)
            item.onStart();
    }
    let url = new URL(location.href);
    let curPage = url.searchParams.get("p") || "challenges";
    let pageInd = headerList.findIndex(v => v.id == curPage);
    if (pageInd != -1)
        nav_list.children[pageInd].click();
}
function createCodeFile(text, ext, title) {
    return __awaiter(this, void 0, void 0, function* () {
        let codeCont2 = main_tut.querySelector(".code-cont");
        codeCont2.textContent = "";
        let div2 = document.createElement("div");
        let ogText = text;
        if (ext == "html") {
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
        let copyCode = div2.querySelector(".copy-code");
        if (copyCode)
            copyCode.onclick = function () {
                navigator.clipboard.writeText(ogText);
                copyCode.textContent = "Copied!";
                setTimeout(() => {
                    copyCode.textContent = "Copy Code";
                }, 1000);
            };
        ta.value = text;
        Prism.highlightElement(div2.children[1].children[0].children[0], null, null);
        return new Project(div2.children[1].children[0].children[0], ta);
    });
}
function executeActions(file, actions) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!file) {
            alert("No file was specified");
            return;
        }
        yield wait(100);
        for (let i = 0; i < actions.length; i++) {
            let action = actions[i];
            yield action.execute(file);
            yield wait(100);
        }
    });
}
//# sourceMappingURL=tutorial_engine.js.map