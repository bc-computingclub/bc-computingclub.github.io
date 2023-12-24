// learn to code or something, it's really up to you, you have to put in the work
let d_files = document.querySelector(".d-open-files");
let main = document.querySelector(".main");
let codeCont = document.querySelector(".cont-js");
let pane_files = document.querySelector(".pane-files");
let pane_code = document.querySelector(".pane-code");
let pane_preview = document.querySelector(".pane-preview");
class Project {
    constructor(title) {
        this.title = title;
        this.files = [];
        this.openFiles = [];
    }
    title;
    files;
    openFiles;
    curFile;
    createFile(name, text, lang) {
        let f = new FFile(this, name, text, lang);
        this.files.push(f);
    }
    hasEditor() {
        return (this.curFile?.curEditor != null);
    }
    getCurEditor() {
        return this.curFile.curEditor;
    }
}
class FFile {
    constructor(p, name, text, lang) {
        this.p = p;
        this.name = name;
        this.text = text;
        this.lang = lang;
    }
    p;
    name;
    text;
    lang;
    link;
    cont;
    editor;
    curEditor;
    editorHandle;
    open() {
        if (!this.p.openFiles.includes(this)) {
            let link = document.createElement("div");
            this.link = link;
            link.textContent = this.name;
            link.className = "file-link";
            d_files.appendChild(link);
            this.p.openFiles.push(this);
            let t = this;
            link.onmousedown = function () {
                t.open();
            };
            let cont = document.createElement("div");
            cont.className = "js-cont cont";
            this.cont = cont;
            let editor = monaco.editor.create(cont, {
                value: [this.text].join('\n'),
                language: this.lang,
                theme: "vs-light",
                bracketPairColorization: {
                    enabled: false
                },
                minimap: {
                    enabled: false
                }
            });
            let textArea = cont.querySelector("textarea");
            let overflowGuard = cont.querySelector(".overflow-guard");
            textArea.oninput = function () {
                overflowGuard.scrollTo({ top: 0, left: 0, behavior: "instant" });
            };
            this.curEditor = editor;
            this.editor = editor;
            this.p.curFile = this;
        }
        // deselect others
        for (const c of d_files.children) {
            c.classList.remove("cur");
        }
        this.link.classList.add("cur");
        for (const c of codeCont.children) {
            codeCont.removeChild(c);
        }
        codeCont.appendChild(this.cont);
        this.editor.layout();
        loadEditorTheme();
    }
}
let project;
async function init() {
    // @ts-ignore
    require.config({ paths: { vs: "../lib/monaco/min/vs" } });
    await new Promise(resolve => {
        // @ts-ignore
        require(['vs/editor/editor.main'], function () {
            resolve();
        });
    });
    project = new Project("Test Project");
    project.createFile("index.html", `<html>
    <head>
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
        <div>Hello</div>

        <script src="script.js"></script>
    </body>
</html>`, "html");
    project.createFile("style.css", `body{
    color:royalblue;
}`, "css");
    project.createFile("script.js", `console.log("page loaded!");`, "javascript");
    project.files[0].open();
    project.files[1].open();
    project.files[2].open();
    onResize(true);
}
window.addEventListener("resize", e => {
    onResize();
});
function onResize(isFirst = false, who) {
    let remainingWidth = innerWidth - pane_files.offsetWidth - 15;
    if (isFirst) {
        pane_code.style.width = (remainingWidth / 2) + "px";
        pane_preview.style.width = (remainingWidth / 2) + "px";
    }
    else {
        // if(who == )
        pane_preview.style.width = (remainingWidth - pane_code.offsetWidth) + "px";
    }
    main.style.height = (innerHeight - 60) + "px";
    if (project.hasEditor())
        project.getCurEditor().layout();
}
let b_refresh = document.querySelector(".b-refresh");
let icon_refresh = document.querySelector(".icon-refresh");
let iframe = document.querySelector("iframe");
let _icRef_state = true;
b_refresh.addEventListener("click", e => {
    let newIF = document.createElement("iframe");
    iframe.replaceWith(newIF);
    iframe = newIF;
    icon_refresh.style.rotate = _icRef_state ? "360deg" : "0deg";
    _icRef_state = !_icRef_state;
    let text = project.files[0].editor.getValue();
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
document.addEventListener("keydown", e => {
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
            // e.preventDefault();
            // b_refresh.click();
        }
        else if (k == "s") {
            e.preventDefault();
            b_refresh.click();
        }
    }
});
let s_loader = document.getElementById("s-loader");
s_loader.onload = function () {
    console.log("loaded loader");
    init();
};
// document.addEventListener("DOMContentLoaded",async e=>{
//     await wait(800);
//     if(localStorage.getItem("logData")){
//         logUserIn();
//     }
// });
//# sourceMappingURL=editor.js.map