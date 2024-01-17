PAGE_ID = PAGEID.editor;

// learn to code or something, it's really up to you, you have to put in the work

// d_files = document.querySelector(".d-open-files");
main = document.querySelector(".main") as HTMLElement;
// codeCont = document.querySelector(".cont-js");

pane_files = document.querySelector(".pane-files") as HTMLElement;
pane_code = document.querySelector(".pane-code") as HTMLElement;
pane_preview = document.querySelector(".pane-preview") as HTMLElement;

let project:Project;

async function init(){    
    // @ts-ignore
    require.config({paths:{vs:"/lib/monaco/min/vs"}});
    await new Promise<void>(resolve=>{
        // @ts-ignore
        require(['vs/editor/editor.main'], function () {
            resolve();
        });
    });

    project = new Project("Test Project",pane_code);
    let pid = new URL(location.href).searchParams.get("pid");
    project.pid = pid;
    console.log("FOUND PID: ",pid);
    if(!pid) project.pid = "tmp_project";
    setupEditor(pane_code,EditorType.self);
    postSetupEditor(project);

    d_curProject.textContent = project.title;

    await restoreProjectFiles(project);
    if(project.files.length == 0){ // create boilerplate files
        console.warn(":: no files found, loading boilerplate");
        project.createFile("index.html",`<html>
    <head>
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
        <div>Hello</div>

        <script src="script.js"></script>
    </body>
</html>`,"html");
        project.createFile("style.css",`body{
    color:royalblue;
}`,"css");
        project.createFile("script.js",`console.log("page loaded!");`,"javascript");

        project.files[0].open();
        project.files[1].open();
        project.files[2].open();
    }
    else project.hasSavedOnce = true;

    project.files.forEach(v=>v.setSaved(true));

    onResize(true);
}

onResize = function(isFirst=false,who?:HTMLElement){
    let remainingWidth = innerWidth - pane_files.offsetWidth - 15;
    if(isFirst){
        pane_code.style.width = (remainingWidth/2)+"px";
        pane_preview.style.width = (remainingWidth/2)+"px";
    }
    else{
        // if(who == )
        pane_preview.style.width = (remainingWidth-pane_code.offsetWidth)+"px";
    }
    
    main.style.height = (innerHeight - 60)+"px";
    if(project?.hasEditor()) project.getCurEditor().layout();
};
onResize();

icon_refresh = document.querySelector(".icon-refresh") as HTMLElement;
iframe = document.querySelector("iframe") as HTMLIFrameElement;

if(false) b_refresh.addEventListener("click",e=>{
    if(!project.files[0]) return;
    
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

document.addEventListener("keydown",e=>{
    if(!e.key) return;
    let k = e.key.toLowerCase();

    if(menusOpen.length){
        if(k == "escape"){
            closeAllMenus();
        }
        return;
    }

    if(e.ctrlKey){
        if(k == "r"){
            e.preventDefault();
            refreshProject();
        }
        else if(k == "s"){
            e.preventDefault();
            saveProject();
        }
    }
});

let s_loader = document.getElementById("s-loader") as HTMLElement;
s_loader.onload = async function(){
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
function updateBubbles(){}

// Editor Dashboard
class ProjectDashboard extends Menu{
    constructor(){
        super("Project Dashboard","home");
    }
    load(priority?: number): void {
        super.load(priority);
        this.body.innerHTML = `
            <div>Hi there!</div>
        `;
    }
}

let b_editorDashboard = document.querySelector(".b-editor-dashboard");
let d_curProject = document.querySelector(".d-current-project");

let projDash = new ProjectDashboard();

b_editorDashboard.addEventListener("click",e=>{
    projDash.load();
});
d_curProject.addEventListener("click",e=>{
    openCurProjSettings();
});

function openCurProjSettings(){   
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
    div.onmouseenter = function(){
        isOverTmpMenu = true;
    };
    div.onmouseleave = function(){
        isOverTmpMenu = false;
    };
    tmpMenus.push(div);
    
    let rect = d_curProject.getBoundingClientRect();
    div.style.left = (rect.x)+"px";
    div.style.top = (rect.bottom+3)+"px";

    document.body.appendChild(div);

    let i_rename = div.querySelector(".i-rename") as HTMLInputElement;
    i_rename.value = project.title;
}