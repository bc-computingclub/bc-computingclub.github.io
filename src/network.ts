// import type { Socket } from "socket.io-client";

// declare let socket:Socket;

// @ts-ignore
let socket:Socket = io(serverURL);

let connected = false;

function setConneted(val:boolean){
    connected = val;
    console.log("NEW Connection Status: ",connected);
    // setTimeout(()=>{
    //     if(PAGE_ID != PAGEID.home) if(localStorage.getItem("token") == null) new LogInMenu().load();
    // },500);
}

socket.on("connect",()=>{
    if(!connected){
        // reconnect
        logUserIn();
    }
    
    setConneted(true);
});
socket.on("disconnect",()=>{
    setConneted(false);
});

// 

function reconnectUser(){
    _usedConfirmLeavePopup = true;
    socket.disconnect();
    socket.connect();
}

function _logout(){
    socket.emit("logout",(data:number)=>{
        if(data != 0){
            alert(`Error ${data} failed to logout`);
            return;
        }
        h_profile.classList.remove("logged-in");
        h_profile.innerHTML = `<span class="material-symbols-outlined">Person</span>`;
        localStorage.removeItem("logData");
        localStorage.removeItem("token");
        g_user = null;
        location.href = "/index.html";
        google.accounts.id.disableAutoSelect();
    });
}
let _usedConfirmLeavePopup = false;
function _login(data:CredentialResData,token:string){
    socket.emit("login",data,token,(data:CredentialResData)=>{
        console.log("Log in successful");
        if(!_usedConfirmLeavePopup){
            if(g_user || _hasAlertedNotLoggedIn){
                reloadPage();
                return;
            }
            if(g_user) if(g_user.data.email != data.email){
                reloadPage();
                return;
            }
        }
        _usedConfirmLeavePopup = false;
        g_user = new GlobalUser(data);
        if(loginProm){
            _loginRes();
            _loginRes = null;
            loginProm = null;
        }
    });
}

// header
let h_profile = document.querySelector(".h-profile") as HTMLElement;
h_profile.addEventListener("mousedown",e=>{
    let labels = [
        g_user ? "View Profile" : " --- ",
        g_user ? "Switch Account" : "Log In",
        g_user ? "Log Out" : " --- ",
        g_user ? "<Top Secret>" : " --- ",
        // "<Top Secret>",
        "Switch Theme",
        "Reconnect to Server"
    ];
    openDropdown(h_profile,()=>labels,async (i)=>{
        let l = labels[i];
        // if(l == "Switch Account" || l == "Log In"){
        if(i == 0) {
            location.href = "/profile/";
        }
        if(i == 1){
            new LogInMenu().load();
        }
        // else if(l == "Log Out"){
        if(i == 2 && g_user){
            _logout();
        }
        if(i == 3 && g_user){
        // if(i == 3){
            new NotYetMenu().load();
        }
        // else if(l == "Switch Theme"){
        if(i == 4){
            setTheme(curTheme == "dark" ? "light" : "dark");
            return;
        }
        else if(i == 5){
            socket.disconnect();
            await wait(500);
            socket.connect();
        }
        
        closeAllSubMenus();
    },{
        openToLeft:true,
        getIcons(){
            return ["person","switch_account","logout","deployed_code","light","wifi"]; // not sure if I want "landscape" or "question_mark" or "deployed_code" here or maybe "cloud"/"filter_drama"
        },
        useHold:false, // true doesn't quite work right yet
        onopen(dd){
            if(dev.blockViewProfile) if(dd.children[0]){
                dd.children[0].classList.add("disabled");
            }
        }
    });
});

// 
async function testBuffers(){
    let can = document.createElement("canvas");
    let ctx = can.getContext("2d");
    ctx.fillStyle = "red";
    ctx.fillRect(20,20,40,30);
    
    let u = new Uint8Array(ctx.getImageData(0,0,can.width,can.height).data.buffer);
    
    let blob = await new Promise<Blob>(resolve=>{
        can.toBlob(blob=>{
            resolve(blob);
        });
    });
    let u2 = new Uint8Array(await blob.arrayBuffer());
    
    console.log(u,u2);
}

// lesson
class ULItem{
    constructor(name:string){
        this.name = name;
    }
    name:string;
}
class ULFolder extends ULItem{
    constructor(name:string,items:ULItem[]=[]){
        super(name);
        this.items = items;
    }
    items:ULItem[];
}
class ULFile extends ULItem{
    constructor(name:string,buf:Uint8Array){
        super(name);
        this.buf = buf;
        this.type = getExt(name); // might not even need this
        // this.val = val;
        // this.path = path;
        // this.enc = enc;
    }
    // val:string;
    // path:string;
    // enc:string;

    buf:Uint8Array;
    type:string;
}
function uploadLessonFiles(lesson:Lesson){ // for refresh
    let list:ULItem[] = [];
    // for(const f of lesson.p.files){
    //     if(f.editor) f.buf = encoder.encode(f.editor.getValue());
    //     list.push(new ULFile(f.name,f.buf));
    // }

    function sant(l:FItem[]){
        let ll:ULItem[] = [];
        for(const f of l){
            if(f instanceof FFile){
                if(!f._saved ? true : !f.beenUploaded){
                    ll.push(new ULFile(f.name,f.encode()));
                    f.beenUploaded = true;
                }
            }
            else if(f instanceof FFolder) ll.push(new ULFolder(f.name,sant(f.items)));
        }
        return ll;
    }
    list = sant(project.items);

    let prog = {
        eventI:lesson.progress.eventI,
        taskI:lesson.progress.taskI,
        prog:lesson.progress.prog,
        section:lesson.progress.section,
        scene:lesson.progress.scene
        // tutFiles:[]
    };
    // for(const f of lesson.tut.files){
    //     prog.tutFiles.push(new ULFile(f.name,f.editor.getValue(),"","utf8"));
    // }
    return new Promise<void>(resolve=>{
        console.log(".......uploading");
        socket.emit("uploadLessonFiles",lesson.lid,list,prog,(err:any)=>{
            if(err) alert("ERR while uploading files: "+err);
            resolve();
        });
    });
}
async function restoreLessonFiles(lesson:Lesson){
    let data = await new Promise<any>(resolve=>{
        socket.emit("restoreLessonFiles",{
            lid:lesson.lid,
            section:lesson.progress.section,
            scene:lesson.progress.scene
        },async (data:any)=>{
            if(!data){
                console.log("ERR while restoring files");
                resolve(null);
                return;
            }

            console.log("LESSON META:",data);

            async function loadBufs(items:ULItem[]){
                for(let i = 0; i < items.length; i++){
                    let item = items[i];
                    if("items" in item){ // folder
                        await loadBufs(item.items as ULItem[]);
                    }
                    else{ // file
                        let it1 = item as any;
                        it1.buf = new Uint8Array(it1.buf);
                        let it = new ULFile(it1.name,it1.buf);
                        items[i] = it;
                    }
                }
            }
            await loadBufs(data.files ?? []);

            resolve(data);
        });
    });
    if(!data || typeof data == "number"){
        alert("Err: while trying to restore lesson files. Error code: "+data);
        return;
    }
    if(!data.files){
        data.files = [];
        console.warn("...default for files[]");
    }
    console.log("now files:",data.files,!data.files,data);
    // for(const f of data.files){
    //     await lesson.p.createFile(f.name,f.buf,undefined,f.val); // TODO - make this work with the blob system
    // }

    // NEW SYSTEM
    async function run(l:any[],cur:FFolder){
        console.log("...L:",l);
        sortFiles(l);
        let list = [];
        for(const f of l){
            if(f.items == null){
                let ff = await project.createFile(f.name,f.buf,null,cur);
                list.push(ff);
            }
            else if(f.items != null){
                let ff = project.createFolder(f.name,cur,false);
                list.push(ff);
                ff.items = await run(f.items,ff);
            }
        }
        return list;
    }
    await run(data.files,null);

    // if(data.tutFiles) for(const f of data.tutFiles){
    //     lesson.tut.createFile(f.name,f.val);
    // }
    if(data.files.length) lesson.p.hasSavedOnce = true;
    project.files.forEach(v=>v.setSaved(true));
    
    // console.log("LESSON META",data);
    lesson.progress.eventI = data.meta.eventI;
    lesson.progress.taskI = data.meta.taskI;
    if(data.meta.section) lesson.progress.section = data.meta.section;
    if(data.meta.scene) lesson.progress.scene = data.meta.scene;

    console.log(":::META",data.meta);
    
    // console.warn("PREVIOUS INFO:",lesson.info);
    lesson.info = data.info;
    // return data;

    // select the first file to be consistent (usually this will be the index.html)
    await wait(0);
    // if(lesson.p.files.length) lesson.p.files[0].open();
    // if(lesson.tut.files.length) lesson.tut.files[0].open();


    // Claeb: I don't think this stuff actually works at all lol xD

    // let indexTut = lesson.tut.items.find(v=>v.name == "index.html") as FFile;
    // if(indexTut) indexTut.open();
    // else lesson.tut.files[0]?.open();

    for(const f of lesson.p.files){
        f.open(false);
    }
    lesson.startActiveFileUnlock();
    for(const f of lesson.tut.files){
        f.open();
    }
    lesson.endActiveFileUnlock();

    lesson.postSetup();
    // let index = lesson.p.files.find(v=>v.name == "index.html") as FFile;
    // if(index) index.open();
    // else lesson.p.files[0]?.open();
}
// 
// function old_uploadProjectFiles(project:Project){ // for refresh
//     let list:ULFile[] = [];
//     for(const f of project.files){
//         list.push(new ULFile(f.name,f.editor.getValue(),"","utf8"));
//     }
//     return new Promise<void>(resolve=>{
//         socket.emit("uploadProjectFiles",project.pid||"tmp_project",list,(err:any)=>{
//             if(err) console.log("ERR while uploading files:",err);
//             resolve();
//         });
//     });
// }
function uploadProjectFiles(project:Project){ // for refresh    
    let list:ULItem[] = [];
    function sant(l:FItem[]){
        let ll:ULItem[] = [];
        for(const f of l){
            // if(f instanceof FFile) ll.push(new ULFile(f.name,f.blob,f.isTextFile() ? (f.editor ? f.editor.getValue() : f.text) : null,"","utf8"));
            if(f instanceof FFile){
                // if(f.editor) f.buf = project.textEncoder.encode(f.editor.getValue());

                if(!f._saved ? true : !f.beenUploaded){
                    ll.push(new ULFile(f.name,f.encode()));
                    f.beenUploaded = true;
                }
            }
            else if(f instanceof FFolder) ll.push(new ULFolder(f.name,sant(f.items)));
        }
        return ll;
    }
    list = sant(project.items);
    return new Promise<void>(resolve=>{
        socket.emit("uploadProjectFiles",project.meta.owner,project.pid||"tmp_project",list,(err:any)=>{
            if(err) console.log("ERR while uploading files:",err);
            resolve();
        });
    });
}
// /**@deprecated */
// async function _restoreProjectFiles(project:Project){
//     let files = await new Promise<ULFile[]>(resolve=>{
//         socket.emit("restoreProjectFiles",project.pid||"tmp_project",(files:ULFile[])=>{
//             if(!files){
//                 console.log("ERR while restoring files");
//                 resolve([]);
//                 return;
//             }
//             console.log("FOUND FILES",files);
//             resolve(files);
//         });
//     });
//     for(const f of files){
//         project.createFile(f.name,f.val);
//     }
//     if(files.length) project.hasSavedOnce = true;
// }
async function restoreProjectFiles(uid:string,pid:string){
    let data = await new Promise<{meta:ProjectMeta,canEdit:boolean}>(resolve=>{
        socket.emit("restoreProjectFiles",uid,pid,async (meta:ProjectMeta,err:any,canEdit:boolean)=>{
            console.warn("CAN EDIT THIS PROJECT: ",canEdit);
            if(meta == null){
                console.log("ERR while restoring files","code",err);
                if(err == -2) alert("You don't have permission to view this project");
                resolve(null);
                return;
            }
            // console.log("FOUND META",meta);

            // load array buffers into blobs

            async function loadBufs(items:ULItem[]){
                for(let i = 0; i < items.length; i++){
                    let item = items[i];
                    if("items" in item){ // folder
                        await loadBufs(item.items as ULItem[]);
                    }
                    else{ // file
                        let it1 = item as any;
                        // it1.buf = encoder.encode(it1.buf);
                        it1.buf = new Uint8Array(it1.buf);
                        let it = new ULFile(it1.name,it1.buf);
                        items[i] = it;
                        // it.blob = new Blob([it.buf]);
                        // it.val = await it.blob.text();
                    }
                }
            }
            await loadBufs(meta.items);

            // 

            resolve({meta,canEdit});
        });
    });
   if(!data){
        console.log("ERR: couldn't get data when restoring project files");
        return {meta:null,canEdit:false};
   }
   return data;
}

// Challenge
async function getServerChallenges(search?:string){
    let list = await new Promise<Challenge[]>(resolve=>{
        socket.emit("getChallenges",search?.length?search:undefined,20,0,selectedFilters,searchOption,searchDesc,(list:any[])=>{
            resolve(list);
        });
    });
    if(list) list = list.map(v=>Challenge.from(v));
    return list || [];
}
async function getChallengeData(cid:string){
    return await new Promise<DetailedChallenge>(resolve=>{
        socket.emit("getChallengeDetails",cid,(data:any)=>{
            resolve(data);
        });
    });
}

// Feedback
async function sendFeedback(title:string,type:number,desc:string){
    return await new Promise<boolean>(resolve=>{
        socket.emit("sendFeedback",title,type,desc,(res:any)=>{
            if(typeof res == "number"){
                alert(`Error ${res} while trying to submit feedback`);
                resolve(false);
                return;
            }
            resolve(true);
        });
    });
}

// some util

function handleEndpointError(res:any,msg:string){
    if(!res || res?.err){
        alert(`Error ${res?.err} ${msg}`);
        return false;
    }
    return true;
}

// not ready just yet ;)
class NotYetMenu extends Menu{
    constructor(){
        super("not-yet");
    }
    load(priority?: number, newLayer?: boolean): this {
        super.load(priority,newLayer);
        
        this.startTheNotReadyYet();
        return this;
    }
    async startTheNotReadyYet(){
        function create(tag:string,text:string){
            let d = document.createElement(tag);
            d.innerHTML = text;
            return d;
        }
        function makeCenterCont(){
            let d = document.createElement("div");
            d.className = "flx-c";
            d.style.width = "100%";
            d.style.height = "100%";
            // d.style.width = "400px";
            // d.style.height = "400px";
            return d;
        }
        function makeCont(){
            let d = document.createElement("div");
            d.style.margin = "40px";
            d.style.width = "100%";
            d.style.height = "100%";
            return d;
        }
        async function SWait(delay:number){
            await DWait(delay);
        }

        await SWait(1000);
    
        // loading
        let loadCont = makeCenterCont();
        let l_load = create("div","");
        let loadI = 0;

        loadCont.appendChild(l_load);
        this.body.appendChild(loadCont);

        for(let i = 0; i < 3; i++){
            l_load.textContent = ".".repeat(loadI%3+1);
            loadI++;
            await SWait(500);
        }

        loadCont.remove();
        await SWait(500);

        // terminal
        // let terminalCont = makeCont();
        let terminalCont = makeCenterCont();
        let terminal = create("div","");
        terminal.className = "ny-terminal";

        type TypeOps = {
            delay?:number,
            choices?:{
                text:string
            }[],

            prom?:Promise<string>,
            res?:(s:string)=>void
        };

        let cur:TypeOps;
        let listen = (e:KeyboardEvent)=>{
            let k = e.key;
            
            if(cur.choices){
                let c = cur.choices.find(v=>v.text == k);
                if(c){
                    terminal.textContent = "";
                    if(cur.res) cur.res(k);
                }
            }
        };
        document.addEventListener("keydown",listen);

        async function typeText(text:string,ops:TypeOps={}){
            // terminal.textContent = "";
            
            // 

            cur = ops;

            if(ops.choices){
                ops.prom = new Promise<string>(resolve=>ops.res = resolve);
            }
            
            if(ops.delay == null) ops.delay = 1500;
            if(ops.choices) text += ` (${ops.choices.map(v=>v.text).join("/")})`;
            
            let div = create("div",text);
            terminal.appendChild(div);
            await SWait(ops.delay);

            if(ops.choices){
                return await ops.prom;
            }
        }
        async function clearText(){
            terminal.textContent = "";
            await SWait(1500);
        }

        terminalCont.appendChild(terminal);
        this.body.appendChild(terminalCont);

        // type (start)
        await typeText("You realize there's something hidden behind the menu.");
        await typeText("It's top secret.");
        let choice = await typeText("Look closer?",{
            choices:[
                {
                    text:"y"
                },
                {
                    text:"n"
                }
            ]
        });
        if(choice == "n"){
            await typeText("I see you're not ready then.");
            await SWait(2000);
            this.close();
            return;
        }

        await typeText("You decide to look closer.");

        await SWait(1500);
        this.menu.classList.add("flip");
        await SWait(2000);
        this.body.style.animation = "none";
        await SWait(500);

        await clearText();
        await typeText("You see an inscription on it, it writes:<br>");
        await typeText("There will come a time when humans can pass, but only the worthy will survive. Are you ready for this?");

        choice = await typeText("Continue reading?",{
            choices:[
                {
                    text:"y"
                },
                {
                    text:"n"
                }
            ]
        });
        if(choice == "n"){
            await typeText("You scared to work hard or something? Alright then.");
            await typeText("But trust me, you'll be missing out.");
            await SWait(2000);
            this.close();
            return;
        }

        // await typeText("Come back when you get stronger and show me your strength.");
        await typeText("Come back when you get stronger, and show me just how strong you can get.",{
            choices:[
                {
                    text:"Enter"
                }
            ]
        });
        await typeText("It won't be easy, great power requires great dedication and effort.",{
            choices:[
                {
                    text:"Enter"
                }
            ]
        });
        await typeText("Train, and train hard, and maybe some day I'll let you pass if you prove yourself worthy.",{
            choices:[
                {
                    text:"Enter"
                }
            ]
        });
        // choice = await typeText("Some day I'll let you pass, but true reward comes from true dedication.",{
        //     choices:[
        //         {
        //             text:"Enter"
        //         }
        //     ]
        // });
        // you are not yet worthy... come back when you are stronger

        await SWait(500);
        this.close();
    }
}