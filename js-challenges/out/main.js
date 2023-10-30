var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var list = document.querySelector(".challenge-list");
var frame = document.getElementById("frame");
var codeCont = document.querySelector(".code-cont");
back.onmousedown = function () {
    back.style.pointerEvents = "none";
    overlay.textContent = "";
};
// From Jaredcheeda, https://stackoverflow.com/questions/7381974/which-characters-need-to-be-escaped-in-html
function escapeMarkup(dangerousInput) {
    var dangerousString = String(dangerousInput);
    var matchHtmlRegExp = /["'&<>]/;
    var match = matchHtmlRegExp.exec(dangerousString);
    if (!match) {
        return dangerousInput;
    }
    var encodedSymbolMap = {
        '"': '&quot;',
        '\'': '&#39;',
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };
    var dangerousCharacters = dangerousString.split('');
    var safeCharacters = dangerousCharacters.map(function (character) {
        return encodedSymbolMap[character] || character;
    });
    var safeString = safeCharacters.join('');
    return safeString;
}
var sel;
var curChallengeName = "JS Challenges </>"; //old: View JS Challenge Code
var pageLoadFileIndex = -1;
function replaceIFrameSrc(f, src) {
    var newFrame = document.createElement("iframe");
    newFrame.className = f.className;
    newFrame.id = f.id;
    newFrame.setAttribute("frameborder", "0");
    frame = newFrame;
    newFrame.src = src;
    f.replaceWith(newFrame);
    // frame.parentElement.replaceChild(newFrame,frame);
}
var defaultTitle = curChallengeName;
document.title = defaultTitle;
var folderReg = new Map();
var fileReg = new Map();
function registerFolder(name, date) {
    var div = document.createElement("div");
    div.innerHTML = "\n        <div class=\"list-div no-hover\">\n            <div class=\"icon-btn\" style=\"width:fit-content\">\n                <div class=\"icon-open material-symbols-outlined\">chevron_right</div>\n                <div>".concat(name, "</div>\n            </div>\n            <div class=\"challenge-date\">").concat(date, "</div>\n        </div>\n        <div class=\"none\"></div>\n    ");
    div.classList.add("folder-cont");
    list.appendChild(div);
    var button = div.children[0];
    var details = div.children[1];
    var icon = div.querySelector(".icon-open");
    folderReg.set(name, details);
    var open = false;
    button.onclick = function () {
        open = !open;
        if (open) {
            div.classList.add("open");
            details.classList.remove("none");
            icon.style.rotate = "90deg";
        }
        else {
            div.classList.remove("open");
            details.classList.add("none");
            icon.style.rotate = "0deg";
        }
    };
    button.click();
}
function registerProject(name, date, files, htmlOverride, folder) {
    var div = document.createElement("div");
    // let i = list.children.length+1;
    var i = fileReg.size + 1;
    div.innerHTML = "\n        <div>".concat(name, "</div>\n        <div class=\"challenge-date\">").concat(date, "</div>\n        <div class=\"material-symbols-outlined\">javascript</div>\n        <!--<div>").concat(i, "</div>-->\n    ");
    div.classList.add("list-div");
    if (folder) {
        var folderDiv = folderReg.get(folder);
        if (!folderDiv) {
            console.warn("An error occurred: folder '" + folder + "' was not found in the folder registry.");
        }
        else
            folderDiv.appendChild(div);
    }
    else
        list.appendChild(div);
    fileReg.set(i - 1, div);
    div.onclick = function (e, isBare) {
        if (isBare === void 0) { isBare = false; }
        return __awaiter(this, void 0, void 0, function () {
            var i_1, c, url1_1, url1, _loop_1, _i, files_1, file;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        for (i_1 = 0; i_1 < list.children.length; i_1++) {
                            c = list.children[i_1];
                            c.classList.remove("sel");
                        }
                        if (sel == div) {
                            document.title = defaultTitle;
                            sel = null;
                            url1_1 = new URL(location.href);
                            url1_1.searchParams["delete"]("index");
                            location.search = "?" + url1_1.searchParams.toString();
                            return [2 /*return*/];
                        }
                        curChallengeName = "Challenge " + i + " - " + name;
                        document.title = curChallengeName;
                        div.classList.add("sel");
                        sel = div;
                        url1 = new URL(location.href);
                        url1.searchParams.set("index", (i - 1).toString());
                        if (!isBare) {
                            location.search = "?" + url1.searchParams.toString();
                        }
                        if (!isBare) return [3 /*break*/, 4];
                        _loop_1 = function (file) {
                            var div2, text, ogText, ext, copyCode;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        div2 = document.createElement("div");
                                        return [4 /*yield*/, fetch("files/" + i + "/" + file)];
                                    case 1: return [4 /*yield*/, (_b.sent()).text()];
                                    case 2:
                                        text = _b.sent();
                                        ogText = text;
                                        ext = file.split(".")[1];
                                        if (ext == "html") {
                                            if (htmlOverride) {
                                                text = escapeMarkup(htmlOverride);
                                                ogText = htmlOverride;
                                            }
                                            else
                                                text = escapeMarkup(text);
                                        }
                                        div2.innerHTML = "\n                <div class=\"file-title\">\n                    <div>".concat(file, "</div>\n                    <button class=\"copy-code\">Copy Code</button>\n                </div>\n                <pre><code class=\"language-").concat(ext, "\">").concat(text, "</code></pre>\n            ");
                                        codeCont.appendChild(div2);
                                        copyCode = div2.querySelector(".copy-code");
                                        if (copyCode)
                                            copyCode.onclick = function () {
                                                navigator.clipboard.writeText(ogText);
                                                copyCode.textContent = "Copied!";
                                                setTimeout(function () {
                                                    copyCode.textContent = "Copy Code";
                                                }, 1000);
                                            };
                                        Prism.highlightElement(div2.children[1].children[0], null, null);
                                        return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, files_1 = files;
                        _a.label = 1;
                    case 1:
                        if (!(_i < files_1.length)) return [3 /*break*/, 4];
                        file = files_1[_i];
                        return [5 /*yield**/, _loop_1(file)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        setTimeout(function () {
                            replaceIFrameSrc(frame, "files/" + i + "/index.html");
                        }, 0);
                        return [2 /*return*/];
                }
            });
        });
    };
    if (pageLoadFileIndex == i - 1)
        div.click();
}
var b_fullscreen = document.getElementById("fullscreen");
b_fullscreen.onclick = function () {
    frame.requestFullscreen();
};
// registry
registerFolder("Timer", "9/27/23");
registerProject("Timer", "9/27/23", ["main.js", "index.html"], "<!-- A Basic Example of a Timer -->\n\n<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>1 - Timer - Lv 1</title>\n</head>\n<body>\n    <p id=\"time-left\">60</p>\n    <p>Seconds Remaining</p>\n\n    <script src=\"main.js\"></script>\n</body>\n</html>", "Timer");
registerProject("Ex: Timer Widget", "10/4/23", ["index.html", "style.css"], "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Document</title>\n\n    <!-- Need to \"link\" our style.css file -->\n    <link rel=\"stylesheet\" href=\"style.css\">\n</head>\n<body>\n    <!-- Create a container for our timer -->\n    <div class=\"timer\">\n\n        <!-- This shows the actual time -->\n        <div class=\"time\">1 : 0 0</div>\n\n        <!-- Container for the main buttons -->\n        <div class=\"mainButtons\">\n            <button>Reset</button>\n            <button>Start</button>\n        </div>\n        <!-- This is a \"horizontal rule\" or a vertical line to separate the two sections -->\n        <hr>\n\n        <!-- Container to hold minute options -->\n        <div>\n            <span class=\"label\">Minutes</span>\n            <button>v</button>\n            <button>^</button>\n        </div>\n\n        <!-- Container to hold second options -->\n        <div>\n            <span class=\"label\">Seconds</span>\n            <button>v</button>\n            <button>^</button>\n        </div>\n        \n    </div>\n</body>\n</html>", "Timer");
// registerProject("Timer","9/27/23",["main.js","index.html"]);
var dd_view = document.querySelector(".dd-view");
registerDropdown(dd_view, [
    "JS Challenges",
    "Examples / Tutorials"
], function (i) {
});
// Header
var nav_list = document.querySelector(".nav-list");
var nav_challenges = document.querySelector(".nav-challenges");
var nav_tutorials = document.querySelector(".nav-tutorials");
var mainCont = document.querySelector(".main-cont");
var main_js = document.querySelector(".main-js");
var main_tut = document.querySelector(".main-tut");
function clearNavMains() {
    for (var i = 0; i < nav_list.children.length; i++) {
        var e = nav_list.children[i];
    }
}
// nav_tutorials.onclick = function(){
// main_js.classList.add("hide");
// main_tut.classList.remove("hide");
// };
var headerList = [
    {
        name: "Challenges",
        id: "challenges",
        className: "js",
        // off:"0px 100vh"
        off: "-100vh 0px",
        prevURL: null,
        onLoad: function () {
            document.title = curChallengeName;
            sel = null;
            if (this.prevURL) {
                // location.href = this.prevURL;
                var url = new URL(this.prevURL);
                var url2_1 = new URL(location.href);
                var search = url.searchParams.forEach(function (v, k) {
                    url2_1.searchParams.set(k, v);
                });
                history.replaceState("", "", url2_1.href);
                this.prevURL = null;
            }
            // let url = new URL(location.href);
            // let searchIndex = url.searchParams.get("index");
            // if(searchIndex != null){
            //     list.children[searchIndex]?.click();
            // }
            this.prevURL = location.href;
        },
        onLeave: function () {
            // this.prevURL = location.href;
        },
        onStart: function () {
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
        onLoad: function () {
            document.title = "JS Tutorials";
            var url = new URL(location.href);
            url.searchParams["delete"]("index");
            testStartOnLoad();
            this.prevURL = location.href;
        },
        onLeave: function () {
        }
    }
];
var curItem;
function genHeaderList() {
    nav_list.textContent = "";
    for (var i = 0; i < mainCont.children.length; i++) {
        mainCont.children[i].style.display = "initial";
    }
    var _loop_2 = function (item) {
        var a = document.createElement("a");
        a.textContent = item.name;
        var m = document.querySelector(".main-" + item.className);
        m.style.setProperty("--off", item.off);
        a.onclick = function (e, isBare) {
            if (isBare === void 0) { isBare = false; }
            if (!isBare) {
                // let url = new URL(location.href);
                // url.searchParams.set("p",item.id);
                // history.pushState("","",url);
            }
            for (var i = 0; i < mainCont.children.length; i++) {
                var e_1 = mainCont.children[i];
                // e.style.display = "initial";
                e_1.classList.add("hide");
            }
            m.classList.remove("hide");
            m.style.display = "flex";
            for (var i = 0; i < nav_list.children.length; i++) {
                var e_2 = nav_list.children[i];
                e_2.classList.remove("cur");
            }
            a.classList.add("cur");
            // if(curItem) if(curItem.onLeave) curItem.onLeave();
            curItem = item;
            // item.onLoad();
        };
        nav_list.appendChild(a);
        if (item.onStart)
            item.onStart();
    };
    for (var _i = 0, headerList_1 = headerList; _i < headerList_1.length; _i++) {
        var item = headerList_1[_i];
        _loop_2(item);
    }
    var url = new URL(location.href);
    var curPage = url.searchParams.get("p") || "challenges";
    var pageInd = headerList.findIndex(function (v) { return v.id == curPage; });
    if (pageInd != -1)
        nav_list.children[pageInd].click();
}
function createCodeFile(text, ext, title) {
    return __awaiter(this, void 0, void 0, function () {
        var codeCont2, div2, ogText, copyCode;
        return __generator(this, function (_a) {
            codeCont2 = main_tut.querySelector(".code-cont");
            codeCont2.textContent = "";
            div2 = document.createElement("div");
            ogText = text;
            if (ext == "html") {
                text = escapeMarkup(text);
            }
            div2.innerHTML = "\n        <div class=\"file-title\">\n            <div>".concat(title, "</div>\n            <button class=\"copy-code\">Copy Code</button>\n        </div>\n        <pre><code class=\"language-").concat(ext, "\">").concat(text, "</code></pre>\n    ");
            codeCont2.appendChild(div2);
            copyCode = div2.querySelector(".copy-code");
            if (copyCode)
                copyCode.onclick = function () {
                    navigator.clipboard.writeText(ogText);
                    copyCode.textContent = "Copied!";
                    setTimeout(function () {
                        copyCode.textContent = "Copy Code";
                    }, 1000);
                };
            Prism.highlightElement(div2.children[1].children[0], null, null);
            return [2 /*return*/, new Project(div2.children[1].children[0])];
        });
    });
}
var MovementType;
(function (MovementType) {
    MovementType[MovementType["abs"] = 0] = "abs";
    MovementType[MovementType["rel"] = 1] = "rel";
})(MovementType || (MovementType = {}));
function wait(delay) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, delay);
    });
}
var realTimeColorUpdate = true;
var currentFile;
var animateText = true;
var Action = /** @class */ (function () {
    function Action() {
        this.delay = 40;
    }
    Action.prototype.setDelay = function (delay) {
        this.delay = delay;
        return this;
    };
    Action.prototype.execute = function (file) { };
    return Action;
}());
var ActionMove = /** @class */ (function (_super) {
    __extends(ActionMove, _super);
    function ActionMove(line, col) {
        var _this = _super.call(this) || this;
        _this.line = line;
        _this.col = col;
        return _this;
    }
    return ActionMove;
}(Action));
var ActionMoveRel = /** @class */ (function (_super) {
    __extends(ActionMoveRel, _super);
    function ActionMoveRel(ev) {
        var _this = _super.call(this) || this;
        _this.ev = ev;
        return _this;
    }
    ActionMoveRel.prototype.execute = function (file) {
        for (var i = 0; i < this.ev.length; i++) {
            var c = this.ev[i];
            if (c == "r")
                file.moveRight();
            else if (c == "l")
                file.moveLeft();
            else if (c == "u")
                file.moveUp();
            else if (c == "d")
                file.moveDown();
            else if (c == "h")
                file.moveHome();
            else
                file.addText(c);
        }
    };
    return ActionMoveRel;
}(Action));
var ActionText = /** @class */ (function (_super) {
    __extends(ActionText, _super);
    function ActionText(text) {
        var _this = _super.call(this) || this;
        _this.text = text;
        return _this;
    }
    ActionText.prototype.execute = function (file) {
        file.addText(this.text);
    };
    return ActionText;
}(Action));
var Project = /** @class */ (function () {
    function Project(ref) {
        // line = 0;
        // col = 0;
        this.ind = 0;
        this.fullText = "";
        this.ref = ref;
    }
    Project.prototype.moveRight = function () {
        this.ind++;
    };
    Project.prototype.moveLeft = function () {
        this.ind--;
    };
    Project.prototype.moveUp = function () {
        var end = -1;
        for (var i = this.ind - 1; i >= 0; i--) {
            var c = this.fullText[i];
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
        var start = this.ind;
        this.ind -= this.ind - end;
        console.log("MOVE UP: ", start, end);
    };
    Project.prototype.moveDown = function () {
        var end = -1;
        for (var i = this.ind + 1; i < this.fullText.length; i++) {
            var c = this.fullText[i];
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
        var start = this.ind;
        this.ind += end - this.ind;
        console.log("START, END:", start, end);
    };
    Project.prototype.moveHome = function () {
        var end = -1;
        for (var i = this.ind - 1; i >= -1; i--) {
            var c = this.fullText[i];
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
    };
    Project.prototype.addText = function (text) {
        return __awaiter(this, void 0, void 0, function () {
            var left, right, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!animateText) return [3 /*break*/, 1];
                        this.fullText = this.fullText.substring(0, this.ind) + text + this.fullText.substring(this.ind);
                        this.ref.textContent = this.fullText;
                        this.ind += text.length;
                        Prism.highlightElement(this.ref, null, null);
                        return [3 /*break*/, 6];
                    case 1:
                        left = this.fullText.substring(0, this.ind);
                        right = this.fullText.substring(this.ind);
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < text.length)) return [3 /*break*/, 5];
                        this.fullText = left + text.substring(0, i + 1) + right;
                        this.ref.textContent = this.fullText;
                        Prism.highlightElement(this.ref, null, null);
                        return [4 /*yield*/, wait(5)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5:
                        this.ind += text.length;
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return Project;
}());
function testStartOnLoad() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createCodeFile("", "js", "TestFile.js")];
                case 1:
                    currentFile = _a.sent();
                    executeActions(currentFile, [
                        // new ActionText("// Line 1\n"),
                        // new ActionText("// Line 3\n"),
                        // new ActionText("// Line 4\n"),
                        // new ActionMoveRel(""),
                        // new ActionMoveRel("uu\n"),
                        // new ActionText("// Line 2")
                        new ActionText("// this is the start of the file\n"),
                        new ActionText("\nfunction start(){\n\n}"),
                        new ActionMoveRel("u"),
                        new ActionText('\tconsole.log("hello");')
                    ]);
                    return [2 /*return*/];
            }
        });
    });
}
function executeActions(file, actions) {
    return __awaiter(this, void 0, void 0, function () {
        var i, action;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!file) {
                        alert("No file was specified");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, wait(100)];
                case 1:
                    _a.sent();
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < actions.length)) return [3 /*break*/, 5];
                    action = actions[i];
                    action.execute(file);
                    return [4 /*yield*/, wait(300)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function writeToCodeFile(move) {
    return __awaiter(this, void 0, void 0, function () {
        var file, text, i, c;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createCodeFile("", "js", "TestFile.js")];
                case 1:
                    file = _a.sent();
                    text = "function start(){\n    console.log(\"hello\");\n}";
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < text.length)) return [3 /*break*/, 5];
                    c = text[i];
                    file.ref.textContent += c;
                    if (realTimeColorUpdate)
                        Prism.highlightElement(file, null, null);
                    return [4 /*yield*/, wait(40)];
                case 3:
                    _a.sent(); //40
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5:
                    // testFile.textContent = ;
                    if (!realTimeColorUpdate)
                        Prism.highlightElement(file, null, null);
                    return [2 /*return*/];
            }
        });
    });
}
// genHeaderList();
function updateState(isBare) {
    if (isBare === void 0) { isBare = false; }
    var url = new URL(location.href);
    pageLoadFileIndex = parseInt(url.searchParams.get("index"));
    for (var i = 0; i < list.children.length; i++) {
        var c = list.children[i];
        c.classList.remove("sel");
    }
    // if(pageLoadFileIndex != null && pageLoadFileIndex >= 0){
    //     // @ts-ignore
    //     (list.children[pageLoadFileIndex] as HTMLElement).onclick(null,isBare);
    // }
    var fileDiv = fileReg.get(pageLoadFileIndex);
    if (!fileDiv) {
        console.warn("An error occurred: File with the index '" + pageLoadFileIndex + "' was not found in the file registry.");
    }
    else {
        // @ts-ignore
        fileDiv.onclick(null, isBare);
        if (fileDiv.parentElement.parentElement.classList.contains("folder-cont")) {
            if (!fileDiv.parentElement.parentElement.classList.contains("open"))
                fileDiv.parentElement.parentElement.children[0].click();
        }
    }
}
updateState(true);
window.addEventListener("popstate", function (e) {
    updateState(true);
});
setTimeout(function () {
    var mainCont = document.querySelector(".main");
    for (var i = 0; i < mainCont.children.length; i++) {
        var c = mainCont.children[i];
        c.style.opacity = "1";
    }
}, 250);
//# sourceMappingURL=main.js.map