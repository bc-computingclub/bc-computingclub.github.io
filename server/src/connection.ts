import * as http from "http";
import express, { NextFunction, Request, Response } from "express";
import {Server, Socket} from "socket.io";
import fs from "fs";

console.log("started...");
const app = express();
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
export class Project{
    constructor(pid:string,name:string,ownerEmail:string){
        this.pid = pid;
        this.name = name;
        this.ownerEmail = ownerEmail;
        
        this.desc = "A project for experiments.";
        this.isPublic = false;

        this._owner = null;
        this.files = [];
    }
    pid:string;
    name:string;
    ownerEmail:string;
    _owner:User|null;
    
    desc:string;
    isPublic:boolean;
    files:ULFile[];

    // meta:ProjectMeta; // might need this at some point
    
    getRefStr(){
        return this.ownerEmail+":"+this.pid;
    }

    serialize(){
        if(!this._owner){
            console.log("Err: while trying to serialize project, no owner found");
            return;
        }
        // return this.meta;
        return new ProjectMeta(this._owner,this.pid,this.name,this.desc,this.isPublic);
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
        p.desc = o.desc;
        p.isPublic = o.isPublic;
        return p;
    }
}

export interface CredentialResData{
    name:string;
    email:string;
    sanitized_email:string;
    email_verified:boolean;
    picture:string;

    _joinDate:string;
    _lastLoggedIn:string;
}
export class ProjectMeta{
    constructor(user:User,pid:string,name:string,desc:string,isPublic:boolean){
        this.user = user;
        this.pid = pid;
        this.name = name;
        this.desc = desc;
        this.isPublic = isPublic;
    }
    user:User;
    pid:string;
    name:string;
    desc:string;
    isPublic:boolean;
    
    hasLoaded = false;
    serialize(){
        return JSON.stringify({
            pid:this.pid,
            name:this.name,
            desc:this.desc,
            isPublic:this.isPublic
        });
    }
    static deserialize(user:User,str:string){
        let o = JSON.parse(str);
        let p = new ProjectMeta(user,o.pid,o.name,o.desc,o.isPublic);
        // console.log("DESEL",o,p);
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
    constructor(name:string,email:string,picture:string,_joinDate:string,_lastLoggedIn:string,sockId:string,pMeta:any[]){
        this.name = name;
        this.email = email;
        this.sanitized_email = sanitizeEmail(email);
        this.picture = picture;
        this.joinDate = _joinDate;
        
        this.lastLoggedIn = _lastLoggedIn;
        this.tokens = [];
        this.sockIds = [];
        console.log("loading pmeta obj",pMeta);
        if(pMeta) this.pMeta = pMeta.map(v=>ProjectMeta.deserialize(this,v)).filter(v=>v.pid != null);
        else this.pMeta = [];
        this.projects = [];
        this.challenges = [];
    }
    name:string;
    email:string;
    sanitized_email:string;
    picture:string;
    joinDate:string;
    lastLoggedIn:string;

    private tokens:string[];
    private sockIds:string[];

    projects:Project[];
    pMeta:ProjectMeta[];
    challenges:UserChallengeData[];

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
        socks.set(sockId,this.email);
    }
    removeSocketId(sockId:string){
        if(!this.sockIds.includes(sockId)) return;
        this.sockIds.splice(this.sockIds.indexOf(sockId),1);
        socks.delete(sockId);
    }

    getTransferData(){
        return {
            name:this.name,
            email:this.email,
            sanitized_email:this.sanitized_email,
            picture:this.picture,
            _joinDate:this.joinDate,
            _lastLoggedIn:this.lastLoggedIn
        } as CredentialResData;
    }

    // _saveLock:Promise<void>; // do we need this? to prevent conflicts with saving? if there is a saveLock then await it and then proceed
    getPath(){
        return "../users/"+this.sanitized_email+".json";
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
            // projects,
            pMeta:this.pMeta.map(v=>v.serialize()),
            challenges:this.challenges
        };
        let res = await write(this.getPath(),JSON.stringify(data),"utf8");
        if(!res) console.log("Err: failed to save user to file");
    }

    // Projects
    createProject(meta:ProjectMeta,pid?:string){
        if(pid == null) pid = genPID();
        let p = new Project(pid,meta.name,this.email);
        p.desc = meta.desc;
        p.isPublic = meta.isPublic;
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

export const users = new Map<string,User>();
const socks = new Map<string,string>();
export const allProjects = new Map<string,Project>();
const hasntFoundProject:string[] = [];

// for indexing, need to make a deloadProject at some point
function loadProject(p:Project){
    allProjects.set(p.getRefStr(),p);
}
export function getProject(ref:string){
    return allProjects.get(ref);
}
export async function attemptToGetProject(user:User,pid:string){
    let ref = user.email+":"+pid;

    if(hasntFoundProject.includes(ref)){
        console.log("$ prevented, already stored that it couldn't find it");
        return;
    }
    
    let p = getProject(ref);
    if(p){
        console.log(" :: FOUND PROJECT: ",p.name);
        return p;
    }
    else{
        // console.log(" :: did not find project...",user.email,pid);
        // attemptToGetProject(user,pid);
        // return;
    }

    console.log("$ searching...");

    let uid = user.sanitized_email;
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
    let files:ULFile[] = [];
    for(const f of curFiles){
        files.push(new ULFile(f,await read(path+"/"+f,"utf8"),"","utf8"));
    }
    console.log("$ found files! fetching meta...");
    let meta = user.pMeta.find(v=>v.pid == pid);
    if(!meta){
        meta = new ProjectMeta(user,pid,"New Project","A project description!",false);
        console.log("$ couldn't find meta, making up some...");
        console.log("$ loading meta!",meta.name,meta.desc);

        let p1 = user.createProject(meta,pid);
        p1._owner = user;
        p1.files = files;
        return p1;
    }
    console.log("$ found meta!",meta.name,meta.desc);
    let p2 = new Project(meta.pid,meta.name,user.email);
    p2.desc = meta.desc;
    p2.isPublic = meta.isPublic;
    p2._owner = user;
    p2.files = files;
    user.projects.push(p2);
    loadProject(p2);
    return p2;
}

export function getUserBySock(sockId:string){
    let email = socks.get(sockId);
    if(!email) return;
    return users.get(email);
}

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
        res.send("Auth incorrect");
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
        res.send("Auth incorrect");
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
export class ULFile{
    constructor(name:string,val:string,path:string,enc:BufferEncoding){
        this.name = name;
        this.val = val;
        this.path = path;
        this.enc = enc;
    }
    name:string;
    val:string;
    path:string;
    enc:BufferEncoding;
}

export function access(path:string){
    return new Promise<boolean>(resolve=>{
        fs.access(path,err=>{
            if(err){
                console.log("err: ",err);
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
                console.log("err: ",err);
                resolve(null);
            }
            else resolve(files);
        });
    });
}