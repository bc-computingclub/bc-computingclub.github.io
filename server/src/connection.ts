import * as http from "http";
import express, { NextFunction, Request, Response } from "express";
import {Server, Socket} from "socket.io";
import fs from "fs";
import { challenges } from "./s_challenges";
// import cors from "cors";

console.log("started...");
const app = express();
// app.use(cors({
//     origin:"http://localhost:5501"
// }));
export const server = http.createServer(app);
export const io = new Server(server,{
    cors:{
        // origin:"http://127.0.0.1:5500"
        origin:"*"
    }
});

export function sanitizeEmail(email:string){
    email = email.trim();
    
    // let chars = email.split("");
    // let forSlashe = chars.filter(v=>v == "/").length;
    // let backSlashe = chars.filter(v=>v == "\\").length;
    // let lt = chars.filter(v=>v == "<").length;
    // let gt = chars.filter(v=>v == ">").length;
    // let colon = chars.filter(v=>v == ":").length;
    // let quote = chars.filter(v=>v == '"').length;
    // let pipe = chars.filter(v=>v == "|").length;
    // let question = chars.filter(v=>v == "?").length;
    // let astrix = chars.filter(v=>v == "*").length;
    // let period = chars.filter(v=>v == ".").length;
    
    email = email.replaceAll("/","(f)");
    email = email.replaceAll("\\","(b)");
    email = email.replaceAll("<","(l)");
    email = email.replaceAll(">","(g)");
    email = email.replaceAll(":","(c)");
    email = email.replaceAll('"',"(o)");
    email = email.replaceAll("|","(p)");
    email = email.replaceAll("?","(q)");
    email = email.replaceAll("*","(a)");

    return email;
}

function checkAuth(req:Request,res:Response,next:NextFunction){
    console.log("log:",req.headers);
    console.log(req.headers.authorization);
    // res.status(403).json({error:"No credentials sent!"});
    
    if(false){
        next();
    }
    else{
        res.sendStatus(401);
    }
}

function genPID(){
    return crypto.randomUUID();
}
export function getDefaultProjectMeta(user:User,pid:string,name:string){
    return new ProjectMeta(user,pid,name,"A project for experiments.",false,false);
}
export class Project{
    constructor(pid:string,ownerUid:string,meta:ProjectMeta){
        this.pid = pid;
        // this.name = name;
        this.ownerUid = ownerUid;
        
        // this.desc = "A project for experiments.";
        // this.isPublic = false;
        this.meta = meta;

        this._owner = null;
        // this.files = [];
        this.items = [];
    }
    meta:ProjectMeta;
    pid:string;
    // name:string;
    ownerUid:string;
    _owner:User|null;
    
    // desc:string;
    // isPublic:boolean;
    // files:ULFile[];
    items:ULItem[];
    get cid(){
        return this.meta.cid;
    }

    // meta:ProjectMeta; // might need this at some point

    validateMetaLink(){
        if(!this._owner){
            console.log("$ err: cannot validate meta link (no owner loaded)");
            return;
        }
        // console.log(this._owner.pMeta.includes(this.meta));
    }
    canUserEdit(uid:string){
        // tmp for now as there is no sharing projects with others or allowing specific access yet
        return this.ownerUid == uid;
    }
    
    getPath(){
        return "../project/"+this.ownerUid+"/"+this.pid+"/";
    }
    getRefStr(){
        return this.ownerUid+":"+this.pid;
    }

    serializeGet(force=false){
        if(!force) if(!this._owner) return;
        // let meta = this._owner.pMeta.find(v=>v.pid == this.pid);
        // let challenge = this._owner.challenges.find(v=>v.pid == this.pid);
        return {
            owner:this.ownerUid,
            name:this.meta.name,
            desc:this.meta.desc,
            isPublic:this.meta.isPublic,
            pid:this.pid,
            // files:this.files,
            items:this.items,
            cid:this.meta.cid,
            submitted:this.meta.submitted,
            meta:this.meta.serialize(),
            starred:(this._owner ? this._owner.starred.includes(this.pid) : null)
        };
    }
    serialize(){
        if(!this._owner){
            console.log("Err: while trying to serialize project, no owner found");
            return;
        }
        // return this.meta;
        let m = new ProjectMeta(this._owner,this.pid,this.meta.name,this.meta.desc,this.meta.isPublic,this.meta.submitted);
        m.cid = this.cid;
        return m;
        // return JSON.stringify({
        //     pid:this.pid,
        //     name:this.name,
        //     ownerEmail:this.ownerEmail,

        //     desc:this.desc,
        //     isPublic:this.isPublic
        // });
    }
    static deserialize(str:string){
        let o = JSON.parse(str);
        let p = new Project(o.pid,o.name,o.ownerEmail);
        p.meta.desc = o.desc;
        p.meta.isPublic = o.isPublic;
        return p;
    }
}

export interface CredentialResData{
    uid:string,
    name:string;
    email:string;
    sanitized_email:string;
    email_verified:boolean;
    picture:string;

    _joinDate:string;
    _lastLoggedIn:string;
}
export class ProjectMeta{
    constructor(user:User|null,pid:string,name:string,desc:string,isPublic:boolean,submitted:boolean){
        this.user = user;
        this.pid = pid;
        this.name = name;
        this.desc = desc;
        this.isPublic = isPublic;
        this.submitted = submitted ?? false;
    }
    user:User|null;
    pid:string;
    name:string;
    desc:string;
    isPublic:boolean;
    submitted:boolean;
    wc:string = ""; // when created
    time = 0;
    wls:string = ""; // when last saved

    cid?:string;
    ws:string = ""; // when submitted
    
    hasLoaded = false;
    serialize(){
        // let challenge = this.user.challenges.find(v=>v.pid == this.pid);
        // return JSON.stringify({
        return {
            pid:this.pid,
            name:this.name,
            desc:this.desc,
            isPublic:this.isPublic,
            // cid:challenge?.cid
            cid:this.cid,
            sub:this.submitted,

            starred:(this.user ? this.user.starred.includes(this.pid) : null),
            wc:this.wc,
            time:this.time,
            ws:this.ws,
            wls:this.wls,
            owner:(this.user ? this.user.uid : null),

            canEdit:(this.user ? this.user.canEdit(this) : false),
            isOwner:(this.user ? this.user.isOwner(this) : false),
        };
    }
    static deserialize(user:User,str:string|any){
        let o = (typeof str == "string" ? JSON.parse(str) : str);
        return this.deserialize2(user,o);
    }
    static deserialize2(user:User|null,o:any){
        if(o instanceof ProjectMeta) return o;
        let p = new ProjectMeta(user,o.pid,o.name,o.desc,o.isPublic,o.sub);
        p.cid = o.cid;
        p.wc = o.wc ?? new Date().toISOString();
        p.time = o.time ?? 0;
        p.ws = o.ws ?? "";
        p.wls = o.wls ?? "";
        return p;
    }
}
export class UserChallengeData{
    constructor(i:number,cid:string,pid:string){
        this.i = i;
        this.cid = cid;
        this.pid = pid;
    }
    i:number;
    cid:string;
    pid:string;
}
export class User{
    constructor(uid:string,name:string,email:string,picture:string,_joinDate:string,_lastLoggedIn:string,sockId:string,pMeta:any[]){
        this.name = name;
        this.email = email;
        // this.sanitized_email = sanitizeEmail(email);
        this.picture = picture;
        this.joinDate = _joinDate;
        
        this.lastLoggedIn = _lastLoggedIn;
        this.tokens = [];
        this.sockIds = [];
        // console.log("loading pmeta obj",pMeta);
        if(pMeta) this.pMeta = pMeta.map(v=>ProjectMeta.deserialize(this,v)).filter(v=>v.pid != null);
        else this.pMeta = [];
        this.projects = [];
        this.challenges = [];

        // temp for now
        // this.uid = email;
        this.uid = uid;
    }
    name:string;
    email:string;
    // sanitized_email:string;
    picture:string;
    joinDate:string;
    lastLoggedIn:string;
    uid:string;

    private tokens:string[];
    private sockIds:string[];

    projects:Project[];
    pMeta:ProjectMeta[];
    challenges:UserChallengeData[];

    recent:string[] = [];
    starred:string[] = [];

    addToRecents(pid:string){
        let _maxRecentsLength = 16;
        if(this.recent.length >= _maxRecentsLength) this.recent.splice(0,1);
        if(!this.recent.includes(pid)) this.recent.push(pid);
        this.saveToFile();
    }
    removeFromRecents(pid:string){
        let i = this.recent.indexOf(pid);
        if(i != -1){
            this.recent.splice(i,1);
            this.saveToFile();
            return true;
        }
        return false;
    }
    addToStarred(pid:string){
        let res = true;
        let _maxStarredLength = 512;
        if(this.starred.length >= _maxStarredLength){
            this.starred.splice(0,1);
            res = false;
        }
        if(!this.starred.includes(pid)) this.starred.push(pid);
        this.saveToFile();
        return res;
    }
    removeFromStarred(pid:string){
        let i = this.starred.indexOf(pid);
        if(i != -1){
            this.starred.splice(i,1);
            this.saveToFile();
            return true;
        }
        return false;
    }

    canEdit(meta:ProjectMeta){
        let canEdit = true;
        if(meta.user?.uid != this.uid) canEdit = false;
        if(meta.submitted) canEdit = false;
        return canEdit;
    }
    isOwner(meta:ProjectMeta){
        return this.uid == meta.user?.uid;
    }

    // lesson = new Map<string,LessonMeta>;
    // saveLessonMeta(lid:string,meta:LessonMeta){
    //     this.lesson.set(lid,meta);
    // }
    // startLesson(lid:string,mode:LessonMode){
    //     let meta = new LessonMeta(-1,-1,0,mode,false);
    //     this.lesson.set(lid,meta);
    // }

    addToken(token:string){
        if(this.tokens.includes(token)) return;
        this.tokens = []; // if on new login should we clear all the other tokens?
        
        this.tokens.push(token);
    }
    hasToken(token:string){
        return this.tokens.includes(token);
    }
    deleteTokens(){
        this.tokens = [];
    }
    getFirstToken(){
        return this.tokens[0];
    }

    getSocketIds(){
        return this.sockIds;
    }
    addSocketId(sockId:string){
        if(this.sockIds.includes(sockId)) return;
        this.sockIds.push(sockId);
        socks.set(sockId,this.uid);
    }
    removeSocketId(sockId:string){
        if(!this.sockIds.includes(sockId)) return;
        this.sockIds.splice(this.sockIds.indexOf(sockId),1);
        socks.delete(sockId);
    }
    deleteSocketIds(){
        let list = [...this.sockIds];
        for(const id of list){
            this.removeSocketId(id);
        }
    }

    getTransferData(){
        return {
            uid:this.uid,
            name:this.name,
            email:this.email,
            // sanitized_email:this.sanitized_email,
            picture:this.picture,
            _joinDate:this.joinDate,
            _lastLoggedIn:this.lastLoggedIn
        } as CredentialResData;
    }

    // _saveLock:Promise<void>; // do we need this? to prevent conflicts with saving? if there is a saveLock then await it and then proceed
    getPath(){
        return "../users/"+this.uid+".json";
    }
    async saveToFile(){
        // if we don't save tokens this will require users to relog when there's a server restart maybe? do we need to save them?
        // let projects:string[] = [];
        // for(const p of this.projects){
        //     projects.push(p.serialize());
        // }
        let data = {
            name:this.name,
            email:this.email,
            picture:this.picture,
            joinDate:this.joinDate,
            lastLoggedIn:this.lastLoggedIn,
            pMeta:this.pMeta.map(v=>v.serialize()),
            challenges:this.challenges,
            recent:this.recent,
            starred:this.starred
            // lesson:this.lesson
        };
        let res = await write(this.getPath(),JSON.stringify(data,null,4),"utf8"); // this is formatted for now but won't be for production
        if(!res) console.log("Err: failed to save user to file");
    }

    // Projects
    createProject(meta:ProjectMeta,pid?:string){
        if(pid == null) pid = genPID();
        let p = new Project(pid,this.uid,meta);
        p._owner = this;
        this.projects.push(p);
        this.pMeta.push(meta);
        this.saveToFile();
        loadProject(p);
        return p;
    }
}
class ProjRef{
    constructor(email:string,pid:string){
        this.email = email;
        this.pid = pid;
    }
    email:string;
    pid:string;
    static parse(str:string){
        let split = str.split(":");
        let r = new ProjRef(split[0],split[1]);
        return r;
    }
    getStr(){
        return this.email+":"+this.pid;
    }
}

export enum LessonMode{
    lesson,
    review
}
export class LessonMeta{
    constructor(eventI=-1,taskI=-1,prog=0,mode:LessonMode=0){
        this.eventI = eventI;
        this.taskI = taskI;
        this.prog = prog;
        this.mode = mode;
    }
    eventI:number;
    taskI:number;
    prog:number;
    mode:number;
    wu:string = ""; // when unlocked
    s:boolean = false; // started
    n:boolean = false; // is new
    u:boolean = false;
    times = 0;
    ws = ""; // when started the first time
    hf = false; // has finished once
    _hp = 0; // has sent out post (like unlocks) - this is a version number if new updates come out in the future
    wls = ""; // when last save
    static parse(data:any){
        let m = new LessonMeta(data.eventI,data.taskI,data.prog??0,data.mode??0);
        m.wu = data.wu ?? "";
        m.s = data.started??(m.prog != 0);
        m.n = data.n ?? false;
        m.u = data.u ?? false;
        m.times = data.times ?? 0;
        m.ws = data.ws ?? "";
        m.hf = data.hf ?? false;
        m._hp = data._hp ?? 0;
        m.wls = data.wls ?? "";
        return m;
    }
}

export const users = new Map<string,User>();
export const socks = new Map<string,string>();
export const allProjects = new Map<string,Project>();
const hasntFoundProject:string[] = [];
export const lessonMetas = new Map<string,LessonMeta>();

export async function getLessonMeta(uid:string,lid:string){
    let metaPath = "../users/"+uid+"/lesson/"+lid+"/";
    let meta = lessonMetas.get(uid+":"+lid);
    if(!meta){
        if(!await access(metaPath+"meta.json")){
            meta = new LessonMeta();
            lessonMetas.set(uid+":"+lid,meta);
        }
        else{
            meta = LessonMeta.parse(JSON.parse(await read(metaPath+"meta.json")));
            lessonMetas.set(uid+":"+lid,meta);
        }
    }
    return meta;
}
export async function writeLessonMeta(uid:string,lid:string,meta:LessonMeta,isNew=false){
    let metaPath = "../users/"+uid+"/lesson/"+lid+"/";
    if(isNew) if(!await access(metaPath)) await mkdir(metaPath);
    await write(metaPath+"meta.json",JSON.stringify(meta),"utf8");
    let id = uid+":"+lid;
    if(!lessonMetas.has(id)) lessonMetas.set(id,meta);
}
export async function deleteLessonMeta_old(uid:string,lid:string){
    let metaPath = "../users/"+uid+"/lesson/"+lid+"/";
    await removeFolder(metaPath);
    lessonMetas.delete(uid+":"+lid);
}
export async function deleteLessonMeta(uid:string,lid:string,meta:LessonMeta){
    meta.eventI = -1;
    meta.taskI = -1;
    meta.prog = 0;
    meta.mode = 0;
    meta.s = false;
    await writeLessonMeta(uid,lid,meta);
}

// for indexing, need to make a deloadProject at some point
export function loadProject(p:Project){
    allProjects.set(p.getRefStr(),p);
    // extra catches when updating
    if(p.meta.cid != null){
        if(p.meta.submitted){
            p.meta.isPublic = true;
        }
    }
}
export function getProject(ref:string){
    return allProjects.get(ref);
}
export function getProject2(uid:string,pid:string){
    return allProjects.get(uid+":"+pid);
}
export async function getProjectFromHD(uid:string,pid:string){
    if(!uid) return -2;
    if(!pid) return -3;
    if(uid.includes(".")) return -4;
    if(pid.includes(".")) return -5;

    let ref = uid+":"+pid;
    let _p = getProject(ref);
    if(_p) return _p;
    
    let path = "../project/"+uid+"/"+pid;
    if(!await access(path)) return -6;

    let user = users.get(uid) as any;
    let realUser = user as User;
    let meta:any;
    if(!user){
        let userData = await read("../users/"+uid+".json");
        if(!userData) return -7;
        user = JSON.parse(userData);
        meta = user.pMeta.map((v:any)=>(typeof v == "string" ? JSON.parse(v) : v)).find((v:any)=>v.pid == pid);
        if(!meta) return -9;
    }
    else{
        meta = realUser.pMeta.find((v:any)=>v.pid == pid);
        if(!meta) return -9.1;
    }
    if(meta) meta = ProjectMeta.deserialize2(null,meta);

    let curFiles = await readdir(path);
    if(!curFiles) return -8;

    async function run(l:string[]|null,pth:string){
        if(l == null) return [];
        let list:ULItem[] = [];
        for(const s of l){
            if(s.includes(".")){
                let ff = new ULFile(s,await read(path+"/"+pth+"/"+s,"utf8"),"","utf8");
                list.push(ff);
            }
            else{
                let ff = new ULFolder(s,await run(await readdir(path+"/"+pth+"/"+s),pth+"/"+s));
                list.push(ff);
            }
        }
        return list;
    }
    let root = await run(curFiles,"");

    let p = new Project(pid,uid,meta);
    p.items = root;
    if(realUser) p._owner = realUser;
    loadProject(p); // hopefully this doesn't cause crashes
    return p;
}
export async function attemptToGetProject(user:User,pid:string){
    let ref = user.uid+":"+pid;

    // if(hasntFoundProject.includes(ref)){
    //     console.log("$ prevented, already stored that it couldn't find it");
    //     return;
    // }
    
    let p = getProject(ref);
    if(p){
        // console.log(" :: FOUND PROJECT: ",p.name);
        return p;
    }
    else{
        // console.log(" :: did not find project...",user.email,pid);
        // attemptToGetProject(user,pid);
        // return;
    }

    // console.log("$ searching...");

    let uid = user.uid;
    let path = "../project/"+uid+"/"+pid;
    if(!await access(path)){
        // await mkdir(path);
        // call(null);
        hasntFoundProject.push(ref);
        console.log("$ not found. stored new hasn't found project");
        return;
    }
    let curFiles = await readdir(path);
    if(!curFiles){
        console.log("Err: failed to find project files");
        return;
    }
    // let files:ULFile[] = [];
    // for(const f of curFiles){
    //     files.push(new ULFile(f,await read(path+"/"+f,"utf8"),"","utf8"));
    // }
    async function run(l:string[]|null,pth:string){
        if(l == null) return [];
        let list:ULItem[] = [];
        for(const s of l){
            if(s.includes(".")){
                let ff = new ULFile(s,await read(path+"/"+pth+"/"+s,"utf8"),"","utf8");
                list.push(ff);
            }
            else{
                let ff = new ULFolder(s,await run(await readdir(path+"/"+pth+"/"+s),pth+"/"+s));
                list.push(ff);
            }
        }
        return list;
    }
    let root = await run(curFiles,"");

    // console.log("$ found files! fetching meta...");
    let meta = user.pMeta.find(v=>v.pid == pid);
    if(!meta){
        meta = new ProjectMeta(user,pid,"New Project","A project description!",false,false);
        console.log("$ couldn't find meta, making up some...");
        console.log("$ loading meta!",meta.name,meta.desc);

        let p1 = user.createProject(meta,pid);
        p1._owner = user;
        // p1.files = files;
        p1.items = root;
        return p1;
    }
    // console.log("$ found meta!",meta.name,meta.desc);
    let p2 = new Project(meta.pid,user.uid,meta);
    p2._owner = user;
    // p2.files = files;
    p2.items = root;
    user.projects.push(p2);
    loadProject(p2);
    return p2;
}

export function getUserBySock(sockId:string){
    let email = socks.get(sockId);
    if(!email) return;
    return users.get(email);
}

app.use("/public",async (req,res,next)=>{
    let arr = req.originalUrl.split("/");
    // let project = getProject2(arr[2],arr[3]);
    let project = await getProjectFromHD(arr[2],arr[3]);
    if(typeof project == "number"){
        res.send("Error getting project, code "+project);
        return;
    }
    // let pid = arr[2];
    // let owner = arr[3];
    // let user = users.get(owner);
    // let meta:ProjectMeta;
    // if(!user){
    //     let data = await read("../users/"+owner+".json");
    //     if(!data){
    //         res.send("Project or User not found");
    //         return;
    //     }
    //     meta = ProjectMeta.deserialize(null as any,data); // hopefully not too problematic
    // }
    // if(!pid || !owner){
    //     res.send("Error getting project, query invalid");
    //     return;
    // }
    if(!project){
        res.send("Project not found or loaded");
        return;
    }
    if(!project.meta.isPublic){
        res.send("Project is private");
        return;
    }
    next();
},express.static("../project/"));
app.use("/project/:userId/:auth",(req,res,next)=>{
    let p = req.params;
    if(!p) return;
    let user = users.get(p.userId);
    if(!user){
        // console.warn("Err: user not found: "+p.userId);
        res.send("User not found");
        return;
    }
    if(!user.getSocketIds().includes(p.auth)){
        res.send("Auth incorrect (try closing this page and reopening it from the project page)");
        return;
    }
    let arr = req.originalUrl.split("/");
    // console.log(arr,arr[4],p.userId);
    if(arr.at(4) != p.userId){
        // console.log("Err: UserId mismatch");
        res.send("UserId Mismatch");
        return;
    }
    next();
},express.static("../project/"));
app.use("/lesson/:userId/:auth/",(req,res,next)=>{
    let p = req.params;
    if(!p) return;
    let user = users.get(p.userId);
    if(!user){
        res.send("User not found");
        return;
    }
    // if(!user.hasToken(p.auth)){
        // res.send("Auth incorrect");
        // return;
    // }
    // todo - add token system instead of using socketIds
    if(!user.getSocketIds().includes(p.auth)){
        res.send("Auth incorrect (try closing this page and reopening it from the lesson page)");
        return;
    }
    let arr = req.originalUrl.split("/");
    if(arr.at(4) != p.userId){
        res.send("UserId Mismatch");
        return;
    }
    next();

},express.static("../lesson/"));

// TEMPORARY FOR SAME ORIGIN STUFF
app.use("/",express.static("../../"));

export {Socket};

// UTIL
export class ULItem{
    constructor(name:string){
        this.name = name;
    }
    name:string;
    static from(d:any):ULItem{
        function sanitize(data:any){
            if(data.items){
                return new ULFolder(data.name,data.items.map((v:any)=>sanitize(v)));
            }
            else return new ULFile(data.name,data.val,data.path,data.enc);
        }
        return sanitize(d);
    }
}
export class ULFolder extends ULItem{
    constructor(name:string,items:ULItem[]=[]){
        super(name);
        this.items = items;
    }
    items:ULItem[];
}
export class ULFile extends ULItem{
    constructor(name:string,val:string,path:string,enc:BufferEncoding){
        super(name);
        this.val = val;
        this.path = path;
        this.enc = enc;
    }
    val:string;
    path:string;
    enc:BufferEncoding;
}

export function access(path:string){
    return new Promise<boolean>(resolve=>{
        fs.access(path,err=>{
            if(err){
                // console.log("err: ",err);
                resolve(false);
            }
            else resolve(true);
        });
    });
}
export function write(path:string,data:any,encoding?:BufferEncoding){
    return new Promise<boolean>(resolve=>{
        fs.writeFile(path,data,{encoding},err=>{
            if(err){
                console.log("err: ",err);
                resolve(false);
            }
            else resolve(true);
        });
    });
}
export function read(path:string,encoding?:BufferEncoding){
    return new Promise<any>(resolve=>{
        fs.readFile(path,{encoding},(err,data)=>{
            if(err){
                console.log("err: ",err);
                resolve(null);
            }
            else resolve(data);
        });
    });
}
export function removeFile(path:string){
    return new Promise<boolean>(resolve=>{
        fs.rm(path,err=>{
            if(err){
                console.log("err: ",err);
                resolve(false);
            }
            else resolve(true);
        });
    });
}
export function removeFolder(path:string){
    return new Promise<boolean>(resolve=>{
        fs.rm(path,{recursive:true},err=>{
            if(err){
                console.log("err: ",err);
                resolve(false);
            }
            else resolve(true);
        });
    });
}
export function mkdir(path:string,encoding?:BufferEncoding){
    return new Promise<boolean>(resolve=>{
        fs.mkdir(path,{recursive:true},err=>{
            if(err){
                console.log("err: ",err);
                resolve(false);
            }
            else resolve(true);
        });
    });
}
export function readdir(path:string){
    return new Promise<string[]|null>(resolve=>{
        fs.readdir(path,(err,files)=>{
            if(err){
                // console.log("err: ",err);
                resolve(null);
            }
            else resolve(files);
        });
    });
}
export function rename(fromPath:string,toPath:string){
    return new Promise<boolean>(resolve=>{
        fs.rename(fromPath,toPath,err=>{
            if(err){
                console.log("err renaming...",err);
                resolve(false);
            }
            else resolve(true);
        });
    });
}
export function internalCP(fromPath:string,toPath:string){
    return new Promise<boolean>(resolve=>{
        fs.copyFile(fromPath,toPath,err=>{
            if(err){
                resolve(false);
            }
            else resolve(true);
        });
    });
}