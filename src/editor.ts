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

b_refresh = document.querySelector(".b-refresh") as HTMLButtonElement;
icon_refresh = document.querySelector(".icon-refresh") as HTMLElement;
iframe = document.querySelector("iframe") as HTMLIFrameElement;
let b_openInNew = document.querySelector(".b-open-in-new") as HTMLElement;

b_openInNew.addEventListener("click",e=>{
    console.log(iframe.src);
    // open(iframe.src,"_blank");
});

// needs to be unified later
async function refresh(){
    // tmp
    // if(project.files.some(v=>!v._saved)) await uploadProjectFiles(project);
    if(project.files.some(v=>!v._saved) || !project.hasSavedOnce) await save(true);
    
    let file1 = project.files.find(v=>v.name == "index.html");
    if(!file1){
        alert("No index.html file found! Please create a new file called index.html, this file will be used in the preview.");
        return;
    }
    // iframe.contentWindow.onloadstart = function(){
    //     console.log(":: START");
    // };
    // iframe.contentWindow.onloadedmetadata = function(){
    //     console.log(":: META");
    // };
    // iframe.contentWindow.onloadeddata = function(){
    //     console.log(":: DATA");
    // };
    // iframe.contentWindow.onload = function(){
    //     console.log(":: LOAD");
    // };
    iframe.src = serverURL+"/project/"+g_user.sanitized_email+"/"+socket.id+"/"+g_user.sanitized_email+"/"+project.pid;
    // let cs = (iframe.contentWindow as any).console as Console;
    // cs.log = function(...data:any[]){
    //     console.log("BOB");
    //     // console.log("(LOG)",...data);
    //     // cs.log(...data);
    // };
    // console.log(cs);

    icon_refresh.style.rotate = _icRef_state ? "360deg" : "0deg";
    _icRef_state = !_icRef_state;
    
    resolveHook(listenHooks.refresh,null);
}

if(true) b_refresh.addEventListener("click",e=>{ 
    refresh();
});
else b_refresh.addEventListener("click",e=>{
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
            refresh();
        }
        else if(k == "s"){
            e.preventDefault();
            save();
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
let b_save = document.querySelector(".b-save");

let projDash = new ProjectDashboard();

b_editorDashboard.addEventListener("click",e=>{
    projDash.load();
});
d_curProject.addEventListener("click",e=>{
    openCurProjSettings();
});

let _isSaving = false;
async function save(isQuick=false){
    if(_isSaving) return;
    
    _isSaving = true;
    b_save.children[0].textContent = "progress_activity";
    b_save.children[0].classList.add("progress-anim");
    let start = performance.now();
    await uploadProjectFiles(project);
    let time = performance.now()-start;
    let delay = 0;

    if(!isQuick){
        if(time < 50) delay = 300;
        await wait(delay);
    }

    b_save.children[0].textContent = "save";
    b_save.children[0].classList.remove("progress-anim");
    _isSaving = false;

    project.hasSavedOnce = true;
    project.files.forEach(v=>v.setSaved(true));
}
b_save.addEventListener("click",e=>{
    save();
});

function openCurProjSettings(){   
    let div = document.createElement("div");
    div.className = "proj-settings";
    div.innerHTML = `
        <div>
            <div>Rename</div>
            <input class="i-rename">
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