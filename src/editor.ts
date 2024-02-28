PAGE_ID = PAGEID.editor;

// learn to code or something, it's really up to you, you have to put in the work

// d_files = document.querySelector(".d-open-files");
main = document.querySelector(".main") as HTMLElement;
// codeCont = document.querySelector(".cont-js");

pane_files = document.querySelector(".pane-files") as HTMLElement;
pane_code = document.querySelector(".pane-code") as HTMLElement;
pane_preview = document.querySelector(".pane-preview") as HTMLElement;

const b_newFolder = document.querySelector(".b-new-folder") as HTMLButtonElement;
const b_newFile = document.querySelector(".b-new-file") as HTMLButtonElement;
b_newFolder.addEventListener("click",e=>{
    if(!project) return;
    let name = prompt("Enter folder name:");
    if(!name) return;
    project.createFolder(name,project.lastFolder ?? project.curFile?.folder);
});
b_newFile.addEventListener("click",e=>{
    if(!project) return;
    let name = prompt("Enter file name:");
    if(!name) return;
    project.createFile(name,"",null,project.lastFolder ?? project.curFile?.folder,true);
});

async function loadProject(uid:string,pid:string){
    project = null;
    let {meta,canEdit} = await restoreProjectFiles(uid,pid);
    if(!meta){
        console.warn(`selected project ${pid}: doesn't exist`);
        new ProjectDashboard().load();
        return;
    }

    let url = new URL(location.href);
    if(url.searchParams.get("pid") != pid){
        url.searchParams.set("pid",pid);
        history.replaceState(null,null,url);
    }

    project = new Project(meta.name,pane_code);
    project.canEdit = canEdit;
    project.meta = meta;
    project.pid = pid;
    project.desc = meta.desc;
    project.isPublic = meta.isPublic;
    console.log("FOUND PID: ",pid);
    if(!pid) project.pid = "tmp_project";
    setupEditor(pane_code,EditorType.self);
    postSetupEditor(project);

    d_curProject.textContent = project.title;

    if(meta.cid != null){
        console.log("** found Challenge Project");
        document.body.classList.add("is-challenge");
        let nav = document.querySelector("a.nav-link:nth-child(2)");
        if(nav){
            nav.classList.add("active");
            nav.nextElementSibling.classList.remove("active");
        }
    }
    console.log("project meta:",meta);

    // for(const f of meta.files){
    //     project.createFile(f.name,f.val);
    // }
    function run(l:any[],cur:FFolder){
        sortFiles(l);
        // l.sort((a,b)=>{
        //     let dif = (a.val != null && b.val == null ? 1 : (a.val == null && b.val != null ? -1 : 0));
        //     if(dif == 0) dif = a.name.localeCompare(b.name);
        //     return dif;
        // });
        let list = [];
        for(const f of l){
            if(f.val != null){
                // console.log("created file: ",f.name,cur?.name);
                let ff = project.createFile(f.name,f.val,null,cur);
                list.push(ff);
            }
            else if(f.items != null){
                // console.log("created folder: ",f.name);
                let ff = project.createFolder(f.name,cur,false);
                list.push(ff);
                ff.items = run(f.items,ff);
            }
        }
        return list;
    }
    run(meta.items,null);
    if(meta.items.length) project.hasSavedOnce = true;
    
    if(project.files.length == 0){ // create boilerplate files
        console.warn(":: no files found");
        return;
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
    if(project.curFile) project.curFile.open();

    // load index.html by default
    let index = project.items.find(v=>v.name == "index.html") as FFile;
    if(index) index.open();

    if(!canEdit){
        b_save.style.display = "none";
        b_publish.style.display = "none";
    }
}

async function init(){    
    // @ts-ignore
    require.config({paths:{vs:"/lib/monaco/min/vs"}});
    await new Promise<void>(resolve=>{
        // @ts-ignore
        require(['vs/editor/editor.main'], function () {
            resolve();
        });
    });

    let url = new URL(location.href);
    let uid = url.searchParams.get("uid");
    let pid = url.searchParams.get("pid");
    await loadProject(url.searchParams.has("uid")?uid:g_user.uid,pid);

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
    load(priority?: number){
        super.load(priority);
        this.body.innerHTML = `
            <div class="flx edb-body">
                <div class="edb-nav">
                    <div class="edb-nav-cont">
                        <button class="icon-btn regular sel">
                            <div class="material-symbols-outlined">face</div>
                            <div>Personal</div>
                        </button>
                        <button class="icon-btn regular">
                            <div class="material-symbols-outlined">fitness_center</div>
                            <div>Challenges</div>
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
        let b_newProject = this.body.querySelector(".b-new-project") as HTMLButtonElement;
        b_newProject.addEventListener("click",e=>{
            let name = prompt("Enter project name:","New Project");
            if(!name) return;
            createNewProject(name);
        });
        let navCont = this.body.querySelector(".edb-nav-cont");
        let content = this.body.querySelector(".edb-content-list");
        for(let i = 0; i < navCont.children.length; i++){
            let b = navCont.children[i];
            b.addEventListener("mousedown",e=>{
                loadSection(i);
            });
        }
        async function loadSection(i:number){
            let b = navCont.children[i];
            for(const c of navCont.children){
                c.classList.remove("sel");
            }
            b.classList.add("sel");
            curProjectSettingsMeta = null;
            curProjectSettingsMetaPID = null;
            content.textContent = "";
            let raw = await new Promise<string[]>(resolve=>{
                socket.emit("user-getProjectList",i,(data:string[])=>{
                    resolve(data || []);
                });
            });
            let list = raw.map(v=>JSON.parse(v) as ProjectMeta);
            for(const c of list){
                loadItem(c);
            }
        }
        function loadItem(meta:ProjectMeta){
            let div = document.createElement("div");
            div.className = "project-item";
            div.classList.add("pi-"+meta.pid);
            div.innerHTML = `
                <div class="project-info">
                    <div class="l-project-name">${meta.name}</div>
                    <div class="l-project-desc">${meta.desc}</div>
                </div>
                <div class="flx-sb" style="gap:5px">
                    <button class="icon-btn accent smaller b-open-project">
                        <div class="material-symbols-outlined">edit</div>
                        <div>Tinker</div>
                    </button>
                    <button class="icon-btn-single accent smaller b-ops">
                        <div class="material-symbols-outlined">discover_tune</div>
                    </button>
                </div>
            `;
            content.appendChild(div);
            let l_pname = div.querySelector(".l-project-name");
            let b_openProject = div.querySelector(".b-open-project");
            b_openProject.addEventListener("click",e=>{
                openProjectSuper(meta.pid);
            });
            if(meta.cid != null){
                b_openProject.classList.add("challenge");
                b_openProject.children[1].textContent = "Practice";
            }

            let b_ops = div.querySelector(".b-ops") as HTMLButtonElement;
            b_ops.addEventListener("click",e=>{
                let cur = openCurProjSettingsMeta(meta,{
                    onrename(v:string){
                        l_pname.textContent = v;
                    }
                });
                // b_ops.parentElement.insertAdjacentElement("afterend",cur);
                if(cur) div.insertAdjacentElement("beforebegin",cur);
            });
            // setupDropdown(b_ops,()=>[
            //     "Rename",
            //     "Delete"
            // ],(i)=>{
            //     if(i == 0){
            //         let name = prompt(`Old project name: ${meta.name}\n\nEnter new project name:`,meta.name);
            //         if(!name) return;
            //         if(name == "") return;
            //         socket.emit("renameProject",meta.pid,name,(res:number)=>{
            //             if(res != 0) return;
            //             l_pname.textContent = name;
            //         });
            //     }
            //     else if(i == 1){
                    
            //     }
            // });
            // div.addEventListener("click",e=>{

            // });
        }
        loadSection(project ? (project.meta?.cid != null ? 1 : 0) : 0);
        return this;
    }
}

async function createNewProject(name:string,desc="A project for experiments."){
    let pid = await new Promise<string>(resolve=>{
        console.log("...creating project");
        socket.emit("createProject",name,desc,(pid:string)=>{
            if(pid == null){
                alert("Error creating project");
                resolve(null);
                return;
            }
            console.log(":: successfully created project: ",name);
            resolve(pid);
        });
    });
    if(pid == null) return;
    console.log("succesfully created");
    await openProjectSuper(pid);
}
async function openProjectSuper(pid:string){
    if(!project) await loadProject(g_user.uid,pid);
    else goToProject(pid);
    closeAllMenus();
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
    if(!project) return;

    let oldName = project.title;
    
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
    div.onclose = function(){
        let newName = i_rename.value;
        if(!newName || newName == "") return;
        if(oldName == newName) return;
        socket.emit("renameProject",project.pid,newName,(res:number)=>{
            console.log("rename project res:",res);
            let elm = document.querySelector(".d-current-project");
            if(elm) elm.textContent = newName;
        });
    };
    tmpMenus.push(div);
    
    let rect = d_curProject.getBoundingClientRect();
    div.style.left = (rect.x)+"px";
    div.style.top = (rect.bottom+3)+"px";

    document.body.appendChild(div);

    let i_rename = div.querySelector(".i-rename") as HTMLInputElement;
    i_rename.value = project.title;

    return div;
}
let curProjectSettingsMetaPID:string;
let curProjectSettingsMeta:HTMLElement;
function openCurProjSettingsMeta(meta:ProjectMeta,ops:any){
    if(!meta) return;
    if(curProjectSettingsMetaPID == meta.pid){
        curProjectSettingsMeta.remove();
        curProjectSettingsMeta = null;
        curProjectSettingsMetaPID = null;
        return;
    }

    let oldName = meta.name;
    
    let div = document.createElement("div");
    div.className = "proj-settings";
    div.innerHTML = `
        <div class="flx-sb">
            <div class="flx-al" style="gap:10px">
                <div>Rename</div>
                <input type="text" class="i-rename">
            </div>
            <button class="icon-btn-single b-delete-project"><div class="material-symbols-outlined">delete</div></button>
        </div>
        <div class="flx-sb">
            <div class="flx-al" style="gap:10px">
                <div>Is public?</div>
                <input type="checkbox">
            </div>
            <button class="icon-btn-single b-unlink-project"><div class="material-symbols-outlined">link_off</div></button>
        </div>
    `;
    if(curProjectSettingsMeta) curProjectSettingsMeta.remove();
    curProjectSettingsMeta = div;
    curProjectSettingsMetaPID = meta.pid;
    
    let rect = d_curProject.getBoundingClientRect();
    div.style.left = (rect.x)+"px";
    div.style.top = (rect.bottom+3)+"px";

    document.body.appendChild(div);

    let i_rename = div.querySelector(".i-rename") as HTMLInputElement;
    i_rename.value = meta.name;
    whenEnter(i_rename,v=>{
        let newName = i_rename.value;
        if(!newName || newName == "") return;
        if(oldName == newName) return;
        socket.emit("renameProject",meta.pid,newName,(res:number)=>{
            console.log("rename project res:",res);
            let elm = document.querySelector(".d-current-project");
            if(elm) elm.textContent = newName;

            ops.onrename(v);
        });
    });

    let b_deleteProject = div.querySelector(".b-delete-project") as HTMLButtonElement;
    b_deleteProject.addEventListener("click",e=>{
        if(!confirm(`Are you sure you want to delete project: "${meta.name}" ?\n\nThere is no reversing this option.`)) return;
        socket.emit("deleteProject",meta.pid,(res:number)=>{
            console.log("delete project res: ",res);
            if(res != 0){
                alert("There was an error deleting the project, error code: "+res);
                return;
            }
            let item = document.querySelector(".pi-"+meta.pid);
            if(item) item.remove();
            div.remove();
            if(project?.pid == meta.pid) location.reload();
        });
    });
    setupCallout(b_deleteProject,"Delete Project");

    let b_unlinkProject = div.querySelector(".b-unlink-project") as HTMLButtonElement;
    if(!meta.cid) b_unlinkProject.style.display = "none";
    b_unlinkProject.addEventListener("click",e=>{
        if(!confirm(`Are you sure you want to unlink the challenge with this project: "${meta.name}" ?\n\nThere is no reversing this option.`)) return;
        socket.emit("unlinkProject",meta.pid,(res:number)=>{
            console.log("unlink project res: ",res);
            if(res != 0){
                alert("There was an error unlinking the project, error code: "+res);
                return;
            }
            // let item = document.querySelector(".pi-"+meta.pid);
            // if(item) item.remove();
            // div.remove();
            // if(project?.pid == meta.pid) location.reload();
            location.reload();
        });
    });

    // 
    div.style.position = "static";
    div.style.marginLeft = "10px";

    return div;
}