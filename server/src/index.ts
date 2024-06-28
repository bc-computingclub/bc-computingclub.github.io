import { io, server, CredentialResData, User, users, getSession, sanitizeEmail, getProject, attemptToGetProject, getDefaultProjectMeta, getProjectFromHD, lessonMetas, LessonMeta, loadProject, LessonMode, writeLessonMeta, deleteLessonMeta, socks, getProject2, ProjectMeta, allProjects, Project, UserChallengeData, projectCache, Socket } from "./connection";
import { CSubmission, Challenge, ChallengeData, ChallengeGet, challenges, getDifficultyId } from "./s_challenges";
import {LessonData, getLessonFolder, globalLessonFolders, ptreeMap, reloadLessons} from "./s_lesson";
import fs, { copyFile } from "fs";
import { createInterface } from "readline";
import crypto from "crypto";
import { createGuidedProject, createLesson, write, read, readdir, access, mkdir, removeFolder, removeFile, rename, internalCPDir, internalCP, lessonCache, registeredLessonFolders, ULFolder, ULItem, ULFile, createRushLesson } from "./s_util";
import { ChallengeInst, ChallengeModel, ChallengeSubmissionModel, FolderInst, FolderModel, LessonMetaInst, ProjectInst, ProjectModel, UserModel, UserSessionItem, findChallenge, removeFromList, removeFromListPred, uploadChallenges, uploadLessonProgs, uploadUsers, uploadUsersStage2, userSessions } from "./db";
import mongoose, { QuerySelector } from "mongoose";

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

// let usersOnline:string[] = [];
// let allUsers:Record<string,string> = {};
// function readAllUsers(){
//     let str = fs.readFileSync("../data/users.json","utf8");
//     if(!str){
//         console.log("$ error loading user cache; code 1");
//         return;
//     }
//     try{
//         allUsers = JSON.parse(str);
//     }
//     catch(e){
//         console.log("$ error loading user cache; code 2");
//         return;
//     }
//     console.log("$ loaded user cache");
// }
// async function saveUserCache(){
//     await write("../data/users.json",JSON.stringify(allUsers),"utf8");
// }
// readAllUsers();


// Project Functions

async function restoreProjectFiles(socket:Socket,uid:string,pid:string,call:(data:any,data2?:any,canEdit?:boolean)=>void){
    if(!valVar2(uid,"string",call)) return;
        if(!valVar(pid,"string")){
            call(null,1);
            return;
        }
        if(!valVar(call,"function")){
            call(null,2);
            return;
        }

        let user = getSession(socket.id);
        if(!user){
            call(null,3);
            return;
        }

        let p = await user.getProject(pid,uid);

        if(!p){
            call(null,4);
            return;
        }
        if(typeof p == "number"){
            call(null,p);
            return;
        }

        if(!p.hasPermissionToView(user.meta.uid)){
            call(null,-2); // you do not have permission to view this private project
            return;
        }

        p.updateWhenLastSaved();
        await p.save();

        let serialized = p.serialize(user.uid);
        let startPath = p.getPath();
        
        serialized.items = await p.getFileItems();

        call(serialized,null,p.canEdit(user.meta.uid));

        user.addToRecents(p.meta.pid);
        await user.save();
}

// 

io.on("connection",socket=>{
    socket.on("logout",async (call:(data:any)=>void)=>{
        if(!valVar(call,"function")) return;

        let user = getSession(socket.id);
        if(!user){
            call(-3);
            return;
        }

        // await user.saveToFile();

        socks.delete(socket.id);
        let udata = users.get(user.meta.uid);
        if(udata){
            removeFromListPred(udata.sessions,v=>v.sockId == socket.id);
            removeFromList(udata.socks,socket.id);
        }
        
        // if(user.getSocketIds().length <= 1) users.delete(user.uid);
        // socks.delete(socket.id);
        // user.removeSocketId(socket.id);

        userSessions.delete(socket.id);
        
        // user.deleteTokens();
        // user.deleteSocketIds();

        call(0);
    });
    socket.on("login",async (data:CredentialResData,token:string,call:(data:any)=>void)=>{
        // console.log("login: ",data,token);

        async function post(session:UserSessionItem,isNew=false){
            session.meta.lastLoggedIn = new Date();
            // console.log("$ logged in: "+data.email);

            socks.set(socket.id,session.meta.email);
            let udata = users.get(session.meta.uid);
            if(udata){
                udata.socks.push(socket.id);
                udata.sessions.push(session);
            }
            else users.set(session.meta.uid,{
                sessions:[session],
                socks:[socket.id]
            });
            session.sockId = socket.id;
            // session.addSocketId(socket.id);

            if(!session.meta.rootFolder){
                let root = new FolderModel({
                    name:"Root Folder",
                    itemCount:0,
                    uid:session.uid
                });
                
                // run fix to convert all projects to use root folder instead of null

                let folderList = await FolderModel.find({
                    uid:session.uid,
                    folder:null
                });
                let projectList = await ProjectModel.find({
                    uid:session.uid,
                    folder:null
                });
                for(const folder of folderList){
                    folder.folder = root._id;
                    await folder.save();
                }
                for(const project of projectList){
                    project.folder = root._id;
                    await project.save();
                }

                root.itemCount += folderList.length;
                root.itemCount += projectList.length;

                // 
                
                await root.save();
                console.log("Created root folder that didn't exist for user: "+session.meta.name);
                
                session.meta.rootFolder = root._id;
            }

            // save user inst
            await session.save();

            call({
                ...data,
                uid:session.meta.uid,
                rootFolder:session.meta.rootFolder,
                _joinDate:session.meta.joinDate.toISOString(),
                _lastLoggedIn:session.meta.lastLoggedIn.toISOString()
            });
        }

        async function attempt(){
            let session = userSessions.get(socket.id);
            if(!session){
                // console.log("...creating a session");
                
                let result = await UserModel.findOne({
                    email:data.email
                });

                if(!result){ // no account, create one
                    console.log("...creating new account");
                    result = new UserModel({
                        uid:crypto.randomUUID(),
                        name:data.name,
                        email:data.email,
                        picture:data.picture,
                        joinDate:new Date(),
                        lastLoggedIn:new Date()
                    });
                    await result.save();
                    // console.log("...SAVED...");
                }
                // account already exists, login and create new session
                // console.log("...creating SESSION...");
                // @ts-ignore
                session = new UserSessionItem(token,result);
                userSessions.set(socket.id,session);

                post(session,true);
            }
            else if(false){ // there shouldn't be a way you can get to this point unless you manually invoke login from the console
                // if(session.token != token){
                //     console.log("!!! token is invalid -> need to relog");
                //     userSessions.delete(data.email);
                //     attempt();
                //     return;
                // }
                // console.log("...ALREADY logged in");

                // post(session,false);
            }
        }
        attempt();
    });
    // socket.on("login_old",async (data:CredentialResData,token:string,call:(data:any)=>void)=>{
    //     if(!valVar2(data,"object",call)) return;
    //     if(!valVar2(data.email,"string",call)) return;
    //     // if(!valVar2(data.uid,"string",call)) return; // not until we fully migrate to uid
    //     if(!valVar2(token,"string",call)) return;
    //     if(!valVar(call,"function")) return;
    //     if(token.length < 20){
    //         call(1);
    //         return;
    //     }

    //     let uid = allUsers[data.email];
    //     data.uid = uid;

    //     let wasNewUser = false;

    //     // ** tmp fix for email to uid conversion
    //     // if(data.uid == null) data.uid = data.email;

    //     let user = users.get(data.uid);
    //     // console.log("... logging in ...",data.uid,data.email);
    //     if(!user){ // create account
    //         if(!users.has(data.uid)){
    //             // let san = sanitizeEmail(data.email);
    //             // try to read from file first
    //             let fdataStr:string|null = null;
    //             try{
    //                 fdataStr = await read("../users/"+data.uid+".json","utf8");
    //             }
    //             catch(e){}

    //             function newUser(){
    //                 if(data.uid == null) data.uid = crypto.randomUUID();
    //                 user = new User(data.uid,data.name,data.email,data.picture,data._joinDate,data._lastLoggedIn,socket.id,[]);
    //                 let dat = data as any;
    //                 user.recent = dat.recent ?? [];
    //                 user.starred = dat.starred ?? [];
                    
    //                 user.joinDate = new Date().toISOString();
    //                 user.saveToFile();
    //                 wasNewUser = true;
    //                 allUsers[data.email] = data.uid;
    //                 saveUserCache();
    //                 console.log(":: created new user: ",user.uid,user.email);
    //                 return user;
    //             }
    //             if(!fdataStr){
    //                 // create new user if couldn't find their file
    //                 newUser();
    //             }
    //             else{
    //                 let fdata = JSON.parse(fdataStr);
    //                 if(!fdata){
    //                     console.log("# Err couldn't read user file! using provided data instead");
    //                     let u = newUser();
    //                     call(u.getTransferData());
    //                     return;
    //                 }
    //                 user = new User(data.uid,fdata.name,fdata.email,fdata.picture,fdata.joinDate,fdata.lastLoggedIn,socket.id,fdata.pMeta);
    //                 user.challenges = (fdata.challenges as any[]||[]).map(v=>new UserChallengeData(v.i,v.cid,v.pid));
    //                 let dat = fdata as any;
    //                 user.recent = dat.recent ?? [];
    //                 user.starred = dat.starred ?? [];
    //                 // user.lesson = fdata.lesson || {};
    //                 // user.saveToFile();
    //             }
    //             if(user){
    //                 users.set(user.uid,user);
    //                 if(usersOnline.includes(user.email)) usersOnline.push(user.email);
    //             }
    //         }
    //     }
    //     if(!user){
    //         call(2);
    //         return;
    //     }
    //     if(!user.joinDate) user.joinDate = new Date().toISOString();
    //     user.lastLoggedIn = new Date().toISOString();

    //     if(!await access("../users/"+user.uid)){
    //         let path = "../users/"+user.uid;
    //         await mkdir(path);
    //         await mkdir(path+"/lesson");
    //     }

    //     // login
    //     let _prevToken = user.getFirstToken();
    //     user.addToken(token);
    //     user.addSocketId(socket.id);

    //     // if(!wasNewUser) user.saveToFile(); // disabled for testing

    //     call(user.getTransferData());

    //     // console.log(":: user logged in: ",user.uid,user.email,` (New session? ${user.getFirstToken() != _prevToken}) (SockIds: ${user.getSocketIds().join(", ")})`);
    // });
    socket.on("disconnect",()=>{
        let user = getSession(socket.id);
        if(!user) return;
        // user.removeSocketId(socket.id);

        // removeFromList(usersOnline,user.meta.email);

        socks.delete(socket.id);
        let udata = users.get(user.meta.uid);
        if(udata){
            removeFromListPred(udata.sessions,v=>v.sockId == socket.id);
            removeFromList(udata.socks,socket.id);
        }
        if(!udata?.socks.length) users.delete(user.meta.uid);
        userSessions.delete(socket.id);
    });
    socket.on("getUserLastLoggedIn",(token:string)=>{

    });

    // lesson
    socket.on("getAvailableLessons",()=>{

    })
    socket.on("restartLessonProgress",async (lid:string,f:(data:any)=>void)=>{
        if(!valVar2(lid,"path",f)) return;
        
        let user = getSession(socket.id);
        if(!user){
            f(-3);
            return;
        }

        let lessonMeta = await user.getLessonMeta(lid);
        if(!lessonMeta){
            f(1);
            return;
        }

        lessonMeta.meta.eventI = -1;
        lessonMeta.meta.taskI = -1;
        lessonMeta.meta.progress = 0;

        // save
        await lessonMeta.save();

        f(0);
    });
    socket.on("deleteLessonProgress",async (lid:string,f:(data:any)=>void)=>{
        if(!valVar2(lid,"path",f)) return;
        
        let user = getSession(socket.id);
        if(!user){
            f(-3);
            return;
        }

        let lessonMeta = await user.getLessonMeta(lid);
        if(!lessonMeta){
            f(1);
            return;
        }
        // await deleteLessonMeta(user.uid,lid);
        await deleteLessonMeta(lessonMeta);
        await removeFolder("../lesson/"+user.uid+"/"+lid);

        f(0);
    });
    socket.on("copyFilesIntoNewProject",async (name:string,root:ULFolder,desc:string,f:(data:any)=>void)=>{
        if(!valVar2(name,"string",f)) return;
        if(!valVar2(desc,"string",f)) return;
        if(!valVar2(root,"object",f)) return;
        if(!valVar2(root.items,"array",f)) return;

        let user = getSession(socket.id);
        if(!user){
            f(-3);
            return;
        }

        let p = await user.createProject({
            name:name,
            desc:desc,
            public:false
        })
        // let p = await createProject(user,name,desc,false);
        if(!p){
            f(1);
            return;
        }

        let path = await p.createPath();

        async function _write(l:any[],pth:string,ffL:any[]){
            let i = 0;
            for(const item of l){
                let ff:ULItem|undefined = undefined;
                if(ffL){
                    // ff = ffL[i];
                    ff = ffL.find(v=>v.name == item.name);
                    if(!ff) if(i != -1) ffL.splice(i,0,item);
                }
                // if(item instanceof ULFile){
                if("val" in item){
                    await write(path+"/"+pth+"/"+item.name,item.val,item.enc);
                    if(ff){
                        if("val" in ff){
                            ff.name = item.name;
                            ff.val = item.val;
                        }
                        // else console.log("$ err: ff wasn't a file..?",ff.name,item.name);
                    }
                    // else console.log("$ err: no ff ref found");
                }
                else if("items" in item){
                    await mkdir(path+"/"+pth+"/"+item.name);
                    await _write(item.items,pth+"/"+item.name,(ff as ULFolder)?.items);
                    if(ff) if("items" in ff){
                        ff.name = item.name;
                    }
                }
                i++;
            }
        }
        // await _write(root.items,"",p.items);
        await _write(root.items,"",[]);
        
        f(p.meta.pid);
    });
    socket.on("finishLesson",async (lid:string,call:(data:any)=>void)=>{
        if(!valVar2(lid,"string",call)) return;

        let user = getSession(socket.id);
        if(!user){
            call(-3);
            return;
        }

        let lessonMeta = await user.getLessonMeta(lid);
        if(!lessonMeta){
            call(1);
            return;
        }

        let changedUser = false;

        lessonMeta.meta.progress = 100;
        if(!lessonMeta.meta.hasFinished){
            // if it hasn't been finished then increment lessonsCompleted stat
            user.meta.lessonsCompleted++;
            changedUser = true;
        }
        lessonMeta.meta.hasFinished = true;
        await lessonMeta.save();
        if(changedUser) await user.save();
        call(0);
    });
    socket.on("postFinishLesson",async (lid:string,call:(data:any)=>void)=>{
        if(!valVar2(lid,"string",call)) return;

        let user = getSession(socket.id);
        if(!user){
            call(-3);
            return;
        }

        let lessonMeta = await user.getLessonMeta(lid);
        // if(!lessonMeta){
        //     call(2);
        //     return;
        // }
        // if(meta._hp >= __maxHP){ // don't keep repeating after it's been done once // // might need to disable this until I find a more efficient solution
        //     call(0);
        //     return;
        // }

        // if(!meta.hf){
        //     call(3); // criteria not met
        //     return;
        // }
        
        // let list = path.split("/");
        // let folder = getLessonFolder(list);
        // if(!folder){
        //     call(1); // folder not found
        //     return;
        // }

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
        
        // let data = folder.lessons.find(v=>v.lid == lid);
        // if(!data){
        //     call(4); // couldn't find ptree data, not good!
        //     return;
        // }

        let ldata = lessonCache.get(lid);
        if(!ldata){
            call(3); // couldn't find lesson data
            return;
        }

        // for(const l of ldata.lesson.links){ // old way of checking
        //     let meta = await getLessonMeta(user.uid,l.to);
        //     meta.u = true;
        //     // meta.n = true; // maybe this should only be client side?
        //     await writeLessonMeta(user.uid,l.to,meta,true);
        // }
        
        let unlockSuccess = true;
        for(const reqLink of ldata.lesson.links){ // requirements for unlock
            // let req = ldata.folder.lessons.find(v=>v.lid == reqLink.to);
            let meta2 = await user.getLessonMeta(reqLink.to,true,true);
            if(!meta2){
                unlockSuccess = false;
                break;
            }
            if(!meta2.meta.hasFinished){
                unlockSuccess = false;
                break;
            }
        }

        if(unlockSuccess){
            if(!lessonMeta) lessonMeta = await user.getLessonMeta(lid,false,false);
            if(!lessonMeta){
                call(4);
                return;
            }
            lessonMeta.meta.unlocked = true; // unlock
            if(!lessonMeta.meta.dateUnlocked) lessonMeta.meta.dateUnlocked = new Date();

            // lessonMeta.meta._hp = __maxHP; // depricated?
            // await writeLessonMeta(user.uid,lid,lessonMeta);
            await lessonMeta.save();
            
            // call(ldata.lesson.links.map(v=>v.to));
            call(null);
        }
        else{
            call(0);
        }
    });
    let __maxHP = 1; // max_HasPost xD
    socket.on("startLesson",async (lid:string,mode:LessonMode,call:(data:any)=>void)=>{        
        if(!valVar2(lid,"string",call)) return;
        if(!valVar2(mode,"number",call)) return;
        if(LessonMode[mode] == null){
            call(1);
            return;
        }

        let user = getSession(socket.id);
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

        // let meta = await getLessonMeta(user.uid,lid);
        let lessonMeta = await user.getLessonMeta(lid,false,false);
        if(!lessonMeta){
            call(2); // couldn't find progress data
            return;
        }
        let meta = lessonMeta.meta;

        if(meta.times == 0) meta.dateStarted = new Date();
        if(!meta.started) meta.times++;
        meta.started = true;
        // await mkdir("../users/"+user.uid+"/lesson/"+lid);
        // await writeLessonMeta(user.uid,lid,meta);

        // save
        meta.save();

        // console.log("----started lesson");
        // user.startLesson(lid,mode);
        call(0);
    });
    socket.on("getProgressTree",async (path:string,call:(data:any)=>void)=>{     
        if(!valVar2(path,"string",call)) return;

        let user = getSession(socket.id);
        if(!user){
            call(-3);
            return;
        }

        let list = path.split("/");

        let folder = getLessonFolder(list);
        if(!folder){
            call(1);
            return;
        }

        // let folder = progressTree;
        // for(const key of list){
        //     folder = folder.folders[key];
        //     if(!folder){
        //         call(1); // folder not found
        //         return;
        //     }
        // }

        for(const l of folder.lessons){
            if(!l.ops) continue;
            let wasChange = false;
            let meta:LessonMetaInst|undefined;
            if(l.ops.unlocked){
                // meta = await getLessonMeta(user.uid,l.lid);
                meta = await user.getLessonMeta(l.lid,true);
                if(meta){
                    if(!meta.meta.unlocked) wasChange = true;
                    meta.meta.unlocked = true;
                }
            }
            if(wasChange) if(meta) meta.save();
            // if(wasChange) if(meta) await writeLessonMeta(user.uid,l.lid,meta);
        }
        
        call(folder.lessons);
    });
    socket.on("getLearnData",async (lids:string[],call:(data:any)=>void)=>{
        if(!valVar(call,"function")) return;
        if(!valVar2(lids,"array",call)) return;
        
        let user = getSession(socket.id);
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
        // let list = await readdir("../lessons");
        // if(!list){
        //     call(1);
        //     return;
        // }
        for(const lid of lids){
            // let data = await getLessonMeta(user.uid,lid);
            let lessonMeta = await user.getLessonMeta(lid,true);
            if(!lessonMeta) continue;
            ar[lid] = lessonMeta.serialize();
        }

        call(ar);
    });
    socket.on("getLesson",async (lid:string,f:(data:any)=>void)=>{
        if(!valVar2(lid,"string",f)) return;
        if(lid.includes(".")){
            f(3);
            return;
        }
        // if(paths.some(v=>v.includes(".")||v.includes("/"))){
        //     f(3); // invalid characters in paths
        //     return;
        // }
        
        let user = getSession(socket.id);
        if(!user){
            f(-3);
            return;
        }

        // let path = "../lessons/"+paths.join("/")+(paths.length?"/":"")+lid+"/";
        // let path = "../lessons/"+lid+"/";
        let path = lessonCache.get(lid)?.fullPath;
        let str = await read(path+"meta.json");
        if(!str){
            f(1);
            return;
        }
        let data;
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
        // if(!await access("../users/"+user.uid+"/lesson/"+lid)){
        //     data.isStart = true;
        // }
        if(!await user.hasStartedLesson(lid)){
            data.isStart = true;
        }
        if(!await access("../lesson/"+user.uid+"/"+lid)) if(data.continueFrom) await copyContinueFromFiles(user.uid,data.continueFrom,lid);
        let initialFiles = await readdir(path+"initial_files");
        if(initialFiles){
            data.initialFiles = [];
            for(const v of initialFiles){
                data.initialFiles.push({
                    name:v,
                    data:await read(path+"initial_files/"+v)
                });
            }
        }
        
        f(data);
    });
    socket.on("uploadLessonFiles",async (lessonId:string,listData:any[],progress:LessonMeta,call:(data:any)=>void)=>{        
        if(!valVar2(lessonId,"string",call)) return;
        if(!valVar2(listData,"array",call)) return;
        if(!valVar2(progress,"object",call)) return;
        
        let user = getSession(socket.id);
        if(!user){
            call(-3);
            return;
        }
        // need to validate type integrity here

        let path = "../lesson/"+user.uid+"/"+lessonId;
        if(!await access(path)){
            await mkdir(path);
        }

        let curFiles = await readdir(path);
        if(!curFiles){
            call(1);
            return;
        }

        // ///////// OLD SYSTEM
        // curFiles = curFiles.filter(v=>!list.some(w=>w.name == v));
        // for(const f of curFiles){
        //     await removeFile(filePath+"/"+f);
        // }
        // for(const f of list){
        //     await write(filePath+"/"+f.name,f.buf);
        // }
        // ////////////////////////

        let list = listData.map(v=>ULItem.from(v));

        async function _write(l:ULItem[],pth:string,ffL:ULItem[]){
            let i = 0;
            for(const item of l){
                let ff:ULItem|undefined = undefined;
                if(ffL){
                    ff = ffL.find(v=>v.name == item.name);
                    if(!ff) ffL.splice(i,0,item);
                }
                if(item instanceof ULFile){
                    await write(path+"/"+pth+"/"+item.name,item.buf);
                    if(ff){
                        if(ff instanceof ULFile){
                            ff.name = item.name;
                            ff.buf = item.buf;
                        }
                    }
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
        // await _write(list,"",p.items);
        await _write(list,"",[]);
                
        // ////

        // let metaPath = "../users/"+user.uid+"/lesson/"+lessonId+"/";
        // if(!await access(metaPath)){
        //     await mkdir(metaPath);
        //     // await mkdir(metaPath+"tut");
        // }
        // if(progress.tutFiles){ // need to check for type integrity later
        //     for(const f of progress.tutFiles){
        //         await write(metaPath+"tut/"+f.name,f.val,f.enc);
        //     }
        // }

        let lessonMeta = await user.getLessonMeta(lessonId);
        if(!lessonMeta){
            call(2);
            return; // should this be up higher so it doesn't save first??? eh maybe it doesn't really matter
        }

        lessonMeta.meta.eventI = progress.eventI;
        lessonMeta.meta.taskI = progress.taskI;
        lessonMeta.meta.progress = progress.prog;
        lessonMeta.updateWhenLastSaved();

        // save
        await lessonMeta.save();

        // let meta = lessonMetas.get(user.uid+":"+lessonId);
        // if(!meta){
        //     meta = await getLessonMeta(user.uid,lessonId);
        // }
        // else{
        //     meta.eventI = progress.eventI;
        //     meta.taskI = progress.taskI;
        //     meta.prog = progress.prog;
        // }
        // await write(metaPath+"meta.json",JSON.stringify(meta),"utf8");

        // todo - cache file values so if they're the same then they don't need to be reuploaded, or do this on the client maybe to speed it up

        // console.log(":: done uploading");
        call(0);
    });
    socket.on("restoreLessonFiles",async (lessonId:string,call:(data:any)=>void)=>{
        if(!valVar(lessonId,"string")) return;
        if(!valVar(call,"function")) return;

        let user = getSession(socket.id);
        if(!user) return;

        // let meta = await getLessonMeta(user.uid,lessonId);
        let lessonMeta = await user.getLessonMeta(lessonId);
        if(!lessonMeta){
            call(1);
            return;
        }

        await lessonMeta.createPath();

        // console.log("restoring lesson files...");
        // let path = "../lesson/"+user.uid+"/"+lessonId;
        // let filePath = path;
        // if(!await access(path)){
        //     await mkdir(path);
        //     // await mkdir(filePath);

        //     // let path2 = "../lessons/"+lessonId+"/initial_files";
        //     // let initialFiles = await readdir(path2);
        //     // if(initialFiles){
        //     //     for(const name of initialFiles){
        //     //         await write(filePath+"/"+name,await read(path2+"/"+name));
        //     //     }
        //     // }
        //     // if(meta.continueFrom) await copyContinueFromFiles(user,meta.continueFrom,lessonId);
        //     // call(null);
        //     // return;
        // }
        // let curFiles = await readdir(filePath);
        // // let tutFilePath = "../users/"+user.uid+"/lesson/"+lessonId+"/tut";
        // // let tutCurFiles = await readdir(tutFilePath);
        // if(!curFiles){
        //     console.log("Err: failed to find project curFiles");
        //     return;
        // }
        // let files:ULFile[] = [];
        // for(const f of curFiles){
        //     files.push(new ULFile(f,await read(filePath+"/"+f,"utf8"),"","utf8"));
        // }

        let files = await lessonMeta.getFileItems();

        // let tutFiles:ULFile[] = [];
        // if(tutCurFiles) for(const f of tutCurFiles){
        //     tutFiles.push(new ULFile(f,await read(tutFilePath+"/"+f,"utf8"),"","utf8"));
        // }

        // if(meta){
        //     meta.updateWhenLastSaved();
        //     await writeLessonMeta(user.uid,lessonId,meta);
        // }

        lessonMeta.updateWhenLastSaved();
        // save
        await lessonMeta.meta.save();
        

        let info = ptreeMap.get(lessonId);

        call({
            files,
            // tutFiles,
            meta:lessonMeta.serialize(),
            info
        });
    });
    // editor
    socket.on("uploadProjectFiles",async (uid:string,pid:string,listData:any[],call:(data?:any)=>void)=>{
        if(!valVar2(listData,"array",call)) return;
        if(!valVar2(uid,"string",call)) return;
        if(!valVar2(pid,"string",call)) return;

        let user = getSession(socket.id);
        if(!user){
            call(-3); // you aren't logged in
            return;
        }

        // console.log("INPUT:",listData);

        let list = listData.map(v=>ULItem.from(v));
        // console.log("UPLOAD LIST:",list[0].items);
        // return;

        // let p = user.projects.find(v=>v.pid == pid);
        // let p = getProject(uid+":"+pid);
        let p = await user.getProject(pid,uid);
        if(!p){
            console.log("Warn: project not found while uploading");
            call(2); // project not found
            return;
        }
        if(!p.canEdit(user.uid)){
            console.log("$ err: user tried to edit project without permission");
            call(3); // no permission
            return;
        }
        
        // console.log("uploading...");

        // let path = "../project/"+user.uid+"/"+pid;
        // if(!await access(path)) await mkdir(path);
        let path = await p.createPath();

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

        // let encoder = new TextEncoder();

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
                    // let buf2 = item.buf ? Buffer.from(item.buf.buffer) : new Uint8Array();
                    // console.log("WRITE:",path+"/"+pth+"/"+item.name,item.buf);

                    await write(path+"/"+pth+"/"+item.name,item.buf);
                    if(ff){
                        if(ff instanceof ULFile){
                            ff.name = item.name;
                            ff.buf = item.buf;
                            // ff.val = item.val;
                        }
                        // else console.log("$ err: ff wasn't a file..?",ff.name,item.name);
                    }
                    // else console.log("$ err: no ff ref found");
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
        // await _write(list,"",p.items);
        await _write(list,"",[]);

        // if(p) for(const f of list){
        //     // let ff = p.files.find(v=>v.name == f.name);
        //     // if(ff) ff.val = f.val;
        //     // else console.log("Err: null file in project files list");
        // }
        // else{
        //     console.log("Err: couldn't find project while uploading files: "+pid,"$ attempting to search");
        //     // p = await attemptToGetProject(user,pid);
        //     // if(p) console.log("$ found");
        //     // else console.log("$ still failed to find project");
        // }

        if(p) if(p.meta){
            // p.meta.wls = new Date().toISOString();
            p.updateWhenLastSaved();
            await p.save();
            // await user.saveToFile();
        }
        

        // todo (done as of 6/16/24 I think) - cache file values so if they're the same then they don't need to be reuploaded, or do this on the client maybe to speed it up

        // console.log(":: done uploading");
        call(0);
    });
    socket.on("restoreProjectFiles",async (uid:string,pid:string,call:(data:any,data2?:any,canEdit?:boolean)=>void)=>{
        restoreProjectFiles(socket,uid,pid,call);
    });

    // User get stuff
    socket.on("user-getFilesList",async (searchQuery:string,fid:string|undefined,call:(data:any)=>void)=>{
        if(fid != null) if(!valVar2(fid,"string",call)) return;
        
        let user = getSession(socket.id);
        if(!user){
            call({err:-3});
            return;
        }

        
        let projects:any[] = [];
        let folders:any[] = [];
        
        // let parent = await user.getFolder(fid);
        
        let projectQuery = ProjectModel.find({
            uid:user.uid
        });
        let folderQuery = FolderModel.find({
            uid:user.uid
        });

        projectQuery = projectQuery.where("folder").equals(fid);
        folderQuery = folderQuery.where("folder").equals(fid);

        if(searchQuery != null && searchQuery != ""){
            projectQuery = projectQuery.find({
                $text:{
                    $search:searchQuery
                }
            });
            folderQuery = folderQuery.find({
                $text:{
                    $search:searchQuery
                }
            });
        }
        // else{ // at least for now don't want to only search within the current folder
        //     projectQuery = projectQuery.where("folder").equals(fid);
        //     folderQuery = folderQuery.where("folder").equals(fid);
        // }

        projects = await projectQuery;
        folders = await folderQuery;

        // let files = await FileModel.find({
        //     uid:user.uid,
        //     folder:fid,

        // });

        call({
            projects:projects.filter(v=>v != null).map(v=>new ProjectInst(v).serialize(user.uid)),
            folders:folders.filter(v=>v != null).map(v=>new FolderInst(v).serialize())
        });
    });
    socket.on("user-getProjectList",async (searchQuery:string,section:ProjectGroup,fid:string,f:(d:any)=>void)=>{
        let user = getSession(socket.id);
        if(!user){
            f(-3);
            return;
        }
        let query:mongoose.Query<any,any>|null = null;
        switch(section){
            case ProjectGroup.projects:{
                // data = user.projects.map(v=>v.serialize()?.serialize());
                // data = user.pMeta.filter(v=>v.cid == null).map(v=>v.serialize());
                query = ProjectModel.find({
                    uid:user.uid,
                    cid:{
                        $eq:null
                    }
                });
            } break;
            case ProjectGroup.challenges:{
                // data = user.pMeta.filter(v=>v.cid != null).map(v=>v.serialize()); // probably need to optimize the filters at some point
                query = ProjectModel.find({
                    uid:user.uid,
                    cid:{
                        $ne:null
                    }
                });
            } break;
            case ProjectGroup.recent:{
                // data = user.pMeta.filter(v=>user?.recent.includes(v.pid)).map(v=>v.serialize());
                query = ProjectModel.find({
                    uid:user.uid,
                    pid:{
                        $in:user.meta.recentProjects
                    }
                });
            } break;
            case ProjectGroup.starred:{
                // data = user.pMeta.filter(v=>user?.starred.includes(v.pid)).map(v=>v.serialize());
                query = ProjectModel.find({
                    uid:user.uid,
                    pid:{
                        $in:user.meta.starredProjects
                    }
                });
            } break;
        }

        if(!query){
            f([]);
            return;
        }

        if(fid != null) query = query.where("folder").equals(fid);

        if(searchQuery != null && searchQuery != ""){
            query = query.find({
                $text:{
                    $search:searchQuery
                }
            });
        }
        // else{ // at least for now don't want to only search within the current folder
        //     if(fid != null) query = query.where("folder").equals(fid);
        // }

        query = query.sort({
            dateLastSaved:-1
        });

        let res = await query.exec();

        let data = res.map((v:any)=>new ProjectInst(v).serialize(user.uid)); // compliler doesn't like user here for some reason
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

        let user = getSession(socket.id);
        if(!user){
            f(null);
            return 3;
        }

        let p = await user.getProject(pid,ownerUid);
        if(!p){
            f(2);
            return;
        }

        let data = p.serialize(user.uid);
        data.items = await p.getFileItems();
        
        f({p:data});
        
        // let p = await getProjectFromHD(ownerUid,pid);
        // if(typeof p == "number") f(p);
        // else f({
        //     p:p.serializeGet(true)
        // });
    });
    socket.on("getSubmissions",async (cid:string,perPage:number,pageI:number,filter:SubmissionsFilterType,option:string,desc:boolean,f:(data:any)=>void)=>{
        if(!valVar2(perPage,"number",f)) return;
        if(!valVar2(pageI,"number",f)) return;
        if(!valVar2(filter,"object",f)) return;
        if(!valVar2(option,"string",f)) return;
        if(!valVar2(desc,"boolean",f)) return;

        let user = getSession(socket.id);
        if(!user){
            f(-3);
            return;
        }

        let c = challenges.get(cid);
        if(!c){
            f(1);
            return;
        }

        let list:CSubmission[] = [];
        let clist:CSubmission[] = [];
        for(const v of c.sub){
            clist.push(v);
        }
        clist = clist.sort((a,b)=>{
            switch(option) {
                case "lines": // line count
                    if(desc) return b.lc - a.lc;
                    return a.lc - b.lc;
                case "chars": // char count
                    if(desc) return b.cc - a.cc;
                    return a.cc - b.cc;
                case "time": // time taken
                    return (desc ? (b.t-a.t) : (a.t-b.t));
                case "recent": // recently submitted
                    let dif = new Date(b.ws).getTime() - new Date(a.ws).getTime();
                    return (desc ? dif : -dif);
                default:
                    return 0;
            }
        });

        let i = 0;
        let skip = pageI*perPage;
        for(const v of clist){
            if(filter.mine){
                if(v.uid != user.uid) continue;
            }
            
            if(i >= skip) list.push(v);

            if(list.length >= perPage) break;
            i++;
        }
        
        f(list);
    });
    socket.on("getChallenge",async (cid:string,mode:number,f:(data:any)=>void)=>{
        if(!valVar2(cid,"string",f)) return;
        if(!valVar2(mode,"number",f)) return;
        
        let user = getSession(socket.id);
        if(!user){
            f(null);
            return;
        }

        // let c = challenges.get(cid);
        let c = await findChallenge(cid);
        if(!c){
            f(null);
            return;
        }

        // f(c.serializeGet(user,mode));
        f(await c.serialize(user,mode));
    });
    socket.on("getChallenges",async (search:string|undefined,perPage:number,pageI:number,filter:FilterType,option:string,desc:boolean,f:(data:any)=>void)=>{
        if(!option) option = "popularity";
        if(desc == null) desc = true;
        
        if(!valVar2(perPage,"number",f)) return;
        if(!valVar2(pageI,"number",f)) return;
        if(!valVar2(filter,"object",f)) return;
        if(!valVar2(option,"string",f)) return;
        if(!valVar2(desc,"boolean",f)) return;
        
        let user = getSession(socket.id);
        if(!user){
            f(1);
            return;
        }

        let difficulty = filter.difficulty?.map(v=>getDifficultyId(v)) ?? [];
        
        let qq = {
            // ongoing is not implemented
            
            // $where:function(){
            //     let inst = new ChallengeInst(this);
            //     if(filter.completed.length) if(!inst.isCompleted(user)) return false;
            //     if(filter.ongoing.length) if(!inst.isOngoing()) return false;
            //     return true;
            // },
        } as any;
        if(search != undefined){
            qq["$text"] = {
                $search:search
            };
        }
        if(filter.difficulty?.length){
            qq.difficulty = {
                $in:difficulty
            };
        }
        if(filter.completed?.length){
            qq.cid = { // is completed
                $in:user.meta.completedChallenges
            };
        }
        let query = ChallengeModel.find(qq);

        switch(option) {
            case "popularity":
                query = query.sort({
                    submission_count:desc?-1:1
                });
                // if(desc) {
                //     return b.sub.length - a.sub.length;
                // }
                // return a.sub.length - b.sub.length;
            case "alphabetical":
                query = query.sort({
                    name:desc?1:-1
                });
                // if(desc) {
                //     return a.name.localeCompare(b.name);
                // }
                // return b.name.localeCompare(a.name);
            // default:
                // return 0;
        }

        // query = query.skip(pageI*perPage).limit(perPage);

        let res = await query.exec();

        let list:any[] = [];
        for(const c of res){
            let inst = new ChallengeInst(c);
            list.push(await inst.serialize(user,0));
        }

        f(list);
    });
    // socket.on("getChallenges_old",async (perPage:number,pageI:number,filter:FilterType,option:string,desc:boolean,f:(data:any)=>void)=>{
    //     let user = getSession(socket.id);
    //     if(!user) return;
        
    //     if(!option) option = "popularity";
    //     if(desc == null) desc = true;
        
    //     if(!valVar2(perPage,"number",f)) return;
    //     if(!valVar2(pageI,"number",f)) return;
    //     if(!valVar2(filter,"object",f)) return;
    //     if(!valVar2(option,"string",f)) return;
    //     if(!valVar2(desc,"boolean",f)) return;
        
    //     let list:ChallengeGet[] = [];
    //     let clist:Challenge[] = [];
    //     for(const [k,v] of challenges){
    //         clist.push(v);
    //     }
    //     clist = clist.sort((a,b)=>{
    //         switch(option) {
    //             case "popularity":
    //                 if(desc) {
    //                     return b.sub.length - a.sub.length;
    //                 }
    //                 return a.sub.length - b.sub.length;
    //             case "alphabetical":
    //                 if(desc) {
    //                     return a.name.localeCompare(b.name);
    //                 }
    //                 return b.name.localeCompare(a.name);
    //             default:
    //                 return 0;
    //         }
    //     });

    //     // my optimized method
    //     let i = 0;
    //     let skip = pageI*perPage;
    //     for(const v of clist){
    //         if(filter.difficulty?.length){
    //             if(!filter.difficulty.includes(v.difficulty)) continue;
    //         }
    //         // else continue; // comment this so if no boxes are checked to default to all checked
    //         let ongoing = v.ongoing;
    //         if(filter.ongoing?.length) if(!ongoing) continue;
    //         // if(filter.ongoing?.length ? !ongoing : ongoing) continue;

    //         if(filter.completed?.length) if(!v.isCompleted(user)) continue;
            
    //         if(i >= skip) list.push(await v.serializeGet(user,0));

    //         if(list.length >= perPage) break;
    //         i++;
    //     }
    //     // partly chatgpt from Paul
    //     if(false){
    //         let challengeList:Challenge[] = [];
    //         for(const [k,v] of challenges){
    //             list.push(v);
    //         }
    //         list = challengeList.filter(challenge=>{
    //             Object.keys(filter).every(filterType => {
    //                 switch (filterType) {
    //                     case "difficulty":
    //                         return filter[filterType].includes(challenge.difficulty);
    //                     // case "ongoing":
    //                             // return challenge.ongoing === true;
    //                     // case "completed":
    //                             // return challenge.submitted === true;
    //                     default:
    //                         return true;
    //                 }
    //             });
    //         });
    //     }

    //     f(list);
    // });
    socket.on("startChallenge",async (cid:string,f:(data:any)=>void)=>{
        if(!valVar2(cid,"string",f)) return;

        let user = getSession(socket.id);
        if(!user){
            f(-3);
            return;
        }

        // let ch = challenges.get(cid);
        // if(!ch){
        //     f(null);
        //     return;
        // }
        // let p = await createChallengeProject(user,cid);
        let p = await user.createChallengeProject(cid);
        if(!p){
            // console.log("Err: failed starting challenge with error code: ");
            f(1);
            return;
        }
        // ch.sub.push(new CSubmission("",user.name,p.pid));
        // await ch.save();

        f(p.meta.pid);
        // console.log(">> created challenge project");
    });
    socket.on("submitChallenge",async (cid:string,pid:string,call:(res:number)=>void)=>{
        if(!valVar2(pid,"string",call)) return;

        let user = getSession(socket.id);
        if(!user){
            call(-3);
            return;
        }
        
        // if(!user.meta.projects.includes(pid)){
        //     call(1); // either this isn't your project or it doesn't exist
        //     return;
        // }
        
        let challenge = await findChallenge(cid);
        if(!challenge){
            call(2); // challenge doesn't exist
            return;
        }

        let p = await user.getProject(pid);
        if(!p){
            call(3); // project doesn't exist
            return;
        }
        if(!p.isOwner(user.uid)){
            call(4); // you can't submit if you don't own it
            return;
        }
        
        let res = await challenge.submitProject(user,p);
        call(res);
    });
    socket.on("unsubmitChallenge",async (pid:string,call:(res:number)=>void)=>{
        if(!valVar2(pid,"string",call)) return;

        let user = getSession(socket.id);
        if(!user){
            call(-3);
            return;
        }

        let p = await user.getProject(pid);
        if(!p){
            call(1); // couldn't find project to unsubmit
            return;
        }

        if(!p.meta.cid){
            call(2); // wasn't a challenge project
            return;
        }

        let challenge = await findChallenge(p.meta.cid);
        if(!challenge){
            call(3); // couldn't find challenge to unsubmit from
            return;
        }

        let res = await challenge.unsubmitProject(user,p);
        call(res);
    });
    // socket.on("submitChallenge_old",async (pid:string,f:(res:number)=>void)=>{
    //     if(!valVar2(pid,"string",f)) return;

    //     let user = getSession(socket.id);
    //     if(!user){
    //         f(1);
    //         return;
    //     }

    //     let p = getProject2(user.uid,pid);
    //     if(!p){
    //         f(2);
    //         return;
    //     }
    //     if(p.cid == null){
    //         f(3); // wasn't a challenge project
    //         return;
    //     }

    //     let ch = challenges.get(p.cid);
    //     if(!ch){
    //         f(4); // challenge doesn't exist anymore
    //         return;
    //     }
        
    //     let c = new CSubmission("",user.name,user.uid,p.pid);
    //     ch.sub.push(c);
    //     let meta = user.pMeta.find(v=>v.pid == p?.pid);
    //     if(!meta){
    //         f(5);
    //         return;
    //     }
    //     meta.submitted = true;
    //     meta.isPublic = true;
    //     meta.ws = new Date().toISOString();
    //     p.meta.submitted = true;
    //     p.meta.isPublic = true;
    //     p.meta.ws = meta.ws

    //     c.ws = meta.ws;
        
    //     function calcSubmissionLang(){
    //         if(!p) return [];
    //         let lang:string[] = [];
    //         let allowed = ["html","css","js"];
    //         function search(list:ULItem[]){
    //             for(const item of list){
    //                 if(item instanceof ULFolder){
    //                     search(item.items);
    //                     continue;
    //                 }
    //                 let ind = item.name.lastIndexOf(".");
    //                 if(ind == -1) continue;
    //                 let ext = item.name.substring(ind+1);
    //                 if(allowed.includes(ext)) lang.push(ext);
    //             }
    //         }
    //         if(p.items) search(p.items);
    //         return lang;
    //         // return lang.length ? lang.sort((a,b)=>a.localeCompare(b)).join(", ") : "None";
    //     }
    //     let allowed = ["html","css","js"];
    //     function calcSubmissionCharCount(){
    //         if(!p) return 0;
    //         let amt = 0;
    //         function search(list:ULItem[]){
    //             for(const item of list){
    //                 if(item instanceof ULFolder){
    //                     search(item.items);
    //                     continue;
    //                 }
    //                 let it = item as ULFile;
    //                 let ind = item.name.lastIndexOf(".");
    //                 if(ind == -1) continue;
    //                 let ext = item.name.substring(ind+1);
    //                 if(allowed.includes(ext)){
    //                     let after = it.val.replace(/\s/g,"");
    //                     amt += after.length;
    //                 }
    //             }
    //         }
    //         if(p.items) search(p.items);
    //         return amt;
    //     }
    //     function calcLineCount(){
    //         if(!p) return 0;
    //         let amt = 0;
    //         function search(list:ULItem[]){
    //             for(const item of list){
    //                 if(item instanceof ULFolder){
    //                     search(item.items);
    //                     continue;
    //                 }
    //                 let it = item as ULFile;
    //                 let ind = item.name.lastIndexOf(".");
    //                 if(ind == -1) continue;
    //                 let ext = item.name.substring(ind+1);
    //                 if(allowed.includes(ext)){
    //                     it.val = it.val.replace(/\r/g,"");
    //                     let lines = it.val.split("\n");
    //                     for(const l of lines){
    //                         if(l.length > 0) amt++;
    //                     }
    //                     // let v = it.val.match(/\n/g);
    //                     // console.log((v ? v.length : 0),v);
    //                     // amt += (v ? v.length : 0);
    //                 }
    //             }
    //         }
    //         if(p.items) search(p.items);
    //         return amt;
    //     }
    //     c.cc = calcSubmissionCharCount();
    //     c.lc = calcLineCount();
    //     c.lang = calcSubmissionLang();
    //     c.t = meta.time;

    //     await ch.save();

    //     p.validateMetaLink();
    //     await user.save();

    //     f(0);
    //     // console.log(">> submitted challenge");
    // });
    socket.on("unsubmitChallenge_old",async (pid:string,f:(res:number)=>void)=>{
        if(!valVar2(pid,"string",f)) return;

        let user = getSession(socket.id);
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
        
        removeFromListPred(ch.sub,v=>v.pid == pid);
        await ch.save();
        p.meta.submitted = false;
        p.meta.isPublic = false;
        await user.save();

        f(0);
        // console.log(">> unsubmitted challenge");
    });
    socket.on("continueChallenge",async (cid:string,f:(data:any)=>void)=>{
        if(!valVar2(cid,"string",f)) return;
        
        let user = getSession(socket.id);
        if(!user){
            f(null);
            return;
        }

        // let m = user.pMeta.find(v=>v.cid == cid && !v.submitted);
        let data = await ProjectModel.findOne({
            cid,
            submitted:false
        });
        if(!data){
            f(null);
            return;
        }
        f(data.pid);
    });
    socket.on("deleteChallengeProgress",async (cid:string,f:(data:any)=>void)=>{
        if(!valVar2(cid,"string",f)) return;

        let user = getSession(socket.id);
        if(!user){
            f(1);
            return;
        }

        let p = await user.getUnfinishedChallengeProject(cid);
        if(!p){
            f(2);
            return;
        }

        let res = await p.deleteThis(user.uid);

        f(res);

        // let m = user.pMeta.find(v=>v.cid == cid);
        // if(!m){
        //     f(2);
        //     return;
        // }

        // let p = await user.
        // if(!p){
        //     f(3);
        //     return;
        // }

        // deleteProject(user,p,f);
    });

    // 
    socket.on("createProject",async (name:string,desc:string,fid:string|undefined,f:(data:any)=>void)=>{
        if(!valVar2(name,"string",f)) return;
        if(!valVar2(desc,"string",f)) return;
        if(fid != null) if(!valVar2(fid,"string",f)) return;

        let user = getSession(socket.id);
        if(!user) return;
        // let p = await createProject(user,name,desc,false);
        let p = await user.createProject({
            name,desc,public:false,fid
        });
        if(!p) f(null);
        else f(p.meta.pid);
    });
    socket.on("moveFiles",async (pid:string,files:string[],fromPath:string,toPath:string,lid:string,f:(data:any)=>void)=>{
        if(!lid) if(!valVar2(pid,"string",f)) return;
        if(!valVar2(files,"object",f)) return;
        if(!valVar2(fromPath,"string",f)) return;
        if(!valVar2(toPath,"string",f)) return;
        if(lid) if(!valVar2(lid,"string",f)) return;

        if(fromPath.includes(".") || toPath.includes(".")){
            f(3);
            return; // you trying to hack or something there?
        }

        let user = getSession(socket.id);
        if(!user){
            f(2);
            return;
        }
        // let p = getProject2(user.uid,pid);
        let p = await user.getProjectOrLesson(pid,lid);
        if(!p){
            f(1);
            return;
        }

        let items = await p.getFileItems();
        
        let fromF = parseFolderStr(p,fromPath,items);
        let toF = parseFolderStr(p,toPath,items);
        // if(!fromF || !toF){
        //     f(null);
        //     return;
        // }
        let fromItems = (fromF?.items ?? items);
        let toItems = (toF?.items ?? items);
        
        for(const f of files){
            let file = fromItems.find(v=>v.name == f);
            if(!file){
                console.log("$ weird, couldn't find file while trying to move it");
                continue;
            }
            removeFromList(fromItems,file);
            toItems.push(file);
        }
        // console.log(fromF,toF);

        let start = p.getPath()+"/";
        for(const f of files){
            // console.log("...moving...",fromPath+f,toPath+f);
            await rename(start+fromPath+f,start+toPath+f);
        }
        // console.log(fromPath,toPath,files);
        f(0);
    });
    socket.on("renameFItem",async (pid:string,fromPath:string,file:string,newName:string,lid:string,f:(data:any)=>void)=>{
        if(!lid) if(!valVar2(pid,"string",f)){
            console.log("... invalid pid");
            return;
        }
        if(!valVar2(file,"string",f)){
            console.log("... invalid file",file,typeof file);
            return;
        }
        if(!valVar2(fromPath,"string",f)){
            console.log("... invalid fromPath");
            return;
        }
        if(lid) if(!valVar2(lid,"string",f)){
            console.log("... invalid lid");
            return;
        }

        if(fromPath.includes(".")){
            f(3);
            return; // you trying to hack or something there?
        }

        let user = getSession(socket.id);
        if(!user){
            f(2);
            return;
        }
        // let p = getProject2(user.uid,pid);
        let p = await user.getProjectOrLesson(pid,lid);
        if(!p){
            f(1);
            return;
        }

        let fileItems = await p.getFileItems();

        let fromF = parseFolderStr(p,fromPath,fileItems);
        let items = fromF?.items;
        if(!fromF){
            items = fileItems;
            // f(4); // couldn't find path
            // return;
        }
        if(!items){
            f(6); // couldn't find folder items
            return;
        }

        let item = items.find(v=>v.name == file);
        if(!item){
            f(5); // couldn't find file/folder
            return;
        }

        let start = p.getPath()+"/";
        item.name = newName;
        await rename(start+fromPath+file,start+fromPath+newName);
        f(0);
    });
    socket.on("deleteFItem",async (pid:string,fromPath:string,file:string,lid:string,f:(data:any)=>void)=>{
        if(!lid) if(!valVar2(pid,"string",f)) return;
        if(!valVar2(file,"string",f)) return;
        if(!valVar2(fromPath,"string",f)) return;
        if(lid) if(!valVar2(lid,"string",f)) return;

        if(fromPath.includes(".")){
            f(3);
            return; // you trying to hack or something there?
        }

        let user = getSession(socket.id);
        if(!user){
            f(2);
            return;
        }
        // let p = getProject2(user.uid,pid);
        let p = await user.getProjectOrLesson(pid,lid);
        if(!p){
            f(1);
            return;
        }

        let fileItems = await p.getFileItems();

        let fromF = parseFolderStr(p,fromPath,fileItems);
        let items = fromF?.items;
        if(!items){
            items = fileItems;
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

        let start = p.getPath()+"/";
        // console.log(`deleting NAME (${file})...`,items.map(v=>v.name));
        removeFromList(items,item);
        // console.log("after...",items.map(v=>v.name));
        if(item instanceof ULFile) await removeFile(start+fromPath+file);
        else await removeFolder(start+fromPath+file);
        f(0);
    });
    // 
    socket.on("renameProject",async (pid:string,newName:string,f:(res:number)=>void)=>{
        if(!valVar2(pid,"string",f)) return;
        if(!valVar2(newName,"string",f)) return;

        let user = getSession(socket.id);
        if(!user){
            f(1);
            return;
        }

        // let m = user.pMeta.find(v=>v.pid == pid);
        let p = await user.getProject(pid);
        if(!p){
            f(2);
            return;
        }

        // save
        p.meta.name = newName;
        await p.save();

        // let p = user.projects.find(v=>v.pid == pid);
        // if(p) p.name = newName;
        // await user.save();

        // m.name = newName;
        f(0);
    });
    socket.on("updatePMeta",async (pid:string,data:any,f:(res:number,name?:string,desc?:string)=>void)=>{
        if(!valVar2(pid,"string",f)) return;
        if(!valVar2(data,"object",f)) return;

        let user = getSession(socket.id);
        if(!user){
            f(1);
            return;
        }

        // let m = user.pMeta.find(v=>v.pid == pid);
        let p = await user.getProject(pid);
        if(!p){
            f(2);
            return;
        }

        // let p = user.projects.find(v=>v.pid == pid);

        if(data.name) if(valVar(data.name,"string")){
            p.meta.name = data.name;
            // if(p) p.name = data.name;
        }
        if(data.desc) if(valVar(data.desc,"string")){
            p.meta.desc = data.desc;
            // if(p) p.desc = data.desc;
        }
        
        // save
        await p.save();
        // await user.save();

        // m.name = newName;
        f(0,data.name,data.desc);
    });
    socket.on("deleteProject",async (pid:string,f:(res:number)=>void)=>{
        if(!valVar2(pid,"string",f)) return;

        let user = getSession(socket.id);
        if(!user){
            f(1);
            return;
        }

        // let m = user.pMeta.find(v=>v.pid == pid);
        let p = await user.getProject(pid);
        if(!p){
            f(2);
            return;
        }

        if(!p.canEdit(user.uid)){
            f(-5); // can't edit
            return;
        }

        // let p = user.pMeta.find(v=>v.pid == pid);
        // if(!p){
        //     f(3);
        //     return;
        // }

        let res = await p.deleteThis(user.meta.uid);
        f(res);
        // deleteProject(user,p,f);
    });
    socket.on("unlinkProject",async (pid:string,call:(res:number)=>void)=>{
        if(!valVar2(pid,"string",call)) return;

        let user = getSession(socket.id);
        if(!user){
            call(-3);
            return;
        }

        let p = await user.getProject(pid);
        if(!p){
            call(1);
            return;
        }
        if(!p.isOwner(user.uid)){ // <-- this might not be needed but just in case
            call(2); // you don't own this project
            return;
        }
        if(p.meta.cid == null){
            call(3); // project wasn't even a challenge project
            return;
        }
        
        // 

        let res = await p.unlinkFromChallenge(user);
        call(res);
    });
    // socket.on("unlinkProject_old",async (pid:string,f:(res:number)=>void)=>{
    //     if(!valVar2(pid,"string",f)) return;

    //     let user = getSession(socket.id);
    //     if(!user){
    //         f(1);
    //         return;
    //     }

    //     // let m = user.pMeta.find(v=>v.pid == pid);
    //     let p = await user.getProject(pid);
    //     if(!p){
    //         f(2);
    //         return;
    //     }

    //     if(!p.canEdit(user.uid)){
    //         f(-5); // can't edit
    //         return;
    //     }

    //     let cid = p.meta.cid;
    //     // let p = user.projects.find(v=>v.pid == pid);
    //     if(p){
    //         p.meta.cid = undefined;
    //     }
    //     if(cid){
    //         //remove from challenges
    //         let ind = user.challenges.findIndex(v=>v.pid == pid);
    //         user.challenges.splice(ind,1);
    //         // remove from submissions
    //         let ch = challenges.get(cid);
    //         if(ch){
    //             let ind = ch.sub.findIndex(v=>v.pid == pid);
    //             if(ind != -1){
    //                 ch.sub.splice(ind,1);
    //                 await ch.save();
    //             }
    //         }
    //         else console.log("warn: couldn't find challenge: ",p.meta.cid);
    //     }
    //     p.meta.cid = undefined;
    //     // await user.save();

    //     // save
    //     await p.save();

    //     f(0);
    // });
    socket.on("removeFromRecents",async (pid:string,call:(data:any)=>void)=>{
        if(!valVar2(pid,"string",call)) return;

        let user = getSession(socket.id);
        if(!user){
            call(-3);
            return;
        }
        user.removeFromRecents(pid);

        // save
        await user.save();

        call(true);
    });
    socket.on("starProject",async (pid:string,v:boolean,call:(data:any)=>void)=>{
        if(!valVar2(pid,"string",call)) return;
        if(!valVar2(v,"boolean",call)) return;

        let user = getSession(socket.id);
        if(!user){
            call(-3);
            return;
        }

        let p = await user.getProject(pid);
        if(!p){
            call(1);
            return;
        }

        // let res = true;
        if(!user.meta.starredProjects.includes(pid)){
            user.addToStarred(pid)
            p.meta.starred = true;
        }
        else{
            user.removeFromStarred(pid);
            p.meta.starred = false;
        }

        // save
        await user.save();
        await p.save();

        call(true);
    });
    socket.on("setProjVisibility",async (pid:string,v:boolean,call:(data:any,v?:boolean)=>void)=>{
        if(!valVar2(pid,"string",call)) return;
        if(!valVar2(v,"boolean",call)) return;

        let user = getSession(socket.id);
        if(!user){
            call(-3);
            return;
        }

        // if(!user.meta.projects.includes(pid)){
        //     call(-4); // you don't own this project
        //     return;
        // }

        // let m = user.pMeta.find(v=>v.pid == pid);
        let p = await user.getProject(pid);
        if(!p){
            call(1);
            return;
        }
        if(!p.canEdit(user.uid)){
            call(2); // can't edit
            return;
        }

        p.meta.public = v;
        
        // save
        await p.save();

        call(0,v);
    });
    socket.on("sendFeedback",(title:string,type:number,desc:string,f:(res:any)=>void)=>{
        if(!valVar2(title,"string",f)) return;
        if(!valVar2(type,"number",f)) return;
        if(!valVar2(desc,"string",f)) return;
        
        // probably don't want to record who send the feedback?

        cachedFeedbackData.push(new FeedbackData(title,type,desc));
        _feedbackNeedsSaved = true;
        f(null);
    });

    // 

    socket.on("getUserStats",async (call:(res:any)=>void)=>{
        if(!valVar(call,"function")) return;
        
        let session = getSession(socket.id);
        if(!session){
            call({err:-3});
            return;
        }

        session.meta
        let stats = {
            joinDate:session.meta.joinDate.toISOString(),
            
            challengesCompleted:session.meta.completedChallenges.length,
            challengesSubmitted:session.meta.submittedChallenges.length,
            challengesInProgress:session.meta.inprogressChallenges.length,

            lessonsCompleted:session.meta.lessonsCompleted,
            ...await session.getLessonStats(),

            // totalProjects:session.meta.projects.length,
            totalProjects:session.meta.projectCount,
            ...await session.getProjectStats()
        };

        call(stats);
    });

    socket.on("createFolder",async (name:string,fid:string|undefined,call:(data:any)=>void)=>{
        if(!valVar2(name,"string",call)) return;
        if(fid != null) if(!valVar2(fid,"string",call)) return;

        if(name == ""){ // need to write a folder name validatation function at some point
            call({err:1}); // invalid name
            return;
        }

        let user = getSession(socket.id);
        if(!user){
            call({err:-3});
            return;
        }

        // let folder = await FolderModel.find({
        //     _id:
        //     // uid:user.uid,
        // })

        let folder:FolderInst|undefined;
        
        if(fid != null && !folder){
            folder = await user.getFolder(fid);
            if(!folder){
                call({err:2}); // failed to find folder inst (when it was specified)
                return;
            }
        }

        let newFolder = await user.createFolder(name,folder);
        if(newFolder) call({});
        else call({err:3}); // something went wrong creating the folder
    });
    
    socket.on("moveProjectToFolder",async (pid:string,fid:string,call:(data:any)=>void)=>{
        if(!valVar2(pid,"string",call)) return;
        if(!valVar2(fid,"string",call)) return;

        let user = getSession(socket.id);
        if(!user){
            call({err:-3});
            return;
        }

        let project = await user.getProject(pid);
        if(!project){
            call({err:1});
            return;
        }

        let res = await project.moveToFolder(fid);
        if(!res){
            call({err:2});
            return;
        }

        call({});
    });
    socket.on("moveFolderToFolder",async (fromFID:string,toFID:string,call:(data:any)=>void)=>{
        if(!valVar2(fromFID,"string",call)) return;
        if(!valVar2(toFID,"string",call)) return;

        let user = getSession(socket.id);
        if(!user){
            call({err:-3});
            return;
        }

        let fromFolder = await user.getFolder(fromFID);
        if(!fromFolder){
            call({err:1});
            return;
        }

        let res = await fromFolder.moveToFolder(toFID);
        if(!res){
            call({err:2});
            return;
        }

        call({});
    });

    socket.on("updateFolderMeta",async (fid:string,name:string,call:(data:any)=>void)=>{
        if(!valVar2(name,"string",call)) return;
        if(!valVar2(fid,"string",call)) return;
        if(name.length == 0){
            call({err:1}); // name invalid // TODO - need to write a name validator at some point
            return;
        }

        let session = getSession(socket.id);
        if(!session){
            call({err:-3});
            return;
        }

        let folder = await session.getFolder(fid);
        if(!folder){
            call({err:2});
            return;
        }

        folder.meta.name = name;
        await folder.save();

        call({});
    });
    socket.on("deleteFolder",async (fid:string,call:(data:any)=>void)=>{
        if(!valVar2(fid,"string",call)) return;

        let session = getSession(socket.id);
        if(!session){
            call({err:-3});
            return;
        }

        let folder = await session.getFolder(fid);
        if(!folder){
            call({err:1});
            return;
        }

        let res = await folder.deleteThis(session.uid);
        if(res) call({});
        else call({err:2});
    });

    // debug
    socket.on("debug_getStats",async ()=>{
        let session = getSession(socket.id);
        if(!session) return;

        session.getLessonStats();
    });
});

let _feedbackNeedsSaved = false;
let _feedbackIsSaving = false;
let cachedFeedbackData:FeedbackData[] = [];
class FeedbackData{
    constructor(name:string,type:number,desc:string){
        this.date = new Date().toISOString();
        this.title = name;
        this.type = type;
        this.desc = desc;
    }
    date:string;
    title:string;
    type:number;
    desc:string;
}
setInterval(async ()=>{
    if(!_feedbackNeedsSaved) return;
    if(_feedbackIsSaving){
        console.log("Warn: feedback is already saving...");
        return;
    }
    _feedbackNeedsSaved = false;
    _feedbackIsSaving = true;

    let s = await read("../data/fb.json");
    let ar:any[]|null = null;
    try{
        ar = JSON.parse(s);
    }
    catch(e){
        console.log("Warn: error saving feedback.json");
    }
    if(ar){
        for(const c of cachedFeedbackData) ar.push(c);
        await write("../data/fb.json",JSON.stringify(ar,null,4),"utf8");
        cachedFeedbackData = [];
    }
    
    _feedbackIsSaving = false;
},5000);
async function initFeedback(){
    if(!await access("../data/fb.json")){
        await write("../data/fb.json","[]","utf8");
    }
}
initFeedback();

async function copyContinueFromFiles(uid:string,fromLID:string,toLID:string){
    let fromPath = `../lesson/${uid}/${fromLID}`;
    let toPath = `../lesson/${uid}/${toLID}`;
    let res = await internalCPDir(fromPath,toPath);
}
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
        removeFromListPred(user.projects,v=>v.pid == pMeta.pid);
        allProjects.delete(user.uid+":"+pMeta.pid);
        // allProjects.delete(p.getRefStr());
    }
    let pid = pMeta.pid;
    if(pMeta.cid){
        //remove from challenges
        removeFromListPred(user.challenges,v=>v.pid == pid);
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
    removeFromListPred(user.pMeta,v=>v.pid == pid);

    // remove from recents & starred
    removeFromList(user.recent,pid);
    removeFromList(user.starred,pid);
    
    await user.saveToFile();

    let res = await removeFolder("../project/"+user.uid+"/"+pid);
    f(res ? 0 : 3);
}

function parseFolderStr(p:ProjectInst|LessonMetaInst,path:string,items:ULItem[]){
    if(!p) return;
    let s = path.split("/").filter(v=>v != null && v != "");
    if(!s.length) return null;
    let f = items.find(v=>v.name == s[0]) as ULFolder;
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
    
    // let existing = user.challenges.some(v=>v.cid == cid);
    let existingCh = user.challenges.filter(v=>v.cid == cid);
    let _id = 0;
    if(existingCh.length){
        let existing = user.pMeta.filter(v=>v.cid == cid);
        if(existing.some(v=>!v.submitted)){
            // return 1; // already exists
            return 1;
        }
        let id = 0;
        for(const e of existingCh){
            if(e.i > id) id = e.i;
        }
        id++;
        _id = id;
    }
    let path = "../project/"+user.uid+"/"+pid; //__c- prefix (THIS WILL BE INCLUDED ON CHALLENGES DATA EVENTUALLY)
    // if(await access(path)) return 1; // already exists
    let res = await mkdir(path);
    if(!res) return 2; // failed to create
    user.challenges.push(new UserChallengeData(_id,cid,pid));
    await user.saveToFile();

    // setup/create project
    let p = new Project(pid,user.uid,getDefaultProjectMeta(user,pid,c.name+(_id != 0 ? " "+(_id+1) : "")));
    p.meta.desc = `An attempt at the ${c.name} challenge.`;
    p._owner = user;
    p.meta.time = 0;
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
async function createProject1(user:User,name:string,desc:string,isPublic=false){
    let pid = genPID();
    let meta = new ProjectMeta(user,pid,name,desc,isPublic,false);
    meta.wc = new Date().toISOString();
    meta.wls = meta.wc;
    let p = user.createProject(meta,pid);
    let path = "../project/"+user.uid;
    await mkdir(path);
    await mkdir(path+"/"+p.pid);
    return p;
}
enum ProjectGroup{
    personal,
    projects,
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
type SubmissionsFilterType = {
    mine:boolean;
};

server.listen(3000,()=>{
    console.log("listening on *:3000");
});

let rl = createInterface(process.stdin,process.stdout);
rl.on("line",async (line)=>{
    line = line.trim();
    // let s = line.split(" ");
    let s = line.split(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g);
    s = s.filter(v=>v.length != 0 && v != " ");
    s = s.map(v=>{
        if(v.startsWith('"')) return v.substring(1,v.length-1);
        return v;
    });
    let cmd = s[0];
    if(line == "challenges"){
        console.log(challenges);
        return;
    }
    else if(line == "stop"){
        if(_feedbackIsSaving){
            console.log("Can't stop, feedback save is still in progress");
            return;
        }
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
    // else if(s[0] == "email"){
    //     let ar = [...users];
    //     let u = ar.find(v=>v[1].email == s[1]);
    //     console.log(u);
    //     return;
    // }
    else if(s[0] == "projects"){
        console.log(allProjects);
        return;
    }
    else if(s[0] == "sessions"){
        console.log(userSessions);
        return;
    }
    else if(s[0] == "projectCache"){
        console.log(projectCache);
        return;
    }
    else if(s[0] == "pitems"){
        // let u = users.get(s[1]);
        // if(!u){
        //     console.log("couldn't find user.");
        //     return;
        // }
        // let p = u.meta.projects.find(v=>v == s[2]);
        // if(!p){
        //     console.log("couldn't find project.");
        //     return;
        // }
        // // let cur = p.items;
        // let cur = [] as ULItem[];
        // for(let i = 3; i < s.length; i++){
        //     let res = cur[parseInt(s[i])];
        //     if(!res){
        //         console.log("Cannot find.");
        //         return;
        //     }
        //     if(res instanceof ULFile){
        //         console.log("FILE: ",res);
        //         return;
        //     }
        //     cur = (res as ULFolder).items;
        // }
        // console.log(cur);
        // // pitems gyhar.ce@gmail.com e8bc2db5-9443-4c8d-a894-7d8a1deea591
        // return;
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
    else if(s[0] == "regLessons"){
        console.log(registeredLessonFolders);
        return;
    }
    else if(s[0] == "rl"){
        await reloadLessons();
        console.log(":: done");
        return;
    }
    else if(s[0] == "reload"){
        // if(s[1] == "lessons"){
        //     let list = [...lessonMetas];
        //     lessonMetas.clear();
        //     for(const c of list){
        //         let spl = c[0].split(":");
        //         getLessonMeta(spl[0],spl[1]);
        //     }
        //     console.log("done");
        // }
        if(s[1] == "lessons"){
            await reloadLessons();
            console.log(":: done");
            return;
        }
        console.log("! err - didn't find a reload command with the id: "+s[1]);
        return;
    }
    // CREATE cmd
    else if(s[0] == "create"){
        let type = s[1];
        if(!s[2]){
            console.log("Invalid project name");
            return;
        }
        switch(type){
            case "lesson":
                createLesson(s[2]);
                break;
            case "guided_project":
                createGuidedProject(s[2]);
                break;
            case "rush":
                createRushLesson(s[2]);
                break;
            default:
                console.log("Unknown type to create: ",type);
        }
        return;
    }
    else if(s[0] == "print"){
        // if(s[1] == "online"){
        //     console.log("Users Online: ");
        //     console.log(usersOnline.join(", "));
        //     console.log(usersOnline.length);
        //     return;
        // }
        // if(s[1] == "online-cnt"){
        //     console.log("Users Online (count): ",usersOnline.length);
        //     return;
        // }
        if(s[1] == "users"){
            let list:string[] = [];
            for(const [k,v] of socks){
                let email = users.get(v)?.sessions.find(w=>w.sockId == v)?.email; // this isn't right but...
                if(email){
                    if(!list.includes(email)) list.push(email);
                }
                else console.log("** found someone with invalid user data");
            }
            console.log("Users Online: ");
            if(list.length) console.log(list.join(", "));
            console.log(list.length);
            return;
        }
    }
    else if(s[0] == "transfer"){
        if(s[1] == "challenges"){
            let from = await readdir("../transfer/challenges");
            if(!from){
                console.log("couldn't find from folder");
                return;
            }
            let to = await readdir("../challenges");
            if(!to){
                console.log("couldn't find to folder");
                return;
            }
            for(const f of from){
                if(!to.includes(f)){
                    let res = await internalCP("../transfer/challenges/"+f,"../challenges/"+f);
                    if(!res) console.log("...failed: "+f);
                    else console.log("ADDED: "+f);
                }
                else console.log("...skipped: "+f);
            }
            console.log("done");
            return;
        }
    }
    else if(s[0] == "upload"){
        if(s[1] == "challenges"){
            await uploadChallenges();
            return;
        }
        else if(s[1] == "all"){
            if(s[2] != "-confirm"){
                console.log("this is a dangerous command, please run the command with -confirm to continue.");
                return;
            }
            console.log("$ starting upload of all local items into the current database.\n-------\n");

            console.log("$ uploading challenges...");
            await uploadChallenges();

            console.log("$ uploading users...");
            await uploadUsers();
            
            console.log("$ uploading lesson progress...");
            await uploadLessonProgs();

            console.log("$ DONE");
            return;
        }
    }
    else if(s[0] == "test"){
        // 2024-06-03T00:53:57.859+00:00
        // 2024-06-03T00:53:57.859+00:00
        // 2024-06-03T00:58:58.251+00:00 // <- caching with sessions works :D
        if(s[1] == "lastLoggedIn"){
            let sid = s[2];
            if(!sid) return;
            let session = userSessions.get(sid);
            if(!session){
                console.log("no session found");
                return;
            }
            session.meta.lastLoggedIn = new Date();
            console.log("...saving...");
            await session.meta.save();
            console.log("SAVED");
            return;
        }
    }
    else if(s[0] == "calc"){
        if(s[1] == "lines"){ // calc total lines of code :D
            let root = "../../";
            let amts = {
                backend:0,
                frontend:0
            } as Record<string,number>;
            let lines1 = {
                backend:0,
                frontend:0
            } as Record<string,number>;
            let lines1NoBlank = {
                backend:0,
                frontend:0
            } as Record<string,number>;
            
            async function search(path:string,key:string,ignore:string[],allowedTypes:string[]){
                let items = await readdir(path);
                if(!items) return;
                for(const item of items){
                    let fullPath = path+item;
                    if(ignore.includes(fullPath)) continue;
                    if(!item.includes(".")){ // is folder
                        await search(fullPath+"/",key,ignore,allowedTypes);
                    }
                    else{ // is file
                        let type = item.split(".").pop();
                        if(type) if(allowedTypes.includes(type.toLowerCase())){
                            amts[key]++; // file total

                            // line total
                            let text = await read(fullPath,"utf8");
                            text = text.replace(/\r/g,"");
                            let lines = text.split("\n");
                            lines1[key] += lines.length;
                            for(const l of lines){
                                if(l.length > 0){
                                    lines1NoBlank[key]++;
                                }
                            }
                        }
                    }
                }
            }

            // 

            let types = ["html","css","ts"];

            await search(root+"server/","backend",[
                root+"server/project",
                root+"server/projects",
                root+"server/out",
                root+"server/_tmp_data",
                root+"server/challenges_old",
                root+"server/data",
                root+"server/lesson",
                root+"server/lessons",
                root+"server/queries",
                root+"server/transfer",
                root+"server/users_old",
                root+"server/users",
            ],types);
            await search(root,"frontend",[
                root+"server",
                root+"js-challenges",
                root+"out",
                root+"lib",
                root+"node_modules",
                root+"showker/out",
                root+"src/socket.io.min.ts",
                root+"practice/challenges.json"
            ],types);

            console.log("--------------------------------");
            console.log("Total Files: ",amts.backend+amts.frontend);
            // console.log("Total Lines: ",lines1.backend+lines1.frontend);
            console.log("");
            console.log("-- Backend: \n",amts.backend," files\n",lines1.backend," lines\n",lines1NoBlank.backend," lines (non blank)\n");
            console.log("-- Frontend: \n",amts.frontend," files\n",lines1.frontend," lines\n",lines1NoBlank.frontend," lines (non blank)");

            console.log("");
            console.log("TOTAL LINES: ",lines1.backend+lines1.frontend);
            console.log("TOTAL LINES (non blank): ",lines1NoBlank.backend+lines1NoBlank.frontend);
            console.log("--------------------------------");

            return;
        }
    }
    console.log("Unknown command: ",s[0]);
});