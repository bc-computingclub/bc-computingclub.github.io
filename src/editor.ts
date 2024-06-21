PAGE_ID = PAGEID.editor;

// learn to code or something, it's really up to you, you have to put in the work

// d_files = document.querySelector(".d-open-files");
main = document.querySelector(".main") as HTMLElement;
pane_files = document.querySelector(".pane-files");
// codeCont = document.querySelector(".cont-js");

pane_code = document.querySelector(".pane-code") as HTMLElement;
pane_preview = document.querySelector(".pane-preview") as HTMLElement;

async function loadProject(uid:string,pid:string){
    project = null;
    let {meta,canEdit} = await restoreProjectFiles(uid,pid);
    if(!meta){
        console.warn(`selected project ${pid}: doesn't exist`);
        if(!menusOpen.some(v=>v instanceof ProjectDashboard)) new ProjectDashboard().load();
        return;
    }

    // let url = new URL(location.href);
    // if(url.searchParams.get("pid") != pid){
    //     url.searchParams.set("pid",pid);
    //     history.replaceState(null,null,url);
    // }
    goToProject(pid,uid,false);

    project = new Project(meta.name,pane_code);
    project.meta = meta;
    project.pid = pid;
    project.desc = meta.desc;
    project.isPublic = meta.isPublic;
    project.meta.isOwner = (project.meta.owner == g_user.data.uid);
    project.meta.canEdit = canEdit;
    if(!pid) project.pid = "tmp_project";
    setupEditor(pane_code,EditorType.self);
    setupPreview(pane_preview);
    postSetupEditor(project);
    setupResize(pane_files);

    d_curProject.textContent = project.title;

    if(meta.cid != null){
        console.log("** found Challenge Project");
        document.body.classList.add("is-challenge");
        let nav = document.querySelector("a.nav-link.practice-link");
        if(nav){
            nav.classList.add("active");
            nav.nextElementSibling.classList.remove("active");
        }
    }
    // console.log("project meta:",meta);

    // for(const f of meta.files){
    //     project.createFile(f.name,f.val);
    // }
    async function run(l:any[],cur:FFolder){
        sortFiles(l);
        // l.sort((a,b)=>{
        //     let dif = (a.val != null && b.val == null ? 1 : (a.val == null && b.val != null ? -1 : 0));
        //     if(dif == 0) dif = a.name.localeCompare(b.name);
        //     return dif;
        // });
        let list = [];
        for(const f of l){
            if(f.items == null){
                // console.log("created file: ",f.name,cur?.name);
                let ff = await project.createFile(f.name,f.buf,null,cur);
                list.push(ff);
            }
            else if(f.items != null){
                // console.log("created folder: ",f.name);
                let ff = project.createFolder(f.name,cur,false);
                list.push(ff);
                ff.items = await run(f.items,ff);
            }
        }
        return list;
    }
    await run(meta.items,null);
    if(meta.items.length) project.hasSavedOnce = true;
    
    if(project.files.length == 0){ // create boilerplate files
        console.warn(":: no files found");
        return true;
//         console.warn(":: no files found, loading boilerplate");
//         project.createFile("index.html",`<html>
//     <head>
//         <link rel="stylesheet" href="style.css">
//     </head>
//     <body>
//         <div>Hello</div>

//         <script src="script.js"></script>
//     </body>
// </html>`,"html");
//         project.createFile("style.css",`body{
//     color:royalblue;
// }`,"css");
//         project.createFile("script.js",`console.log("page loaded!");`,"javascript");

//         project.files[0].open();
//         project.files[1].open();
//         project.files[2].open();
    }
    else project.hasSavedOnce = true;

    project.files.forEach(v=>v.setSaved(true));
    if(project.curFile) project.curFile.open();

    // load index.html by default
    let index = project.items.find(v=>v.name == "index.html") as FFile;
    if(index) index.open();

    if(!project.canEdit) b_save.style.display = "none";
    if(!project.isOwner){
        b_publish.style.display = "none";
    }

    return true;
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
    if(!url.searchParams.has("pid")){
        new ProjectDashboard().load();
        onResize(true);
        return;
    }
    let uid = url.searchParams.get("uid");
    let pid = url.searchParams.get("pid");
    // @ts-ignore
    if(bypassLogin) g_user = {uid:"b49000e0-ae3e-4d27-9b7e-cc1006ba6cd4"};
    await loadProject(url.searchParams.has("uid")?uid:g_user.data.uid,pid);

    onResize(true);
}

onResize = function(isFirst=false,who?:HTMLElement){
    let remainingWidth = innerWidth - pane_files.offsetWidth - 15;
    if(isFirst){
        pane_code.style.width = (remainingWidth/2)+"px";
        pane_preview.style.width = (remainingWidth/2)+"px";
        _paneFilesLastWidth = pane_files.getBoundingClientRect().width;
        _paneCodeLastWidth = pane_code.getBoundingClientRect().width;
        _panePreviewLastWidth = pane_preview.getBoundingClientRect().width;
    }
    else{
        if(dragging){
            if(dragging.elm == pane_files){
                let w = pane_files.getBoundingClientRect().width;
                let dif = w-_paneFilesLastWidth;
                
                // if(pane_preview.getBoundingClientRect().width > 320){
                    _paneCodeLastWidth -= dif/2;
                    pane_code.style.width = (_paneCodeLastWidth)+"px";

                    _panePreviewLastWidth -= dif/2;
                    pane_preview.style.width = (_panePreviewLastWidth)+"px"; // this is /2 so that both right panes scale, if only one is desired them changed from dif/2 to dif and comment out the other
                // }
                // else{
                //     _paneCodeLastWidth -= dif;
                //     pane_code.style.width = (_paneCodeLastWidth)+"px";
                // }
                
                _paneFilesLastWidth = pane_files.getBoundingClientRect().width;
            }
            else if(dragging.elm == pane_code){
                let w = pane_code.getBoundingClientRect().width;
                let dif = w-_paneCodeLastWidth;
                
                _panePreviewLastWidth -= dif;
                pane_preview.style.width = (_panePreviewLastWidth)+"px";
                
                _paneCodeLastWidth = pane_code.getBoundingClientRect().width;
            }
            let remain = getRemaining();
            if(remain < 0){
                // console.log(remain);
                // _paneCodeLastWidth -= dif;
                // pane_code.style.width = (_paneCodeLastWidth)+"px";
                // _panePreviewLastWidth += dif;
                // pane_preview.style.width = (_panePreviewLastWidth)+"px";

                // pane_files.style.maxWidth = (centerCont.getBoundingClientRect().width-15-centerCont.children[1].getBoundingClientRect().width-centerCont.children[2].getBoundingClientRect().width)+"px";
                // pane_code.style.maxWidth = (centerCont.getBoundingClientRect().width-15-centerCont.children[0].getBoundingClientRect().width-centerCont.children[2].getBoundingClientRect().width)+"px";
                // pane_preview.style.maxWidth = (centerCont.getBoundingClientRect().width-15-centerCont.children[0].getBoundingClientRect().width-centerCont.children[1].getBoundingClientRect().width)+"px";
            }
            else{
                // pane_files.style.maxWidth = null;
                // pane_code.style.maxWidth = null;
                // pane_preview.style.maxWidth = null;
            }
            // pane_files.style.maxWidth = (centerCont.getBoundingClientRect().width-15-150-550)+"px";
        }
        // pane_preview.style.width = (remainingWidth-pane_code.offsetWidth)+"px";
    }
    
    main.style.height = (innerHeight - 60)+"px";
    if(project?.hasEditor()) project.getCurEditor().layout();
};

function initNewResizes(){

}

onResize();

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

    if(e.ctrlKey){
        if(k == "r"){
            e.stopImmediatePropagation();
            e.preventDefault();
            e.stopPropagation();
            refreshProject();
        }
        else if(k == "s"){
            e.stopImmediatePropagation();
            e.preventDefault();
            e.stopPropagation();
            saveProject();
        }
    }
});

let s_loader = document.getElementById("s-loader") as HTMLElement;
s_loader.onload = async function(){
    console.log("loaded loader");
    await loginProm;
    if(!g_user){
        alertNotLoggedIn();
        return;
    }
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

class FolderMeta{
    constructor(data:any){
        let ok = Object.keys(data);
        for(const key of ok){
            this[key] = data[key];
        }
    }
    name:string;
    itemCount:number;
    parent:string;
    fid:string;
    folder:string;

    // 

    moveToFolder(fid:string){
        return new Promise<boolean>(resolve=>{
            socket.emit("moveFolderToFolder",this.fid,fid,(res:any)=>{
                if(!handleEndpointError(res,"while trying to move project to folder")){
                    resolve(false);
                    return;
                }
                resolve(true);
            });
        });
    }
}

// Editor Dashboard
class ProjectDashboard extends Menu{
    constructor(){
        super("Project Dashboard","list");
    }
    navCont:Element;
    content:Element;
    _sectionI:number;

    path:{
        fid:string,
        name:string,
        isRoot?:boolean
    }[] = [];

    i_searchQuery:HTMLInputElement;
    lastSearchQuery:string;

    load(priority?: number){
        super.load(priority);
        this.body.innerHTML = `
            <div class="flx edb-body">
                <div class="edb-nav">
                    <div class="edb-cont">
                        <div>
                            <input type="text" placeholder="Search..." class="i-search-query">
                        </div>
                        <div class="edb-nav-cont">
                            <button class="icon-btn regular sel">
                                <div class="material-symbols-outlined">face</div>
                                <div>Personal</div>
                            </button>
                            <button class="icon-btn regular sel">
                                <div class="material-symbols-outlined">experiment</div>
                                <div>Projects</div>
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
                                <div>Starred</div>
                            </button>
                        </div>
                    </div>
                    <div class="edb-cont">
                        <button class="b-new-folder icon-btn regular">
                            <div class="material-symbols-outlined">create_new_folder</div>
                            <div>New Folder</div>
                        </button>
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

        // setup path
        this.path = [{
            name:"",
            fid:g_user.data.rootFolder,
            isRoot:true
        }];

        this.i_searchQuery = this.body.querySelector(".i-search-query");
        whenEnter(this.i_searchQuery,v=>{
            if(this.i_searchQuery.value == this.lastSearchQuery) return;
            this.reloadSection();
        });
        this.i_searchQuery.focus();

        // 

        let b_newProject = this.body.querySelector(".b-new-project") as HTMLButtonElement;
        b_newProject.addEventListener("click",e=>{
            // let name = prompt("Enter project name:","New Project");
            let name = "New Project";
            let menu = new InputMenu(
                "New Project","Project Name",
                (projname:string)=>{
                    name = projname;
                    if(!name) return;
                    createNewProject(name,undefined,this.getCurFolderFID());
                },
                () => {
                    console.log("Canceled new project creation");
                },
                undefined,undefined,"Choose a name to identify your project with.<br><br>","<br>"
            );
            menu._newLayer = true;
            menu.load();
        });
        let b_newFolder = this.body.querySelector(".b-new-folder") as HTMLButtonElement;
        b_newFolder.addEventListener("click",e=>{
            let menu = new InputMenu(
                "New Folder","Folder Name",
                async (name:string)=>{
                    if(!name) return;
                    let res = await g_user.createNewFolder(name,this.getCurFolderFID());
                    if(!res) return;
                    
                    await this.reloadSection();
                },
                ()=>{},
                undefined,undefined,"Choose a name for your new folder.<br><br>","<br>"
            );
            menu._newLayer = true;
            menu.load();
        });

        let navCont = this.body.querySelector(".edb-nav-cont");
        let content = this.body.querySelector(".edb-content-list");
        this.navCont = navCont;
        this.content = content;
        for(let i = 0; i < navCont.children.length; i++){
            let b = navCont.children[i];
            b.addEventListener("mousedown",e=>{
                this.loadSection(i);
            });
        }
        this.loadSection(project ? (project.meta?.cid != null ? 1 : 0) : 0);

        return this;
    }
    async reloadSection(){
        let top = this.content.parentElement.scrollTop;
        await this.loadSection(this._sectionI);
        this.content.parentElement.scrollTop = top;
    }
    _isLoadingSection = false;
    startLoadingSection(){
        if(this._isLoadingSection) return false;
        this._isLoadingSection = true;
        return true;
    }
    endLoadingSection(){
        this._isLoadingSection = false;
    }
    async loadSection(i:number){
        if(!this.startLoadingSection()) return;
        this.lastSearchQuery = this.i_searchQuery.value;

        this._sectionI = i;
        let navCont = this.navCont;
        let b = navCont.children[i];
        for(const c of navCont.children){
            c.classList.remove("sel");
        }
        b.classList.add("sel");
        curProjectSettingsMeta = null;
        curProjectSettingsMetaPID = null;
        this.content.textContent = "";
    
        if(i > 0){
            let t = this;
            async function tryGet(){
                return new Promise<any[]>(resolve=>{
                    // console.log("send...");
                    socket.emit("user-getProjectList",t.i_searchQuery.value,i,null,(data:any[])=>{ // TODO - null right now is the fid for the folder to search in
                        // console.log("DATA",data);
                        if(typeof data == "number") data = [];
                        resolve(data || []);
                    });
                });
            }
            let raw = await tryGet();
            // if(raw == -3){ // might need this because of weird chromium browser cache
    
            // }
            // let list = raw.map(v=>JSON.parse(v) as ProjectMeta);
            let list = raw.map(v=>v as ProjectMeta);
    
            // sorting
            list = list.sort((a,b)=>{
                // let aTime = a.wc ? new Date(a.wc).getTime() : 0;
                // let bTime = b.wc ? new Date(b.wc).getTime() : 0;
                let aTime = a.wls ? new Date(a.wls).getTime() : 0;
                let bTime = b.wls ? new Date(b.wls).getTime() : 0;
                return aTime-bTime;
            });
            
            for(const c of list){
                this.loadProjectItem(new ProjectMeta2(c));
            }

            // reset for when coming back to personal
            // this.path = []; // actually I decided it's better without the reset

            this.endLoadingSection();
            return;
        }

        // load personal

        let data = await new Promise<{
            projects:any[], // add more things later here if needed
            folders:any[]
        }>(resolve=>{
            socket.emit("user-getFilesList",this.i_searchQuery.value,this.path.length > 0 ? this.path[this.path.length-1].fid : null,(data:any)=>{
                if(!data || data?.err){
                    alert(`Error ${data?.err} while trying to get personal files`);
                    resolve(null);
                }
                else resolve(data);
            });
        });
        if(!data){
            this.endLoadingSection();
            return;
        }

        // console.log("GOT DATA:",data.projects,data.folders);

        this.loadCurrentPathItem();
        if(this.path.length){
            let cur = this.getCurFolder();
            if(cur ? !cur.isRoot : false) this.loadGoUpLevelItem();
        }

        if(data.folders){
            data.folders.sort((a,b)=>a.name.localeCompare(b.name));
            for(const item of data.folders){
                this.loadFolderItem(new FolderMeta(item));
            }
        }
        if(data.projects){
            data.projects.sort((a,b)=>a.name.localeCompare(b.name));
            for(const item of data.projects){
                this.loadProjectItem(new ProjectMeta2(item));
            }
        }

        this.endLoadingSection();
    }
    getCurFolderFID(){
        if(this.path.length == 0) return null;
        return this.path[this.path.length-1].fid;
    }
    getCurFolder(){
        return this.path[this.path.length-1];
    }
    getLastFolderFID(){
        return this.path[this.path.length-2]?.fid;
    }
    async goUpFolder(){
        this.path.pop();
        await this.reloadSection();
    }
    async openFolder(data:FolderMeta){
        this.path.push(data);
        await this.reloadSection();
    }
    scrollToItem(data:ProjectMeta2|FolderMeta){
        let div:HTMLElement;
        if(data instanceof ProjectMeta2){
            div = this.body.querySelector(".pi-"+data.pid);
        }
        else if(data instanceof FolderMeta){
            div = this.body.querySelector(".fi-"+data.fid);
        }
        if(!div) return;
        console.log("...scrolling to...");
        div.scrollIntoView({behavior:"smooth"});
        div.classList.add("highlight");
        setTimeout(()=>{
            div.classList.remove("highlight");
        },1500);
    }
    loadProjectItem(meta:ProjectMeta2){
        let div = document.createElement("div");
        div.className = "project-item";
        div.classList.add("pi-"+meta.pid);
        div.innerHTML = `
            <div class="project-info">
                <div class="l-project-name">
                    <div class="star">star</div>
                    <div class="l-project-name-label">${meta.name}</div>
                    <div co-label="${meta.sub ? "Submitted" : "In Progress"}" class="p-icon ic-submitted ${meta.cid != null ? "" : "hide"}">${meta.sub ? "cloud_done" : "fitness_center"}</div>
                    <div co-label="${meta.isPublic ? "Public" : "Private"}" class="p-icon ic-vis ${meta.isPublic ? "" : "hide"}">${meta.isPublic ? "public" : "lock"}</div>
                    <!--<div co-label="${meta.isPublic ? "Public" : "Private"}" class="p-icon ic-vis ${meta.isPublic && !meta.sub ? "" : "hide"}">${meta.isPublic ? "public" : "lock"}</div>-->
                    <div style="margin-right:10px"></div>
                </div>
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
        this.content.appendChild(div);
        let l_pname = div.querySelector(".l-project-name-label");
        let b_openProject = div.querySelector(".b-open-project");
        b_openProject.addEventListener("click",e=>{
            openProjectSuper(meta.pid,meta.owner);
        });
        if(meta.cid != null){
            b_openProject.classList.add("challenge");
            b_openProject.children[1].textContent = "Practice";
        }

        let b_ops = div.querySelector(".b-ops") as HTMLButtonElement;
        b_ops.addEventListener("click",e=>{
            new ProjSettingsMenu(meta,this,div).load();
            return;
            let cur = openCurProjSettingsMeta(meta,{
                onrename(v:string){
                    l_pname.textContent = v;
                }
            });
            // b_ops.parentElement.insertAdjacentElement("afterend",cur);
            if(cur) div.insertAdjacentElement("beforebegin",cur);
        });

        let b_star = div.querySelector(".star");
        b_star.addEventListener("click",async e=>{
            if(!meta.starred){
                let res = await starProject(meta.pid);
                if(res){
                    div.classList.add("starred");
                    meta.starred = true;
                }
            }
            else{
                let res = await unstarProject(meta.pid);
                if(res){
                    div.classList.remove("starred");
                    meta.starred = false;
                }
            }
        });
        if(meta.starred) div.classList.add("starred");

        // setupCallout(b_star,"Star Project"); // might be annoying to have this
        let ic_sub = div.querySelector(".ic-submitted");
        let ic_vis = div.querySelector(".ic-vis");
        setupCallout(ic_sub,null);
        setupCallout(ic_vis,null);

        ic_sub.addEventListener("click",e=>{
            // location.href = "/practice/index.html?cid="+meta.cid;
            open("/practice/index.html?cid="+meta.cid,"_blank");
        });
        ic_vis.addEventListener("click",e=>{
            open(getPublicProjectURL(meta.owner,meta.pid),"_blank");
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

        if(this._sectionI == 0) div.addEventListener("mousedown",e=>{
            dragItem = new DragData<ProjectMeta2>(e,down=>{
                return div.cloneNode(true) as HTMLElement;
            },last=>{

            },div,{
                className:""
            });
            dragItem.down = meta;
        });
    }
    loadFolderItem(item:FolderMeta){
        let div = document.createElement("div");
        div.className = "project-item folder-item";
        div.classList.add("fi-"+item.fid);
        div.tabIndex = 0; // not sure if this is necessary because it don't work for selection now anyways
        div.innerHTML = `
            <div class="project-info">
                <div class="l-project-name">
                    <div class="main-icon material-symbols-outlined">folder</div>
                    <div class="l-project-name-label">${item.name} (${item.itemCount})</div>
                    <div style="margin-right:10px"></div>
                </div>
            </div>
            <div class="flx-sb" style="gap:5px">
                <button class="icon-btn-single accent smaller b-ops">
                    <div class="material-symbols-outlined">discover_tune</div>
                </button>
            </div>
        `;
        this.content.appendChild(div);

        div.children[0].addEventListener("click",e=>{
            if(!dragItem) return; // if there was no drag item then that means it was destroyed before the click finished, so a drag had occured
            this.openFolder(item);
        });

        div.addEventListener("mousedown",e=>{
            dragItem = new DragData<FolderMeta>(e,down=>{
                return div.cloneNode(true) as HTMLElement;
            },last=>{

            },div,{
                className:""
            });
            dragItem.down = item;
        });
        setupHoverDestination<ProjectMeta2|FolderMeta>(div,async data=>{
            if(!data) return;
            if(!data.moveToFolder) return;

            if(await data.moveToFolder(item.fid)){
                await this.openFolder(item);
                this.scrollToItem(data);
            }
        });

        let b_ops = div.querySelector(".b-ops");
        b_ops.addEventListener("click",e=>{
            new FolderSettingsMenu(item,this).load(undefined,true);
        });
    }
    loadCurrentPathItem(){
        let div = document.createElement("div");
        div.className = "current-path-item";
        div.innerHTML = `
            <div class="project-info">
                <div class="l-project-name">
                    <div class="l-project-name-label d-list"></div>
                    <div style="margin-right:10px"></div>
                </div>
            </div>
        `;
        let list = div.querySelector(".d-list");
        
        for(let i = 0; i < this.path.length; i++){
            let data = this.path[i];
            let item = document.createElement("div");
            item.textContent = data.name;
            list.appendChild(item);
        }

        this.content.appendChild(div);
    }
    loadGoUpLevelItem(){
        let div = document.createElement("div");
        div.className = "project-item folder-item";
        div.innerHTML = `
            <div class="project-info">
                <div class="l-project-name">
                    <!--<div class="main-icon material-symbols-outlined">folder</div>-->
                    <div class="l-project-name-label">[Go Up Level]</div>
                    <div style="margin-right:10px"></div>
                </div>
            </div>
        `;
        this.content.appendChild(div);

        div.addEventListener("click",e=>{
            this.goUpFolder();
        });

        setupHoverDestination<ProjectMeta2|FolderMeta>(div,async data=>{
            if(!data) return;
            
            let fid = this.getLastFolderFID();
            if(fid){
                if(await data.moveToFolder(fid)){
                    await this.goUpFolder();
                    this.scrollToItem(data);
                }
            }
        });
    }
}

async function createNewProject(name:string,desc="A project for experiments.",fid:string){
    let pid = await new Promise<string>(resolve=>{
        console.log("...creating project");
        socket.emit("createProject",name,desc,fid,(pid:string)=>{
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
    await openProjectSuper(pid,g_user.data.uid);
    closeAllMenus();
}
async function openProjectSuper(pid:string,uid:string){
    // if(!project) await loadProject(g_user.data.uid,pid);
    if(!project){
        let res = await loadProject(uid,pid);
        if(!res) return;
    }
    else goToProject(pid,uid);
    closeAllMenus();
}

let b_editorDashboard = document.querySelector(".b-editor-dashboard");
let d_curProject = document.querySelector(".d-current-project");

let projDash = new ProjectDashboard();

b_editorDashboard.addEventListener("click",e=>{
    projDash.load();
});
d_curProject.addEventListener("click",e=>{
    // openCurProjSettings();
    if(!project) return;
    new ProjSettingsMenu(project.meta).load();
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

async function deleteProject(meta:ProjectMeta,div?:HTMLElement){
    return new Promise<boolean>(resolve=>{
        new ConfirmMenu(
            "Delete Project","Are you sure you want to delete project:<br>\""+meta.name+"\" ?<br><br>There is no reversing this option.",
            () => {
                socket.emit("deleteProject",meta.pid,(res:number)=>{
                    if(res != 0){
                        resolve(false);
                        alert("There was an error deleting the project, error code: "+res);
                        return;
                    }
                    let item = document.querySelector(".pi-"+meta.pid);
                    // if(item) item.remove();
                    // if(div) div.remove();
                    resolve(true);
                    if(project?.pid == meta.pid) reloadPage();
                });
            },
            () => { return; }
        ).load();
    })
}
async function unlinkProject(meta:ProjectMeta){
    return new Promise<boolean>(resolve=>{
        new ConfirmMenu(
            "Unlink Project","Are you sure you want to unlink the challenge with this project:<br>\""+meta.name+"\" ?<br><br>There is no reversing this option.",
            () => {
                socket.emit("unlinkProject",meta.pid,(res:number)=>{
                    if(res != 0){
                        resolve(false);
                        alert("There was an error unlinking the project, error code: "+res);
                        return;
                    }
                    // let item = document.querySelector(".pi-"+meta.pid); // paul: i left these commented lines here caleb, idk if they're necessary. I implemented confirmMenu and it seems to work
                    // if(item) item.remove();
                    // div.remove();
                    resolve(true);
                    if(project?.pid == meta.pid) location.reload(); // caleb: I put this one back since you don't want to reload when unlinking a project that isn't open right now
    
                    // location.reload();
                });
            },
            () => { return; }
        ).load();
    });
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
        deleteProject(meta,div);
        // if(!confirm(`Are you sure you want to delete project: "${meta.name}" ?\n\nThere is no reversing this option.`)) return;
        // socket.emit("deleteProject",meta.pid,(res:number)=>{
        //     console.log("delete project res: ",res);
        //     if(res != 0){
        //         alert("There was an error deleting the project, error code: "+res);
        //         return;
        //     }
        //     let item = document.querySelector(".pi-"+meta.pid);
        //     if(item) item.remove();
        //     div.remove();
        //     if(project?.pid == meta.pid) location.reload();
        // });
    });
    setupCallout(b_deleteProject,"Delete Project");

    let b_unlinkProject = div.querySelector(".b-unlink-project") as HTMLButtonElement;
    if(!meta.cid) b_unlinkProject.style.display = "none";
    b_unlinkProject.addEventListener("click",e=>{
        // if(!confirm(`Are you sure you want to unlink the challenge with this project: "${meta.name}" ?\n\nThere is no reversing this option.`)) return;
        unlinkProject(meta);
    });

    // 
    div.style.position = "static";
    div.style.marginLeft = "10px";

    return div;
}

class FolderSettingsMenu extends Menu{
    constructor(meta:FolderMeta,dash:ProjectDashboard){
        super("Folder Settings","settings");
        this.meta = meta;
        this.dash = dash;
    }
    meta:FolderMeta;
    dash:ProjectDashboard;

    i_name:HTMLInputElement;
    b_save:HTMLButtonElement;
    b_delete:HTMLButtonElement;
        
    load(priority?: number, newLayer?: boolean): this {
        super.load(priority,newLayer);
        this.menu.style.height = "max-content";
        this.menu.style.width = "420px";
        
        this.body.innerHTML = `
            <div>
                <div class="i-name">
                    <div class="title">Name</div>
                    <input type="text" class="i-name">
                </div>
            </div>
            <br><br>
            <div style="display:flex;gap:20px;justify-content:space-between">
                <button class="b-save-changes load-btn icon-btn normal" disabled>
                    <div class="material-symbols-outlined">save</div>
                    <div>Save Changes</div>
                </button>

                <button class="b-delete-folder icon-btn warn">
                    <div class="material-symbols-outlined">delete</div>
                    <div>Delete Folder</div>
                </button>
            </div>
        `;

        let i_name = this.setupTextInput(".i-name",{
            label:"Name"
        });
        this.i_name = i_name.inp;
        i_name.div.style.width = "max-content";
        i_name.inp.focus();
        i_name.inp.placeholder = this.meta.name;
        i_name.inp.value = this.meta.name;

        i_name.inp.addEventListener("input",e=>{
            if(i_name.inp.value != this.meta.name && i_name.inp.value != ""){
                this.b_save.disabled = false;
            }
            else this.b_save.disabled = true;
        });
        whenEnter(i_name.inp,v=>{
            this.saveChanges();
        },true);

        this.b_save = this.body.querySelector(".b-save-changes");
        this.b_save.addEventListener("click",e=>{
            this.saveChanges();
        });

        this.b_delete = this.body.querySelector(".b-delete-folder");
        this.b_delete.addEventListener("click",e=>{
            this.deleteFolder();
        });

        return this;
    }
    saveChanges(){
        this.b_save.classList.add("loading");
        socket.emit("updateFolderMeta",this.meta.fid,this.i_name.value,async (res:any)=>{
            if(!handleEndpointError(res,"while trying to update folder meta")) return;
            await this.dash.reloadSection();
            this.close();
        });
    }
    deleteFolder(){
        if(!confirm(`Are you sure you want to delete the folder: "${this.meta.name}"?\n\nIf this folder contains other folders or projects they will be deleted as well!\n\nThis is not reversable!`)) return;
        this.b_save.classList.add("loading");
        socket.emit("deleteFolder",this.meta.fid,async (res:any)=>{
            if(!handleEndpointError(res,"while trying to delete folder")) return;
            await this.dash.reloadSection();
            this.close();
        });
    }
}
class ProjSettingsMenu extends Menu{
    constructor(meta:ProjectMeta,dash?:ProjectDashboard,divItem?:Element){
        super("Project Settings","settings");
        this.meta = meta;
        this.dash = dash;
        this.divItem = divItem;
    }
    meta:ProjectMeta;
    dash:ProjectDashboard;
    divItem:Element;
    load(priority?: number): this {
        if(!this.meta){
            console.warn("Failed to open project settings menu, no project specified");
            return;
        }
        super.load(priority,true);

        if(this.meta.cid == null) this.menu.classList.add("experiment-menu");
        else this.menu.classList.add("practice-menu");
        this.body.innerHTML = `
            <div class="op-div">General</div>
            <div class="op-cont ps-general">
                <div>
                    <div>
                        <div class="title">Name</div>
                        <input type="text" class="i-name">
                    </div>
                    <button class="b-save-changes load-btn icon-btn normal" disabled>
                        <div class="material-symbols-outlined">save</div>
                        <div>Save Changes</div>
                    </button>
                </div>
                <div>
                    <div class="title">Description</div>
                    <textarea class="i-desc" style="resize:none"></textarea>
                </div>
            </div>

            <div class="op-div">Privacy</div>
            <div class="op-cont">
                <div>
                    <div class="title">Visibility</div>
                    <div class="text">Whether or not other users are allowed to view your project.</div>
                </div>
                <button class="b-toggle-privacy icon-btn-v load-btn left">
                    <div class="material-symbols-outlined">lock</div>
                    <div>Private</div>
                </button>
            </div>

            <div class="op-div full-width">
                <span>Dangerous</span>
                <span class="text">These options are irreversible.</span>
            </div>
            <div class="op-cont">
                <button class="b-delete-project icon-btn warn">
                    <div class="material-symbols-outlined">delete</div>
                    <div>Delete Project</div>
                </button>
                ${
                    this.meta.cid != null ? `
                    <button class="b-unlink-project icon-btn warn">
                        <div class="material-symbols-outlined">link_off</div>
                        <div>Unlink From Challenge</div>
                    </button>
                    `:""
                }
            </div>
        `;

        let i_name = this.body.querySelector(".i-name") as HTMLInputElement;
        let i_desc = this.body.querySelector(".i-desc") as HTMLTextAreaElement;
        let b_save = this.body.querySelector(".b-save-changes") as HTMLButtonElement;
        let b_privacy = this.body.querySelector(".b-toggle-privacy") as HTMLButtonElement;
        let b_deleteProject = this.body.querySelector(".b-delete-project") as HTMLButtonElement;
        let b_unlinkProject = this.body.querySelector(".b-unlink-project") as HTMLButtonElement;

        i_name.value = this.meta.name;
        i_desc.value = this.meta.desc;

        i_name.addEventListener("input",e=>{
            if(i_name.value == "" || i_name.value == this.meta.name) b_save.disabled = true;
            else b_save.disabled = false;
        });
        i_desc.addEventListener("input",e=>{
            if(i_desc.value == this.meta.desc) b_save.disabled = true;
            else b_save.disabled = false;
        });

        let updatePrivacy = ()=>{
            b_privacy.children[0].textContent = (this.meta.isPublic?"public":"lock");
            b_privacy.children[1].textContent = (this.meta.isPublic?"Public":"Private");
            if(this.dash) this.dash.reloadSection();
        }
        updatePrivacy();

        b_save.addEventListener("click",e=>{
            b_save.classList.add("loading");
            let _starTime = performance.now();
            socket.emit("updatePMeta",this.meta.pid,{
                name:(i_name.value || null),
                desc:(i_desc.value || null)
            },async (res:any,name:string,desc:string)=>{
                let time = performance.now()-_starTime;
                let timeLimit = 300;
                if(time < timeLimit) await wait(timeLimit-time);
                b_save.classList.remove("loading");

                if(res != 0){
                    alert(`Error ${res} while trying to save changes to project info`);
                    return;
                }
                
                d_curProject.textContent = name;
                b_save.disabled = true;

                if(this.divItem){
                    let l_name = this.divItem.querySelector(".l-project-name-label");
                    let l_desc = this.divItem.querySelector(".l-project-desc");
                    if(l_name) l_name.textContent = name;
                    if(l_desc) l_desc.textContent = desc;
                }

                this.meta.name = name;
                this.meta.desc = desc;
                if(this.dash) this.dash.reloadSection();
            });
        });
        b_privacy.addEventListener("click",e=>{
            b_privacy.classList.add("loading");
            let _starTime = performance.now();
            socket.emit("setProjVisibility",this.meta.pid,!this.meta.isPublic,async (res:any,v:boolean)=>{
                let time = performance.now()-_starTime;
                let timeLimit = 300;
                if(time < timeLimit) await wait(timeLimit-time);
                b_privacy.classList.remove("loading");

                if(res != 0){
                    alert(`Error ${res} while trying to change project visibility`);
                    return;
                }

                this.meta.isPublic = v;
                updatePrivacy();
            });
        });
        b_deleteProject.addEventListener("click",async e=>{
            await deleteProject(this.meta,this.divItem as HTMLElement);
            if(this.dash) this.dash.reloadSection();
            this.close();
        });
        if(b_unlinkProject) b_unlinkProject.addEventListener("click",async e=>{
            await unlinkProject(this.meta);
            if(this.dash) this.dash.reloadSection();
            this.close();
        });

        if(!this.meta.canEdit){
            b_privacy.disabled = true;
            b_deleteProject.disabled = true;
            if(b_unlinkProject) b_unlinkProject.disabled = true;
            i_name.disabled = true;
            i_desc.disabled = true;
        }
        
        return this;
    }
}

window.addEventListener("beforeunload",e=>{
    if(project) if(!project.canLeave()){
        _usedConfirmLeavePopup = true;
        socket.disconnect();
        e.stopPropagation();
        e.preventDefault();
        socket.connect();
    }
});