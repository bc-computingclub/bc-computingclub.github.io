let serverURL = "http://localhost:3000";

let settingsList:Setting<any>[] = [];
class Settings{
    invertContrast = new Setting<boolean>("invertContrast",false);
}
class Setting<T>{
    constructor(id:string,v:T){
        this.id = id;
        this.v = v;
        this.default = v;
        this.v = this.get() as T;
        settingsList.push(this);
    }
    id:string;
    v:T;
    default:T;
    save(){
        localStorage.setItem("__CCSD-"+this.id,JSON.stringify(this.v));
    }
    get(){
        let val = localStorage.getItem("__CCSD-"+this.id);
        if(val != null) val = JSON.parse(val);
        if(val != null) this.v = val as T;
        return val || this.v;
    }
    set(v:T){
        this.v = v;
        this.save();
    }
}
let settings = new Settings();

let g_waitDelayScale = 1;
function wait(delay:number){
    return new Promise<void>(resolve=>{
        if(g_waitDelayScale == 0){
            resolve();
            return;
        }
        setTimeout(()=>{
            resolve();
        },delay*g_waitDelayScale);
    });
}

// menus
let menuCont = document.createElement("div");
menuCont.className = "menu-cont";
document.body.insertBefore(menuCont,document.body.children[0]);

let menusOpen:Menu[] = [];
function closeAllMenus(){
    let list = [...menusOpen];
    for(const m of list){
        m.close();
    }
}

class Menu{
    constructor(title:string,icon?:string){
        this.title = title;
        this.icon = icon;
    }
    icon:string;
    title:string;
    menu:HTMLElement;
    body:HTMLElement;

    reset(){
        this.menu = null;
        this.body = null;
    }

    canClose(){
        return true;
    }

    _priority = 0;

    load(priority=0){
        let list = [...menusOpen];
        for(const m of list){
            // if(m._priority < priority) m.close();
            if(m._priority < priority) m.menu.style.display = "none";
        }
        let isHidden = false;
        if(list.some(v=>v._priority > priority)) isHidden = true;

        this._priority = priority;
        
        let t = this;
        
        let menu = document.createElement("div");
        menu.className = "menu";
        menu.classList.add("menu-"+this.title.replaceAll(" ","-").toLowerCase());
        this.menu = menu;
        menuCont.appendChild(menu);

        if(isHidden) menu.style.display = "none";

        let head = document.createElement("div");
        head.className = "menu-header";
        head.innerHTML = `
            <div class="menu-title">
                <div class="material-symbols-outlined">${this.icon || ""}</div>
                <div>${this.title}</div>
            </div>
            ${this.canClose() ? '<div class="material-symbols-outlined b-close">close</div>' : ""}
        `;
        menu.appendChild(head);

        let b_close = head.querySelector(".b-close");
        if(b_close) b_close.addEventListener("click",e=>{
            t.close();
        });

        let cont = document.createElement("div");
        cont.className = "menu-body";
        menu.appendChild(cont);
        this.body = cont;

        if(!menusOpen.length) menuCont.classList.add("show");
        menusOpen.push(this);

        return this;
    }

    close(){
        if(this.menu?.parentElement){
            this.menu.parentElement.removeChild(this.menu);
            this.onClose();
            this.reset();

            menusOpen.splice(menusOpen.indexOf(this),1);

            // restore other menus

            console.log("on close");
            let list = [...menusOpen];
            for(const m of list){
                if(m._priority < this._priority) m.menu.style.display = "block";
            }

            // 

            if(!menusOpen.length) menuCont.classList.remove("show");
        }
    }
    onClose(){}

    // 

    setupTextInput(query:string,ops:{
        label?:string,
        noErrorCheck?:boolean,
        validate?:(v:string)=>Promise<boolean>,
        isPassword?:boolean,
        title?:string;
        hasCheck?:boolean;

        buttonText?:string;
        onClick?:()=>void
    }={}){
        let div = this.body.querySelector(query);
        div.classList.add("inp-cont");
        
        div.innerHTML = `
            <div>${ops.label || ""}</div>
            ${ops.buttonText ? `<button>${ops.buttonText}</button>` : '<input type="text">'}
            ${ops.buttonText ? "" : ops.hasCheck ? `<div><div class="material-symbols-outlined icon-check">progress_activity</div></div>` : ""}
        `;
        let check = div.querySelector(".icon-check");
    
        if(!ops.buttonText){
            let inp = div.querySelector("input");
            inp.spellcheck = !ops.noErrorCheck;
            if(check) inp.addEventListener("input",async e=>{
                if(ops.validate){
                    check.classList.remove("accept","deny");
                    check.textContent = "progress_activity";
                    await wait(250);
                    let res = await ops.validate(inp.value);
                    check.classList.remove("accept","deny");
                    check.classList.add(res?"accept":"deny");
                    check.textContent = (res?"check":"close");
                }
            });

            if(ops.isPassword) inp.type = "password";
            if(ops.title) inp.title = ops.title;

            if(check){
                check.classList.add("deny");
                check.textContent = "close";
            }            
        }
        else{
            let btn = div.querySelector("button");
            btn.addEventListener("click",e=>{
                if(ops.onClick) ops.onClick();
            });
        }
    }
}

class SignUpMenu extends Menu{
    constructor(){
        super("Sign Up","person_add");
    }
    load(priority?:number){
        super.load();
        this.body.innerHTML = `
            <div class="i-email"></div>
            <div class="i-username"></div>
            <div class="i-password"></div>
            <div class="b-submit"></div>
        `;

        this.setupTextInput(".i-email",{
            label:"Email",
            title:"email",
            noErrorCheck:true,
            async validate(v){
                return v.length >= 5;
            },
            hasCheck:true
        });
        this.setupTextInput(".i-username",{
            label:"Username",
            title:"username",
            noErrorCheck:true,
            async validate(v){
                return v.length >= 5;
            },
            hasCheck:true
        });
        this.setupTextInput(".i-password",{
            label:"Password",
            title:"password",
            noErrorCheck:true,
            async validate(v){
                return v.length >= 8;
            },
            isPassword:true,
            hasCheck:true
        });
        this.setupTextInput(".b-submit",{
            buttonText:"Submit",
            onClick(){
                
            }
        });
        return this;
    }
}
class LogInMenu extends Menu{
    constructor(){
        super("Log In","login");
    }
    load(priority?:number) {
        super.load();

        // this.body.innerHTML = `
        //     <div class="i-username"></div>
        //     <div class="i-password"></div>
        //     <div class="b-submit"></div>
        // `;

        // this.setupTextInput(".i-username",{
        //     label:"Username",
        //     title:"username",
        //     noErrorCheck:true,
        //     async validate(v){
        //         return v.length >= 5;
        //     }
        // });
        // this.setupTextInput(".i-password",{
        //     label:"Password",
        //     title:"password",
        //     noErrorCheck:true,
        //     async validate(v){
        //         return v.length >= 8;
        //     },
        //     isPassword:true
        // });
        // this.setupTextInput(".b-submit",{
        //     buttonText:"Submit",
        //     onClick(){
                
        //     }
        // });

        if(true){
            this.body.innerHTML = `
            <div class="two-col">
                <div class="g-cont">
                    <div id="g_id_onload"
                        data-client_id="639454147876-f7ehoq29hcqnmis69l7shgbr2nbtv02o.apps.googleusercontent.com"
                        data-context="use"
                        data-ux_mode="popup"
                        data-callback="handleCredentialResponse"
                        data-auto_prompt="false">
                    </div>
                    
                    <div class="g_id_signin"
                        data-type="standard"
                        data-shape="rectangular"
                        data-theme="outline"
                        data-text="signin_with"
                        data-size="large"
                        data-logo_alignment="left">
                    </div>
                </div>
                <div>
                    <button class="b-continue">Continue</button>
                </div>
            </div>
            `;
            google.accounts.id.renderButton(this.body.querySelector(".g-cont"),{});
            let b_continue = this.body.querySelector(".b-continue");
            b_continue.addEventListener("click",e=>{
                closeAllMenus();
            });
        }
        else{
            if(!socket.connected){
                this.body.textContent = "Failed to connect to the server.";
                return;
            }
            this.body.innerHTML = `
                <div class="two-col">
                    <div>
                        <div class="sign-in-cont">
                            <div>Sign in with Google</div>
                            <div class="si-icon-cont"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="LgbsSe-Bz112c"><g><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></g></svg></div>
                        </div>
                    </div>
                    <div>
                        <!--<button>Continue</button>-->
                    </div>
                </div>
            `;
            let signInBtn = this.body.querySelector(".sign-in-cont") as HTMLElement;
            signInBtn.addEventListener("click",e=>{
                promptSignIn();
            });
        }

        return this;
    }
}

interface CredentialResponse {
    credential:string;
}
interface CredentialResData{
    name:string;
    email:string;
    sanitized_email:string;
    email_verified:boolean;
    picture:string;

    _joinDate:string;
    _lastLoggedIn:string;
}

function decodeJwtResponse(token:string) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  
    return JSON.parse(jsonPayload) as CredentialResData;
}

declare const google:any;
let initializedSignInPrompt = false;

function initializeSignIn(){
    if(!initializedSignInPrompt){
        google.accounts.id.initialize({
            client_id: '639454147876-f7ehoq29hcqnmis69l7shgbr2nbtv02o',
            callback: handleCredentialResponse,
            context:"use",
            ux_mode:"popup",
            auto_prompt:"false"
        });
        initializedSignInPrompt = true;
    }
}
function promptSignIn(){
    if(!initializedSignInPrompt){
        google.accounts.id.initialize({
            client_id: '639454147876-f7ehoq29hcqnmis69l7shgbr2nbtv02o',
            callback: handleCredentialResponse,
            context:"use",
            ux_mode:"popup",
            auto_prompt:"false"
        });
        initializedSignInPrompt = true;
    }
    google.accounts.id.prompt();
}
function handleCredentialResponse(response:CredentialResponse){
    console.log("LOGGED IN: ",response);
    // Your code here

    let data = decodeJwtResponse(response.credential);
    console.log("DATA",data);

    logUserIn(data,response.credential);
    closeAllMenus();
}

let loginProm:Promise<void>;
let _loginRes:()=>void;
loginProm = new Promise<void>(resolve=>{
    _loginRes = resolve;
});
let g_user:CredentialResData;
async function waitForUser(){
    if(!loginProm) return;
    await loginProm;
}
function logUserIn(data?:CredentialResData,token?:string){
    if(!data) data = JSON.parse(localStorage.getItem("logData")) as CredentialResData;
    if(!token) token = localStorage.getItem("token");
    
    if(!data || !token){
        // you are not logged in, cancel prom
        _loginRes();
        _loginRes = null;
        loginProm = null;
        return;
    }
    
    if(data){
        localStorage.setItem("token",token);
        localStorage.setItem("logData",JSON.stringify(data));
        h_profile.classList.add("logged-in");
        h_profile.innerHTML = `
            <img referrerpolicy="no-referrer" src="${data.picture}">
        `;
        let img = h_profile.querySelector("img");
        img.onerror = (err:Event,source,lineno,colno,error)=>{
            if(err) console.warn("> Failed loading profile picture",err.type);
            g_user = null;
            new PromptLoginMenu().load();
            return;
        };

        _login(data,token);
        return;
    }
    // clear user - log out
    h_profile.classList.remove("logged-in");
    h_profile.innerHTML = `<span class="material-symbols-outlined">Person</span>`;
    localStorage.removeItem("logData");
    localStorage.removeItem("token");

    _logout(data);
}

// let testMenu = new SignUpMenu();
// let testMenu2 = new LogInMenu();
// testMenu2.load();
// testMenu.load();

// Gen Header
let d_lesson_confirm:HTMLElement;
function genHeader(i:number,isCompact=true,id:string){
    let navCont = document.createElement("div");
    let noLogo = false;
    console.log("...generating header with id: ",id);
    if(id == "editor" || id == "lesson"){
        noLogo = true;
    }
    navCont.className = "nav-container";
    navCont.role = "navigation";
    navCont.innerHTML = `
        ${!noLogo?`<div class="logo">
        <a href="/index.html">
            <img src="/images/error.png" alt="Code Challenge Logo" class="logo-thumbnail">
            <!-- Insert placeholder logo here -->
        </a>
        </div>`:id=="editor"||id=="lesson"?`
        <div class="editor-menu-bar">
            <div class="b-editor-dashboard icon-div"><div class="material-symbols-outlined co-item" co-label="Project Dashboard">home</div></div>
            <!--<div>File</div>
            <div>Edit</div>
            <div>View</div>-->
        </div>
        <div class="cur-project-controls">
            <div class="d-current-project">. . .</div>
            <div class="b-save icon-div"><div class="material-symbols-outlined">save</div></div>
            <div class="icon-div hide"><div class="material-symbols-outlined">play_arrow</div></div>
        </div>
        `:""}
        <div class="d-lesson-confirm none">
            <div>Press "I'm Done" to let the Tutor know when you're done with this step.</div>
            <button class="b-im-done icon-btn">
                <div class="material-symbols-outlined">done</div>
                <div>I'm Done</div>
            </button>
            <button class="b-replay"><div class="material-symbols-outlined">replay</div></button>
            <button style="display:none" class="b-go-back-step"><div class="material-symbols-outlined">keyboard_double_arrow_left</div></button>
        </div>
        <div class="nav-links">
            <a href="/learn/lesson/index.html" class="nav-link">Learn <span class="material-symbols-outlined">Auto_stories</span></a>
            <a href="/practice/index.html" class="nav-link">Practice <span class="material-symbols-outlined">Checkbook</span></a>
            <a href="/editor/index.html" class="nav-link">Experiment <span class="material-symbols-outlined">Experiment</span></a>
            <a class="h-profile"><span class="material-symbols-outlined">Person</span></a>
        </div>
    `;
    if(isCompact) navCont.classList.add("compact");
    document.body.appendChild(navCont);
    let links = navCont.querySelectorAll(".nav-link");
    links[i].classList.add("active");
    document.body.classList.add([
        "learn-page",
        "practice-page",
        "experiment-page"
    ][i]);

    d_lesson_confirm = document.querySelector(".d-lesson-confirm") as HTMLElement;
}

// Add General Scripts
function addScript(src:string,isAsync=false,call?:()=>void){
    let sc = document.createElement("script");
    sc.src = src;
    sc.async = isAsync;
    document.body.appendChild(sc);
    if(call) sc.onload = function(){
        call();
    };
}
// addScript("/out/pre_init.js");
addScript("https://accounts.google.com/gsi/client",true,()=>{
    initializeSignIn();
});

// Pane Resizing
window.addEventListener("resize",e=>{
    onResize();
});
let onResize = function(isFirst?:boolean,who?:HTMLElement){};
// let d_files:HTMLElement;
let main:HTMLElement;
// let codeCont:HTMLElement;

let pane_lesson:HTMLElement;
let pane_files:HTMLElement;
let pane_tutor_code:HTMLElement;
let pane_code:HTMLElement;
let pane_preview:HTMLElement;

class Project{
    constructor(title:string,parent:HTMLElement,settings:{readonly?:boolean,disableCopy?:boolean}={}){
        this.title = title;
        this.items = [];
        this.files = [];
        this.openFiles = [];
        this.hlItems = [];
        this.parent = parent;

        this.readonly = settings.readonly || false;
        this.disableCopy = settings.disableCopy || false;
    }
    pid:string;
    title:string;
    items:FItem[];
    files:FFile[];
    openFiles:FFile[];
    curFile:FFile;
    lastFolder:FFolder;
    desc:string;
    isPublic:boolean;

    parent:HTMLElement;
    d_files:HTMLElement;
    codeCont:HTMLElement;

    hlItems:FItem[];

    readonly = false;
    disableCopy = false;

    hasSavedOnce = false;
    needsSave = false;

    // right click actions

    renameFItem(f:FItem){
        if(!f) return;
        let newName = prompt("Old name: "+f.name+"\n\nEnter new name: ",f.name);
        if(newName == f.name || newName == null || newName == ""){
            close();
            return;
        }
        if(newName.includes("/") || newName.includes("..")){
            alert("Invalid file/folder name");
            close();
            return;
        }
        socket.emit("renameFItem",f.p.pid,calcFolderPath(f.folder),f.name,newName,((res:number)=>{
            console.log("RES RENAME: ",res);
            if(res != 0) return;
            f.name = newName;
            if(f instanceof FFile){
                if(f.link) f.link.children[0].textContent = newName;
                if(f._fi) f._fi.textContent = newName;
            }
            else if(f._fi) f._fi.children[0].children[1].textContent = newName;
            close();
        }));
    }
    async deleteFItem(f:FItem){
        if(!f) return;
        let list:FItem[] = [];
        if(f.p.hlItems.length){
            for(const f1 of f.p.hlItems){
                list.push(f1);
            }
        }
        else list.push(f);
        if(!confirm("Are you sure you want to delete: ["+list.map(v=>v.name).join(", ")+"] ?\n\nThere is no reversing this option!")) return;
        for(const f1 of list){
            let res = await new Promise<number>(resolve=>{
                socket.emit("deleteFItem",f1.p.pid,calcFolderPath(f1.folder),f1.name,((res:number)=>{
                    console.log("RES delete: ",res);
                    resolve(res);
                }));
            });
            if(res == 0){
                let items = (f1.folder ? f1.folder.items : f1.p.items);
                items.splice(items.indexOf(f1),1);
                f1._fi.remove();
            }
            await wait(100);
        }
        f.p.deselectHLItems();
    }
    cutFItems(f:FItem){
        if(!f) return;
        fclipboard.files = [];
        if(f.p.hlItems.length) for(const f1 of f.p.hlItems){
            fclipboard.files.push(f1);
        }
        else fclipboard.files.push(f);
        fclipboard.action = "cut";
        f.p.deselectHLItems();
        console.log("Cut "+fclipboard.files.length+" items into the clipboard");
    }
    copyFItems(f:FItem){
        if(!f) return;
        fclipboard.files = [];
        if(f.p.hlItems.length) for(const f1 of f.p.hlItems){
            fclipboard.files.push(f1);
        }
        else fclipboard.files.push(f);
        fclipboard.action = "copy";
        f.p.deselectHLItems();
        console.log("Copied "+fclipboard.files.length+" items into the clipboard");
    }
    async pasteFItems(f:FItem,cb:(list:FItem[])=>void){
        if(!f) return;
        let folder = (f instanceof FFolder ? f : f.folder);
        // let folder = f.p.lastFolder;
        // if(!folder) folder = f.p.curFile?.folder;
        let amt = fclipboard.files.length;
        let effected:FItem[] = [];
        for(const f1 of fclipboard.files){
            let item:FItem;
            if(fclipboard.action == "cut"){
                await moveFile(f1,folder,true);
                item = f1;
                effected.push(f1);
            }
            else if(fclipboard.action == "copy"){
                if(f1 instanceof FFile) item = f.p.createFile(f1.name,f1.text,null,folder,true);
                else if(f1 instanceof FFolder) item = f.p.createFolder(f1.name,folder,true);
                effected.push(item);
            }
            if(!item) continue;
            f.p.hlItems.push(item);
            item._fi.classList.add("hl2");
        }
        close();
        await saveProject();
        // await wait(500);
        f.p.deselectHLItems();
        for(const f1 of effected){
            if(f1) f1.p.flashAddHLItem(f1);
        }
        if(fclipboard.action == "cut"){
            fclipboard.files = [];
            fclipboard.action = null;
        }
        console.log("Pasted "+amt+" items from the clipboard");
        if(cb) cb(effected);
    }

    // 

    addHLItem(f:FItem){
        if(this.hlItems.includes(f)) return;
        this.hlItems.push(f);
        f._fi.classList.add("hl2");
    }
    removeHLItem(f:FItem){
        let i = this.hlItems.indexOf(f);
        if(i == -1) return;
        this.hlItems.splice(i,1);
        f._fi.classList.remove("hl2");
    }
    async flashAddHLItem(f:FItem){
        this.addHLItem(f);
        await wait(500);
        this.removeHLItem(f);
    }
    deselectHLItems(){
        for(const item of this.hlItems){
            item._fi.classList.remove("hl2");
        }
        this.hlItems = [];
        _multiSelLast = null;
        _multiSelFolder = null;
    }

    getURL(){
        if(PAGE_ID == PAGEID.editor) return serverURL+"/project/"+g_user.sanitized_email+"/"+socket.id+"/"+g_user.sanitized_email+"/"+project.pid;
        else if(PAGE_ID == PAGEID.lesson) return serverURL+"/lesson/"+g_user.sanitized_email+"/"+socket.id+"/"+g_user.sanitized_email+"/"+lesson.lid;
    }

    findFile(name:string){
        return this.files.find(v=>v.name == name);
    }
    createFile(name:string,text:string,lang?:string,folder?:FFolder,isNew=false){
        let same = (folder ? folder.items : this.items).find(v=>v.name == name);
        if(same){
            if(same instanceof FFile){
                if(confirm("There is already a file in this folder with the name: "+name+".\n\nDo you want to override it?\n(Press cancel to skip)")){
                    if(same.editor){
                        same.editor.setValue(text);
                    }
                    same.text = text;
                    same.setSaved(false);
                }
                return;
            }
            else if(same instanceof FFolder){
                alert("There is already a folder in this location with the name: "+name+", skipping...");
                return;
            }
        }

        let res = resolveHook(listenHooks.addFile,name);
        if(res == 1){
            console.warn("Failed creation prevented from hook");
            return;
        }
        if(PAGE_ID == PAGEID.lesson){
            let q = this.findFile(name);
            if(q){
                q.open();
                return q;
            }
        }
        let f = new FFile(this,name,text,folder,lang);
        this.files.push(f);
        if(folder) folder.items.push(f);
        else this.items.push(f);

        if(PAGE_ID == PAGEID.editor){
            createFileListItem(f);
        }
        if(PAGE_ID == PAGEID.lesson) f.open();
        if(!isNew) f.setSaved(true);
        else{
            f.open(false);
        }
        if(PAGE_ID == PAGEID.lesson){
            f.setSaved(true);
            f.setTemp(false);
        }
        return f;
    }
    createFolder(name:string,folder?:FFolder,isNew=true){
        if(name.includes(".")){
            alert("Folder names cannot have '.' characters in them");
            return;
        }
        let same = (folder ? folder.items : this.items).find(v=>v.name == name);
        if(same){
            if(same instanceof FFile){
                alert("There is already a file in this folder with the name: "+name+", skipping...");
                return;
            }
            else if(same instanceof FFolder){
                alert("There is already a folder in this location with the name: "+name+", skipping...");
                return;
            }
        }

        let f = new FFolder(this,name,folder);
        if(folder) folder.items.push(f);
        else this.items.push(f);
        if(PAGE_ID == PAGEID.editor){
            createFolderListItem(f);
        }
        // this.needsSave = true;
        if(isNew){
            f._fiLabel.click();
            saveProject();
        }
        else f._fi.classList.toggle("close");
        return f;
    }

    hasEditor(){
        return (this.curFile?.curEditor != null);
    }
    getCurEditor(){
        return this.curFile?.curEditor;
    }

    init(){
        postSetupEditor(this);
    }

    get isTutor(){ //temp for now
        return this.disableCopy;
    }
}

let fileList:HTMLElement;
let hoverFileListItem:FFile;
let hoverFolderListItems:FFolder[] = [];
// let hoverFolderListItem:FFolder;
function sortFiles(l:any[]){
    l.sort((a,b)=>{
        let dif = ((a.val != null || a.curI != null) && (b.val == null && b.curI == null) ? 1 : ((a.val == null &&a.curI == null) && (b.val != null || b.curI != null) ? -1 : 0));
        if(dif == 0) dif = a.name.localeCompare(b.name);
        return dif;
    });
}
function calcFolderPath(f:FFolder){
    if(!f) return "";
    let list:FFolder[] = [];
    function add(ff:FFolder){
        list.push(ff);
        if(ff.folder) add(ff.folder);
    }
    add(f);
    let path = "";
    for(let i = list.length-1; i >= 0; i--){
        path += list[i].name+"/";
    }
    return path;
}

let fclipboard = {
    files:[] as FItem[],
    action:null
};

let _multiSelLast:FItem;
let _multiSelFolder:FFolder;
function applyMultiSelectFI(e:MouseEvent,f:FItem){
    let isMulti = (e.shiftKey || e.ctrlKey);
    let items = f.p.hlItems;
    // if(items.length) if(f.folder != _multiSelFolder) return true;
    if(items.length) if(f.folder != items[0].folder) return true;
    if(true) if(isMulti) if(items.length == 0){
        let cur:FItem = f.p.curFile;
        if(cur?.folder == f.folder){
            if(cur instanceof FFile){
                if(!items.includes(cur)){
                    items.push(cur);
                    cur._fi.classList.add("hl2");
                    if(f == cur) return true;
                }
            }
        }
        else return true;
        // if(f instanceof FFolder) cur = f.p.lastFolder;
        // if(f){
        //     _multiSelFolder = f.folder;
        //     if(!items.includes(cur)){
        //         items.push(cur);
        //         cur._fi.classList.add("hl2");
        //         if(f == cur) return;
        //     }
        // }
    }
    if(items.includes(f)){
        items.splice(items.indexOf(f),1);
        f._fi.classList.remove("hl2");
    }
    else{
        if(items.length == 0) _multiSelFolder = f.folder;
        items.push(f);
        f._fi.classList.add("hl2");
    }

    if(isMulti) return true;
    // project.deselectHLItems();
    // return false;
    return true;
}

function createFileListItem(f:FFile){
    if(!fileList){
        fileList = document.querySelector(".file-list");
        if(!fileList) return;
        fileList.oncontextmenu = function(e){
            e.preventDefault();
        };
    }
    let div = document.createElement("div");
    div.className = "file-item";
    div.textContent = f.name;

    let list = [...(f.folder?.items ?? f.p.items)];
    if(list.includes(f)) list.splice(list.indexOf(f),1);
    list.push(f);
    sortFiles(list);
    let i1 = list.indexOf(f);
    let fiList:HTMLElement;
    if(f.folder) fiList = f.folder._fiList;
    else fiList = fileList;
    fiList.insertBefore(div,fiList.children[i1]);
    // if(f.folder) f.folder._fiList.appendChild(div);
    // else fileList.appendChild(div);

    setupFItemDropdown(f,div);
    
    f._fi = div;
    div.addEventListener("click",e=>{
        if(!e.ctrlKey && !e.shiftKey) f.p.deselectHLItems();
    });
    div.addEventListener("mousedown",e=>{
        if(!f.p.hlItems.includes(f) && f.p.hlItems.length && !e.ctrlKey && !e.shiftKey){
            f.p.deselectHLItems();
        }
        if(e.button != 0) return;
        if(e.ctrlKey || e.shiftKey){ // multi file select
            // if(applyMultiSelectFI(e,f)) return;
            applyMultiSelectFI(e,f);
            return;
        }

        f.open();
        dragItem = new DragData<FFile>(down=>{
            return div.cloneNode(true) as HTMLElement;
        },async last=>{
            let hover = hoverFolderListItems[hoverFolderListItems.length-1];
            if(hover == last.folder) return;
            let effected:FItem[] = [];
            if(f.p.hlItems.length){
                for(const f1 of f.p.hlItems){
                    await moveFile(f1,hover,true);
                    effected.push(f1);
                    // await wait(100);
                }
            }
            else{
                await moveFile(f,hover,true);
                effected.push(f);
            }
            // if(effected.length) f.p.deselectHLItems();
            for(const f1 of effected){
                f1.p.flashAddHLItem(f1);
            }
            await saveProject();
        });
        dragItem.down = f;
    });
    div.addEventListener("mouseenter",e=>{
        hoverFileListItem = f;
        if(!f.folder) hoverFolderListItems.push(null);
    });
    div.addEventListener("mouseleave",e=>{
        hoverFileListItem = null;
        if(!f.folder) hoverFolderListItems.splice(hoverFolderListItems.indexOf(null),1);
    });
}

function setupFItemDropdown(f:FItem,div:HTMLElement){
    setupDropdown(div,()=>{
        let cpy = "Copy";
        let cut = "Cut";
        let paste = "Paste";

        let p = f.p;
        if(p.hlItems.length){
            cpy += " ("+p.hlItems.length+" items)";
            cut += " ("+p.hlItems.length+" items)";
        }
        if(fclipboard.files.length){
            paste += " ("+fclipboard.files.length+" items)";
        }

        return [
            "Rename",
            "Delete",
            cut,
            cpy,
            paste,
        ];
    },async (i)=>{
        function close(){
            closeAllSubMenus();
        }
        if(i == 0){ // rename
            f.p.renameFItem(f);
        }
        else if(i == 1){ // delete
            await f.p.deleteFItem(f);
            close();
        }
        else if(i == 2){ // cut
            f.p.cutFItems(f);
            close();
        }
        else if(i == 3){ // copy
            f.p.copyFItems(f);
            close();
        }
        else if(i == 4){ // paste
            await f.p.pasteFItems(f,()=>{
                close();
            });
        }
    },(dd)=>{
        div.classList.add("hl");
        if(!fclipboard.files.length) dd.children[4].classList.add("disabled");
    },()=>{
        div.classList.remove("hl");
    },{
        getIcons:()=>{
            return [
                "edit",
                "delete",
                "content_cut",
                "content_copy",
                "content_paste"
            ];
        }
    });
}

async function moveFile(f:FItem,toFolder:FFolder,noSave=false){
    let last = f;
    if(toFolder == last.folder) return;
    let items:FItem[] = [];
    let fiList:HTMLElement;
    if(!toFolder){
        items = f.p.items;
        fiList = fileList;
    }
    else{
        items = toFolder.items;
        fiList = toFolder._fiList;
    }
    let i1 = 0;
    let fromFolder = last.folder;
    
    let res = await new Promise<number>(resolve=>{
        socket.emit("moveFiles",f.p.pid,[f.name],calcFolderPath(fromFolder),calcFolderPath(toFolder),(res:any)=>{
            console.log("move res: ",res);
            resolve(res);
        });
    });
    if(res != 0){
        console.log("failed to move files/folders");
        return;
    }

    let list = [...items];
    if(list.includes(f)) list.splice(list.indexOf(f),1);
    list.push(f);
    sortFiles(list);
    i1 = list.indexOf(f);
    fiList.insertBefore(last._fi,fiList.children[i1]);
    last.folder = toFolder;

    let fromItems = (fromFolder?.items ?? f.p.items);
    let toItems = (toFolder?.items ?? f.p.items);
    fromItems.splice(fromItems.indexOf(f),1);
    toItems.push(f);

    if(toFolder) if(toFolder._fi.classList.contains("close")) toFolder._fi.classList.remove("close");
    if(!noSave) saveProject();
}

function createFolderListItem(f:FFolder){
    if(!fileList){
        fileList = document.querySelector(".file-list");
        if(!fileList) return;
        fileList.oncontextmenu = function(e){
            e.preventDefault();
        };
    }
    let div = document.createElement("div");
    div.className = "folder-item";
    div.innerHTML = `
        <div class=fi-label>
            <div class="material-symbols-outlined b-expand">expand_more</div>
            <div>${f.name}</div>
        </div>
        <div class="fi-list"></div>
    `;

    let list = [...(f.folder?.items ?? f.p.items)];
    if(list.includes(f)) list.splice(list.indexOf(f),1);
    list.push(f);
    sortFiles(list);
    let i1 = list.indexOf(f);
    let fiList:HTMLElement;
    if(f.folder) fiList = f.folder._fiList;
    else fiList = fileList;
    fiList.insertBefore(div,fiList.children[i1]);
    // if(f.folder) f.folder._fiList.appendChild(div);
    // else fileList.appendChild(div);
    
    f._fiLabel = div.querySelector(".fi-label");
    f._fiList = div.querySelector(".fi-list");
    f._fiLabel.addEventListener("click",e=>{
        // if(!e.ctrlKey || !e.shiftKey) f.p.deselectHLItems();
        if(e.shiftKey || e.ctrlKey) return;
        
        div.classList.toggle("close");
        // if(f.p.lastFolder == f) div.classList.toggle("close");
        // let sels = document.querySelectorAll(".folder-item.sel");
        // for(const c of sels){
        //     c.classList.remove("sel");
        // }
        if(f.p.lastFolder) f.p.lastFolder._fiLabel.parentElement.classList.remove("sel");
        div.classList.add("sel");
        f.p.lastFolder = f;
    });
    f._fi = div;

    setupFItemDropdown(f,f._fiLabel);

    f._fiLabel.addEventListener("mousedown",e=>{
        if(!f.p.hlItems.includes(f) && f.p.hlItems.length && !e.ctrlKey && !e.shiftKey){
            f.p.deselectHLItems();
        }
        if(e.button != 0) return;
        if(e.ctrlKey || e.shiftKey){ // multi file select
            // if(applyMultiSelectFI(e,f)) return;
            applyMultiSelectFI(e,f);
            return;
        }

        dragItem = new DragData<FFolder>(down=>{
            return f._fiLabel.cloneNode(true) as HTMLElement;
        },async last=>{
            let hover = hoverFolderListItems[hoverFolderListItems.length-1];
            if(hover == last.folder) return;
            let items:FItem[] = [];
            let fiList:HTMLElement;
            if(!hover){
                items = f.p.items;
                fiList = fileList;
            }
            else{
                items = hover.items;
                fiList = hover._fiList;
                let hasFailed = false;
                function check(folder:FFolder){
                    if(folder == f){
                        hasFailed = true;
                        return;
                    }
                    if(folder.folder) check(folder.folder);
                }
                check(hover);
                if(hasFailed) return;
            }
            let i1 = 0;
            let fromFolder = last.folder;
            
            let res = await new Promise<number>(resolve=>{
                socket.emit("moveFiles",f.p.pid,[f.name],calcFolderPath(fromFolder),calcFolderPath(hover),(res:any)=>{
                    console.log("res: ",res);
                    resolve(res);
                });
            });
            if(res != 0){
                console.log("failed to move files/folders");
                return;
            }

            let list = [...items];
            if(list.includes(f)) list.splice(list.indexOf(f),1);
            list.splice(0,0,f);
            sortFiles(list);
            i1 = list.indexOf(f);
            fiList.insertBefore(last._fiLabel.parentElement,fiList.children[i1]);
            last.folder = hover;

            let fromItems = (fromFolder?.items ?? f.p.items);
            let toItems = (hover?.items ?? f.p.items);
            fromItems.splice(fromItems.indexOf(f),1);
            toItems.push(f);
            saveProject();
        });
        dragItem.down = f;
    });
    div.addEventListener("mouseenter",e=>{
        hoverFolderListItems.push(f);
    });
    div.addEventListener("mouseleave",e=>{
        hoverFolderListItems.splice(hoverFolderListItems.indexOf(f),1);
    });
    // f._fiLabel.addEventListener("mouseenter",e=>{
    //     hoverFolderListItem = f;
    // });
    // f._fiLabel.addEventListener("mouseleave",e=>{
    //     hoverFolderListItem = null;
    // });
}

class FItem{
    constructor(p:Project,name:string,folder:FFolder){
        this.p = p;
        this.name = name;
        this.folder = folder;
    }
    p:Project;
    name:string;
    folder:FFolder;
    _fi:HTMLElement;
}
class FFolder extends FItem{
    constructor(p:Project,name:string,folder:FFolder){
        super(p,name,folder);
        this.items = [];
    }
    items:FItem[];
    _fiList:HTMLElement;
    _fiLabel:HTMLElement;
}
// let downOpenFile:FFile;
// let dragOpenFile:FFile;
let hoverOpenFile:FFile;
class FFile extends FItem{
    constructor(p:Project,name:string,text:string,folder:FFolder,lang?:string){
        super(p,name,folder);
        if(!lang){
            let ext = name.split(".").pop();
            let map = {
                "html":"html",
                "css":"css",
                "js":"javascript"
            };
            lang = map[ext] || "text";
        }
        this.text = text;
        this.lang = lang;
    }

    text:string;
    lang:string;
    path = "";

    link:HTMLElement;
    cont:HTMLElement;
    editor:monaco.editor.IStandaloneCodeEditor;
    curEditor:monaco.editor.IStandaloneCodeEditor;

    editorHandle:HTMLElement;

    // d_files:HTMLElement;
    // codeCont:HTMLElement;
    scrollOffset = 0;
    scrollOffsetX = 0;
    bubbles_ov:HTMLElement;

    curRow = 0;
    curCol = 0;
    curI = 0;
    _mouseOver = false;
    blockPosChange = true;

    _lastSavedText:string;
    _saved = true;
    setSaved(v:boolean,noChange=false){
        this._saved = v;
        if(v) if(this.editor) this.text = this.editor.getValue();
        if(this.link){
            // this.link.children[0].textContent = this.name+(v?"":"*");
            if(!v){
                this.link.classList.add("unsaved");
                this.setTemp(false);
            }
            else{
                this.link.classList.remove("unsaved");
            }
        }
        if(!noChange) if(this.editor) this._lastSavedText = this.editor.getValue();
    }

    type(lineno:number,colno:number,text:string){
        // let v = this.editor.getValue({lineEnding:"lf",preserveBOM:true});
        // v = v.substring(0,this.curI)+text+v.substring(this.curI);
        // this.editor.setValue(v);
        // this.editor.setSelection(new Selection(),v);

        // let sel = this.editor.getSelection();
        // let id = {major:1,minor:1};
        // let op = {
        //     identifier:id,range:sel,text,forceMoveMarkers:true
        // };
        // this.editor.executeEdits("my-source",[op]);

    //

        this.editor.trigger("keyboard","type",{
            text
        });
        // this.editor.trigger("keyboard","cursorMove",{
        //     to:"left",
        //     by:"character",
        //     value:5
        // });
    }

    close(){
        if(this.p.openFiles.includes(this)){
            if(!this._saved){
                if(!confirm("This file is unsaved, are you sure you want to close it?")) return;
            }
            if(this._saved) this.text = this.editor.getValue();
            this.p.d_files.removeChild(this.link);
            let ind = this.p.openFiles.indexOf(this);
            this.p.openFiles.splice(ind,1);
            if(this.cont.parentElement) this.cont.parentElement.removeChild(this.cont);
            this.cont = null;
            this.link = null;
            if(this.p.curFile == this){
                let tar = this.p.openFiles[ind];
                if(tar) tar.open(false);
                else if(this.p.openFiles.length){
                    this.p.openFiles[ind-1].open(false);
                }
                else{
                    this.p.curFile = null;
                    let all = document.querySelectorAll(".file-item.sel");
                    for(const c of all){
                        c.classList.remove("sel");
                    }
                }
            }
            this.editor.dispose();
            this.editor = null;
        }
    }
    isTemp = true;
    setTemp(v:boolean){
        this.isTemp = v;
        if(this.link){
            if(this.isTemp) this.link.classList.add("is-tmp");
            else this.link.classList.remove("is-tmp");
        }
    }
    open(isTemp?:boolean){
        if(isTemp == null){
            isTemp = (PAGE_ID != PAGEID.lesson);
        }
        if(!this.p.openFiles.includes(this)){
            for(const f of this.p.openFiles){
                if(f.isTemp) if(f._saved) f.close();
            }
            let link = document.createElement("div");
            this.link = link;
            let l_name = document.createElement("div");
            l_name.textContent = this.name;
            link.appendChild(l_name);
            let b_close = document.createElement("button");
            b_close.innerHTML = "<div class='material-symbols-outlined'>close</div>";
            b_close.classList.add("file-close");
            b_close.addEventListener("click",e=>{
                if(PAGE_ID == PAGEID.lesson) return;
                if(this.p.readonly) return;
                this.close();
            });
            link.appendChild(b_close);
            link.className = "file-link";
            this.p.d_files.insertBefore(link,this.p.d_files.children[this.p.d_files.children.length-2]);
            this.p.openFiles.push(this);
            let t = this;
            l_name.addEventListener("mousedown",e=>{
                t.open();
            });
            if(isTemp) this.setTemp(isTemp);
            link.addEventListener("mousedown",e=>{
                if(e.button != 0) return;
                // downOpenFile = this;
                dragItem = new DragData<FFile>(down=>{
                    return down.link.cloneNode(true) as HTMLElement;
                },(last)=>{
                    if(!hoverOpenFile) return;
                    let i1 = 0;
                    let i2 = 0;
                    let i = 0;
                    for(const c of project.d_files.children){
                        if(c == last.link) i1 = i;
                        else if(c == hoverOpenFile.link) i2 = i;
                        i++;
                    }
                    if(i1 >= i2) project.d_files.insertBefore(last.link,hoverOpenFile.link);
                    else project.d_files.insertBefore(last.link,hoverOpenFile.link.nextElementSibling);
                });
                dragItem.down = this;
            });
            link.addEventListener("mouseenter",e=>{
                hoverOpenFile = this;
            });
            link.addEventListener("mouseleave",e=>{
                hoverOpenFile = null;
            });

            let cont = document.createElement("div");
            cont.className = "js-cont cont";
            this.cont = cont;

            let editor = monaco.editor.create(cont, {
                value: [this.text].join('\n'),
                language: this.lang,
                theme:"vs-"+themes[curTheme].style,
                bracketPairColorization:{
                    enabled:false
                },
                minimap:{
                    enabled:false
                },
                contextmenu:!this.p.isTutor,
                readOnly:this.p.isTutor
                // cursorSmoothCaretAnimation:"on"
            });
            // editor.onDidContentSizeChange(e=>{
            //     if(!this._saved) return;
            //     let v = editor.getValue();
            //     if(this._lastSavedText != v) this.setSaved(false);
            //     //monaco-mouse-cursor-text
            //     // else this.setSaved(true,true);
            // });
            if(this.p.readonly){
                editor.onDidFocusEditorText(e=>{
                    if (document.activeElement instanceof HTMLElement) {
                        document.activeElement.blur();


                        // is tutor editor
                        let cursor = cont.querySelector(".inputarea.monaco-mouse-cursor-text") as HTMLElement;
                        cursor.style.backgroundColor = "var(--col)";
                        cursor.style.zIndex = "1";
                        cursor.style.width = "2px";
                        cursor.style.height = "19px";
                        cursor.style.border = "solid 1px var(--col)";
                        cursor.classList.add("custom-cursor");
                    }
                    // console.warn("trigger!");
                    // editor.trigger("blur","",[]);
                });
                editor.onDidChangeCursorPosition(e=>{
                    // if(t._mouseOver) editor.setPosition({column:1,lineNumber:1});
                    if(t.blockPosChange) editor.setPosition({column:this.curCol,lineNumber:this.curRow});
                });
                // editor.onMouseMove(e=>{
                //     t._mouseOver = true;
                // });
                // editor.onMouseLeave(e=>{
                //     t._mouseOver = false;
                // });
                setTimeout(()=>{
                    editor.focus();
                },100);
            }
            if(this.p.disableCopy) editor.onKeyDown(e=>{
                if(e.ctrlKey && e.keyCode == monaco.KeyCode.KeyC){
                    alert("Please don't try to copy and paste from the tutor's code");
                    e.preventDefault();
                }
            });

            let textArea = cont.querySelector("textarea");
            let overflowGuard = cont.querySelector(".overflow-guard");
            textArea.oninput = function(){
                overflowGuard.scrollTo({top:0,left:0,behavior:"instant"});
            };
            this.curEditor = editor;
            this.editor = editor;
            this.p.curFile = this;

            // @ts-ignore
            editor.onDidScrollChange(function(){
                t.scrollOffset = editor.getScrollTop();
                t.scrollOffsetX = editor.getScrollLeft();
                updateBubbles();
            });

            // create ov_bubbles
            let bubbles_ov = document.createElement("div");
            bubbles_ov.className = "bubbles-overlay";
            this.bubbles_ov = bubbles_ov;
            cont.appendChild(bubbles_ov);
            this.setSaved(true);
        }
        else this.setTemp(false); // <-- should this be moved onto to when opening files from the left menu? 
        // deselect others
        for(const c of this.p.d_files.children){
            c.classList.remove("cur");
        }
        this.link.classList.add("cur");

        for(const c of this.p.codeCont.children){
            this.p.codeCont.removeChild(c);
        }
        this.p.codeCont.appendChild(this.cont);
        this.editor.layout();
        
        loadEditorTheme();

        this.p.curFile = this;
        if(this.p.lastFolder){
            this.p.lastFolder._fiLabel.parentElement.classList.remove("sel");
            this.p.lastFolder = null;
        }
        let allFI = document.querySelectorAll(".file-item.sel");
        for(const c of allFI){
            c.classList.remove("sel");
        }
        if(this._fi){
            this._fi.classList.add("sel");
            function check(folder:FFolder){
                if(!folder) return;
                if(folder._fiLabel.parentElement.classList.contains("close")){
                    folder._fiLabel.click();
                    folder.p.lastFolder = null;
                    folder._fiLabel.parentElement.classList.remove("sel");
                }
                if(folder.folder) check(folder.folder);
            }
            check(this.folder);
            // if(this.p.lastFolder){
            //     let sels = document.querySelectorAll(".folder-item.sel");
            //     for(const c of sels){
            //         c.classList.remove("sel");
            //     }
            //     this.p.lastFolder = null;
            // }
        }
    }
}

function cursorLoop(){
    let delay = 500;

    let list = document.querySelectorAll(".custom-cursor");
    for(const c of list){
        if(c.classList.toggle("hide")) delay = 500;
    }
    
    setTimeout(cursorLoop,delay);
}
cursorLoop();

// From Jaredcheeda, https://stackoverflow.com/questions/7381974/which-characters-need-to-be-escaped-in-html
function escapeMarkup (dangerousInput) {
    const dangerousString = String(dangerousInput);
    const matchHtmlRegExp = /["'&<>]/;
    const match = matchHtmlRegExp.exec(dangerousString);
    if (!match) {
      return dangerousInput;
    }
  
    const encodedSymbolMap = {
      '"': '&quot;',
      '\'': '&#39;',
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;'
    };
    const dangerousCharacters = dangerousString.split('');
    const safeCharacters = dangerousCharacters.map(function (character) {
      return encodedSymbolMap[character] || character;
    });
    const safeString = safeCharacters.join('');
    return safeString;
}

// refresh system
let b_refresh:HTMLButtonElement;
let b_save:HTMLButtonElement;
let icon_refresh:HTMLElement;
let iframe:HTMLIFrameElement;
let _icRef_state = true;

// Lesson Hooks
let listenHooks = {
    addFile:[] as Task[],
    refresh:[] as Task[]
};
let _hookCount = 0;
async function waitForQuickHook(hook:Task[]){
    let t = new TmpTask();
    t.start();
    addHook(hook,t);
    await t._prom;
}
function addHook(hook:Task[],task:Task){
    hook.push(task);
    console.log("...added hook");
    _hookCount++;
}
function resolveHook(hook:Task[],data:any){
    let list = [...hook];
    let result = 0;
    for(let i = 0; i < list.length; i++){
        let f = list[i];
        if(!f.check(data)){
            console.log("...hook resolve failed check; Unresolved: "+_hookCount);
            if(f.preventContinueIfFail()) result = 1;
            continue;
        }
        if(f._resFinish) f._resFinish();
        else{
            console.warn("Weird, there wasn't a finish for the hook...?");
        }
        hook.splice(hook.indexOf(f),1);
        _hookCount--;
        console.log("...resolved hook; Unresolved: "+_hookCount);
    }
    return result;
}

// Setup Editor
enum EditorType{
    none,
    self,
    tutor
}
function setupEditor(parent:HTMLElement,type:EditorType){
    let d_files = document.createElement("div");
    d_files.className = "d-open-files pane";
    let contJs = document.createElement("div");
    contJs.className = "cont-js cont pane";
    parent.appendChild(d_files);
    parent.appendChild(contJs);

    let add_file = document.createElement("button");
    add_file.className = "b-add-file";
    add_file.innerHTML = "<div class='material-symbols-outlined'>add</div>";
    d_files.appendChild(add_file);

    if(type != EditorType.none){
        let label = document.createElement("div");
        label.innerHTML = `<div class="material-symbols-outlined">menu</div><div>${(type == EditorType.tutor ? "TUTOR" : "YOU")}</div>`;
        // label.textContent = (type == EditorType.tutor ? "Tutor's Code" : "Your Code");
        label.className = (type == EditorType.tutor ? "editor-type-tutor" : "editor-type-self");
        d_files.appendChild(label);
    }
}
function postSetupEditor(project:Project){
    let parent = project.parent;
    project.d_files = parent.querySelector(".d-open-files");
    project.codeCont = parent.querySelector(".cont-js");

    project.d_files.addEventListener("wheel",e=>{
        e.preventDefault();
        let m = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY);
        project.d_files.scrollBy({
            left:m/2,
            top:0,
            behavior:"instant"
        });
    });

    console.log("completed post setup");

    // project.createFile("test.html",`<p>Hello</p>`,"html");
    // project.files[0].open();
    // project.createFile("main.js",`console.log("hello");\nconsole.log("hello");\nconsole.log("hello");\nconsole.log("hello");`,"javascript");
    // project.files[1].open();

    let add_file = parent.querySelector(".b-add-file");
    add_file.addEventListener("click",e=>{
        if(project.isTutor){
            alert("Sorry! You can't add files to the tutor's project!");
            return;
        }
        
        let name = prompt("Enter file name:","index.html");
        if(!name) return;

        project.createFile(name,"",null,project.lastFolder ?? project.curFile?.folder,true);
    });

    // loadEditorTheme();
    
    // project.files[0].d_files;
    // project.files[0].codeCont;
    // project.files[0].bubbles_ov;

    // INIT OPS BUTTONS
    const ops_rename = document.querySelector(".ops-rename");
    const ops_delete = document.querySelector(".ops-delete");
    const ops_cut = document.querySelector(".ops-cut");
    const ops_copy = document.querySelector(".ops-copy");
    const ops_paste = document.querySelector(".ops-paste");
    async function flashHL(f:FItem){
        if(!f) return;
        let ele = (f instanceof FFolder ? f._fiLabel : f._fi);
        if(!ele) return;
        ele.classList.add("hl");
        await wait(200);
        ele.classList.remove("hl");
    }
    ops_rename.addEventListener("click",e=>{
        if(!project) return;
        project.renameFItem(project.lastFolder??project.curFile);
    });
    ops_delete.addEventListener("click",e=>{
        if(!project) return;
        project.deleteFItem(project.curFile);
    });
    ops_cut.addEventListener("click",e=>{
        if(!project) return;
        let items = project.hlItems.length ? project.hlItems : [project.lastFolder??project.curFile];
        for(const c of items) flashHL(c);
        project.cutFItems(project.curFile);
    });
    ops_copy.addEventListener("click",e=>{
        if(!project) return;
        let items = project.hlItems.length ? project.hlItems : [project.lastFolder??project.curFile];
        for(const c of items) flashHL(c);
        project.copyFItems(project.curFile);
    });
    ops_paste.addEventListener("click",e=>{
        if(!project) return;
        let item = project.lastFolder??project.curFile;
        project.pasteFItems(item,(effected)=>{
            // for(const c of effected) flashHL(item);
        });
    });
}

// PAGE ID
enum PAGEID{
    none,
    editor,
    lesson
}
let PAGE_ID = PAGEID.none;

// 
let tmpMenus:HTMLElement[] = [];
let isOverTmpMenu = false;
function closeTmpMenus(){
    for(const c of tmpMenus){
        c.parentElement.removeChild(c);
        if(c.onclose) c.onclose(null);
    }
    tmpMenus = [];
    isOverTmpMenu = false;
}
document.addEventListener("mousedown",e=>{
    if(!isOverTmpMenu) closeTmpMenus();
    if(!overSubMenu) closeAllSubMenus();
});
// document.addEventListener("mouseup",e=>{
//     if(tmpMenus.length) if(!isOverTmpMenu) closeTmpMenus();
// });
// document.addEventListener("mouseup",e=>{
//     requestAnimationFrame(()=>{
//         if(project.lastFolder){
//             project.lastFolder._fiLabel.parentElement.classList.remove("sel");
//             project.lastFolder = null;
//         }
//     });
// });

// SAVE / REFRESH
async function refreshProject(){
    if(!project) return;
    if(project.needsSave || project.files.some(v=>!v._saved) || !project.hasSavedOnce){
        await saveProject(true);
        project.needsSave = false;
    }
    
    let file1 = project.items.find(v=>v.name == "index.html");
    if(!file1 || !project.hasSavedOnce){
        alert("No index.html file found! Please create a new file called index.html in the outer most folder of your project, this file will be used in the preview.");
        return;
    }
    iframe.src = serverURL+"/project/"+g_user.sanitized_email+"/"+socket.id+"/"+g_user.sanitized_email+"/"+project.pid;
    // let cs = (iframe.contentWindow as any).console as Console;
    // cs.log = function(...data:any[]){
    //     console.log("BOB");
    //     // console.log("(LOG)",...data);
    //     // cs.log(...data);
    // };
    // console.log(cs);
    // ^^^ attempts at log injection

    icon_refresh.style.rotate = _icRef_state ? "360deg" : "0deg";
    _icRef_state = !_icRef_state;
    
    resolveHook(listenHooks.refresh,null);
}
async function refreshLesson(){  
    if(!lesson) return;
    let project = lesson.p;
    if(project.files.some(v=>!v._saved) || !project.hasSavedOnce) await saveLesson(true);
    
    let file1 = project.files.find(v=>v.name == "index.html");
    if(!file1 || !project.hasSavedOnce){
        alert("No index.html file found! Please create a new file called index.html, this file will be used in the preview.");
        return;
    }
    iframe.src = serverURL+"/lesson/"+g_user.sanitized_email+"/"+socket.id+"/"+g_user.sanitized_email+"/"+lesson.lid;

    icon_refresh.style.rotate = _icRef_state ? "360deg" : "0deg";
    _icRef_state = !_icRef_state;
    
    resolveHook(listenHooks.refresh,null);
}

let _isSaving = false;
async function saveProject(isQuick=false){
    if(!project) return;
    if(_isSaving) return;
    
    _isSaving = true;
    b_save.children[0].textContent = "progress_activity";
    b_save.children[0].classList.add("progress-anim");
    let start = performance.now();
    await uploadProjectFiles(project);
    let time = performance.now()-start;
    let delay = 0;

    project.hasSavedOnce = true;
    project.files.forEach(v=>v.setSaved(true));

    if(!isQuick){
        if(time < 50) delay = 300;
        await wait(delay);
    }

    b_save.children[0].textContent = "save";
    b_save.children[0].classList.remove("progress-anim");
    _isSaving = false;
}
async function saveLesson(isQuick=false){
    if(!lesson) return;
    if(_isSaving) return;
    
    _isSaving = true;
    b_save.children[0].textContent = "progress_activity";
    b_save.children[0].classList.add("progress-anim");
    let start = performance.now();
    await uploadLessonFiles(lesson);
    // let time = performance.now()-start;
    // let delay = 0;

    lesson.p.hasSavedOnce = true;
    lesson.p.files.forEach(v=>v.setSaved(true));

    if(!isQuick){
        // if(time < 50) delay = 300;
        // await wait(delay);
        await wait(300);
    }

    b_save.children[0].textContent = "save";
    b_save.children[0].classList.remove("progress-anim");
    _isSaving = false;
}

type ProjectMeta = {
    pid:string,
    name:string,
    desc:string,
    isPublic:boolean,
    // files:ULFile[],
    items:ULItem[],
    cid?:string;
};

// screenshot util
function screenshot(){
    // @ts-ignore
    html2canvas(document.body.children[5]).then(canvas=>{
        document.body.appendChild(canvas);
    });
}

function goToProject(pid:string){
    // location.pathname = "/editor/index.html?pid="+pid;
    let url = new URL(location.href);
    url.pathname = "/editor/index.html";
    url.searchParams.set("pid",pid);
    history.pushState(null,null,url);
    location.reload();
}

document.addEventListener("keydown",e=>{
    // let active = document.activeElement;
    // if(active) if(active.className.endsWith("cursor-text")){
    
});
document.addEventListener("keyup",e=>{
    {
        let f = (PAGE_ID == PAGEID.lesson ? lesson?.p?.curFile : project?.curFile);
        if(!f){
            // console.warn("no file");
            return;
        }
        if(!f._saved){
            // console.warn("not saved");
            return;
        }
        function check(){
            let v = f.editor.getValue();
            if(f._lastSavedText != v){
                f.setSaved(false);
            }
        }
        // setTimeout(()=>{
            // check();
        // },50);
        requestAnimationFrame(check);
    }
});
document.addEventListener("mouseup",e=>{
    if(dragItem){
        if(dragItem.down) dragItem.down = null;
        if(dragItem.drag){
            if(dragItem.tmp) dragItem.tmp.remove();
            dragItem.tmp = null;
            // document.body.classList.remove("dragging");
            let last = dragItem.drag;
            dragItem.drag = null;
            dragItem.end(last);
        }
    }
});

class DragData<T>{
    constructor(clone:(down:T)=>HTMLElement,end:(last:T)=>void){
        this.clone = clone;
        this.end = end;
    }
    down:T;
    drag:T;
    tmp:HTMLElement;
    clone:(down:T)=>HTMLElement;
    end:(last:T)=>void;
}
let dragItem:DragData<FItem>;

// let dragOpenFileTmp:HTMLElement;
document.addEventListener("mousemove",e=>{
    if(dragItem){
        let down = dragItem.down;
        if(down){
            dragItem.drag = down;
            // document.body.classList.add("dragging");
            if(!dragItem.tmp){
                // let clone = down.link.cloneNode(true) as HTMLElement;
                let clone = dragItem.clone(down);
                clone.style.pointerEvents = "none";
                let cont = document.createElement("div");
                cont.className = "d-open-files";
                cont.style.position = "absolute";
                cont.classList.add("drag-cont");
                cont.appendChild(clone);
                menuCont.appendChild(cont);
                dragItem.tmp = cont;
            }
        }
        if(dragItem.drag){
            dragItem.tmp.style.left = (e.clientX)+"px";
            dragItem.tmp.style.top = (e.clientY)+"px";
        }
    }
});

// Dropdowns
let subMenus:HTMLElement;
let overSubMenu = false;
let subs:any[] = [];
setTimeout(()=>{
    subMenus = document.querySelector(".sub-menus") as HTMLElement;
    if(!subMenus) return;
    subMenus.addEventListener("mouseenter",e=>{
        overSubMenu = true;
    });
    subMenus.addEventListener("mouseleave",e=>{
        overSubMenu = false;
    });
},500);
function closeAllSubMenus(){
    for(const s of subs){
        s.e.remove();
        s.onclose();
    }
}
function setupDropdown(btn:HTMLElement,getLabels:()=>string[],onclick:(i:number)=>void,onopen?:(dd:HTMLElement)=>void,onclose?:()=>void,ops:any={}){
    btn.addEventListener("contextmenu",e=>{
        let labels = getLabels();
        let icons = (ops?.getIcons ? ops?.getIcons() : null) as string[];
        // if(e.button != 2) return;
        e.preventDefault();
        // subMenus.innerHTML = "";
        closeAllSubMenus();
        // let rect = btn.getBoundingClientRect();
        let dd = document.createElement("div");
        dd.oncontextmenu = function(e){
            e.preventDefault();
        };
        dd.className = "dropdown";
        for(let i = 0; i < labels.length; i++){
            let d = document.createElement("div");
            let l = labels[i];
            let icon = icons[i];
            if(icon){
                let ic = document.createElement("div");
                ic.className = "material-symbols-outlined";
                ic.textContent = icon;
                d.appendChild(ic);
            }
            let lab = document.createElement("div");
            lab.textContent = l;
            d.appendChild(lab);
            d.className = "dd-item";
            dd.appendChild(d);
            d.addEventListener("click",function(e){
                onclick(i);
            });
        }
        subMenus.appendChild(dd);
        console.log("appended");
        dd.style.left = (e.clientX)+"px";
        dd.style.top = (e.clientY-60)+"px";
        if(e.clientY > innerHeight/2) dd.style.transform = "translate(0px,-100%)";
        else dd.style.transform = "translate(0px,0px)";
        onopen(dd);
        subs.push({
            e:dd,
            onclose
        });
        // requestAnimationFrame(()=>{
        //     let rect = dd.getBoundingClientRect();
        //     if(rect.bottom >= innerHeight-20){
        //         let y = rect.y = innerHeight-20-rect.height - 60;
        //         dd.style.top = (y)+"px";
        //     }
        // });
    });
}

// callouts
function setupCallout(ele:Element,label?:string){
    if(label == null) label = ele.getAttribute("co-label");
    let d:HTMLElement;
    let isOver = false;
    let flag = false;
    ele.addEventListener("mouseenter",async (e:MouseEvent)=>{
        if(isOver || flag){
            if(d?.parentElement) d.remove();
            return;
        }
        isOver = true;
        flag = true;
        // await wait(500);
        await wait(200);
        flag = false;
        if(!isOver){
            if(d?.parentElement) d.remove();
            return;
        }

        d = document.createElement("div");
        d.textContent = label;
        d.className = "callout";
        subMenus.appendChild(d);

        let rect = ele.getBoundingClientRect();
        d.style.top = (rect.y+rect.height-60+12)+"px";
        if(rect.x > innerWidth/2){
            d.style.left = (rect.right+d.offsetWidth)+"px";
            d.style.setProperty("--left",(rect.width/2-7-rect.width+d.offsetWidth)+"px");
            // d.style.setProperty("--left",(rect.width/2-7+d.offsetWidth)+"px");
            d.style.transform = "translate(-200%,0px)";
        }
        else{
            d.style.left = (rect.x)+"px";
            d.style.setProperty("--left",(rect.width/2-7)+"px");
            d.style.transform = "translate(0px,0px)";
        }
    });
    ele.addEventListener("mouseleave",e=>{
        isOver = false;
        if(d?.parentElement) d.remove();
    });
}
async function initCallouts(){
    await loginProm;
    const callouts = document.querySelectorAll(".co-item");
    for(const c of callouts){
        setupCallout(c);
    }
    console.log(`initialized ${callouts.length} callouts`);
}

function whenEnter(elm:HTMLInputElement,f:(v:string)=>void){
    elm.addEventListener("keydown",e=>{
        if(e.key.toLowerCase() == "enter") f(elm.value);
    });
    elm.addEventListener("blur",e=>{
        f(elm.value);
    });
}