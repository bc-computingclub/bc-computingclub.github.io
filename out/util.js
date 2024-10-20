let lesson;
let project;
let settingsList = [];
class Settings {
    invertContrast = new Setting("invertContrast", false);
}
class Setting {
    constructor(id, v) {
        this.id = id;
        this.v = v;
        this.default = v;
        this.v = this.get();
        settingsList.push(this);
    }
    id;
    v;
    default;
    save() {
        localStorage.setItem("__CCSD-" + this.id, JSON.stringify(this.v));
    }
    get() {
        let val = localStorage.getItem("__CCSD-" + this.id);
        if (val != null)
            val = JSON.parse(val);
        if (val != null)
            this.v = val;
        return val || this.v;
    }
    set(v) {
        this.v = v;
        this.save();
    }
}
let settings = new Settings();
let g_waitDelayScale = 1;
function wait(delay) {
    return new Promise(resolve => {
        if (g_waitDelayScale == 0) {
            resolve();
            return;
        }
        setTimeout(() => {
            resolve();
        }, delay * g_waitDelayScale);
    });
}
// debugWait - independent of g_waitDelayScale
function DWait(delay) {
    return new Promise(resolve => {
        if (delay == 0) {
            resolve();
            return;
        }
        setTimeout(() => {
            resolve();
        }, Math.floor(delay));
    });
}
// menus
let menuCont = document.createElement("div");
menuCont.className = "menu-cont";
document.body.insertBefore(menuCont, document.body.children[0]);
let menuLayers = [[]];
let menusOpen = menuLayers[0];
function closeAllMenus() {
    let list = [...menusOpen];
    for (const m of list) {
        m.close();
    }
}
class Menu {
    constructor(title, icon) {
        this.title = title;
        this.icon = icon;
    }
    icon;
    title;
    menu;
    body;
    reset() {
        this.menu = null;
        this.body = null;
    }
    canClose() {
        return true;
    }
    _priority = 0;
    load(priority = 0, newLayer = false) {
        if (newLayer) {
            for (const m of menusOpen) {
                m.menu.classList.add("force-hidden");
            }
            menuLayers.push([]);
            menusOpen = menuLayers[menuLayers.length - 1];
        }
        let list = [...menusOpen];
        for (const m of list) {
            // if(m._priority < priority) m.close();
            if (m._priority < priority)
                m.menu.style.display = "none";
        }
        let isHidden = false;
        if (list.some(v => v._priority > priority))
            isHidden = true;
        this._priority = priority;
        let t = this;
        let menu = document.createElement("div");
        menu.className = "menu";
        menu.classList.add("menu-" + this.title.replaceAll(" ", "-").toLowerCase());
        this.menu = menu;
        menuCont.appendChild(menu);
        if (isHidden)
            menu.style.display = "none";
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
        if (b_close)
            b_close.addEventListener("click", e => {
                t.close();
            });
        let cont = document.createElement("div");
        cont.className = "menu-body";
        menu.appendChild(cont);
        this.body = cont;
        if (!menusOpen.length)
            menuCont.classList.add("show");
        menusOpen.push(this);
        return this;
    }
    close() {
        if (this.menu?.parentElement) {
            this.menu.parentElement.removeChild(this.menu);
            this.onClose();
            this.reset();
            menusOpen.splice(menusOpen.indexOf(this), 1);
            if (!menusOpen.length) {
                menuLayers.pop();
                menusOpen = menuLayers[menuLayers.length - 1];
                if (!menusOpen) {
                    menuLayers.push([]);
                    menusOpen = menuLayers[0];
                }
                else
                    for (const m of menusOpen) {
                        m.menu.classList.remove("force-hidden");
                    }
            }
            // restore other menus
            console.log("on close");
            let list = [...menusOpen];
            for (const m of list) {
                if (m._priority < this._priority)
                    m.menu.style.display = "block";
            }
            // 
            if (!menusOpen.length)
                menuCont.classList.remove("show");
        }
    }
    onClose() { }
    // 
    setupTextInput(query, ops = {}) {
        let div = this.body.querySelector(query);
        div.classList.add("inp-cont");
        div.innerHTML = `
            <div class="text-input-label">${ops.label || ""}</div>
            ${ops.buttonText ? `<button>${ops.buttonText}</button>` : '<input type="text">'}
            ${ops.buttonText ? "" : ops.hasCheck ? `<div><div class="material-symbols-outlined icon-check">progress_activity</div></div>` : ""}
        `;
        let check = div.querySelector(".icon-check");
        let _inp;
        if (!ops.buttonText) {
            let inp = div.querySelector("input");
            _inp = inp;
            inp.spellcheck = !ops.noErrorCheck;
            if (check)
                inp.addEventListener("input", async (e) => {
                    if (ops.validate) {
                        check.classList.remove("accept", "deny");
                        check.textContent = "progress_activity";
                        await wait(250);
                        let res = await ops.validate(inp.value);
                        check.classList.remove("accept", "deny");
                        check.classList.add(res ? "accept" : "deny");
                        check.textContent = (res ? "check" : "close");
                    }
                });
            if (ops.isPassword)
                inp.type = "password";
            if (ops.title)
                inp.title = ops.title;
            if (check) {
                check.classList.add("deny");
                check.textContent = "close";
            }
        }
        else {
            let btn = div.querySelector("button");
            btn.addEventListener("click", e => {
                if (ops.onClick)
                    ops.onClick();
            });
        }
        return { div, inp: _inp };
    }
}
class SignUpMenu extends Menu {
    constructor() {
        super("Sign Up", "person_add");
    }
    load(priority) {
        super.load();
        this.body.innerHTML = `
            <div class="i-email"></div>
            <div class="i-username"></div>
            <div class="i-password"></div>
            <div class="b-submit"></div>
        `;
        this.setupTextInput(".i-email", {
            label: "Email",
            title: "email",
            noErrorCheck: true,
            async validate(v) {
                return v.length >= 5;
            },
            hasCheck: true
        });
        this.setupTextInput(".i-username", {
            label: "Username",
            title: "username",
            noErrorCheck: true,
            async validate(v) {
                return v.length >= 5;
            },
            hasCheck: true
        });
        this.setupTextInput(".i-password", {
            label: "Password",
            title: "password",
            noErrorCheck: true,
            async validate(v) {
                return v.length >= 8;
            },
            isPassword: true,
            hasCheck: true
        });
        this.setupTextInput(".b-submit", {
            buttonText: "Submit",
            onClick() {
            }
        });
        return this;
    }
}
class LogInMenu extends Menu {
    constructor() {
        super("Log In", "login");
    }
    load(priority) {
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
        if (false) {
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
            google.accounts.id.renderButton(this.body.querySelector(".g-cont"), {});
            let b_continue = this.body.querySelector(".b-continue");
            b_continue.addEventListener("click", e => {
                closeAllMenus();
            });
        }
        else {
            if (!socket.connected) {
                this.body.textContent = "Failed to connect to the server.";
                return;
            }
            this.body.style.gap = "5px";
            this.body.innerHTML = `
                <div>Log in to access lessons, challenges, and an editor to experiment in!</div>
                ${g_user ? `<div class="l-currently-logged-in">Currently logged in as ${g_user.email}</div>` : ""}
                <div class="sign-in-btn"></div>
                <!--<div class="two-col" style="grid-template-columns:unset">
                    <div>
                        <div class="sign-in-cont">
                            <div>Log in with Google</div>
                            <div class="si-icon-cont"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="LgbsSe-Bz112c"><g><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></g></svg></div>
                        </div>
                    </div>
                    <div>
                        
                    </div>
                </div>-->
            `;
            let signInBtn = this.body.querySelector(".sign-in-btn");
            // let signInBtn = this.body.querySelector(".sign-in-cont") as HTMLElement;
            // signInBtn.addEventListener("click",e=>{
            //     promptSignIn();
            // });
            google.accounts.id.renderButton(signInBtn, {
                theme: 'filled_blue', //outline
                size: 'large',
                text: "Log in with Google"
            });
        }
        return this;
    }
}
function decodeJwtResponse(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}
let initializedSignInPrompt = false;
function initializeSignIn() {
    if (!initializedSignInPrompt) {
        google.accounts.id.initialize({
            client_id: '639454147876-f7ehoq29hcqnmis69l7shgbr2nbtv02o',
            callback: handleCredentialResponse,
            context: "use",
            ux_mode: "popup",
            auto_prompt: "false"
        });
        initializedSignInPrompt = true;
    }
}
function promptSignIn() {
    if (!initializedSignInPrompt) {
        google.accounts.id.initialize({
            client_id: '639454147876-f7ehoq29hcqnmis69l7shgbr2nbtv02o',
            callback: handleCredentialResponse,
            context: "use",
            ux_mode: "popup",
            auto_prompt: "false"
        });
        initializedSignInPrompt = true;
    }
    google.accounts.id.prompt();
}
function handleCredentialResponse(response) {
    console.log("LOGGED IN: ", response);
    // Your code here
    let data = decodeJwtResponse(response.credential);
    console.log("DATA", data);
    logUserIn(data, response.credential);
    closeAllMenus();
}
let loginProm;
let _loginRes;
loginProm = new Promise(resolve => {
    _loginRes = resolve;
});
let g_user;
async function waitForUser() {
    if (!loginProm)
        return;
    await loginProm;
}
function logUserIn(data, token) {
    if (!data)
        data = JSON.parse(localStorage.getItem("logData"));
    if (!token)
        token = localStorage.getItem("token");
    if (!data || !token) {
        // you are not logged in, cancel prom
        _loginRes();
        _loginRes = null;
        loginProm = null;
        return;
    }
    if (data) {
        localStorage.setItem("token", token);
        localStorage.setItem("logData", JSON.stringify(data));
        h_profile.classList.add("logged-in");
        h_profile.innerHTML = `
            <img referrerpolicy="no-referrer" src="${data.picture}">
        `;
        let img = h_profile.querySelector("img");
        img.onerror = (err, source, lineno, colno, error) => {
            if (err)
                console.warn("> Failed loading profile picture", err.type);
            g_user = null;
            new PromptLoginMenu().load();
            return;
        };
        _login(data, token);
        return;
    }
    // clear user - log out
    console.warn("... logging out?");
    _logout();
}
// let testMenu = new SignUpMenu();
// let testMenu2 = new LogInMenu();
// testMenu2.load();
// testMenu.load();
// Gen Header
let d_lesson_confirm;
function genHeader(i, isCompact = true, id) {
    let navCont = document.createElement("div");
    let noLogo = false;
    console.log("...generating header with id: ", id);
    if (id == "editor" || id == "lesson") {
        noLogo = true;
    }
    let isLesson = (id == "lesson");
    navCont.className = "nav-container";
    navCont.role = "navigation";
    let logoI = 3;
    navCont.innerHTML = `
        ${!noLogo ? `<div class="logo">
        <a href="/index.html">
            <!--<img src="/images/error.png" alt="Code Challenge Logo" class="logo-thumbnail">-->
            <!--<img src="/images/CodeOtterLogo_v1.7.svg" alt="Code Challenge Logo" class="logo-thumbnail">-->
            <!--<img src="/images/${[
        "CodeOtterLogo_alt.svg",
        "CO_logo_v2.svg",
        "CO_logo_v2.2.svg",
        "CO_logo_v3.svg"
    ][logoI]}" alt="Code Challenge Logo" class="logo-thumbnail">-->
            <!-- Insert placeholder logo here -->
            <!-- <span class="logo">Code Otter</span> -->
            
        </a>
        </div>` : ""}${id == "editor" || id == "lesson" ? `
        <div class="editor-menu-bar">
            <div class="b-editor-dashboard icon-div"><div class="material-symbols-outlined co-item" co-label="${isLesson ? "View Lessons" : "Project Dashboard"}">${isLesson ? "home" : "list"}</div></div>
            <!--<div>File</div>
            <div>Edit</div>
            <div>View</div>-->
        </div>
        <div class="cur-project-controls">
            <div class="d-current-project">[No Project Loaded]</div>
            <div class="b-save icon-div"><div class="material-symbols-outlined co-item" co-label="Save Project">save</div></div>
            <!--<div class="b-publish icon-div hide"><div class="material-symbols-outlined"></div></div>-->
            <button class="b-publish hide">
                <div class="material-symbols-outlined"></div>
                <div></div>
            </button>
            <div class="icon-div hide"><div class="material-symbols-outlined">play_arrow</div></div>
        </div>
        ` : ""}
        <div class="d-lesson-confirm none">
            <div>Press "I'm Done" to let the Tutor know when you're done with this step.</div>
            <button class="b-im-done icon-btn">
                <div class="material-symbols-outlined">done</div>
                <div>I'm Done</div>
            </button>
            <button class="b-replay"><div class="material-symbols-outlined">replay</div></button>
            <button class="b-go-back-step hide"><div class="material-symbols-outlined">keyboard_double_arrow_left</div></button>
        </div>
        <div class="nav-links">
            <a href="/learn/index.html" class="nav-link">Learn <span class="material-symbols-outlined">Auto_stories</span></a>
            <a href="/practice/index.html" class="nav-link">Practice <span class="material-symbols-outlined">Checkbook</span></a>
            <a href="/editor/index.html" class="nav-link">Experiment <span class="material-symbols-outlined">Experiment</span></a>
            <a class="h-profile"><span class="material-symbols-outlined">Person</span></a>
        </div>
    `;
    if (isCompact)
        navCont.classList.add("compact");
    document.body.appendChild(navCont);
    let links = navCont.querySelectorAll(".nav-link");
    if (links[i])
        links[i].classList.add("active");
    document.body.classList.add([
        "learn-page",
        "practice-page",
        "experiment-page"
    ][i]);
    d_lesson_confirm = document.querySelector(".d-lesson-confirm");
    b_publish = navCont.querySelector(".b-publish");
    // setupCustomCallout(b_publish,div=>{
    //     div.classList.add("callout-no-color");
    //     div.textContent = "Submit";
    // });
}
// Add General Scripts
function addScript(src, isAsync = false, call) {
    let sc = document.createElement("script");
    sc.src = src;
    sc.async = isAsync;
    document.body.appendChild(sc);
    if (call)
        sc.onload = function () {
            call();
        };
}
// addScript("/out/pre_init.js");
addScript("https://accounts.google.com/gsi/client", true, () => {
    initializeSignIn();
});
// Pane Resizing
window.addEventListener("resize", e => {
    onResize();
});
let onResize = function (isFirst, who) { };
// let d_files:HTMLElement;
let main;
// let codeCont:HTMLElement;
let pane_lesson;
let pane_files;
let pane_tutor_code;
let pane_code;
let pane_preview;
let centerCont;
requestAnimationFrame(() => {
    centerCont = document.querySelector(".center-cont");
});
function getSum() {
    let sum = 0;
    for (const c2 of centerCont.children) {
        sum += c2.getBoundingClientRect().width;
    }
    return sum;
}
function getRemaining() {
    let c = 15.4000244140625;
    return centerCont.getBoundingClientRect().width - getSum() - c;
}
let _paneFilesLastWidth = 0;
let _paneCodeLastWidth = 0;
let _panePreviewLastWidth = 0;
async function _star(pid, v) {
    return await new Promise(resolve => {
        socket.emit("starProject", pid, v, (data) => {
            if (typeof data == "number" || data == null) {
                alert(`Error ${data} while starring/unstarring project`);
                resolve(null);
                return;
            }
            resolve(data);
        });
    });
}
async function starProject(pid) {
    return await this._star(pid, true);
}
async function unstarProject(pid) {
    return await this._star(pid, false);
}
class Project {
    constructor(title, parent, settings = {}) {
        this.title = title;
        this.items = [];
        this.files = [];
        this.openFiles = [];
        this.hlItems = [];
        this.parent = parent;
        this.readonly = settings.readonly || false;
        this.disableCopy = settings.disableCopy || false;
    }
    meta;
    pid;
    title;
    items;
    files;
    openFiles;
    curFile;
    lastFolder;
    desc;
    isPublic;
    // canEdit = true;
    // isOwner = true;
    get canEdit() {
        if (PAGE_ID == PAGEID.lesson)
            return true;
        return this.meta?.canEdit;
    }
    get isOwner() {
        if (PAGE_ID == PAGEID.lesson)
            return true;
        return this.meta?.isOwner;
    }
    parent;
    d_files;
    codeCont;
    hlItems;
    readonly = false;
    disableCopy = false;
    hasSavedOnce = false;
    needsSave = false;
    setPublished(v) {
        if (!this.meta)
            return;
        this.meta.submitted = v;
        b_publish.children[0].textContent = (v ? "cloud_done" : "cloud_upload");
        b_publish.children[1].textContent = (v ? "Submitted" : "Submit");
    }
    isPublished() {
        return this.meta.submitted;
    }
    canLeave() {
        if (this.needsSave)
            return false;
        if (this.openFiles.some(v => !v._saved))
            return false;
        return true;
    }
    // right click actions
    renameFItem(f, close) {
        if (!f)
            return;
        if (!f.p.canEdit)
            return;
        // let newName = prompt("Old name: "+f.name+"\n\nEnter new name: ",f.name);
        let newName = f.name;
        new InputMenu("Rename File", "New name", (data) => {
            newName = data;
            if (newName == f.name || newName == null || newName == "") {
                if (close)
                    close();
                return;
            }
            if (newName.includes("/") || newName.includes("..")) {
                alert("Invalid file/folder name");
                if (close)
                    close();
                return;
            }
            /*if(f.isNew && f instanceof FFile){
                f.name = newName;
                if(f.link) f.link.children[0].textContent = newName;
                if(f._fi) f._fi.textContent = newName;
                close();
            }
            else */ socket.emit("renameFItem", f.p.pid, calcFolderPath(f.folder), f.name, newName, ((res) => {
                console.log("RES RENAME: ", res);
                if (res != 0)
                    return;
                f.name = newName;
                if (f instanceof FFile) {
                    if (f.link)
                        f.link.children[0].textContent = newName;
                    if (f._fi)
                        f._fi.textContent = newName;
                }
                else if (f._fi)
                    f._fi.children[0].children[2].textContent = newName;
                if (close)
                    close();
            }));
        }, () => {
            console.log("Canceled file rename");
        }, "Rename file", "", `Old name: ${f.name.substring(0, 30) + (f.name.length > 30 ? "..." : "")}`).load();
    }
    async deleteFItem(f) {
        if (!f)
            return;
        if (!f.p.canEdit)
            return;
        let list = [];
        if (f.p.hlItems.length) {
            for (const f1 of f.p.hlItems) {
                list.push(f1);
            }
        }
        else
            list.push(f);
        let deleting = list.map(v => v.name);
        // if(!confirm("Are you sure you want to delete: ["+list.map(v=>v.name).join(", ")+"] ?\n\nThere is no reversing this option!")) return;
        let confirmres = await new Promise(resolve => {
            new ConfirmMenu("Delete Item", "Are you sure you want to delete: [" + deleting.join(", ") + "] ?<br><br>There is no reversing this option!", () => {
                resolve(0);
            }, () => {
                resolve(1);
            }).load();
        });
        if (confirmres != 0)
            return;
        for (const f1 of list) {
            let res = await new Promise(resolve => {
                socket.emit("deleteFItem", f1.p.pid, calcFolderPath(f1.folder), f1.name, ((res) => {
                    console.log("RES delete: ", res);
                    resolve(res);
                }));
            });
            if (res == 0) {
                let items = (f1.folder ? f1.folder.items : f1.p.items);
                items.splice(items.indexOf(f1), 1);
                f1._fi.remove();
            }
            await wait(100);
        }
        f.p.deselectHLItems();
    }
    cutFItems(f) {
        if (!f)
            return;
        if (!f.p.canEdit)
            return;
        fclipboard.files = [];
        if (f.p.hlItems.length)
            for (const f1 of f.p.hlItems) {
                fclipboard.files.push(f1);
            }
        else
            fclipboard.files.push(f);
        fclipboard.action = "cut";
        f.p.deselectHLItems();
        console.log("Cut " + fclipboard.files.length + " items into the clipboard");
    }
    copyFItems(f) {
        if (!f)
            return;
        if (!f.p.canEdit)
            return;
        fclipboard.files = [];
        if (f.p.hlItems.length)
            for (const f1 of f.p.hlItems) {
                fclipboard.files.push(f1);
            }
        else
            fclipboard.files.push(f);
        fclipboard.action = "copy";
        f.p.deselectHLItems();
        console.log("Copied " + fclipboard.files.length + " items into the clipboard");
    }
    async pasteFItems(f, cb, close) {
        if (!f)
            return;
        if (!f.p.canEdit)
            return;
        if (!fclipboard.files.length)
            return;
        let folder = (f instanceof FFolder ? f : f.folder);
        // let folder = f.p.lastFolder;
        // if(!folder) folder = f.p.curFile?.folder;
        let amt = fclipboard.files.length;
        let effected = [];
        for (const f1 of fclipboard.files) {
            let item;
            if (fclipboard.action == "cut") {
                await moveFile(f1, folder, true);
                item = f1;
                effected.push(f1);
            }
            else if (fclipboard.action == "copy") {
                if (f1 instanceof FFile)
                    item = f.p.createFile(f1.name, f1.text, null, folder, true);
                else if (f1 instanceof FFolder)
                    item = f.p.createFolder(f1.name, folder, true);
                effected.push(item);
            }
            if (!item)
                continue;
            f.p.hlItems.push(item);
            item._fi.classList.add("hl2");
        }
        if (close)
            close();
        await saveProject();
        // await wait(500);
        f.p.deselectHLItems();
        for (const f1 of effected) {
            if (f1)
                f1.p.flashAddHLItem(f1);
        }
        if (fclipboard.action == "cut") {
            fclipboard.files = [];
            fclipboard.action = null;
        }
        console.log("Pasted " + amt + " items from the clipboard");
        if (cb)
            cb(effected);
    }
    // 
    addHLItem(f) {
        if (this.hlItems.includes(f))
            return;
        this.hlItems.push(f);
        f._fi.classList.add("hl2");
    }
    removeHLItem(f) {
        let i = this.hlItems.indexOf(f);
        if (i == -1)
            return;
        this.hlItems.splice(i, 1);
        f._fi.classList.remove("hl2");
    }
    async flashAddHLItem(f) {
        this.addHLItem(f);
        await wait(500);
        this.removeHLItem(f);
    }
    deselectHLItems() {
        for (const item of this.hlItems) {
            item._fi.classList.remove("hl2");
        }
        this.hlItems = [];
        _multiSelLast = null;
        _multiSelFolder = null;
    }
    getURL() {
        if (PAGE_ID == PAGEID.editor) {
            if (!this.canEdit)
                return serverURL + "/public/" + this.meta.owner + "/" + this.pid;
            return serverURL + "/project/" + g_user.uid + "/" + socket.id + "/" + this.meta.owner + "/" + this.pid;
        }
        else if (PAGE_ID == PAGEID.lesson)
            return serverURL + "/lesson/" + g_user.uid + "/" + socket.id + "/" + g_user.uid + "/" + lesson.lid;
    }
    getExternalURL() {
        if (PAGE_ID == PAGEID.editor) {
            if (!this.canEdit)
                return location.origin + "/viewer.html?a=" + this.meta.owner + "&b=" + this.pid + "/index.html";
            return location.origin + `/viewer.html?t=p&a=${g_user.uid}&b=${socket.id}&c=${this.meta.owner}&d=${this.pid}/index.html`;
        }
        else
            return location.origin + `/viewer.html?t=l&a=${g_user.uid}&b=${socket.id}&c=${lesson.lid}/index.html`;
    }
    findFile(name) {
        return this.files.find(v => v.name == name);
    }
    createFile(name, text, lang, folder, isNew = false) {
        let same = (folder ? folder.items : this.items).find(v => v.name == name);
        if (same) {
            new ConfirmMenu("File already exists", "There is already a file in this folder with the name: " + name + ".\n\nDo you want to override it?", () => {
                if (same instanceof FFile) {
                    if (same.editor) {
                        same.editor.setValue(text);
                    }
                    same.text = text;
                    same.setSaved(false);
                }
            }, () => {
                console.log("File override canceled");
            }).load();
            // if(confirm("There is already a file in this folder with the name: "+name+".\n\nDo you want to override it?\n(Press cancel to skip)")){
            //     if(same.editor){
            //         same.editor.setValue(text);
            //     }
            //     same.text = text;
            //     same.setSaved(false);
            // }
            if (same instanceof FFolder) {
                alert("There is already a folder in this location with the name: " + name + ", skipping...");
                return;
            }
            return;
        }
        let res = resolveHook(listenHooks.addFile, name);
        if (res == 1) {
            console.warn("Failed creation prevented from hook");
            return;
        }
        if (PAGE_ID == PAGEID.lesson) {
            let q = this.findFile(name);
            if (q) {
                q.open();
                return q;
            }
        }
        let f = new FFile(this, name, text, folder, lang);
        // f.isNew = true;
        this.files.push(f);
        if (folder)
            folder.items.push(f);
        else
            this.items.push(f);
        if (PAGE_ID == PAGEID.editor) {
            createFileListItem(f);
        }
        if (PAGE_ID == PAGEID.lesson)
            f.open();
        if (!isNew)
            f.setSaved(true);
        else {
            f.open(false);
        }
        if (PAGE_ID == PAGEID.lesson) {
            f.setSaved(true);
            f.setTemp(false);
        }
        if (isNew)
            if (PAGE_ID == PAGEID.editor)
                saveProject();
        return f;
    }
    createFolder(name, folder, isNew = true) {
        if (name.includes(".")) {
            alert("Folder names cannot have '.' characters in them");
            return;
        }
        let same = (folder ? folder.items : this.items).find(v => v.name == name);
        if (same) {
            if (same instanceof FFile) {
                alert("There is already a file in this folder with the name: " + name + ", skipping...");
                return;
            }
            else if (same instanceof FFolder) {
                alert("There is already a folder in this location with the name: " + name + ", skipping...");
                return;
            }
        }
        let f = new FFolder(this, name, folder);
        if (folder)
            folder.items.push(f);
        else
            this.items.push(f);
        if (PAGE_ID == PAGEID.editor) {
            createFolderListItem(f);
        }
        // this.needsSave = true;
        if (isNew) {
            f._fiLabel.click();
            saveProject();
        }
        else
            f._fi.classList.toggle("close");
        if (isNew)
            if (f._fi) {
                f._fi.classList.add("sel");
                function check(folder) {
                    if (!folder)
                        return;
                    if (folder._fiLabel.parentElement.classList.contains("close")) {
                        folder._fiLabel.click();
                        folder.p.lastFolder = null;
                        folder._fiLabel.parentElement.classList.remove("sel");
                    }
                    if (folder.folder)
                        check(folder.folder);
                }
                check(f.folder);
                this.deselectHLItems();
                this.lastFolder = f;
                f._fi.classList.add("sel");
            }
        return f;
    }
    hasEditor() {
        return (this.curFile?.curEditor != null);
    }
    getCurEditor() {
        return this.curFile?.curEditor;
    }
    init() {
        postSetupEditor(this);
    }
    get isTutor() {
        return this.disableCopy;
    }
}
/**Gets the url (for iframes) to a `"private"` project */
function getProjectURL(uid, pid) {
    // return location.origin+"/viewer.html?t=p&a="+uid+"&b="+pid+"/index.html";
    return serverURL + "/project/" + g_user.uid + "/" + socket.id + "/" + uid + "/" + pid;
}
/**Gets the url (for iframes) to a `"public"` project */
function getPublicProjectURL(ownerUid, pid) {
    return location.origin + "/viewer.html?a=" + ownerUid + "&b=" + pid + "/index.html";
    // return serverURL+"/public/"+ownerUid+"/"+pid;
}
// submitting challenges
async function submitChallenge(pid) {
    await saveProject(true);
    let res = await new Promise(resolve => {
        socket.emit("submitChallenge", pid, (res) => {
            resolve(res);
        });
    });
    if (res != 0) {
        alert("Failed to submit challenge, error code: " + res);
        return;
    }
    console.log(">> submitted challenge");
    project.setPublished(true);
    project.meta.isPublic = false;
    // location.reload();
    location.href = `/practice/submissions.html?cid=${project.meta.cid}&pid=${project.meta.pid}`;
}
async function unsubmitChallenge(pid) {
    await saveProject(true);
    let res = await new Promise(resolve => {
        socket.emit("unsubmitChallenge", pid, (res) => {
            resolve(res);
        });
    });
    if (res != 0) {
        alert("Failed to unsubmit challenge, error code: " + res);
        return;
    }
    console.log(">> unsubmitted challenge");
    project.setPublished(false);
    project.meta.isPublic = true;
    location.reload();
}
// filtering
let fileList;
let hoverFileListItem;
let hoverFolderListItems = [];
// let hoverFolderListItem:FFolder;
function sortFiles(l) {
    l.sort((a, b) => {
        let dif = ((a.val != null || a.curI != null) && (b.val == null && b.curI == null) ? 1 : ((a.val == null && a.curI == null) && (b.val != null || b.curI != null) ? -1 : 0));
        if (dif == 0)
            dif = a.name.localeCompare(b.name);
        return dif;
    });
}
function calcFolderPath(f) {
    if (!f)
        return "";
    let list = [];
    function add(ff) {
        list.push(ff);
        if (ff.folder)
            add(ff.folder);
    }
    add(f);
    let path = "";
    for (let i = list.length - 1; i >= 0; i--) {
        path += list[i].name + "/";
    }
    return path;
}
let fclipboard = {
    files: [],
    action: null
};
let _multiSelLast;
let _multiSelFolder;
function applyMultiSelectFI(e, f) {
    let isMulti = (e.shiftKey || e.ctrlKey);
    let items = f.p.hlItems;
    // if(items.length) if(f.folder != _multiSelFolder) return true;
    if (items.length)
        if (f.folder != items[0].folder)
            return true;
    if (true)
        if (isMulti)
            if (items.length == 0) {
                let cur = f.p.curFile;
                if (cur?.folder == f.folder) {
                    if (cur instanceof FFile) {
                        if (!items.includes(cur)) {
                            items.push(cur);
                            cur._fi.classList.add("hl2");
                            if (f == cur)
                                return true;
                        }
                    }
                }
                else
                    return true;
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
    if (items.includes(f)) {
        items.splice(items.indexOf(f), 1);
        f._fi.classList.remove("hl2");
    }
    else {
        if (items.length == 0)
            _multiSelFolder = f.folder;
        items.push(f);
        f._fi.classList.add("hl2");
    }
    if (isMulti)
        return true;
    // project.deselectHLItems();
    // return false;
    return true;
}
// function createFileListItemSimple(f:ULFile,folder:ULFolder|null,root:ULItem[]){
//     if(!fileList){
//         fileList = document.querySelector(".file-list");
//         if(!fileList) return;
//         fileList.oncontextmenu = function(e){
//             e.preventDefault();
//         };
//     }
//     let div = document.createElement("div");
//     div.className = "file-item";
//     div.textContent = f.name;
//     let list = [...(folder?.items ?? root)];
//     if(list.includes(f)) list.splice(list.indexOf(f),1);
//     list.push(f);
//     sortFiles(list);
//     let i1 = list.indexOf(f);
//     let fiList:HTMLElement;
//     if(folder) fiList = folder._fiList;
//     else fiList = fileList;
//     fiList.insertBefore(div,fiList.children[i1]);
// }
function createFileListItem(f) {
    if (!fileList) {
        fileList = document.querySelector(".file-list");
        if (!fileList)
            return;
        fileList.oncontextmenu = function (e) {
            e.preventDefault();
        };
    }
    let div = document.createElement("div");
    div.className = "file-item";
    div.textContent = f.name;
    let list = [...(f.folder?.items ?? f.p.items)];
    if (list.includes(f))
        list.splice(list.indexOf(f), 1);
    list.push(f);
    sortFiles(list);
    let i1 = list.indexOf(f);
    let fiList;
    if (f.folder)
        fiList = f.folder._fiList;
    else
        fiList = fileList;
    fiList.insertBefore(div, fiList.children[i1]);
    // if(f.folder) f.folder._fiList.appendChild(div);
    // else fileList.appendChild(div);
    setupFItemDropdown(f, div);
    f._fi = div;
    div.addEventListener("click", e => {
        if (!e.ctrlKey && !e.shiftKey)
            f.p.deselectHLItems();
    });
    div.addEventListener("mousedown", e => {
        if (!f.p.hlItems.includes(f) && f.p.hlItems.length && !e.ctrlKey && !e.shiftKey) {
            f.p.deselectHLItems();
        }
        if (e.button != 0)
            return;
        if (e.ctrlKey || e.shiftKey) { // multi file select
            // if(applyMultiSelectFI(e,f)) return;
            applyMultiSelectFI(e, f);
            return;
        }
        f.open();
        dragItem = new DragData(e, down => {
            return div.cloneNode(true);
        }, async (last) => {
            let hover = hoverFolderListItems[hoverFolderListItems.length - 1];
            if (hover == last.folder)
                return;
            let effected = [];
            if (f.p.hlItems.length) {
                for (const f1 of f.p.hlItems) {
                    await moveFile(f1, hover, true);
                    effected.push(f1);
                    // await wait(100);
                }
            }
            else {
                await moveFile(f, hover, true);
                effected.push(f);
            }
            // if(effected.length) f.p.deselectHLItems();
            for (const f1 of effected) {
                f1.p.flashAddHLItem(f1);
            }
            await saveProject();
        });
        dragItem.down = f;
    });
    div.addEventListener("mouseenter", e => {
        hoverFileListItem = f;
        if (!f.folder)
            hoverFolderListItems.push(null);
    });
    div.addEventListener("mouseleave", e => {
        hoverFileListItem = null;
        if (!f.folder)
            hoverFolderListItems.splice(hoverFolderListItems.indexOf(null), 1);
    });
}
function setupFItemDropdown(f, div) {
    setupDropdown(div, () => {
        let del = "Delete";
        let cpy = "Copy";
        let cut = "Cut";
        let paste = "Paste";
        let p = f.p;
        if (p.hlItems.length) {
            let str = " (" + p.hlItems.length + " items)";
            del += str;
            cpy += str;
            cut += str;
        }
        if (fclipboard.files.length) {
            paste += " (" + fclipboard.files.length + " items)";
        }
        return [
            "Rename",
            del,
            cut,
            cpy,
            paste,
        ];
    }, async (i) => {
        function close() {
            closeAllSubMenus();
        }
        close();
        if (i == 0) { // rename
            f.p.renameFItem(f, close);
        }
        else if (i == 1) { // delete
            await f.p.deleteFItem(f);
        }
        else if (i == 2) { // cut
            f.p.cutFItems(f);
        }
        else if (i == 3) { // copy
            f.p.copyFItems(f);
        }
        else if (i == 4) { // paste
            await f.p.pasteFItems(f, () => {
                // close();
            }, close);
        }
    }, {
        onopen: (dd) => {
            div.classList.add("hl");
            if (!fclipboard.files.length)
                dd.children[4].classList.add("disabled");
        },
        onclose: () => {
            div.classList.remove("hl");
        },
        getIcons: () => {
            return [
                "edit",
                "delete",
                "content_cut",
                "content_copy",
                "content_paste"
            ];
        },
        isRightClick: true
    });
}
async function moveFile(f, toFolder, noSave = false) {
    let last = f;
    if (toFolder == last.folder)
        return;
    let items = [];
    let fiList;
    if (!toFolder) {
        items = f.p.items;
        fiList = fileList;
    }
    else {
        items = toFolder.items;
        fiList = toFolder._fiList;
    }
    let i1 = 0;
    let fromFolder = last.folder;
    let res = await new Promise(resolve => {
        socket.emit("moveFiles", f.p.pid, [f.name], calcFolderPath(fromFolder), calcFolderPath(toFolder), (res) => {
            console.log("move res: ", res);
            resolve(res);
        });
    });
    if (res != 0) {
        console.log("failed to move files/folders");
        return;
    }
    let list = [...items];
    if (list.includes(f))
        list.splice(list.indexOf(f), 1);
    list.push(f);
    sortFiles(list);
    i1 = list.indexOf(f);
    fiList.insertBefore(last._fi, fiList.children[i1]);
    last.folder = toFolder;
    let fromItems = (fromFolder?.items ?? f.p.items);
    let toItems = (toFolder?.items ?? f.p.items);
    fromItems.splice(fromItems.indexOf(f), 1);
    toItems.push(f);
    if (toFolder)
        if (toFolder._fi.classList.contains("close"))
            toFolder._fi.classList.remove("close");
    if (!noSave)
        saveProject();
}
function createFolderListItem(f) {
    if (!fileList) {
        fileList = document.querySelector(".file-list");
        if (!fileList)
            return;
        fileList.oncontextmenu = function (e) {
            e.preventDefault();
        };
    }
    let div = document.createElement("div");
    div.className = "folder-item";
    div.innerHTML = `
        <div class=fi-label>
            <div class="material-symbols-outlined b-expand">expand_more</div>
            <div class="ic-folder"></div>
            <div>${f.name}</div>
        </div>
        <div class="fi-list"></div>
    `;
    let list = [...(f.folder?.items ?? f.p.items)];
    if (list.includes(f))
        list.splice(list.indexOf(f), 1);
    list.push(f);
    sortFiles(list);
    let i1 = list.indexOf(f);
    let fiList;
    if (f.folder)
        fiList = f.folder._fiList;
    else
        fiList = fileList;
    fiList.insertBefore(div, fiList.children[i1]);
    // if(f.folder) f.folder._fiList.appendChild(div);
    // else fileList.appendChild(div);
    f._fiLabel = div.querySelector(".fi-label");
    f._fiList = div.querySelector(".fi-list");
    f._fiLabel.addEventListener("click", e => {
        // if(!e.ctrlKey || !e.shiftKey) f.p.deselectHLItems();
        if (e.shiftKey || e.ctrlKey)
            return;
        div.classList.toggle("close");
        // if(f.p.lastFolder == f) div.classList.toggle("close");
        // let sels = document.querySelectorAll(".folder-item.sel");
        // for(const c of sels){
        //     c.classList.remove("sel");
        // }
        if (f.p.lastFolder)
            f.p.lastFolder._fiLabel.parentElement.classList.remove("sel");
        div.classList.add("sel");
        f.p.lastFolder = f;
    });
    f._fi = div;
    setupFItemDropdown(f, f._fiLabel);
    f._fiLabel.addEventListener("mousedown", e => {
        if (!f.p.hlItems.includes(f) && f.p.hlItems.length && !e.ctrlKey && !e.shiftKey) {
            f.p.deselectHLItems();
        }
        if (e.button != 0)
            return;
        if (e.ctrlKey || e.shiftKey) { // multi file select
            // if(applyMultiSelectFI(e,f)) return;
            applyMultiSelectFI(e, f);
            return;
        }
        dragItem = new DragData(e, down => {
            return f._fiLabel.cloneNode(true);
        }, async (last) => {
            let hover = hoverFolderListItems[hoverFolderListItems.length - 1];
            if (hover == last.folder)
                return;
            let items = [];
            let fiList;
            if (!hover) {
                items = f.p.items;
                fiList = fileList;
            }
            else {
                items = hover.items;
                fiList = hover._fiList;
                let hasFailed = false;
                function check(folder) {
                    if (folder == f) {
                        hasFailed = true;
                        return;
                    }
                    if (folder.folder)
                        check(folder.folder);
                }
                check(hover);
                if (hasFailed)
                    return;
            }
            let i1 = 0;
            let fromFolder = last.folder;
            let res = await new Promise(resolve => {
                socket.emit("moveFiles", f.p.pid, [f.name], calcFolderPath(fromFolder), calcFolderPath(hover), (res) => {
                    console.log("res: ", res);
                    resolve(res);
                });
            });
            if (res != 0) {
                console.log("failed to move files/folders");
                return;
            }
            let list = [...items];
            if (list.includes(f))
                list.splice(list.indexOf(f), 1);
            list.splice(0, 0, f);
            sortFiles(list);
            i1 = list.indexOf(f);
            fiList.insertBefore(last._fiLabel.parentElement, fiList.children[i1]);
            last.folder = hover;
            let fromItems = (fromFolder?.items ?? f.p.items);
            let toItems = (hover?.items ?? f.p.items);
            fromItems.splice(fromItems.indexOf(f), 1);
            toItems.push(f);
            saveProject();
        });
        dragItem.down = f;
    });
    div.addEventListener("mouseenter", e => {
        hoverFolderListItems.push(f);
    });
    div.addEventListener("mouseleave", e => {
        hoverFolderListItems.splice(hoverFolderListItems.indexOf(f), 1);
    });
    // f._fiLabel.addEventListener("mouseenter",e=>{
    //     hoverFolderListItem = f;
    // });
    // f._fiLabel.addEventListener("mouseleave",e=>{
    //     hoverFolderListItem = null;
    // });
}
class FItem {
    constructor(p, name, folder) {
        this.p = p;
        this.name = name;
        this.folder = folder;
    }
    p;
    name;
    folder;
    _fi;
}
class FFolder extends FItem {
    constructor(p, name, folder) {
        super(p, name, folder);
        this.items = [];
    }
    items;
    _fiList;
    _fiLabel;
}
// let downOpenFile:FFile;
// let dragOpenFile:FFile;
let hoverOpenFile;
class FFile extends FItem {
    constructor(p, name, text, folder, lang) {
        super(p, name, folder);
        if (!lang) {
            let ext = name.split(".").pop();
            let map = {
                "html": "html",
                "css": "css",
                "js": "javascript",
                "ts": "typescript",
                "rs": "rust",
                "md": "markdown"
            };
            lang = map[ext] || "text";
        }
        this.text = text;
        this.lang = lang;
    }
    text;
    lang;
    path = "";
    link;
    cont;
    editor;
    curEditor;
    editorHandle;
    // d_files:HTMLElement;
    // codeCont:HTMLElement;
    scrollOffset = 0;
    scrollOffsetX = 0;
    bubbles_ov;
    curRow = 0;
    curCol = 0;
    curI = 0;
    _mouseOver = false;
    blockPosChange = true;
    _lastSavedText;
    _saved = true;
    setSaved(v, noChange = false) {
        this._saved = v;
        // if(this.isNew && v) this.isNew = false;
        if (v)
            if (this.editor)
                this.text = this.editor.getValue();
        if (this.link) {
            // this.link.children[0].textContent = this.name+(v?"":"*");
            if (!v) {
                this.link.classList.add("unsaved");
                this.setTemp(false);
            }
            else {
                this.link.classList.remove("unsaved");
            }
        }
        if (!noChange)
            if (this.editor)
                this._lastSavedText = this.editor.getValue();
    }
    type(lineno, colno, text) {
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
        this.editor.trigger("keyboard", "type", {
            text
        });
        // this.editor.trigger("keyboard","cursorMove",{
        //     to:"left",
        //     by:"character",
        //     value:5
        // });
    }
    close() {
        if (this.p.openFiles.includes(this)) {
            if (!this._saved) {
                // return; 
                // if(!confirm("This file is unsaved, are you sure you want to close it?")) return
            }
            if (this._saved)
                this.text = this.editor.getValue();
            this.p.d_files.removeChild(this.link);
            let ind = this.p.openFiles.indexOf(this);
            this.p.openFiles.splice(ind, 1);
            if (this.cont.parentElement)
                this.cont.parentElement.removeChild(this.cont);
            this.cont = null;
            this.link = null;
            if (this.p.curFile == this) {
                let tar = this.p.openFiles[ind];
                if (tar)
                    tar.open(false);
                else if (this.p.openFiles.length) {
                    this.p.openFiles[ind - 1].open(false);
                }
                else {
                    this.p.curFile = null;
                    let all = document.querySelectorAll(".file-item.sel");
                    for (const c of all) {
                        c.classList.remove("sel");
                    }
                }
            }
            this.editor.dispose();
            this.editor = null;
            return 1;
        }
    }
    async softDelete() {
        let res = this.close();
        if (res == 1) {
            if (this.p.files.includes(this))
                this.p.files.splice(this.p.files.indexOf(this), 1);
            if (this.p.items.includes(this))
                this.p.items.splice(this.p.items.indexOf(this), 1);
        }
    }
    isTemp = true;
    setTemp(v) {
        this.isTemp = v;
        if (this.link) {
            if (this.isTemp)
                this.link.classList.add("is-tmp");
            else
                this.link.classList.remove("is-tmp");
        }
    }
    open(isTemp) {
        if (isTemp == null) {
            isTemp = (PAGE_ID != PAGEID.lesson);
        }
        if (!this.p.openFiles.includes(this)) {
            for (const f of this.p.openFiles) {
                if (f.isTemp)
                    if (f._saved)
                        f.close();
            }
            let link = document.createElement("div");
            this.link = link;
            let l_name = document.createElement("div");
            l_name.textContent = this.name;
            link.appendChild(l_name);
            let b_close = document.createElement("button");
            b_close.innerHTML = "<div class='material-symbols-outlined'>close</div>";
            b_close.classList.add("file-close");
            b_close.addEventListener("click", e => {
                if (this.p.isTutor)
                    return;
                if (this.p.readonly) {
                    this.close();
                    return;
                }
                if (PAGE_ID == PAGEID.lesson) {
                    this.softDelete();
                }
                if (!this._saved)
                    new ConfirmMenu("Unsaved file", "This file is unsaved, are you sure you want to close it?", () => {
                        this.close();
                    }, () => {
                        console.log("File close canceled");
                    }).load();
                else
                    this.close();
            });
            link.appendChild(b_close);
            link.className = "file-link";
            this.p.d_files.insertBefore(link, this.p.d_files.children[this.p.d_files.children.length - 2]);
            this.p.openFiles.push(this);
            let t = this;
            l_name.addEventListener("mousedown", e => {
                t.open();
            });
            if (isTemp)
                this.setTemp(isTemp);
            link.addEventListener("mousedown", e => {
                if (e.button != 0)
                    return;
                // downOpenFile = this;
                dragItem = new DragData(e, down => {
                    return down.link.cloneNode(true);
                }, (last) => {
                    if (!hoverOpenFile)
                        return;
                    let i1 = 0;
                    let i2 = 0;
                    let i = 0;
                    for (const c of project.d_files.children) {
                        if (c == last.link)
                            i1 = i;
                        else if (c == hoverOpenFile.link)
                            i2 = i;
                        i++;
                    }
                    if (i1 >= i2)
                        project.d_files.insertBefore(last.link, hoverOpenFile.link);
                    else
                        project.d_files.insertBefore(last.link, hoverOpenFile.link.nextElementSibling);
                });
                dragItem.down = this;
            });
            link.addEventListener("mouseenter", e => {
                hoverOpenFile = this;
            });
            link.addEventListener("mouseleave", e => {
                hoverOpenFile = null;
            });
            let cont = document.createElement("div");
            cont.className = "js-cont cont";
            this.cont = cont;
            let editor = monaco.editor.create(cont, {
                value: [this.text].join('\n'),
                language: this.lang,
                theme: "vs-" + themes[curTheme].style,
                bracketPairColorization: {
                    enabled: false
                },
                minimap: {
                    enabled: false
                },
                contextmenu: !this.p.isTutor,
                readOnly: !this.p.canEdit || this.p.isTutor
                // cursorSmoothCaretAnimation:"on"
            });
            // editor.onDidContentSizeChange(e=>{
            //     if(!this._saved) return;
            //     let v = editor.getValue();
            //     if(this._lastSavedText != v) this.setSaved(false);
            //     //monaco-mouse-cursor-text
            //     // else this.setSaved(true,true);
            // });
            if (this.p.readonly) {
                editor.onDidFocusEditorText(e => {
                    if (document.activeElement instanceof HTMLElement) {
                        document.activeElement.blur();
                        // is tutor editor
                        let cursor = cont.querySelector(".inputarea.monaco-mouse-cursor-text");
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
                editor.onDidChangeCursorPosition(e => {
                    // if(t._mouseOver) editor.setPosition({column:1,lineNumber:1});
                    if (t.blockPosChange)
                        editor.setPosition({ column: this.curCol, lineNumber: this.curRow });
                });
                // editor.onMouseMove(e=>{
                //     t._mouseOver = true;
                // });
                // editor.onMouseLeave(e=>{
                //     t._mouseOver = false;
                // });
                setTimeout(() => {
                    editor.focus();
                }, 100);
            }
            if (this.p.disableCopy)
                editor.onKeyDown(e => {
                    if (e.ctrlKey && e.keyCode == monaco.KeyCode.KeyC) {
                        alert("Please don't try to copy and paste from the tutor's code");
                        e.preventDefault();
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
            // @ts-ignore
            if (PAGE_ID == PAGEID.lesson)
                editor.onDidScrollChange(function () {
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
        else
            this.setTemp(false); // <-- should this be moved onto to when opening files from the left menu? 
        // deselect others
        for (const c of this.p.d_files.children) {
            c.classList.remove("cur");
        }
        this.link.classList.add("cur");
        for (const c of this.p.codeCont.children) {
            this.p.codeCont.removeChild(c);
        }
        this.p.codeCont.appendChild(this.cont);
        this.editor.layout();
        loadEditorTheme();
        this.p.curFile = this;
        if (this.p.lastFolder) {
            this.p.lastFolder._fiLabel.parentElement.classList.remove("sel");
            this.p.lastFolder = null;
        }
        let allFI = document.querySelectorAll(".file-item.sel");
        for (const c of allFI) {
            c.classList.remove("sel");
        }
        if (this._fi) {
            this._fi.classList.add("sel");
            function check(folder) {
                if (!folder)
                    return;
                if (folder._fiLabel.parentElement.classList.contains("close")) {
                    folder._fiLabel.click();
                    folder.p.lastFolder = null;
                    folder._fiLabel.parentElement.classList.remove("sel");
                }
                if (folder.folder)
                    check(folder.folder);
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
function cursorLoop() {
    let delay = 500;
    let list = document.querySelectorAll(".custom-cursor");
    for (const c of list) {
        if (c.classList.toggle("hide"))
            delay = 500;
    }
    setTimeout(cursorLoop, delay);
}
cursorLoop();
// From Jaredcheeda, https://stackoverflow.com/questions/7381974/which-characters-need-to-be-escaped-in-html
function escapeMarkup(dangerousInput) {
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
let b_refresh;
let b_save;
let b_publish;
let icon_refresh;
let iframe;
let _icRef_state = true;
// Lesson Hooks
let listenHooks = {
    addFile: [],
    refresh: []
};
let _hookCount = 0;
async function waitForQuickHook(hook) {
    if (lesson.isResuming)
        return;
    let t = new TmpTask();
    t.start();
    addHook(hook, t);
    await t._prom;
}
function addHook(hook, task) {
    hook.push(task);
    console.log("...added hook");
    _hookCount++;
}
function resolveHook(hook, data) {
    let list = [...hook];
    let result = 0;
    for (let i = 0; i < list.length; i++) {
        let f = list[i];
        if (!f.check(data)) {
            console.log("...hook resolve failed check; Unresolved: " + _hookCount);
            if (f.preventContinueIfFail())
                result = 1;
            continue;
        }
        if (f._resFinish)
            f._resFinish();
        else {
            console.warn("Weird, there wasn't a finish for the hook...?");
        }
        hook.splice(hook.indexOf(f), 1);
        _hookCount--;
        console.log("...resolved hook; Unresolved: " + _hookCount);
    }
    return result;
}
function abortAllHooks() {
    let ok = Object.keys(listenHooks);
    for (const key of ok) {
        let list = [...listenHooks[key]];
        for (const c of list) {
            if (!c._resFinish) {
                listenHooks[key].slice(listenHooks[key].indexOf(c), 1);
            }
            else
                c._resFinish();
        }
    }
}
// Setup Editor
var EditorType;
(function (EditorType) {
    EditorType[EditorType["none"] = 0] = "none";
    EditorType[EditorType["self"] = 1] = "self";
    EditorType[EditorType["tutor"] = 2] = "tutor";
})(EditorType || (EditorType = {}));
function setupEditor(parent, type) {
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
    if (type != EditorType.none) {
        let label = document.createElement("div");
        label.innerHTML = `<!--<div class="material-symbols-outlined">menu</div>--><div>${(type == EditorType.tutor ? "TUTOR" : "YOU")}</div>`; // disabled the menu icon
        // label.textContent = (type == EditorType.tutor ? "Tutor's Code" : "Your Code");
        label.className = (type == EditorType.tutor ? "editor-type-tutor" : "editor-type-self");
        d_files.appendChild(label);
    }
}
function postSetupEditor(project) {
    let parent = project.parent;
    project.d_files = parent.querySelector(".d-open-files");
    project.codeCont = parent.querySelector(".cont-js");
    project.d_files.addEventListener("wheel", e => {
        e.preventDefault();
        let m = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY);
        project.d_files.scrollBy({
            left: m / 2,
            top: 0,
            behavior: "instant"
        });
    });
    console.log("completed post setup");
    // project.createFile("test.html",`<p>Hello</p>`,"html");
    // project.files[0].open();
    // project.createFile("main.js",`console.log("hello");\nconsole.log("hello");\nconsole.log("hello");\nconsole.log("hello");`,"javascript");
    // project.files[1].open();
    let add_file = parent.querySelector(".b-add-file");
    add_file.addEventListener("click", e => {
        if (!project.canEdit)
            return;
        if (project.isTutor) {
            alert("Sorry! You can't add files to the tutor's project!");
            return;
        }
        // let name = prompt("Enter file name:","index.html");\
        let name = "index.html";
        new InputMenu("New File", "Enter file name", (data) => {
            project.createFile(data, "", null, project.lastFolder ?? project.curFile?.folder, true);
        }, () => {
            console.log("File Creation Canceled");
        }, "Create File").load();
        if (!name)
            return;
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
    if (ops_rename) {
        async function flashHL(f) {
            if (!f)
                return;
            let ele = (f instanceof FFolder ? f._fiLabel : f._fi);
            if (!ele)
                return;
            ele.classList.add("hl");
            await wait(200);
            ele.classList.remove("hl");
        }
        ops_rename.addEventListener("click", e => {
            if (!project)
                return;
            project.renameFItem(project.lastFolder ?? project.curFile);
        });
        ops_delete.addEventListener("click", e => {
            if (!project)
                return;
            project.deleteFItem(project.lastFolder ?? project.curFile);
        });
        ops_cut.addEventListener("click", e => {
            if (!project)
                return;
            let items = project.hlItems.length ? project.hlItems : [project.lastFolder ?? project.curFile];
            for (const c of items)
                flashHL(c);
            project.cutFItems(project.lastFolder ?? project.curFile);
        });
        ops_copy.addEventListener("click", e => {
            if (!project)
                return;
            let items = project.hlItems.length ? project.hlItems : [project.lastFolder ?? project.curFile];
            for (const c of items)
                flashHL(c);
            project.copyFItems(project.lastFolder ?? project.curFile);
        });
        ops_paste.addEventListener("click", e => {
            if (!project)
                return;
            let item = project.lastFolder ?? project.curFile;
            project.pasteFItems(item, (effected) => {
                // for(const c of effected) flashHL(item);
            });
        });
    }
    // other meta
    if (project.meta)
        project.setPublished(project.meta.submitted);
    else
        project.setPublished(false);
    if (project.meta)
        if (project.meta.cid != null)
            b_publish.classList.remove("hide");
}
// PAGE ID
var PAGEID;
(function (PAGEID) {
    PAGEID[PAGEID["none"] = 0] = "none";
    PAGEID[PAGEID["editor"] = 1] = "editor";
    PAGEID[PAGEID["lesson"] = 2] = "lesson";
})(PAGEID || (PAGEID = {}));
let PAGE_ID = PAGEID.none;
// 
let tmpMenus = [];
let isOverTmpMenu = false;
function closeTmpMenus() {
    for (const c of tmpMenus) {
        c.parentElement.removeChild(c);
        if (c.onclose)
            c.onclose(null);
    }
    tmpMenus = [];
    isOverTmpMenu = false;
}
document.addEventListener("mousedown", e => {
    if (!isOverTmpMenu)
        closeTmpMenus();
    if (!overSubMenu) {
        closeAllSubMenus();
    }
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
async function refreshProject() {
    if (!project)
        return;
    if (project.needsSave || project.files.some(v => !v._saved) || !project.hasSavedOnce) {
        await saveProject(true);
        project.needsSave = false;
    }
    let file1 = project.items.find(v => v.name == "index.html");
    if (!file1 || !project.hasSavedOnce) {
        alert("No index.html file found! Please create a new file called index.html in the outer most folder of your project, this file will be used in the preview.");
        return;
    }
    iframe.contentWindow.location.replace(project.getURL());
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
    resolveHook(listenHooks.refresh, null);
}
async function refreshLesson() {
    if (!lesson)
        return;
    let project = lesson.p;
    if (project.files.some(v => !v._saved) || !project.hasSavedOnce)
        await saveLesson(true);
    let file1 = project.files.find(v => v.name == "index.html");
    if (!file1 || !project.hasSavedOnce) {
        alert("No index.html file found! Please create a new file called index.html, this file will be used in the preview.");
        return;
    }
    iframe.contentWindow.location.replace(serverURL + "/lesson/" + g_user.uid + "/" + socket.id + "/" + g_user.uid + "/" + lesson.lid);
    icon_refresh.style.rotate = _icRef_state ? "360deg" : "0deg";
    _icRef_state = !_icRef_state;
    resolveHook(listenHooks.refresh, null);
}
let _isSaving = false;
async function saveProject(isQuick = false) {
    if (PAGE_ID == PAGEID.lesson)
        return;
    if (!project)
        return;
    if (_isSaving)
        return;
    if (!project.canEdit)
        return;
    _isSaving = true;
    b_save.children[0].textContent = "progress_activity";
    b_save.children[0].classList.add("progress-anim");
    let start = performance.now();
    await uploadProjectFiles(project);
    let time = performance.now() - start;
    let delay = 0;
    project.hasSavedOnce = true;
    project.files.forEach(v => v.setSaved(true));
    if (!isQuick) {
        if (time < 50)
            delay = 300;
        await wait(delay);
    }
    b_save.children[0].textContent = "save";
    b_save.children[0].classList.remove("progress-anim");
    _isSaving = false;
}
async function saveLesson(isQuick = false) {
    if (!lesson)
        return;
    if (_isSaving)
        return;
    _isSaving = true;
    b_save.children[0].textContent = "progress_activity";
    b_save.children[0].classList.add("progress-anim");
    await uploadLessonFiles(lesson);
    lesson.p.hasSavedOnce = true;
    lesson.p.files.forEach(v => v.setSaved(true));
    if (!isQuick) {
        await wait(300);
    }
    b_save.children[0].textContent = "save";
    b_save.children[0].classList.remove("progress-anim");
    _isSaving = false;
    lesson.needsSave = false;
}
// screenshot util
function screenshot() {
    // @ts-ignore
    html2canvas(document.body.children[5]).then(canvas => {
        document.body.appendChild(canvas);
    });
}
function goToProject(pid) {
    // location.pathname = "/editor/index.html?pid="+pid;
    let url = new URL(location.href);
    url.pathname = "/editor/index.html";
    url.searchParams.set("pid", pid);
    history.pushState(null, null, url);
    location.reload();
}
document.addEventListener("keydown", e => {
    // let active = document.activeElement;
    // if(active) if(active.className.endsWith("cursor-text")){
    let k = e.key.toLowerCase();
    if (menusOpen.length)
        if (!document.fullscreenElement) {
            if (k == "escape") {
                closeAllMenus();
            }
            return;
        }
});
document.addEventListener("keyup", e => {
    {
        let f = (PAGE_ID == PAGEID.lesson ? lesson?.p?.curFile : project?.curFile);
        if (!f) {
            // console.warn("no file");
            return;
        }
        if (!f._saved) {
            // console.warn("not saved");
            return;
        }
        function check() {
            let v = f.editor.getValue();
            if (f._lastSavedText != v) {
                f.setSaved(false);
            }
        }
        // setTimeout(()=>{
        // check();
        // },50);
        requestAnimationFrame(check);
    }
});
document.addEventListener("mouseup", e => {
    if (dragItem) {
        if (dragItem.down)
            dragItem.down = null;
        if (dragItem.drag) {
            if (dragItem.tmp)
                dragItem.tmp.remove();
            dragItem.tmp = null;
            // document.body.classList.remove("dragging");
            let last = dragItem.drag;
            dragItem.drag = null;
            dragItem.end(last);
        }
    }
    _hadClosedSubMenu = false;
});
class DragData {
    constructor(e, clone, end) {
        this._sx = e.clientX;
        this._sy = e.clientY;
        this.clone = clone;
        this.end = end;
    }
    down;
    drag;
    tmp;
    clone;
    end;
    _sx;
    _sy;
}
let dragItem;
document.addEventListener("mousemove", e => {
    if (dragItem) {
        let down = dragItem.down;
        let dx = e.clientX - dragItem._sx;
        let dy = e.clientY - dragItem._sy;
        let dist = Math.sqrt(dx ** 2 + dy ** 2);
        if (down && dist > 20) {
            dragItem.drag = down;
            // document.body.classList.add("dragging");
            if (!dragItem.tmp) {
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
        if (dragItem.drag) {
            dragItem.tmp.style.left = (e.clientX) + "px";
            dragItem.tmp.style.top = (e.clientY) + "px";
        }
    }
});
// Dropdowns
let subMenus;
let overSubMenu = false;
let subs = [];
function pushSub(data) {
    subs.push(data);
    requestAnimationFrame(() => {
        _areSubs = true;
    });
}
setTimeout(() => {
    subMenus = document.querySelector(".sub-menus");
    if (!subMenus)
        return;
    subMenus.addEventListener("mouseenter", e => {
        overSubMenu = true;
    });
    subMenus.addEventListener("mouseleave", e => {
        overSubMenu = false;
    });
}, 500);
let _hadClosedSubMenu = false;
let _areSubs = false;
function closeAllSubMenus() {
    if (!areSubMenus())
        return;
    // console.log("HAD: ",_hadClosedSubMenu);
    // if(_hadClosedSubMenu) return;
    let list = [...subs];
    for (const s of subs) {
        s.e.remove();
        subs.splice(subs.indexOf(s), 1);
        if (s.ops.useHold)
            s.e.classList.remove("hold");
        // _hadClosedSubMenu = true;
        if (s.ops?.onclose)
            s.ops?.onclose();
    }
    _areSubs = false;
}
function areSubMenus() {
    return _areSubs;
}
async function openDropdown(btn, getLabels, onclick, ops = {}) {
    let labels = getLabels();
    let icons = (ops?.getIcons ? ops?.getIcons() : []);
    // if(e.button != 2) return;
    // subMenus.innerHTML = "";
    if (ops.isRightClick)
        closeAllSubMenus();
    else {
        if (areSubMenus()) {
            btn.classList.remove("hold");
            closeAllSubMenus();
            return;
        }
        // _hadClosedSubMenu = true;
        // requestAnimationFrame(()=>{
        //     _hadClosedSubMenu = false;
        // });
    }
    // else await wait(1);
    // let rect = btn.getBoundingClientRect();
    let dd = document.createElement("div");
    if (ops.useHold)
        btn.classList.add("hold");
    dd.oncontextmenu = function (e) {
        e.preventDefault();
    };
    dd.className = "dropdown";
    for (let i = 0; i < labels.length; i++) {
        let d = document.createElement("div");
        let l = labels[i];
        let icon = icons[i];
        if (icon) {
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
        d.addEventListener("click", function (e) {
            closeAllSubMenus(); // for now (might need an op to disable this)
            onclick(i);
        });
    }
    subMenus.appendChild(dd);
    // dd.style.left = (e.clientX)+"px";
    // dd.style.top = (e.clientY-60)+"px";
    let rect = btn.getBoundingClientRect();
    let x = rect.x;
    let y = rect.bottom;
    if (!ops?.customPos) {
        let xoff = 0;
        if (ops?.openToLeft) {
            xoff = -100;
            x += rect.width;
        }
        dd.style.left = (x) + "px";
        dd.style.top = (y - 60) + "px";
        if (y > innerHeight / 2)
            dd.style.transform = `translate(${xoff}%,-100%)`;
        else
            dd.style.transform = `translate(${xoff}%,0px)`;
    }
    if (ops?.onopen)
        ops.onopen(dd);
    pushSub({
        e: dd,
        ops: ops
        // onclose:ops?.onclose
    });
    return dd;
    // requestAnimationFrame(()=>{
    //     let rect = dd.getBoundingClientRect();
    //     if(rect.bottom >= innerHeight-20){
    //         let y = rect.y = innerHeight-20-rect.height - 60;
    //         dd.style.top = (y)+"px";
    //     }
    // });
}
function setupDropdown(btn, getLabels, onclick, ops) {
    btn.addEventListener("contextmenu", async (e) => {
        e.preventDefault();
        ops.customPos = true;
        let dd = await openDropdown(btn, getLabels, onclick, ops);
        dd.style.left = (e.clientX) + "px";
        dd.style.top = (e.clientY - 60) + "px";
        if (e.clientY > innerHeight / 2)
            dd.style.transform = "translate(0px,-100%)";
        else
            dd.style.transform = "translate(0px,0px)";
    });
}
// callouts
function setupCallout(ele, label) {
    if (!ele)
        return;
    let d;
    let isOver = false;
    let flag = false;
    ele.addEventListener("mouseenter", async (e) => {
        if (label == null)
            label = ele.getAttribute("co-label");
        if (isOver || flag) {
            if (d?.parentElement)
                d.remove();
            return;
        }
        isOver = true;
        flag = true;
        // await wait(500);
        await wait(200);
        flag = false;
        if (!isOver) {
            if (d?.parentElement)
                d.remove();
            return;
        }
        d = document.createElement("div");
        d.textContent = label;
        d.className = "callout";
        subMenus.appendChild(d);
        let rect = ele.getBoundingClientRect();
        d.style.top = (rect.y + rect.height - 60 + 12) + "px";
        if (rect.x > innerWidth / 2) {
            d.style.left = (rect.right + d.offsetWidth) + "px";
            d.style.setProperty("--left", (rect.width / 2 - 7 - rect.width + d.offsetWidth) + "px");
            // d.style.setProperty("--left",(rect.width/2-7+d.offsetWidth)+"px");
            d.style.transform = "translate(-200%,0px)";
        }
        else {
            d.style.left = (rect.x) + "px";
            d.style.setProperty("--left", (rect.width / 2 - 7) + "px");
            d.style.transform = "translate(0px,0px)";
        }
    });
    ele.addEventListener("mouseleave", e => {
        isOver = false;
        if (d?.parentElement)
            d.remove();
    });
}
function setupCustomCallout(ele, onshow) {
    if (!ele)
        return;
    let d;
    let isOver = false;
    let flag = false;
    ele.addEventListener("mouseenter", async (e) => {
        if (isOver || flag) {
            if (d?.parentElement)
                d.remove();
            return;
        }
        isOver = true;
        flag = true;
        // await wait(500);
        await wait(200);
        flag = false;
        if (!isOver) {
            if (d?.parentElement)
                d.remove();
            return;
        }
        d = document.createElement("div");
        d.className = "callout";
        subMenus.appendChild(d);
        onshow(d);
        let rect = ele.getBoundingClientRect();
        d.style.top = (rect.y + rect.height - 60 + 12) + "px";
        if (rect.x > innerWidth / 2) {
            d.style.left = (rect.right + d.offsetWidth) + "px";
            d.style.setProperty("--left", (rect.width / 2 - 7 - rect.width + d.offsetWidth) + "px");
            d.style.transform = "translate(-200%,0px)";
        }
        else {
            d.style.left = (rect.x) + "px";
            d.style.setProperty("--left", (rect.width / 2 - 7) + "px");
            d.style.transform = "translate(0px,0px)";
        }
    });
    ele.addEventListener("mouseleave", e => {
        isOver = false;
        if (d?.parentElement)
            d.remove();
    });
}
async function initCallouts() {
    await loginProm;
    const callouts = document.querySelectorAll(".co-item");
    for (const c of callouts) {
        setupCallout(c);
    }
    console.log(`initialized ${callouts.length} callouts`);
}
function whenEnter(elm, f) {
    elm.addEventListener("keydown", e => {
        if (e.key.toLowerCase() == "enter")
            f(elm.value);
    });
    elm.addEventListener("blur", e => {
        f(elm.value);
    });
}
let _hasAlertedNotLoggedIn = false;
function alertNotLoggedIn() {
    _hasAlertedNotLoggedIn = true;
    new LogInMenu().load();
}
// Paul transfered stuff
class Submission {
    constructor(previewURL, sentBy, pid, uid) {
        this.url = previewURL;
        this.who = sentBy;
        this.pid = pid;
        this.uid = uid;
    }
    url;
    who;
    pid;
    uid;
    cc;
    lc;
    lang;
    ws;
    t;
}
class Challenge {
    constructor(cID, name, desc, inProgress, imgURL, pid, submitted, difficulty, ongoing, submission_count) {
        if (!imgURL || imgURL == "")
            imgURL = "/images/fillerthumbnail.png";
        this.name = name;
        this.desc = desc;
        this.inProgress = inProgress;
        this.imgURL = imgURL;
        this.pid = pid;
        this.submitted = submitted;
        this.cID = cID;
        this.difficulty = difficulty;
        this.ongoing = ongoing;
        this.submission_count = submission_count;
        this.sub_highlights = [];
    }
    name;
    desc;
    inProgress;
    imgURL;
    pid;
    submitted;
    cID;
    difficulty;
    ongoing;
    submission_count;
    timespan;
    sub_highlights;
    submissions;
    static from(data) {
        let c = new Challenge(data.id, data.name, data.desc, false, data.imgUrl, null, false, data.difficulty, data.ongoing, data.submission_count);
        c.timespan = data.timespan;
        c.submissions = data.sub;
        // c.submissions = data.sub?.map(
        //     (v: any) =>
        //     new Submission(
        //         v.url || "/images/fillerthumbnail.png",
        //         v.who,
        //         v.lineCount,
        //         v.pid,
        //         v.uid
        //     ),
        // );
        data.sub_highlights = data.hl;
        // c.sub_highlights = data.hl?.map(
        //     (v: any) =>
        //     new Submission(
        //         v.url || "/images/fillerthumbnail.png",
        //         v.who,
        //         v.lineCount,
        //         v.pid,
        //         v.uid
        //     ),
        // );
        c.inProgress = data.inProgress;
        c.submitted = data.completed;
        return c;
    }
}
class DetailedChallenge extends Challenge {
    constructor(cID, name, desc, inProgress, imgURL, pid, submitted, difficulty, ongoing, submission_count, submissions) {
        super(cID, name, desc, inProgress, imgURL, pid, submitted, difficulty, ongoing, submission_count);
    }
    static fromDetails(c, data) {
        let dc = new DetailedChallenge(c.cID, c.name, c.desc, c.inProgress, c.imgURL, c.pid, c.submitted, c.difficulty, c.ongoing, c.submission_count, data.submissions);
        return dc;
    }
}
let curChallengeMenu;
async function createChallengePopup(c) {
    console.log("Creating Challenge Menu");
    if (curChallengeMenu)
        curChallengeMenu.close();
    curChallengeMenu = new ChallengeMenu(c);
    curChallengeMenu.load();
}
let cLeft;
let challengePopupBody;
let tempPopupBody;
class ChallengeMenu extends Menu {
    constructor(c) {
        super("Challenge Menu");
        this.c = c;
    }
    c;
    load() {
        super.load();
        let areSubmissions = this.c.submission_count <= 0 ? false : true;
        let cDesc = getChallengeDescription(this.c.desc);
        this.menu.innerHTML = `
              <div class="c-popup">
                  <div class ="c-popup-left">
                      <div class="c-popup-header">
                          <h2 class="c-popup-title">${this.c.name}</h2>
                          <i class="c-attempted"> ${this.c.submitted ? "Attempted" : "Not Attempted"}</i>
                      </div>
                      <div class="c-popup-body resize" resize="r">
                          <div class ="c-popup-task">
                            <h3 class="c-popup-sub-title">Task</h3>
                            ${cDesc.innerHTML || '<span class="popup-class-text"> There is currently no description for this challenge. Please check back later!'}
                          </div>
                          <div class ="c-popup-implementations">
                              <div class="c-popup-implementations-header">
                                  <h3 class="c-popup-sub-title">Submissions</h3>
                                  <button class="c-view-all" onclick="showSubmissions('${this.c.cID}','${areSubmissions}')">
                                      View All (${this.c.submission_count})
                                  </button>
                              </div>
                              <div class="c-implementations">
                              </div>
                          </div>
                      </div>
                  </div>
                  <div class="c-popup-right">
                      <div class="c-popup-close material-symbols-outlined">
                          close
                      </div>
                      <div class="c-popup-img-div">
                        <div class="c-popup-img-cont" onclick="previewImg(${this.c.imgURL});">
                            <img class="c-popup-img" src="${this.c.imgURL}" alt="challenge image">
                        </div>
                          <i class="c-popup-img-text">Sketch Mockup</i>
                      </div>
                      <div class="c-popup-bottom-right">
                        <div class="c-difficulty">
                            <span class="c-difficulty-text">Difficulty:</span><span class="c-difficulty-number">${this.c.difficulty}</span>
                        </div>
                        <button class="c-start" onclick="${!this.c.inProgress ? `startChallenge('${this.c.cID}')` : `continueChallenge('${this.c.cID}')`}"><h3>${this.c.inProgress ? "Continue" : "Start"}</h3><span class="material-symbols-outlined c-start-arrow">arrow_forward_ios<span/></button>
                      </div>
                  </div>
              </div>
        `;
        // let _body = this.menu.querySelector(".c-popup-body") as HTMLElement;
        // setupResize(_body);
        if (this.c.sub_highlights?.length) {
            for (let i = 0; i < this.c.sub_highlights.length; i++) {
                let temp = getSubmissionElement(this.c.sub_highlights[i], this.c.cID);
                document.querySelector(".c-implementations").appendChild(temp);
            }
        }
        else {
            document.querySelector(".c-implementations").innerHTML =
                "<i>There are currently no submissions to this challenge. Upload one to be featured here!</i>";
            document.querySelector(".c-implementations").classList.add("empty");
            document.querySelector(".c-view-all").classList.add("empty");
            console.log("No submissions found for this challenge.");
        }
        cLeft = document.querySelector(".c-popup-left");
        let cBtn = document.querySelector(".c-popup-close");
        cBtn.onclick = () => {
            this.close();
        };
        return this;
    }
}
function getChallengeDescription(desc) {
    let challDesc = document.createElement("span");
    challDesc.className = "popup-class-text";
    let inputStr = desc.split("\n", 4);
    for (let i = 0; i < inputStr.length; i++) {
        let t = document.createElement("span");
        t.textContent = inputStr[i];
        challDesc.append(t);
    }
    return challDesc;
}
function previewImg(url) {
    console.log("Attempting to preview image");
    // new ImagePreview(url).load();
}
class ImagePreview extends Menu {
    constructor(url) {
        super("Image Preview");
        this.url = url;
    }
    url;
    load() {
        super.load();
        this.menu.innerHTML = `
            <div class="img-preview">
                <img src="${this.url}" alt="challenge image">
            </div>
        `;
        return this;
    }
}
function showSubmissions(cID, areSubmissions, goToSubmission) {
    let goToSub = "";
    if (goToSubmission)
        goToSub = goToSubmission;
    if (areSubmissions && cID) {
        console.log(cID);
        window.location.href = `submissions.html?cid=${cID || ''}&pid=${goToSub || ''}`;
    }
}
function getImplementationsHTML(submissionsExist) {
    let temp = document.createElement("div");
    temp.classList.add("c-popup-implementations");
    let defaultText = "";
    let emptyClass = "";
    if (!submissionsExist) {
        defaultText =
            "<i>There are currently no submissions to this challenge. Upload one to be featured here!</i>";
        emptyClass = "empty";
    }
    temp.innerHTML = `
          <div class="c-popup-implementations-header">
                <h4 class="c-popup-sub-title">Implementations</h4>
                <button class="c-back" onclick="resetChallengeBody();">
                Back <span class="material-symbols-outlined c-back-arrow">arrow_back_ios</span>
          </button>
          </div>
          <div class="c-implementations ${emptyClass}">
                ${defaultText}
          </div>
       `;
    return temp;
}
function resetChallengeBody() {
    challengePopupBody.remove();
    console.log("Attempting to reset body of challenge popup");
    cLeft.append(tempPopupBody);
}
let loadingDiv;
async function showLoadingAnim(loadThese, delay) {
    // if no delay is passed in, loading animation wil loop until hideLoadingAnim() is called
    loadingDiv = document.createElement("div");
    loadingDiv.classList.add("loading-div");
    loadingDiv.innerHTML = `
        <div class="lds-ellipsis">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
        <i class ="loading-text">Loading...</i>
    `;
    for (const c of loadThese) {
        c.appendChild(loadingDiv.cloneNode(true));
    }
    await wait(delay);
}
async function hideLoadingAnim() {
    let loadingDivs = document.querySelectorAll(".loading-div");
    loadingDivs.forEach((div) => {
        div.remove();
    });
}
/**
 * Get a single challenge from the server.
 * Using.submissions returns an array with all submissions for that challenge.
 */
async function getChallenge(cid) {
    return new Promise(resolve => {
        socket.emit("getChallenge", cid, (data) => {
            resolve(Challenge.from(data));
        });
    });
}
/**
 * Creates a confirm prompt.
 */
class ConfirmMenu extends Menu {
    constructor(title, message, onConfirm, onCancel, confirmText, cancelText) {
        super(title);
        this.message = message;
        this.onCancel = onCancel;
        this.onConfirm = onConfirm;
        this.confirmText = confirmText;
        this.cancelText = cancelText;
    }
    cancelText;
    confirmText;
    message;
    onConfirm;
    onCancel;
    load() {
        super.load(0, true);
        this.body.innerHTML = `<span class="confirm-menu-message">${this.message}</span>`;
        let temp = document.createElement("div");
        temp.className = "confirm-menu-options";
        this.body.appendChild(temp);
        let btn1 = document.createElement("button");
        btn1.textContent = this.confirmText ?? "Confirm";
        let btn2 = document.createElement("button");
        btn2.textContent = this.cancelText ?? "Cancel";
        temp.appendChild(btn1);
        temp.appendChild(btn2);
        btn1.addEventListener("click", () => { this.confirmChoice(); });
        btn2.addEventListener("click", () => { this.cancelChoice(); });
        // when enter key is pressed, confirm choice
        temp.addEventListener("keydown", (e) => {
            if (e.key == "Enter") {
                this.confirmChoice();
            }
        });
        return this;
    }
    confirmChoice() {
        this.onConfirm();
        this.close();
    }
    cancelChoice() {
        this.onCancel();
        this.close();
    }
}
/**
 * Creates a prompt for user input. onConfirm needs to take a parameter, which the menu will pass in as the user's input.
 */
class InputMenu extends Menu {
    constructor(title, inputMessage, onConfirm, onCancel, confirmText, cancelText, beforeInputPrompt, afterInputPrompt) {
        super(title);
        this.inputMessage = inputMessage;
        this.onConfirm = onConfirm;
        this.onCancel = onCancel;
        this.confirmText = confirmText || null;
        this.cancelText = cancelText || null;
        this.beforeInputPrompt = beforeInputPrompt || null;
        this.afterInputPrompt = afterInputPrompt || null;
    }
    inputMessage;
    onConfirm;
    onCancel;
    confirmText;
    cancelText;
    beforeInputPrompt;
    afterInputPrompt;
    load() {
        super.load();
        this.postLoad();
        return this;
    }
    async postLoad() {
        this.body.innerHTML = `<div class="inputref"></div>`;
        let inputObj = this.setupTextInput(".inputref", { label: this.inputMessage });
        if (this.beforeInputPrompt) {
            let beforeElm = document.createElement("span");
            beforeElm.style.fontSize = "15px";
            beforeElm.textContent = this.beforeInputPrompt;
            document.querySelector(".menu-body").insertBefore(beforeElm, inputObj.inp.parentElement); // this line took forever to figure out and is probably not optimal... sigh. 
        }
        if (this.afterInputPrompt) {
            let afterElm = document.createElement("span");
            afterElm.style.fontSize = "15px";
            afterElm.textContent = this.afterInputPrompt;
            this.body.appendChild(afterElm);
        }
        let temp = document.createElement("div");
        temp.className = "confirm-menu-options";
        this.body.appendChild(temp);
        let btn1 = document.createElement("button");
        btn1.textContent = this.confirmText ?? "Submit";
        let btn2 = document.createElement("button");
        btn2.textContent = this.cancelText ?? "Cancel";
        temp.appendChild(btn1);
        temp.appendChild(btn2);
        btn1.addEventListener("click", () => { this.confirmChoice(inputObj.inp.value); });
        btn2.addEventListener("click", () => { this.cancelChoice(); });
        inputObj.inp.focus();
        // when enter key is pressed, send input to confirmChoice
        inputObj.inp.addEventListener("keydown", (e) => {
            if (e.key == "Enter") {
                this.confirmChoice(inputObj.inp.value);
            }
        });
    }
    // ran on click of "confirm" button, or on enter key press
    confirmChoice(data) {
        console.log("Choice confirmed. Input data: " + data);
        this.onConfirm(data);
        this.close();
    }
    // ran on click of "cancel" button
    cancelChoice() {
        this.onCancel();
        this.close();
    }
}
function getSubmissionElement(submission, cid) {
    let subDiv = document.createElement("div");
    subDiv.className = "s-card";
    /* Submitted by */
    let name = document.createElement("span");
    name.className = "s-name";
    name.textContent = submission.who;
    subDiv.appendChild(name);
    /* Right hand container */
    let submissionRight = document.createElement("div");
    submissionRight.className = "s-card-right";
    subDiv.appendChild(submissionRight);
    /* Languages used */
    // let languages = submission.languages as string[];
    let languages = submission.lang;
    let languageCont = document.createElement("div");
    languageCont.className = "s-languages";
    submissionRight.appendChild(languageCont);
    languages.forEach((lang) => {
        let temp = document.createElement("span");
        temp.textContent = lang;
        temp.className = `s-lang-${lang}`;
        languageCont.appendChild(temp);
    });
    /* Character count */
    let charCount = document.createElement("span");
    charCount.className = "s-char-count";
    let charCountSymbol = document.createElement("span");
    charCountSymbol.className = "material-symbols-outlined char-count-symbol";
    charCountSymbol.textContent = "tag";
    let charCountText = document.createElement("span");
    charCountText.textContent = submission.cc.toLocaleString() || "0";
    // charCountText.textContent = '34,598';
    console.log(submission);
    charCount.appendChild(charCountSymbol);
    charCount.appendChild(charCountText);
    submissionRight.appendChild(charCount);
    /* Time taken */
    let timeTaken = document.createElement("span");
    timeTaken.className = "s-time-taken";
    let dateSymbol = document.createElement("span");
    dateSymbol.className = "material-symbols-outlined date-symbol";
    dateSymbol.textContent = "schedule";
    let timeTakenText = document.createElement("span");
    // timeTakenText.textContent = "4h";
    timeTakenText.textContent = getTimeTaken(submission.t);
    timeTaken.appendChild(dateSymbol);
    timeTaken.appendChild(timeTakenText);
    submissionRight.appendChild(timeTaken);
    /* Open button */
    let openButton = document.createElement("button");
    openButton.className = "s-open-preview";
    openButton.textContent = "Open";
    openButton.setAttribute("pid", submission.pid);
    submissionRight.appendChild(openButton);
    if (cid) {
        openButton.addEventListener("click", () => {
            showSubmissions(cid, true, submission.pid);
        });
    }
    /* Return completed submission element */
    return subDiv;
}
async function createSubmissionMenu(sub) {
    console.log("Creating Submission Menu");
    if (curSubMenu) {
        curSubMenu.close();
        console.log("already a menu");
    }
    let subData = await getSubmission(sub.uid, sub.pid);
    curSubMenu = new SubmissionMenu(subData, sub);
    curSubMenu.load();
}
class SubmissionData {
    p;
    lines;
    lang;
    date_submitted;
}
function calcSubmissionLang(data) {
    let lang = [];
    let allowed = ["html", "css", "js"];
    function search(list) {
        for (const item of list) {
            if (item instanceof ULFolder) {
                search(item.items);
                continue;
            }
            let ind = item.name.lastIndexOf(".");
            if (ind == -1)
                continue;
            let ext = item.name.substring(ind + 1);
            if (allowed.includes(ext))
                lang.push(ext);
        }
    }
    if (data.items)
        search(data.items);
    return lang.length ? lang.sort((a, b) => a.localeCompare(b)).join(", ") : "None";
}
function calcSubmissionCharCount(data) {
    let allowed = ["html", "css", "js"];
    let amt = 0;
    function search(list) {
        for (const item of list) {
            if (item instanceof ULFolder) {
                search(item.items);
                continue;
            }
            let it = item;
            let ind = item.name.lastIndexOf(".");
            if (ind == -1)
                continue;
            let ext = item.name.substring(ind + 1);
            if (allowed.includes(ext)) {
                let after = it.val.replace(/\s/g, "");
                amt += after.length;
            }
        }
    }
    if (data.items)
        search(data.items);
    return amt.toLocaleString();
}
function getWhenSubmitted(data) {
    return data.meta.ws ? new Date(data.meta.ws).toLocaleDateString() : "-.-";
}
function getTimeTaken(v) {
    if (v == null)
        return "-.-";
    // time in seconds?
    let unit = "s";
    let units = [
        { u: "m", s: 60 },
        { u: "h", s: 60 },
        { u: "d", s: 24 },
    ];
    for (let i = 0; i < units.length; i++) {
        let d = units[i];
        if (v >= d.s) {
            unit = d.u;
            v /= d.s;
        }
        else
            break;
    }
    return v + unit;
}
let curSubMenu;
class SubmissionMenu extends Menu {
    constructor(data, sub) {
        super("Submission Menu");
        this.data = data;
        console.log("loaded data", data);
        this.submission = sub;
    }
    data;
    submission;
    async load2() {
        let p = this.data.p;
        await loadMonaco();
        // load items
        let par = this.menu.querySelector(".submission-editor > .editor-cont");
        let tmpp = new Project("__tmp", par, {
            readonly: false
        });
        setupEditor(tmpp.parent, EditorType.none);
        tmpp.init();
        // // @ts-ignore
        // window.tmpp = tmpp;
        function run(l, cur) {
            sortFiles(l);
            let list = [];
            for (const f of l) {
                if (f.val != null) {
                    let ff = tmpp.createFile(f.name, f.val, null, cur);
                    createFileListItem(ff);
                    list.push(ff);
                }
                else if (f.items != null) {
                    let ff = tmpp.createFolder(f.name, cur, false);
                    createFolderListItem(ff);
                    list.push(ff);
                    ff.items = run(f.items, ff);
                }
            }
            return list;
        }
        run(p.items, null);
        let height = par.getBoundingClientRect().height;
        par.parentElement.style.height = height + "px";
        let b_openInFull = par.parentElement.querySelector(".b-fullscreen");
        b_openInFull.onclick = async function () {
            b_openInFull.blur();
            if (!document.fullscreenElement) {
                await par.parentElement.requestFullscreen();
                b_openInFull.children[0].textContent = "collapse_content";
                await wait(100);
                tmpp.getCurEditor()?.layout();
            }
            else {
                await document.exitFullscreen();
            }
        };
        par.parentElement.onfullscreenchange = async function (e) {
            if (!document.fullscreenElement) {
                b_openInFull.children[0].textContent = "open_in_full";
                await wait(100);
                tmpp.getCurEditor()?.layout();
            }
        };
    }
    load() {
        let p = this.data.p;
        let url = getPublicProjectURL(this.submission.uid, this.submission.pid);
        super.load();
        this.menu.innerHTML = `
        <div class="s-popup">
          <div class="s-popup-header">
            <h1 class="s-popup-title">${this.submission.who}'s Submission</h1>
            <span class="s-popup-close material-symbols-outlined">close</span>
          </div>
          <div class="s-popup-body">
            <div class="s-popup-code">
              <!--<h2 class="s-popup-code-title">Code</h2>-->
              <div class="submission-editor">
                <div class="pane-files pane">${genFilesPane()}</div>
                <div class="editor-cont pane"></div>
              </div>
              <div class="s-popup-code-contents">${p.name}<br><br>${p.desc}<!--I'm starting to wonder how far I'm willing to take these class names, it's getting bad...--></div>
            </div>
            <div class="s-popup-preview">
              <div class="s-popup-preview-header">
                <h2 class="s-popup-preview-title">Preview</h2>
                <div class="s-preview-title-nested">
                  <button class="b-refresh s-b-refresh icon-btn">
                    <div class="icon-refresh material-symbols-outlined">sync</div>
                    <div class="label">Refresh</div>
                  </button>
                  <div style="margin-left:auto;gap:10px" class="flx-h flx-al">
                    <div class="material-symbols-outlined b-open-in-new co-item" co-label="Open in new tab">open_in_new</div>
                  </div>
                </div>
              </div>
              <div class="s-popup-preview-iframe-cont">
                <iframe src="${url}" class="s-popup-iframe"></iframe>
              </div>
              <div class="s-popup-preview-details">
                <h3 class="s-popup-preview-details-title">Details</h3>
                <div class="s-popup-preview-details-contents">
                  <div class="s-popup-preview-details-item">
                    <h4 class="s-popup-preview-details-item-title">Line Count</h4>
                    <div class="s-popup-preview-details-item-contents">${this.submission.lc}</div>
                  </div>
                  <div class="s-popup-preview-details-item">
                    <h4 class="s-popup-preview-details-item-title">Char. Count</h4>
                    <div class="s-popup-preview-details-item-contents">${this.submission.cc /*calcSubmissionCharCount(p)*/}</div>
                  </div>
                  <div class="s-popup-preview-details-item">
                    <h4 class="s-popup-preview-details-item-title">Language(s)</h4>
                    <div class="s-popup-preview-details-item-contents">${this.submission.lang ? this.submission.lang.join(", ") : "None" /*calcSubmissionLang(p)*/}<!--JavaScript--></div>
                  </div>
                  <div class="s-popup-preview-details-item">
                    <h4 class="s-popup-preview-details-item-title">Date Submitted</h4>
                    <div class="s-popup-preview-details-item-contents">${new Date(this.submission.ws).toLocaleDateString() /*getWhenSubmitted(p)*/}</div>
                  </div>
                  <div class="s-popup-preview-details-item">
                    <h4 class="s-popup-preview-details-item-title">Time Taken (WIP)</h4>
                    <div class="s-popup-preview-details-item-contents">${getTimeTaken(this.submission.t)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
        this.load2();
        let b_refresh = this.menu.querySelector(".s-b-refresh");
        let b_openInNew = this.menu.querySelector(".b-open-in-new");
        let icon_refresh = this.menu.querySelector(".icon-refresh");
        let frame = this.menu.querySelector(".s-popup-iframe");
        b_refresh.addEventListener("click", e => {
            frame.src = url;
            icon_refresh.style.rotate = _icRef_state ? "360deg" : "0deg";
            _icRef_state = !_icRef_state;
        });
        b_openInNew.addEventListener("click", e => {
            open(frame.src, "_blank");
        });
        let sPopupClose = document.querySelector(".s-popup-close");
        sPopupClose.onclick = () => {
            this.close();
        };
        return this;
    }
}
let _hasLoadedMonaco = false;
async function loadMonaco() {
    if (_hasLoadedMonaco)
        return;
    // @ts-ignore
    require.config({ paths: { vs: "/lib/monaco/min/vs" } });
    await new Promise(resolve => {
        // @ts-ignore
        require(['vs/editor/editor.main'], function () {
            resolve();
        });
    });
    _hasLoadedMonaco = true;
}
//# sourceMappingURL=util.js.map