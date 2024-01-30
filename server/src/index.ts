import { io, server, CredentialResData, User, users, getUserBySock, sanitizeEmail, getProject, attemptToGetProject, access, readdir, read, mkdir, removeFile, write, ULFile, ProjectMeta, allProjects, UserChallengeData, Project } from "./connection";
import { Challenge, ChallengeData, ChallengeGet, challenges } from "./s_challenges";
import fs from "fs";
import { createInterface } from "readline";
import crypto from "crypto";

function valVar(v:any,type:string){
    if(v == null) return false;
    return (typeof v == type);
}
function valVar2(v:any,type:string,f:any){
    if(typeof f != "function") return false;
    if(v == null){
        f();
        return false;
    }
    return (typeof v == type);
}

io.on("connection",socket=>{
    socket.on("login",async (data:CredentialResData,token:string,call:(data:CredentialResData)=>void)=>{
        if(!valVar(data,"object")) return;
        if(!valVar(data.email,"string")) return;
        if(!valVar(token,"string")) return;
        if(token.length < 20) return;

        let wasNewUser = false;

        let user = users.get(data.email);
        if(!user){ // create account
            if(!users.has(data.email)){
                let san = sanitizeEmail(data.email);
                // try to read from file first
                let fdataStr:string|null = null;
                try{
                    fdataStr = await read("../users/"+san+".json","utf8");
                }
                catch(e){
                    console.log("aaaaaaaa");
                }

                function newUser(){
                    user = new User(data.name,data.email,data.picture,data._joinDate,data._lastLoggedIn,socket.id,[]);
                    user.joinDate = new Date().toISOString();
                    user.saveToFile();
                    wasNewUser = true;
                    console.log(":: created new user: ",user.email);
                }
                if(!fdataStr){
                    // create new user if couldn't find their file
                    newUser();
                }
                else{
                    let fdata = JSON.parse(fdataStr);
                    if(!fdata){
                        console.log("# Err couldn't read user file! using provided data instead");
                        newUser();
                        return;
                    }
                    user = new User(fdata.name,fdata.email,fdata.picture,fdata._joinDate,fdata._lastLoggedIn,socket.id,fdata.pMeta);
                    user.challenges = (fdata.challenges as any[]||[]).map(v=>new UserChallengeData(v.i,v.cid,v.pid));
                    user.saveToFile();
                }
                if(user) users.set(user.email,user);
            }
        }
        if(!user) return;
        user.lastLoggedIn = new Date().toISOString();

        // login
        let _prevToken = user.getFirstToken();
        user.addToken(token);
        user.addSocketId(socket.id);

        // if(!wasNewUser) user.saveToFile(); // disabled for testing

        if(valVar(call,"function")) call(user.getTransferData());

        console.log(":: user logged in: ",user.email,` (New session? ${user.getFirstToken() != _prevToken}) (SockIds: ${user.getSocketIds().join(", ")})`);
    });
    socket.on("disconnect",()=>{
        let user = getUserBySock(socket.id);
        if(!user) return;
        user.removeSocketId(socket.id);
    });
    socket.on("getUserLastLoggedIn",(token:string)=>{

    });

    // lesson
    socket.on("uploadLessonFiles",async (lessonId:string,list:ULFile[],call:()=>void)=>{
        if(!valVar(list,"object")) return;
        if(!valVar(lessonId,"string")) return;
        if(!valVar(call,"function")) return;
        
        let user = getUserBySock(socket.id);
        if(!user) return;
        // need to validate type integrity here
        
        console.log("uploading...");
        let uid = user.sanitized_email;

        let path = "../lesson/"+uid+"/"+lessonId;
        if(!await access(path)) await mkdir(path);

        let curFiles = await readdir(path);
        if(!curFiles) return;

        curFiles = curFiles.filter(v=>!list.some(w=>w.name == v));
        for(const f of curFiles){
            console.log("...removing file:",path+"/"+f);
            await removeFile(path+"/"+f);
        }
        for(const f of list){
            console.log("...writing file:",path+"/"+f.name,f.enc);
            await write(path+"/"+f.name,f.val,f.enc);
        }

        // todo - cache file values so if they're the same then they don't need to be reuploaded, or do this on the client maybe to speed it up

        console.log(":: done uploading");
        call();
    });
    socket.on("restoreLessonFiles",async (lessonId:string,call:(data:any)=>void)=>{
        if(!valVar(lessonId,"string")) return;
        if(!valVar(call,"function")) return;

        let user = getUserBySock(socket.id);
        if(!user) return;

        console.log("restoring...");
        let uid = user.sanitized_email;
        let path = "../lesson/"+uid+"/"+lessonId;
        if(!await access(path)){
            await mkdir(path);
            // call(null);
            // return;
        }
        let curFiles = await readdir(path);
        if(!curFiles){
            console.log("Err: failed to find project curFiles");
            return;
        }
        let files:ULFile[] = [];
        for(const f of curFiles){
            files.push(new ULFile(f,await read(path+"/"+f,"utf8"),"","utf8"));
        }
        call(files);
    });
    // editor
    socket.on("uploadProjectFiles",async (pid:string,list:ULFile[],call:()=>void)=>{
        if(!valVar(list,"object")) return;
        if(!valVar(pid,"string")) return;
        if(!valVar(call,"function")) return;
        
        let user = getUserBySock(socket.id);
        if(!user) return;
        // need to validate type integrity here
        
        console.log("uploading...");
        let uid = user.sanitized_email;

        let path = "../project/"+uid+"/"+pid;
        if(!await access(path)) await mkdir(path);

        let curFiles = await readdir(path);
        if(!curFiles) return;

        curFiles = curFiles.filter(v=>!list.some(w=>w.name == v));
        for(const f of curFiles){
            console.log("...removing file:",path+"/"+f);
            await removeFile(path+"/"+f);
        }
        for(const f of list){
            console.log("...writing file:",path+"/"+f.name,f.enc);
            await write(path+"/"+f.name,f.val,f.enc);
        }

        let p = user.projects.find(v=>v.pid == pid);
        if(p) for(const f of list){
            let ff = p.files.find(v=>v.name == f.name);
            if(ff) ff.val = f.val;
            else console.log("Err: null file in project files list");
        }
        else console.log("Err: couldn't find project while uploading files");

        // todo - cache file values so if they're the same then they don't need to be reuploaded, or do this on the client maybe to speed it up

        console.log(":: done uploading");
        call();
    });
    socket.on("restoreProjectFiles",async (pid:string,call:(data:any)=>void)=>{
        if(!valVar(pid,"string")){
            console.log("Err: pid incorrect format");
            call(null);
            return;
        }
        if(!valVar(call,"function")){
            console.log("Err: call incorrect format");
            call(null);
            return;
        }

        let user = getUserBySock(socket.id);
        if(!user){
            console.log("Err: could not find user");
            call(null);
            return;
        }

        console.log("restoring... from PID: ",pid);

        let p = await attemptToGetProject(user,pid);
        
        call(p?.files);

        return;
        
        // let uid = user.sanitized_email;
        // let path = "../project/"+uid+"/"+pid;
        // if(!await access(path)){
        //     // await mkdir(path);
        //     call(null);
        //     return;
        // }
        // let curFiles = await readdir(path);
        // let files:ULFile[] = [];
        // for(const f of curFiles){
        //     files.push(new ULFile(f,await read(path+"/"+f,"utf8"),"","utf8"));
        // }
        // call(files);
    });

    // User get stuff
    socket.on("user-getProjectList",(section:ProjectGroup,f:(d:any)=>void)=>{
        let user = getUserBySock(socket.id);
        if(!user){
            f(null);
            return;
        }
        let data:any;
        switch(section){
            case ProjectGroup.personal:{
                data = user.projects.map(v=>v.serialize()?.serialize());
            } break;
        }
        
        f(data);
    });

    // Request stuff
    socket.on("getChallengeDetails",async (cid:string,f:(data:any)=>void)=>{
        if(!valVar2(cid,"string",f)) return;
        
        // let c = challenges.get(cid);
        let data = await ChallengeData.fromCID(cid);
        f(data?.serializeGet());
    });
    socket.on("getChallenges",(perPage:number,pageI:number,filter:FilterType,option:string,desc:boolean,f:(data:any)=>void)=>{
        if(!option) option = "popularity";
        if(desc == null) desc = true;
        
        if(!valVar2(perPage,"number",f)) return;
        if(!valVar2(pageI,"number",f)) return;
        if(!valVar2(filter,"object",f)) return;
        if(!valVar2(option,"string",f)) return;
        if(!valVar2(desc,"boolean",f)) return;
        
        let list:ChallengeGet[] = [];
        let clist:Challenge[] = [];
        for(const [k,v] of challenges){
            clist.push(v);
        }
        clist = clist.sort((a,b)=>{
            switch(option) {
                case "popularity":
                    if(desc) {
                        return b.cnt - a.cnt;
                    }
                    return a.cnt - b.cnt;
                case "alphabetical":
                    if(desc) {
                        return a.name.localeCompare(b.name);
                    }
                    return b.name.localeCompare(a.name);
                default:
                    return 0;
            }
        });

        // my optimized method
        let i = 0;
        let skip = pageI*perPage;
        for(const v of clist){
            if(filter.difficulty?.length){
                if(!filter.difficulty.includes(v.difficulty)) continue;
            }
            // else continue; // comment this so if no boxes are checked to default to all checked
            let ongoing = v.ongoing;
            if(filter.ongoing?.length) if(!ongoing) continue;
            // if(filter.ongoing?.length ? !ongoing : ongoing) continue;
            
            if(i >= skip) list.push(v.serializeGet());

            if(list.length >= perPage) break;
            i++;
        }
        // partly chatgpt from Paul
        if(false){
            let challengeList:Challenge[] = [];
            for(const [k,v] of challenges){
                list.push(v);
            }
            list = challengeList.filter(challenge=>{
                Object.keys(filter).every(filterType => {
                    switch (filterType) {
                        case "difficulty":
                            return filter[filterType].includes(challenge.difficulty);
                        // case "ongoing":
                                // return challenge.ongoing === true;
                        // case "completed":
                                // return challenge.submitted === true;
                        default:
                            return true;
                    }
                });
            });
        }

        f(list);
    });
    socket.on("startChallenge",async (cid:string,f:(data:any)=>void)=>{
        if(!valVar2(cid,"string",f)) return;
        console.log("starting challenge...",cid);

        let user = getUserBySock(socket.id);
        if(!user) return;

        let p = await createChallengeProject(user,cid);
        if(typeof p == "number"){
            console.log("Err: failed starting challenge with error code: "+p);
            f(p);
            return;
        }

        f(p.pid);
        console.log(">> created challenge project");
    });

    // 
    socket.on("createProject",()=>{

    });
});
function genPID(){
    return crypto.randomUUID();
}
async function createChallengeProject(user:User,cid:string):Promise<Project|number>{
    let c = challenges.get(cid);
    if(!c) return 3; // couldn't find challenge
    let pid = genPID();
    
    if(user.challenges.some(v=>v.cid == cid)) return 1; // already exists
    let path = "../project/"+user.email+"/"+pid; //__c- prefix (THIS WILL BE INCLUDED ON CHALLENGES DATA EVENTUALLY)
    // if(await access(path)) return 1; // already exists
    let res = await mkdir(path);
    if(!res) return 2; // failed to create
    user.challenges.push(new UserChallengeData(0,cid,pid));
    await user.saveToFile();

    // setup/create project
    let p = new Project(pid,c.name,user.email);
    allProjects.set(pid,p);
    return p;
}
function createProject(name:string){
    
}
enum ProjectGroup{
    personal,
    recent,
    saved,
    custom
}
type FilterType = {
    difficulty:string[];
    ongoing:string[];
    completed:string[];
};

server.listen(3000,()=>{
    console.log('listening on *:3000');
});

let rl = createInterface(process.stdin,process.stdout);
rl.on("line",(line)=>{
    let s = line.split(" ");
    if(line == "challenges"){
        console.log(challenges);
    }
    else if(line == "stop"){
        process.exit();
    }
    else if(s[0] == "cdata"){
        let c = challenges.get(s[1]);
        console.log(c);
    }
    else if(s[0] == "users"){
        console.log(users);
    }
    else if(s[0] == "udata"){
        let u = users.get(s[1]);
        console.log(u);
    }
});