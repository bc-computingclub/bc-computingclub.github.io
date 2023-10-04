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
var _a;
var list = document.querySelector(".challenge-list");
var frame = document.getElementById("frame");
var codeCont = document.querySelector(".code-cont");
var overlay = document.querySelector(".overlay");
var back = document.querySelector(".back");
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
function registerProject(name, date, /**@type {string[]}*/ files, htmlOverride) {
    var div = document.createElement("div");
    var i = list.children.length + 1;
    div.innerHTML = "\n        <div>".concat(i, "</div>\n        <div>").concat(date, "</div>\n        <div>").concat(name, "</div>\n    ");
    list.appendChild(div);
    div.onclick = function () {
        return __awaiter(this, void 0, void 0, function () {
            function close() {
                codeCont.textContent = "";
                frame.src = "";
                sel.classList.remove("sel");
                sel = null;
                var url = new URL(location.href);
                url.searchParams.delete("index");
                history.replaceState("", "", url);
                document.title = "View JS Challenge Code";
            }
            var url, _loop_1, _i, files_1, file;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (sel == div) {
                            close();
                            return [2 /*return*/];
                        }
                        if (sel)
                            close();
                        div.classList.add("sel");
                        sel = div;
                        url = new URL(location.href);
                        url.searchParams.set("index", (i - 1).toString());
                        history.replaceState("", "", url);
                        document.title = "Challenge " + i + " - " + name;
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
                            frame.src = "files/" + i + "/index.html";
                        }, 0);
                        return [2 /*return*/];
                }
            });
        });
    };
}
var b_fullscreen = document.getElementById("fullscreen");
b_fullscreen.onclick = function () {
    frame.requestFullscreen();
};
// registry
registerProject("Timer", "9/27/23", ["main.js", "index.html"], "<!-- A Basic Example of a Timer -->\n\n<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>1 - Timer - Lv 1</title>\n</head>\n<body>\n    <p id=\"time-left\">60</p>\n    <p>Seconds Remaining</p>\n\n    <script src=\"main.js\"></script>\n</body>\n</html>");
// registerProject("Timer","9/27/23",["main.js","index.html"]);
// load
var url = new URL(location.href);
var searchIndex = url.searchParams.get("index");
if (searchIndex != null) {
    (_a = list.children[searchIndex]) === null || _a === void 0 ? void 0 : _a.click();
}
var dd_view = document.querySelector(".dd-view");
registerDropdown(dd_view, [
    "Challenges",
    "Examples / Tutorials"
], function (i) {
});
