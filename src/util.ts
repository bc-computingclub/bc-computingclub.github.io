let serverURL = "http://localhost:3000";

function wait(delay:number){
    return new Promise<void>(resolve=>{
        setTimeout(()=>{
            resolve();
        },delay);
    });
}

// callouts
const callouts = document.querySelectorAll(".callout");

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
    }

    close(){
        if(this.menu.parentElement){
            this.menu.parentElement.removeChild(this.menu);
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
    load(): void {
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
    }
}
class LogInMenu extends Menu{
    constructor(){
        super("Log In","login");
    }
    load(): void {
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
function genHeader(i:number,isCompact=true){
    let navCont = document.createElement("div");
    navCont.className = "nav-container";
    navCont.innerHTML = `
        <div class="logo">
            <a href="/index.html">
                <img src="/images/error.png" alt="Code Challenge Logo" class="logo-thumbnail">
                <!-- Insert placeholder logo here -->
            </a>
        </div>
        <div class="d-lesson-confirm">
            <div>Press "I'm Done" to let the Tutor know when you're done with this step.</div>
            <button class="b-im-done icon-btn">
                <div class="material-symbols-outlined">done</div>
                <div>I'm Done</div>
            </button>
            <button class="b-replay"><div class="material-symbols-outlined">replay</div></button>
            <button class="b-go-back-step"><div class="material-symbols-outlined">keyboard_double_arrow_left</div></button>
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
        this.files = [];
        this.openFiles = [];
        this.parent = parent;

        this.readonly = settings.readonly || false;
        this.disableCopy = settings.disableCopy || false;
    }
    title:string;
    files:FFile[];
    openFiles:FFile[];
    curFile:FFile;

    parent:HTMLElement;
    d_files:HTMLElement;
    codeCont:HTMLElement;

    readonly = false;
    disableCopy = false;

    createFile(name:string,text:string,lang?:string){
        let res = resolveHook(listenHooks.addFile,name);
        if(res == 1){
            console.warn("Failed creation prevented from hook");
            return;
        }
        let q = this.files.find(v=>v.name == name);
        if(q){
            q.open();
            return q;
        }
        let f = new FFile(this,name,text,lang);
        this.files.push(f);
        f.open();
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

class FFile{
    constructor(p:Project,name:string,text:string,lang?:string){
        if(!lang){
            let ext = name.split(".").pop();
            let map = {
                "html":"html",
                "css":"css",
                "js":"javascript"
            };
            lang = map[ext] || "text";
        }
        
        this.p = p;
        this.name = name;
        this.text = text;
        this.lang = lang;
    }
    p:Project;
    name:string;
    text:string;
    lang:string;

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

    open(){
        if(!this.p.openFiles.includes(this)){
            let link = document.createElement("div");
            this.link = link;
            link.textContent = this.name;
            link.className = "file-link";
            this.p.d_files.insertBefore(link,this.p.d_files.children[this.p.d_files.children.length-2]);
            this.p.openFiles.push(this);
            let t = this;
            link.onmousedown = function(){
                t.open();
            };

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
        }
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
let icon_refresh:HTMLElement;
let iframe:HTMLIFrameElement;
let _icRef_state = true;