// import type { Socket } from "socket.io-client";

// declare let socket:Socket;

// @ts-ignore
let socket:Socket = io("http://127.0.0.1:3000");

let connected = false;

function setConneted(val:boolean){
    connected = val;
    console.log("NEW Connection Status: ",connected);
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

function _logout(data:CredentialResData){
    console.log("...starting logout");
    socket.emit("logout",data,(data:CredentialResData)=>{
        console.log("Log out successful");
        g_user = null;
    });
}
function _login(data:CredentialResData,token:string){
    console.log("...starting login");
    socket.emit("login",data,token,(data:CredentialResData)=>{
        console.log("Log in successful: ",data);
        if(g_user) if(g_user.email != data.email){
            location.reload();
            return;
        }
        g_user = data;
        if(loginProm){
            _loginRes();
            _loginRes = null;
            loginProm = null;
        }
    });
}

// header
let h_profile = document.querySelector(".h-profile") as HTMLElement;
h_profile.addEventListener("click",e=>{
    new LogInMenu().load();
});

// lesson
class ULFile{
    constructor(name:string,val:string,path:string,enc:string){
        this.name = name;
        this.val = val;
        this.path = path;
        this.enc = enc;
    }
    name:string;
    val:string;
    path:string;
    enc:string;
}
function uploadLessonFiles(lesson:Lesson){ // for refresh
    let list:ULFile[] = [];
    for(const f of lesson.p.files){
        list.push(new ULFile(f.name,f.editor.getValue(),"","utf8"));
    }
    return new Promise<void>(resolve=>{
        socket.emit("uploadLessonFiles",lesson.lid,list,(err:any)=>{
            if(err) console.log("ERR while uploading files:",err);
            resolve();
        });
    });
}
async function restoreLessonFiles(lesson:Lesson){
    let files = await new Promise<ULFile[]>(resolve=>{
        socket.emit("restoreLessonFiles",lesson.lid,(files:ULFile[])=>{
            if(!files){
                console.log("ERR while restoring files");
                resolve([]);
                return;
            }
            resolve(files);
        });
    });
    for(const f of files){
        lesson.p.createFile(f.name,f.val);
    }
    if(files.length) lesson.p.hasSavedOnce = true;
}
// 
function uploadProjectFiles(project:Project){ // for refresh
    let list:ULFile[] = [];
    for(const f of project.files){
        list.push(new ULFile(f.name,f.editor.getValue(),"","utf8"));
    }
    return new Promise<void>(resolve=>{
        socket.emit("uploadProjectFiles",project.pid||"tmp_project",list,(err:any)=>{
            if(err) console.log("ERR while uploading files:",err);
            resolve();
        });
    });
}
async function restoreProjectFiles(project:Project){
    let files = await new Promise<ULFile[]>(resolve=>{
        socket.emit("restoreProjectFiles",project.pid||"tmp_project",(files:ULFile[])=>{
            if(!files){
                console.log("ERR while restoring files");
                resolve([]);
                return;
            }
            console.log("FOUND FILES",files);
            resolve(files);
        });
    });
    for(const f of files){
        project.createFile(f.name,f.val);
    }
    if(files.length) project.hasSavedOnce = true;
}

// Challenge
async function getServerChallenges(){
    let list = await new Promise<Challenge[]>(resolve=>{
        socket.emit("getChallenges",20,0,selectedFilters,(list:any[])=>{
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