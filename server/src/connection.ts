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
class Project{
    constructor(pid:string,name:string,ownerEmail:string){
        this.pid = pid;
        this.name = name;
        this.ownerEmail = ownerEmail;
    }
    pid:string;
    name:string;
    ownerEmail:string;
    _owner:User;
    
    getRefStr(){
        return this.ownerEmail+":"+this.pid;
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
export class User{
    constructor(name:string,email:string,picture:string,_joinDate:string,_lastLoggedIn:string,sockId:string){
        this.name = name;
        this.email = email;
        this.sanitized_email = sanitizeEmail(email);
        this.picture = picture;
        this.joinDate = _joinDate;
        
        this.lastLoggedIn = _lastLoggedIn;
        this.tokens = [];
        this.sockIds = [];
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
    saveToFile(){
        // if we don't save tokens this will require users to relog when there's a server restart maybe? do we need to save them?
        let data = {
            name:this.name,
            email:this.email,
            picture:this.picture,
            joinDate:this.joinDate,
            lastLoggedIn:this.lastLoggedIn
        };
        fs.writeFile(this.getPath(),JSON.stringify(data),{encoding:"utf8"},err=>{
            if(err) console.log("Err while saving file: ",err);
        });
    }

    // Projects
    createProject(name:string){
        let pid = genPID();
        let p = new Project(pid,name,this.email);
        p._owner = this;
        this.projects.push(p);
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
const allProjects = new Map<string,Project>();

// for indexing, need to make a deloadProject at some point
function loadProject(p:Project){
    allProjects.set(p.getRefStr(),p);
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