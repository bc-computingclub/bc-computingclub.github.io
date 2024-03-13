import { io, server, CredentialResData, User, users, getUserBySock, sanitizeEmail, getProject, attemptToGetProject, access, readdir, read, mkdir, removeFile, write, ULFile, ProjectMeta, allProjects, UserChallengeData, Project, getProject2, ULItem, ULFolder, rename, removeFolder, getDefaultProjectMeta, getProjectFromHD, lessonMetas, LessonMeta, loadProject, LessonMode, getLessonMeta, writeLessonMeta, deleteLessonMeta, socks } from "./connection";
import { CSubmission, Challenge, ChallengeData, ChallengeGet, challenges } from "./s_challenges";
import {LessonData, progressTree} from "./s_lesson";
import fs from "fs";
import { createInterface } from "readline";
import crypto from "crypto";
import { createLesson } from "./s_util";

function valVar(v:any,type:string){
    if(v == null) return false;
    return (typeof v == type);
}
function valVar2(v:any,type:string,f:any){
    if(type == "path"){
        let res = (typeof v == "string" && !v.includes("."));
        if(!res) f();
        return res;
    }
    if(typeof f != "function") return false;
    if(v == null){
        f();
        return false;
    }
    if(type == "array") return Array.isArray(v);
    return (typeof v == type);
}

let allUsers:Record<string,string> = {};
function readAllUsers(){
    let str = fs.readFileSync("../data/users.json","utf8");
    if(!str){
        console.log("$ error loading user cache; code 1");
        return;
    }
    try{
        allUsers = JSON.parse(str);
    }
    catch(e){
        console.log("$ error loading user cache; code 2");
        return;
    }
    console.log("$ loaded user cache");
}
async function saveUserCache(){
    await write("../data/users.json",JSON.stringify(allUsers),"utf8");
}
readAllUsers();

io.on("connection",socket=>{
    socket.on("test",(msg:string)=>{
        console.log("test: ",msg);
    });
    socket.on("logout",async (call:(data:any)=>void)=>{
        if(!valVar(call,"function")) return;

        let user = getUserBySock(socket.id);
        if(!user){
            call(-3);
            return;
        }

        await user.saveToFile();

        users.delete(user.uid);
        socks.delete(user.uid);
        
        user.deleteTokens();
        user.deleteSocketIds();

        call(0);
    });
    socket.on("login",async (data:CredentialResData,token:string,call:(data:any)=>void)=>{
        if(!valVar2(data,"object",call)) return;
        if(!valVar2(data.email,"string",call)) return;
        // if(!valVar2(data.uid,"string",call)) return; // not until we fully migrate to uid
        if(!valVar2(token,"string",call)) return;
        if(!valVar(call,"function")) return;
        if(token.length < 20){
            call(1);
            return;
        }

        let uid = allUsers[data.email];
        data.uid = uid;

        let wasNewUser = false;

        // ** tmp fix for email to uid conversion
        // if(data.uid == null) data.uid = data.email;

        let user = users.get(data.uid);
        // console.log("... logging in ...",data.uid,data.email);
        if(!user){ // create account
            if(!users.has(data.uid)){
                // let san = sanitizeEmail(data.email);
                // try to read from file first
                let fdataStr:string|null = null;
                try{
                    fdataStr = await read("../users/"+data.uid+".json","utf8");
                }
                catch(e){}

                function newUser(){
                    if(data.uid == null) data.uid = crypto.randomUUID();
                    user = new User(data.uid,data.name,data.email,data.picture,data._joinDate,data._lastLoggedIn,socket.id,[]);
                    let dat = data as any;
                    user.recent = dat.recent ?? [];
                    user.starred = dat.starred ?? [];
                    
                    user.joinDate = new Date().toISOString();
                    user.saveToFile();
                    wasNewUser = true;
                    allUsers[data.email] = data.uid;
                    saveUserCache();
                    console.log(":: created new user: ",user.uid,user.email);
                    return user;
                }
                if(!fdataStr){
                    // create new user if couldn't find their file
                    newUser();
                }
                else{
                    let fdata = JSON.parse(fdataStr);
                    if(!fdata){
                        console.log("# Err couldn't read user file! using provided data instead");
                        let u = newUser();
                        call(u.getTransferData());
                        return;
                    }
                    user = new User(data.uid,fdata.name,fdata.email,fdata.picture,fdata.joinDate,fdata.lastLoggedIn,socket.id,fdata.pMeta);
                    user.challenges = (fdata.challenges as any[]||[]).map(v=>new UserChallengeData(v.i,v.cid,v.pid));
                    let dat = fdata as any;
                    user.recent = dat.recent ?? [];
                    user.starred = dat.starred ?? [];
                    // user.lesson = fdata.lesson || {};
                    // user.saveToFile();
                }
                if(user) users.set(user.uid,user);
            }
        }
        if(!user){
            call(2);
            return;
        }
        if(!user.joinDate) user.joinDate = new Date().toISOString();
        user.lastLoggedIn = new Date().toISOString();

        if(!await access("../users/"+user.uid)){
            let path = "../users/"+user.uid;
            await mkdir(path);
            await mkdir(path+"/lesson");
        }

        // login
        let _prevToken = user.getFirstToken();
        user.addToken(token);
        user.addSocketId(socket.id);

        // if(!wasNewUser) user.saveToFile(); // disabled for testing

        call(user.getTransferData());

        // console.log(":: user logged in: ",user.uid,user.email,` (New session? ${user.getFirstToken() != _prevToken}) (SockIds: ${user.getSocketIds().join(", ")})`);
    });
    socket.on("disconnect",()=>{
        let user = getUserBySock(socket.id);
        if(!user) return;
        user.removeSocketId(socket.id);
    });
    socket.on("getUserLastLoggedIn",(token:string)=>{

    });

    // lesson
    socket.on("getAvailableLessons",()=>{

    })
    socket.on("restartLessonProgress",async (lid:string,f:(data:any)=>void)=>{
        if(!valVar2(lid,"path",f)) return;
        
        let user = getUserBySock(socket.id);
        if(!user){
            f(-3);
            return;
        }

        let meta = await getLessonMeta(user.uid,lid);
        if(!meta){
            f(1);
            return;
        }

        meta.eventI = -1;
        meta.taskI = -1;
        meta.prog = 0;
        await writeLessonMeta(user.uid,lid,meta);

        f(0);
    });
    socket.on("deleteLessonProgress",async (lid:string,f:(data:any)=>void)=>{
        if(!valVar2(lid,"path",f)) return;
        
        let user = getUserBySock(socket.id);
        if(!user){
            f(-3);
            return;
        }

        let meta = await getLessonMeta(user.uid,lid);
        if(!meta){
            f(1);
            return;
        }
        // await deleteLessonMeta(user.uid,lid);
        await deleteLessonMeta(user.uid,lid,meta);
        await removeFolder("../lesson/"+user.uid+"/"+lid);

        f(0);
    });
    socket.on("finishLesson",async (lid:string,call:(data:any)=>void)=>{
        if(!valVar2(lid,"string",call)) return;

        let user = getUserBySock(socket.id);
        if(!user){
            call(-3);
            return;
        }

        let meta = await getLessonMeta(user.uid,lid);
        if(!meta){
            call(1);
            return;
        }
        meta.prog = 100;
        meta.hf = true;
        await writeLessonMeta(user.uid,lid,meta);
        call(0);
    });
    socket.on("postFinishLesson",async (path:string,lid:string,call:(data:any)=>void)=>{
        if(!valVar2(path,"string",call)) return;
        if(!valVar2(lid,"string",call)) return;

        let user = getUserBySock(socket.id);
        if(!user){
            call(-3);
            return;
        }

        let meta = await getLessonMeta(user.uid,lid);
        if(!meta){
            call(2);
            return;
        }
        if(meta._hp >= __maxHP){ // don't keep repeating after it's been done once
            call(0);
            return;
        }

        if(!meta.hf){
            call(3); // criteria not met
            return;
        }
        
        let list = path.split("/");
        let folder = progressTree;
        for(const key of list){
            folder = folder.folders[key];
            if(!folder){
                call(1); // folder not found
                return;
            }
        }

        // for(const l of folder.lessons){
        //     if(!l.ops) continue;
        //     let wasChange = false;
        //     let meta:LessonMeta|null = null;
        //     if(l.ops.unlocked){
        //         meta = await getLessonMeta(user.uid,l.lid);
        //         if(!meta.u) wasChange = true;
        //         meta.u = true;
        //     }
        //     if(wasChange) if(meta){
        //         if(!await access("../users/"+user.uid+"/lesson/"+lid)) await mkdir("../users/"+user.uid+"/lesson/"+lid);
        //         await writeLessonMeta(user.uid,l.lid,meta);
        //     }
        // }
        
        let data = folder.lessons.find(v=>v.lid == lid);
        if(!data){
            call(4); // couldn't find ptree data, not good!
            return;
        }
        for(const l of data.links){
            let meta = await getLessonMeta(user.uid,l.to);
            meta.u = true;
            // meta.n = true; // maybe this should only be client side?
            await writeLessonMeta(user.uid,l.to,meta,true);
        }

        meta._hp = __maxHP;
        await writeLessonMeta(user.uid,lid,meta);
        
        call(data.links.map(v=>v.to));
    });
    let __maxHP = 1; // max_HasPost xD
    socket.on("startLesson",async (lid:string,mode:LessonMode,call:(data:any)=>void)=>{        
        if(!valVar2(lid,"string",call)) return;
        if(!valVar2(mode,"number",call)) return;
        if(LessonMode[mode] == null){
            call(1);
            return;
        }

        let user = getUserBySock(socket.id);
        if(!user){
            call(-3);
            return;
        }

        // if(user.lesson.has(lid)){
        //     call(0);
        //     return;
        // }
        // if(await access("../users/"+user.uid+"/lesson/"+lid)){
        //     call(0); // lesson has already started so just continue to load
        //     return;
        // }

        let meta = await getLessonMeta(user.uid,lid);
        if(meta.times == 0) meta.ws = new Date().toISOString();
        meta.times++;
        meta.s = true;
        meta.wu = new Date().toISOString();
        await mkdir("../users/"+user.uid+"/lesson/"+lid);
        await writeLessonMeta(user.uid,lid,meta);

        // console.log("----started lesson");
        // user.startLesson(lid,mode);
        call(0);
    });
    socket.on("getProgressTree",async (path:string,call:(data:any)=>void)=>{     
        if(!valVar2(path,"string",call)) return;

        let user = getUserBySock(socket.id);
        if(!user){
            call(-3);
            return;
        }

        let list = path.split("/");
        let folder = progressTree;
        for(const key of list){
            folder = folder.folders[key];
            if(!folder){
                call(1); // folder not found
                return;
            }
        }

        for(const l of folder.lessons){
            if(!l.ops) continue;
            let wasChange = false;
            let meta:LessonMeta|null = null;
            if(l.ops.unlocked){
                meta = await getLessonMeta(user.uid,l.lid);
                if(!meta.u) wasChange = true;
                meta.u = true;
            }
            if(wasChange) if(meta) await writeLessonMeta(user.uid,l.lid,meta);
        }
        
        call(folder.lessons);
    });
    socket.on("getLearnData",async (call:(data:any)=>void)=>{
        if(!valVar(call,"function")) return;
        
        let user = getUserBySock(socket.id);
        if(!user){
            call(-3);
            return;
        }
        let ar = {} as Record<string,any>;
        // let startedLessons = await readdir("../users/"+user.uid+"/lesson");
        // if(!startedLessons){
        //     call(1);
        //     return;
        // }
        // for(const lid of startedLessons)
        let list = await readdir("../lessons");
        if(!list){
            call(1);
            return;
        }
        for(const lid of list){
            let data = await getLessonMeta(user.uid,lid);
            ar[lid] = data;
        }

        call(ar);
    });
    socket.on("getLesson",async (lid:string,f:(data:any)=>void)=>{
        if(!valVar2(lid,"string",f)) return;
        if(lid.includes(".")){
            f(3);
            return;
        }
        
        let user = getUserBySock(socket.id);
        if(!user){
            f(-3);
            return;
        }

        let path = "../lessons/"+lid+"/";
        let str = await read(path+"meta.json");
        if(!str){
            f(1);
            return;
        }
        let data:any;
        try{
            data = JSON.parse(str);
        }
        catch(e){}
        if(!data){
            console.log("$ invalid/corrupted lesson data");
            f(2);
            return;
        }
        // let lessonData = new LessonData(data); // this is a lot of work but probably good to eventually use for data integrity stuff
        
        data.lid = lid;
        data.events = await read(path+"evts.js","utf8");
        // data.boardData = data.boards.map(async (v:any)=>await read(path+v+".js","utf8"));
        data.boardData = [];
        for(const board of data.boards){
            data.boardData.push(await read(path+board+".js","utf8"));
        }

        // Initial files (for tutor)
        if(await access("../users/"+user.uid+"/lesson/"+lid)){
            
        }
        else{
            data.isStart = true;
            let initialFiles = await readdir(path+"initial_files");
            if(initialFiles){
                data.initialFiles = [];
                for(const v of initialFiles){
                    data.initialFiles.push({
                        name:v,
                        data:await read(path+"initial_files/"+v,"utf8")
                    });
                }
            }
        }
        
        f(data);
    });
    socket.on("uploadLessonFiles",async (lessonId:string,list:ULFile[],progress:LessonMeta,call:(data:any)=>void)=>{
        console.log(".......uploading");
        
        if(!valVar2(list,"array",call)) return;
        if(!valVar2(lessonId,"string",call)) return;
        
        let user = getUserBySock(socket.id);
        if(!user){
            call(-3);
            return;
        }
        // need to validate type integrity here
        
        console.log("uploading...");

        let path = "../lesson/"+user.uid+"/"+lessonId;
        let filePath = path;
        if(!await access(path)){
            await mkdir(path);
            await mkdir(filePath);
        }

        let curFiles = await readdir(path);
        if(!curFiles){
            call(1);
            return;
        }

        curFiles = curFiles.filter(v=>!list.some(w=>w.name == v));
        for(const f of curFiles){
            await removeFile(filePath+"/"+f);
        }
        for(const f of list){
            await write(filePath+"/"+f.name,f.val,f.enc);
        }

        let metaPath = "../users/"+user.uid+"/lesson/"+lessonId+"/";
        if(!await access(metaPath)){
            await mkdir(metaPath);
            // await mkdir(metaPath+"tut");
        }
        // if(progress.tutFiles){ // need to check for type integrity later
        //     for(const f of progress.tutFiles){
        //         await write(metaPath+"tut/"+f.name,f.val,f.enc);
        //     }
        // }
        let meta = lessonMetas.get(user.uid+":"+lessonId);
        if(!meta){
            meta = await getLessonMeta(user.uid,lessonId);
        }
        else{
            meta.eventI = progress.eventI;
            meta.taskI = progress.taskI;
            meta.prog = progress.prog;
        }
        await write(metaPath+"meta.json",JSON.stringify(meta),"utf8");

        // todo - cache file values so if they're the same then they don't need to be reuploaded, or do this on the client maybe to speed it up

        // console.log(":: done uploading");
        call(0);
    });
    socket.on("restoreLessonFiles",async (lessonId:string,call:(data:any)=>void)=>{
        if(!valVar(lessonId,"string")) return;
        if(!valVar(call,"function")) return;

        let user = getUserBySock(socket.id);
        if(!user) return;

        // console.log("restoring lesson files...");
        let path = "../lesson/"+user.uid+"/"+lessonId;
        let filePath = path;
        if(!await access(path)){
            await mkdir(path);
            await mkdir(filePath);
            let path2 = "../lessons/"+lessonId+"/initial_files";
            let initialFiles = await readdir(path2);
            console.log("$ initial files: ",initialFiles);
            if(initialFiles){
                for(const name of initialFiles){
                    await write(filePath+"/"+name,await read(path2+"/"+name));
                }
            }
            // call(null);
            // return;
        }
        let curFiles = await readdir(filePath);
        // let tutFilePath = "../users/"+user.uid+"/lesson/"+lessonId+"/tut";
        // let tutCurFiles = await readdir(tutFilePath);
        if(!curFiles){
            console.log("Err: failed to find project curFiles");
            return;
        }
        let files:ULFile[] = [];
        for(const f of curFiles){
            files.push(new ULFile(f,await read(filePath+"/"+f,"utf8"),"","utf8"));
        }
        // let tutFiles:ULFile[] = [];
        // if(tutCurFiles) for(const f of tutCurFiles){
        //     tutFiles.push(new ULFile(f,await read(tutFilePath+"/"+f,"utf8"),"","utf8"));
        // }

        let meta = await getLessonMeta(user.uid,lessonId);

        call({
            files,
            // tutFiles,
            meta
        });
    });
    // editor
    socket.on("uploadProjectFiles",async (uid:string,pid:string,listData:any[],call:(data?:any)=>void)=>{
        if(!valVar2(listData,"array",call)) return;
        if(!valVar2(uid,"string",call)) return;
        if(!valVar2(pid,"string",call)) return;
        let user = getUserBySock(socket.id);
        if(!user){
            call(1); // you aren't logged in
            return;
        }

        let list = listData.map(v=>ULItem.from(v));

        // let p = user.projects.find(v=>v.pid == pid);
        let p = getProject(uid+":"+pid);
        if(!p){
            console.log("Warn: project not found while uploading");
            call(2); // project not found
            return;
        }
        if(!p.canUserEdit(user.uid)){
            console.log("$ err: user tried to edit project without permission");
            call(3); // no permission
            return;
        }
        
        // console.log("uploading...");

        let path = "../project/"+user.uid+"/"+pid;
        if(!await access(path)) await mkdir(path);

        let curFiles = await readdir(path);
        if(!curFiles){
            call(4); // failed to make path, HD error?
            return;
        }

        // curFiles = curFiles.filter(v=>!list.some(w=>w.name == v));
        // for(const f of curFiles){
        //     console.log("...removing file:",path+"/"+f);
        //     await removeFile(path+"/"+f);
        // }
        // for(const f of list){
        //     console.log("...writing file:",path+"/"+f.name,f.enc);
        //     await write(path+"/"+f.name,f.val,f.enc);
        //     if(!p.files.find(v=>v.name == f.name)){
        //         p.files.push(f);
        //     }
        // }

        async function _write(l:ULItem[],pth:string,ffL:ULItem[]){
            let i = 0;
            for(const item of l){
                let ff:ULItem|undefined = undefined;
                if(ffL){
                    // ff = ffL[i];
                    ff = ffL.find(v=>v.name == item.name);
                    if(!ff) ffL.splice(i,0,item);
                }
                if(item instanceof ULFile){
                    await write(path+"/"+pth+"/"+item.name,item.val,item.enc);
                    if(ff){
                        if(ff instanceof ULFile){
                            ff.name = item.name;
                            ff.val = item.val;
                        }
                        else console.log("$ err: ff wasn't a file..?",ff.name,item.name);
                    }
                    else console.log("$ err: no ff ref found");
                }
                else if(item instanceof ULFolder){
                    await mkdir(path+"/"+pth+"/"+item.name);
                    await _write(item.items,pth+"/"+item.name,(ff as ULFolder)?.items);
                    if(ff) if(ff instanceof ULFolder){
                        ff.name = item.name;
                    }
                }
                i++;
            }
        }
        await _write(list,"",p.items);

        if(p) for(const f of list){
            // let ff = p.files.find(v=>v.name == f.name);
            // if(ff) ff.val = f.val;
            // else console.log("Err: null file in project files list");
        }
        else{
            console.log("Err: couldn't find project while uploading files: "+pid,"$ attempting to search");
            p = await attemptToGetProject(user,pid);
            if(p) console.log("$ found");
            else console.log("$ still failed to find project");
        }

        // todo - cache file values so if they're the same then they don't need to be reuploaded, or do this on the client maybe to speed it up

        // console.log(":: done uploading");
        call(0);
    });
    socket.on("restoreProjectFiles",async (uid:string,pid:string,call:(data:any,data2?:any,canEdit?:boolean)=>void)=>{
        if(!valVar2(uid,"string",call)) return;
        if(!valVar(pid,"string")){
            // console.log("Err: pid incorrect format");
            call(null);
            return;
        }
        if(!valVar(call,"function")){
            // console.log("Err: call incorrect format");
            call(null);
            return;
        }

        let user = getUserBySock(socket.id);
        if(!user){
            call(null);
            return;
        }

        let p = await getProjectFromHD(uid,pid);
        // let p = getProject2(user.email,pid);
        if(!p){
            call(null);
            return;
        }
        if(typeof p == "number"){
            call(null,p);
            return;
        }

        if(!p.meta.isPublic){
            if(uid != user.uid){
                call(null,-2); // you do not have permission to view this private project
                return;
            }
        }

        if(!user.projects.includes(p)) user.projects.push(p);

        call(p.serializeGet(true),null,user.canEdit(p.meta));

        user.addToRecents(p.pid);

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
                // data = user.projects.map(v=>v.serialize()?.serialize());
                data = user.pMeta.filter(v=>v.cid == null).map(v=>v.serialize());
            } break;
            case ProjectGroup.challenges:{
                data = user.pMeta.filter(v=>v.cid != null).map(v=>v.serialize()); // probably need to optimize the filters at some point
            } break;
            case ProjectGroup.recent:{
                data = user.pMeta.filter(v=>user?.recent.includes(v.pid)).map(v=>v.serialize());
            } break;
            case ProjectGroup.starred:{
                data = user.pMeta.filter(v=>user?.starred.includes(v.pid)).map(v=>v.serialize());
            } break;
        }
        
        f(data);
    });

    // Request stuff
    /**@deprecated */
    socket.on("old_getChallengeDetails",async (cid:string,f:(data:any)=>void)=>{
        if(!valVar2(cid,"string",f)) return;
        
        // let c = challenges.get(cid);
        let data = await ChallengeData.fromCID(cid);
        f(data?.serializeGet());
    });
    socket.on("getSubmission",async (ownerUid:string,pid:string,f:(data:any)=>void)=>{
        if(!valVar2(ownerUid,"string",f)) return 1;
        if(!valVar2(pid,"string",f)) return 2;

        let user = getUserBySock(socket.id);
        if(!user){
            f(null);
            return 3;
        }

        let p = await getProjectFromHD(ownerUid,pid);
        if(typeof p == "number") f(p);
        else f({
            p:p.serializeGet(true)
        });
    });
    socket.on("getChallenge",(cid:string,f:(data:any)=>void)=>{
        if(!valVar2(cid,"string",f)) return;
        
        let user = getUserBySock(socket.id);
        if(!user){
            f(null);
            return;
        }

        let c = challenges.get(cid);
        if(!c){
            f(null);
            return;
        }

        f(c.serializeGet(user));
    });
    socket.on("getChallenges",(perPage:number,pageI:number,filter:FilterType,option:string,desc:boolean,f:(data:any)=>void)=>{
        let user = getUserBySock(socket.id);
        if(!user) return;
        
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
                        return b.sub.length - a.sub.length;
                    }
                    return a.sub.length - b.sub.length;
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

            if(filter.completed?.length) if(!v.isCompleted(user)) continue;
            
            if(i >= skip) list.push(v.serializeGet(user,true));

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
        if(!user){
            f(null);
            return;
        }

        // let ch = challenges.get(cid);
        // if(!ch){
        //     f(null);
        //     return;
        // }
        let p = await createChallengeProject(user,cid);
        if(typeof p == "number"){
            console.log("Err: failed starting challenge with error code: "+p);
            f(p);
            return;
        }
        // ch.sub.push(new CSubmission("",user.name,p.pid));
        // await ch.save();

        f(p.pid);
        console.log(">> created challenge project");
    });
    socket.on("submitChallenge",async (pid:string,f:(res:number)=>void)=>{
        if(!valVar2(pid,"string",f)) return;

        let user = getUserBySock(socket.id);
        if(!user){
            f(1);
            return;
        }

        let p = getProject2(user.uid,pid);
        if(!p){
            f(2);
            return;
        }
        if(p.cid == null){
            f(3); // wasn't a challenge project
            return;
        }

        let ch = challenges.get(p.cid);
        if(!ch){
            f(4); // challenge doesn't exist anymore
            return;
        }
        
        ch.sub.push(new CSubmission("",user.name,user.uid,p.pid));
        await ch.save();
        p.meta.submitted = true;
        p.meta.isPublic = true;
        p.validateMetaLink();
        await user.saveToFile();

        f(0);
        console.log(">> submitted challenge");
    });
    socket.on("unsubmitChallenge",async (pid:string,f:(res:number)=>void)=>{
        if(!valVar2(pid,"string",f)) return;

        let user = getUserBySock(socket.id);
        if(!user){
            f(1);
            return;
        }

        let p = getProject2(user.uid,pid);
        if(!p){
            f(2);
            return;
        }
        if(p.cid == null){
            f(3); // wasn't a challenge project
            return;
        }

        let ch = challenges.get(p.cid);
        if(!ch){
            f(4); // challenge doesn't exist anymore
            return;
        }
        
        ch.sub.splice(ch.sub.findIndex(v=>v.pid == pid),1);
        await ch.save();
        p.meta.submitted = false;
        p.meta.isPublic = false;
        await user.saveToFile();

        f(0);
        console.log(">> unsubmitted challenge");
    });
    socket.on("continueChallenge",async (cid:string,f:(data:any)=>void)=>{
        if(!valVar2(cid,"string",f)) return;
        
        let user = getUserBySock(socket.id);
        if(!user){
            f(null);
            return;
        }

        let m = user.challenges.find(v=>v.cid == cid);
        if(!m){
            f(null);
            return;
        }
        f(m.pid);
    });
    socket.on("deleteChallengeProgress",async (cid:string,f:(data:any)=>void)=>{
        if(!valVar2(cid,"string",f)) return;

        let user = getUserBySock(socket.id);
        if(!user){
            f(1);
            return;
        }

        let m = user.pMeta.find(v=>v.cid == cid);
        if(!m){
            f(2);
            return;
        }

        let p = user.pMeta.find(v=>v.pid == m?.pid);
        if(!p){
            f(3);
            return;
        }

        deleteProject(user,p,f);
    });

    // 
    socket.on("createProject",async (name:string,desc:string,f:(data:any)=>void)=>{
        if(!valVar2(name,"string",f)) return;
        if(!valVar2(desc,"string",f)) return;

        let user = getUserBySock(socket.id);
        if(!user) return;
        let p = await createProject(user,name,desc,false);
        f(p.pid);
    });
    socket.on("moveFiles",async (pid:string,files:string[],fromPath:string,toPath:string,f:(data:any)=>void)=>{
        if(!valVar2(pid,"string",f)) return;
        if(!valVar2(files,"object",f)) return;
        if(!valVar2(fromPath,"string",f)) return;
        if(!valVar2(toPath,"string",f)) return;
        if(fromPath.includes(".") || toPath.includes(".")){
            f(3);
            return; // you trying to hack or something there?
        }

        let user = getUserBySock(socket.id);
        if(!user){
            f(2);
            return;
        }
        let p = getProject2(user.uid,pid);
        if(!p){
            f(1);
            return;
        }
        
        let fromF = parseFolderStr(p,fromPath);
        let toF = parseFolderStr(p,toPath);
        // if(!fromF || !toF){
        //     f(null);
        //     return;
        // }
        let fromItems = (fromF?.items ?? p.items);
        let toItems = (toF?.items ?? p.items);
        
        for(const f of files){
            let file = fromItems.find(v=>v.name == f);
            if(!file){
                console.log("$ weird, couldn't find file while trying to move it");
                continue;
            }
            fromItems.splice(fromItems.indexOf(file),1);
            toItems.push(file);
        }
        // console.log(fromF,toF);

        let start = p.getPath();
        for(const f of files){
            console.log("...moving...",fromPath+f,toPath+f);
            await rename(start+fromPath+f,start+toPath+f);
        }
        // console.log(fromPath,toPath,files);
        f(0);
    });
    socket.on("renameFItem",async (pid:string,fromPath:string,file:string,newName:string,f:(data:any)=>void)=>{
        if(!valVar2(pid,"string",f)) return;
        if(!valVar2(file,"string",f)) return;
        if(!valVar2(fromPath,"string",f)) return;
        if(fromPath.includes(".")){
            f(3);
            return; // you trying to hack or something there?
        }

        let user = getUserBySock(socket.id);
        if(!user){
            f(2);
            return;
        }
        let p = getProject2(user.uid,pid);
        if(!p){
            f(1);
            return;
        }

        let fromF = parseFolderStr(p,fromPath);
        let items = fromF?.items;
        if(!fromF){
            items = p.items;
            // f(4); // couldn't find path
            // return;
        }
        if(!items) return;

        let item = items.find(v=>v.name == file);
        if(!item){
            f(5); // couldn't find file/folder
            return;
        }

        let start = p.getPath();
        item.name = newName;
        await rename(start+fromPath+file,start+fromPath+newName);
        f(0);
    });
    socket.on("deleteFItem",async (pid:string,fromPath:string,file:string,f:(data:any)=>void)=>{
        if(!valVar2(pid,"string",f)) return;
        if(!valVar2(file,"string",f)) return;
        if(!valVar2(fromPath,"string",f)) return;
        if(fromPath.includes(".")){
            f(3);
            return; // you trying to hack or something there?
        }

        let user = getUserBySock(socket.id);
        if(!user){
            f(2);
            return;
        }
        let p = getProject2(user.uid,pid);
        if(!p){
            f(1);
            return;
        }

        let fromF = parseFolderStr(p,fromPath);
        let items = fromF?.items;
        if(!items){
            items = p.items;
            // f(4); // couldn't find path
            // return;
        }
        if(!items) return;

        let item = items.find(v=>v.name == file);
        if(!item){
            console.log("couldn't find file: ",file,items.map(v=>v.name));
            f(5); // couldn't find file/folder
            return;
        }

        let start = p.getPath();
        console.log(`deleting NAME (${file})...`,items.map(v=>v.name));
        items.splice(items.indexOf(item),1);
        console.log("after...",items.map(v=>v.name));
        if(item instanceof ULFile) await removeFile(start+fromPath+file);
        else await removeFolder(start+fromPath+file);
        f(0);
    });
    // 
    socket.on("renameProject",async (pid:string,newName:string,f:(res:number)=>void)=>{
        if(!valVar2(pid,"string",f)) return;
        if(!valVar2(newName,"string",f)) return;

        let user = getUserBySock(socket.id);
        if(!user){
            f(1);
            return;
        }

        let m = user.pMeta.find(v=>v.pid == pid);
        if(!m){
            f(2);
            return;
        }

        m.name = newName;
        // let p = user.projects.find(v=>v.pid == pid);
        // if(p) p.name = newName;
        await user.saveToFile();

        m.name = newName;
        f(0);
    });
    socket.on("updatePMeta",async (pid:string,data:any,f:(res:number,name?:string,desc?:string)=>void)=>{
        if(!valVar2(pid,"string",f)) return;
        if(!valVar2(data,"object",f)) return;

        let user = getUserBySock(socket.id);
        if(!user){
            f(1);
            return;
        }

        let m = user.pMeta.find(v=>v.pid == pid);
        if(!m){
            f(2);
            return;
        }

        // let p = user.projects.find(v=>v.pid == pid);

        if(data.name) if(valVar(data.name,"string")){
            m.name = data.name;
            // if(p) p.name = data.name;
        }
        if(data.desc) if(valVar(data.desc,"string")){
            m.desc = data.desc;
            // if(p) p.desc = data.desc;
        }
        
        await user.saveToFile();

        // m.name = newName;
        f(0,data.name,data.desc);
    });
    socket.on("deleteProject",async (pid:string,f:(res:number)=>void)=>{
        if(!valVar2(pid,"string",f)) return;

        let user = getUserBySock(socket.id);
        if(!user){
            f(1);
            return;
        }

        let m = user.pMeta.find(v=>v.pid == pid);
        if(!m){
            f(2);
            return;
        }

        if(!user.canEdit(m)){
            f(-5); // can't edit
            return;
        }

        let p = user.pMeta.find(v=>v.pid == pid);
        if(!p){
            f(3);
            return;
        }

        deleteProject(user,p,f);
    });
    socket.on("unlinkProject",async (pid:string,f:(res:number)=>void)=>{
        if(!valVar2(pid,"string",f)) return;

        let user = getUserBySock(socket.id);
        if(!user){
            f(1);
            return;
        }

        let m = user.pMeta.find(v=>v.pid == pid);
        if(!m){
            f(2);
            return;
        }

        if(!user.canEdit(m)){
            f(-5); // can't edit
            return;
        }

        let cid = m.cid;
        let p = user.projects.find(v=>v.pid == pid);
        if(p){
            p.meta.cid = undefined;
        }
        if(cid){
            //remove from challenges
            let ind = user.challenges.findIndex(v=>v.pid == pid);
            user.challenges.splice(ind,1);
            // remove from submissions
            let ch = challenges.get(cid);
            if(ch){
                let ind = ch.sub.findIndex(v=>v.pid == pid);
                if(ind != -1){
                    ch.sub.splice(ind,1);
                    await ch.save();
                }
            }
            else console.log("warn: couldn't find challenge: ",m.cid);
        }
        m.cid = undefined;
        await user.saveToFile();

        f(0);
    });
    socket.on("removeFromRecents",(pid:string,call:(data:any)=>void)=>{
        if(!valVar2(pid,"string",call)) return;

        let user = getUserBySock(socket.id);
        if(!user){
            call(-3);
            return;
        }
        call(user.removeFromRecents(pid));
    });
    socket.on("starProject",(pid:string,v:boolean,call:(data:any)=>void)=>{
        if(!valVar2(pid,"string",call)) return;
        if(!valVar2(v,"boolean",call)) return;

        let user = getUserBySock(socket.id);
        if(!user){
            call(-3);
            return;
        }

        let res = true;
        if(v) res = user.addToStarred(pid)
        else res = user.removeFromStarred(pid);
        call(res);
    });
    socket.on("setProjVisibility",async (pid:string,v:boolean,call:(data:any,v?:boolean)=>void)=>{
        if(!valVar2(pid,"string",call)) return;
        if(!valVar2(v,"boolean",call)) return;

        let user = getUserBySock(socket.id);
        if(!user){
            call(-3);
            return;
        }

        if(!user.pMeta.some(v=>v.pid == pid)){
            call(-4); // you don't own this project
            return;
        }

        let m = user.pMeta.find(v=>v.pid == pid);
        if(!m){
            call(1);
            return;
        }
        m.isPublic = v;
        await user.saveToFile();

        call(0,v);
    });
});
async function deleteProject(user:User,pMeta:ProjectMeta,f:(res:number)=>void){
    if(!pMeta.user){
        f(-3);
        return;
    }
    if(pMeta.user.uid != user.uid){
        f(-2);
        return;
    }
    if(pMeta){
        user.projects.splice(user.projects.findIndex(v=>v.pid == pMeta.pid),1);
        allProjects.delete(user.uid+":"+pMeta.pid);
        // allProjects.delete(p.getRefStr());
    }
    let pid = pMeta.pid;
    if(pMeta.cid){
        //remove from challenges
        user.challenges.splice(user.challenges.findIndex(v=>v.pid == pid),1);
        // remove from submissions
        let ch = challenges.get(pMeta.cid);
        if(ch){
            let ind = ch.sub.findIndex(v=>v.pid == pid);
            if(ind != -1){
                ch.sub.splice(ind,1);
                await ch.save();
            }
        }
        else console.log("warn: couldn't find challenge: ",pMeta.cid);
    }
    user.pMeta.splice(user.pMeta.findIndex(v=>v.pid == pid),1);
    await user.saveToFile();

    let res = await removeFolder("../project/"+user.uid+"/"+pid);
    f(res ? 0 : 3);
}

function parseFolderStr(p:Project,path:string){
    if(!p) return;
    let s = path.split("/").filter(v=>v != null && v != "");
    console.log(s);
    if(!s.length) return null;
    let f = p.items.find(v=>v.name == s[0]) as ULFolder;
    if(!f) return null;
    // if(!(f instanceof ULFolder)) return null;
    // s.splice(0,1);
    // while(s.length){
    for(let i = 1; i < s.length; i++){
        f = f.items.find(v=>v.name == s[i]) as ULFolder;
        if(!f) return null;
    }
    return f;
}
function genPID(){
    return crypto.randomUUID();
}
async function createChallengeProject(user:User,cid:string):Promise<Project|number>{
    let c = challenges.get(cid);
    if(!c) return 3; // couldn't find challenge
    let pid = genPID();
    
    if(user.challenges.some(v=>v.cid == cid)) return 1; // already exists
    let path = "../project/"+user.uid+"/"+pid; //__c- prefix (THIS WILL BE INCLUDED ON CHALLENGES DATA EVENTUALLY)
    // if(await access(path)) return 1; // already exists
    let res = await mkdir(path);
    if(!res) return 2; // failed to create
    user.challenges.push(new UserChallengeData(0,cid,pid));
    await user.saveToFile();

    // setup/create project
    let p = new Project(pid,user.uid,getDefaultProjectMeta(user,pid,c.name));
    p.meta.desc = `An attempt at the ${c.name} challenge.`;
    p._owner = user;
    user.projects.push(p);
    // allProjects.set(pid,p);
    p.meta.cid = cid;
    // let m = user.pMeta.find(v=>v.pid == pid);
    // if(m) m.cid = cid;
    // else console.log(">> Err: couldn't find meta when starting challenge");
    // let m = new ProjectMeta(user,pid,p.name,p.desc,p.isPublic);
    let m = p.meta;
    m.cid = p.cid;
    user.pMeta.push(m);
    user.saveToFile();
    loadProject(p);
    return p;
}
async function createProject(user:User,name:string,desc:string,isPublic=false){
    let pid = genPID();
    let meta = new ProjectMeta(user,pid,name,desc,isPublic,false);
    meta.wc = new Date().toISOString();
    let p = user.createProject(meta,pid);
    let path = "../project/"+user.uid;
    await mkdir(path);
    await mkdir(path+"/"+p.pid);
    return p;
}
enum ProjectGroup{
    personal,
    challenges,
    recent,
    starred,
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
rl.on("line",async (line)=>{
    line = line.trim();
    let s = line.split(" ");
    let cmd = s[0];
    if(line == "challenges"){
        console.log(challenges);
        return;
    }
    else if(line == "stop"){
        process.exit();
    }
    else if(s[0] == "cdata"){
        let c = challenges.get(s[1]);
        console.log(c);
        return;
    }
    else if(s[0] == "users"){
        console.log(users);
        return;
    }
    else if(s[0] == "udata"){
        let u = users.get(s[1]);
        console.log(u);
        return;
    }
    else if(s[0] == "email"){
        let ar = [...users];
        let u = ar.find(v=>v[1].email == s[1]);
        console.log(u);
        return;
    }
    else if(s[0] == "projects"){
        console.log(allProjects);
        return;
    }
    else if(s[0] == "pitems"){
        let u = users.get(s[1]);
        if(!u){
            console.log("couldn't find user.");
            return;
        }
        let p = u.projects.find(v=>v.pid == s[2]);
        if(!p){
            console.log("couldn't find project.");
            return;
        }
        let cur = p.items;
        for(let i = 3; i < s.length; i++){
            let res = cur[parseInt(s[i])];
            if(!res){
                console.log("Cannot find.");
                return;
            }
            if(res instanceof ULFile){
                console.log("FILE: ",res);
                return;
            }
            cur = (res as ULFolder).items;
        }
        console.log(cur);
        // pitems gyhar.ce@gmail.com e8bc2db5-9443-4c8d-a894-7d8a1deea591
        return;
    }
    else if(s[0] == "cls" || s[0] == "clear"){
        process.stdout.cursorTo(0,0);
        process.stdout.clearScreenDown();
        return;
    }
    else if(s[0] == "test-lesson"){
        let dataStr = await read("../lessons/"+s[1]+".json");
        if(!dataStr){
            console.log("$ couldn't find lesson data");
            return;
        }
        let data:any;
        try{
            data = JSON.parse(dataStr);
        }
        catch(e){}
        if(!data){
            console.log("$ invalid/corrupted lesson data");
            return;
        }
        let lessonData = new LessonData(data);
        console.log("LESSON DATA",lessonData);
        return;
    }
    else if(s[0] == "lessons"){
        console.log(lessonMetas);
        return;
    }
    // CREATE cmd
    else if(s[0] == "create"){
        let type = s[1];
        switch(type){
            case "lesson":
                if(!s[2]){
                    console.log("Invalid lesson name");
                    return;
                }
                createLesson(s[2]);
                break;
            default:
                console.log("Unknown type to create: ",type);
        }
        return;
    }
    console.log("Unknown command: ",s[0]);
});