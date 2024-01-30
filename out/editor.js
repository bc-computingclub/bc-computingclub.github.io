PAGE_ID = PAGEID.editor;
// learn to code or something, it's really up to you, you have to put in the work
// d_files = document.querySelector(".d-open-files");
main = document.querySelector(".main");
// codeCont = document.querySelector(".cont-js");
pane_files = document.querySelector(".pane-files");
pane_code = document.querySelector(".pane-code");
pane_preview = document.querySelector(".pane-preview");
let project;
async function loadProject(pid) {
    project = null;
    let meta = await restoreProjectFiles(pid);
    if (!meta) {
        console.warn(`selected project ${pid}: doesn't exist`);
        new ProjectDashboard().load();
        return;
    }
    let url = new URL(location.href);
    if (url.searchParams.get("pid") != pid) {
        url.searchParams.set("pid", pid);
        history.replaceState(null, null, url);
    }
    project = new Project(meta.name, pane_code);
    project.pid = pid;
    project.desc = meta.desc;
    project.isPublic = meta.isPublic;
    console.log("FOUND PID: ", pid);
    if (!pid)
        project.pid = "tmp_project";
    setupEditor(pane_code, EditorType.self);
    postSetupEditor(project);
    d_curProject.textContent = project.title;
    if (meta.cid != null) {
        console.log("** found Challenge Project");
        document.body.classList.add("is-challenge");
        let nav = document.querySelector("a.nav-link:nth-child(2)");
        if (nav) {
            nav.classList.add("active");
            nav.nextElementSibling.classList.remove("active");
        }
    }
    console.log("project meta:", meta);
    for (const f of meta.files) {
        project.createFile(f.name, f.val);
    }
    if (meta.files.length)
        project.hasSavedOnce = true;
    if (project.files.length == 0) { // create boilerplate files
        console.warn(":: no files found");
        return;
        console.warn(":: no files found, loading boilerplate");
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
    }
    else
        project.hasSavedOnce = true;
    project.files.forEach(v => v.setSaved(true));
}
async function init() {
    // @ts-ignore
    require.config({ paths: { vs: "/lib/monaco/min/vs" } });
    await new Promise(resolve => {
        // @ts-ignore
        require(['vs/editor/editor.main'], function () {
            resolve();
        });
    });
    let pid = new URL(location.href).searchParams.get("pid");
    await loadProject(pid);
    onResize(true);
}
onResize = function (isFirst = false, who) {
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
    if (project?.hasEditor())
        project.getCurEditor().layout();
};
onResize();
icon_refresh = document.querySelector(".icon-refresh");
iframe = document.querySelector("iframe");
if (false)
    b_refresh.addEventListener("click", e => {
        if (!project.files[0])
            return;
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
            e.preventDefault();
            refreshProject();
        }
        else if (k == "s") {
            e.preventDefault();
            saveProject();
        }
    }
});
let s_loader = document.getElementById("s-loader");
s_loader.onload = async function () {
    console.log("loaded loader");
    await loginProm;
    init();
};
// document.addEventListener("DOMContentLoaded",async e=>{
//     await wait(800);
//     if(localStorage.getItem("logData")){
//         logUserIn();
//     }
// });
// 
// @ts-ignore
function updateBubbles() { }
// Editor Dashboard
class ProjectDashboard extends Menu {
    constructor() {
        super("Project Dashboard", "home");
    }
    load(priority) {
        super.load(priority);
        this.body.innerHTML = `
            <div class="flx edb-body">
                <div class="edb-nav">
                    <div class="edb-nav-cont">
                        <button class="icon-btn regular">
                            <div class="material-symbols-outlined">face</div>
                            <div>Personal</div>
                        </button>
                        <button class="icon-btn regular">
                            <div class="material-symbols-outlined">schedule</div>
                            <div>Recent</div>
                        </button>
                        <button class="icon-btn regular">
                            <div class="material-symbols-outlined">star_rate</div>
                            <div>Saved</div>
                        </button>
                    </div>
                    <div class="edb-nav-cont">
                        <button class="b-new-project icon-btn accent">
                            <div class="material-symbols-outlined">add</div>
                            <div>New Project</div>
                        </button>
                    </div>
                </div>
                <div class="edb-content">
                    <div class="edb-content-list"></div>
                </div>
            </div>
        `;
        let b_newProject = this.body.querySelector(".b-new-project");
        b_newProject.addEventListener("click", e => {
            let name = prompt("Enter project name:", "New Project");
            if (!name)
                return;
            createNewProject(name);
        });
        let navCont = this.body.querySelector(".edb-nav-cont");
        let content = this.body.querySelector(".edb-content-list");
        for (let i = 0; i < navCont.children.length; i++) {
            let b = navCont.children[i];
            b.addEventListener("click", e => {
                loadSection(i);
            });
        }
        async function loadSection(i) {
            content.textContent = "";
            let raw = await new Promise(resolve => {
                socket.emit("user-getProjectList", i, (data) => {
                    resolve(data || []);
                });
            });
            let list = raw.map(v => JSON.parse(v));
            for (const c of list) {
                loadItem(c);
            }
        }
        function loadItem(meta) {
            let div = document.createElement("div");
            div.className = "project-item";
            div.innerHTML = `
                <div class="project-info">
                    <div class="l-project-name">${meta.name}</div>
                    <div class="l-project-desc">${meta.desc}</div>
                </div>
                <div>
                    <button class="icon-btn accent smaller b-open-project">
                        <div class="material-symbols-outlined">edit</div>
                        <div>Tinker</div>
                    </button>
                </div>
            `;
            content.appendChild(div);
            let b_openProject = div.querySelector(".b-open-project");
            b_openProject.addEventListener("click", e => {
                openProjectSuper(meta.pid);
            });
            if (meta.cid != null) {
                b_openProject.classList.add("challenge");
                b_openProject.children[1].textContent = "Practice";
            }
            // div.addEventListener("click",e=>{
            // });
        }
        loadSection(0);
        return this;
    }
}
async function createNewProject(name, desc = "A default project description.") {
    let pid = await new Promise(resolve => {
        console.log("...creating project");
        socket.emit("createProject", name, desc, (pid) => {
            if (pid == null) {
                alert("Error creating project");
                resolve(null);
                return;
            }
            console.log(":: successfully created project: ", name);
            resolve(pid);
        });
    });
    if (pid == null)
        return;
    console.log("succesfully created");
    await openProjectSuper(pid);
}
async function openProjectSuper(pid) {
    if (!project)
        await loadProject(pid);
    else
        goToProject(pid);
    closeAllMenus();
}
let b_editorDashboard = document.querySelector(".b-editor-dashboard");
let d_curProject = document.querySelector(".d-current-project");
let projDash = new ProjectDashboard();
b_editorDashboard.addEventListener("click", e => {
    projDash.load();
});
d_curProject.addEventListener("click", e => {
    openCurProjSettings();
});
function openCurProjSettings() {
    if (!project)
        return;
    let div = document.createElement("div");
    div.className = "proj-settings";
    div.innerHTML = `
        <div>
            <div>Rename</div>
            <input type="text" class="i-rename">
        </div>
        <div>
            <div>Is public?</div>
            <input type="checkbox">
        </div>
    `;
    div.onmouseenter = function () {
        isOverTmpMenu = true;
    };
    div.onmouseleave = function () {
        isOverTmpMenu = false;
    };
    tmpMenus.push(div);
    let rect = d_curProject.getBoundingClientRect();
    div.style.left = (rect.x) + "px";
    div.style.top = (rect.bottom + 3) + "px";
    document.body.appendChild(div);
    let i_rename = div.querySelector(".i-rename");
    i_rename.value = project.title;
}
//# sourceMappingURL=editor.js.map