"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readdir = exports.mkdir = exports.removeFile = exports.read = exports.write = exports.access = exports.ULFile = exports.Socket = exports.getUserBySock = exports.attemptToGetProject = exports.getProject = exports.allProjects = exports.users = exports.User = exports.UserChallengeData = exports.ProjectMeta = exports.Project = exports.sanitizeEmail = exports.io = exports.server = void 0;
const http = __importStar(require("http"));
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
Object.defineProperty(exports, "Socket", { enumerable: true, get: function () { return socket_io_1.Socket; } });
const fs_1 = __importDefault(require("fs"));
console.log("started...");
const app = (0, express_1.default)();
exports.server = http.createServer(app);
exports.io = new socket_io_1.Server(exports.server, {
    cors: {
        // origin:"http://127.0.0.1:5500"
        origin: "*"
    }
});
function sanitizeEmail(email) {
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
    email = email.replaceAll("/", "(f)");
    email = email.replaceAll("\\", "(b)");
    email = email.replaceAll("<", "(l)");
    email = email.replaceAll(">", "(g)");
    email = email.replaceAll(":", "(c)");
    email = email.replaceAll('"', "(o)");
    email = email.replaceAll("|", "(p)");
    email = email.replaceAll("?", "(q)");
    email = email.replaceAll("*", "(a)");
    return email;
}
exports.sanitizeEmail = sanitizeEmail;
function checkAuth(req, res, next) {
    console.log("log:", req.headers);
    console.log(req.headers.authorization);
    // res.status(403).json({error:"No credentials sent!"});
    if (false) {
        next();
    }
    else {
        res.sendStatus(401);
    }
}
function genPID() {
    return crypto.randomUUID();
}
class Project {
    constructor(pid, name, ownerEmail) {
        this.pid = pid;
        this.name = name;
        this.ownerEmail = ownerEmail;
        this.desc = "A project for experiments.";
        this.isPublic = false;
        this._owner = null;
        this.files = [];
    }
    pid;
    name;
    ownerEmail;
    _owner;
    desc;
    isPublic;
    files;
    // meta:ProjectMeta; // might need this at some point
    getRefStr() {
        return this.ownerEmail + ":" + this.pid;
    }
    serialize() {
        if (!this._owner) {
            console.log("Err: while trying to serialize project, no owner found");
            return;
        }
        // return this.meta;
        return new ProjectMeta(this._owner, this.pid, this.name, this.desc, this.isPublic);
        // return JSON.stringify({
        //     pid:this.pid,
        //     name:this.name,
        //     ownerEmail:this.ownerEmail,
        //     desc:this.desc,
        //     isPublic:this.isPublic
        // });
    }
    static deserialize(str) {
        let o = JSON.parse(str);
        let p = new Project(o.pid, o.name, o.ownerEmail);
        p.desc = o.desc;
        p.isPublic = o.isPublic;
        return p;
    }
}
exports.Project = Project;
class ProjectMeta {
    constructor(user, pid, name, desc, isPublic) {
        this.user = user;
        this.pid = pid;
        this.name = name;
        this.desc = desc;
        this.isPublic = isPublic;
    }
    user;
    pid;
    name;
    desc;
    isPublic;
    hasLoaded = false;
    serialize() {
        return JSON.stringify({
            pid: this.pid,
            name: this.name,
            desc: this.desc,
            isPublic: this.isPublic
        });
    }
    static deserialize(user, str) {
        let o = JSON.parse(str);
        let p = new ProjectMeta(user, o.pid, o.name, o.desc, o.isPublic);
        // console.log("DESEL",o,p);
        return p;
    }
}
exports.ProjectMeta = ProjectMeta;
class UserChallengeData {
    constructor(i, cid, pid) {
        this.i = i;
        this.cid = cid;
        this.pid = pid;
    }
    i;
    cid;
    pid;
}
exports.UserChallengeData = UserChallengeData;
class User {
    constructor(name, email, picture, _joinDate, _lastLoggedIn, sockId, pMeta) {
        this.name = name;
        this.email = email;
        this.sanitized_email = sanitizeEmail(email);
        this.picture = picture;
        this.joinDate = _joinDate;
        this.lastLoggedIn = _lastLoggedIn;
        this.tokens = [];
        this.sockIds = [];
        console.log("loading pmeta obj", pMeta);
        if (pMeta)
            this.pMeta = pMeta.map(v => ProjectMeta.deserialize(this, v)).filter(v => v.pid != null);
        else
            this.pMeta = [];
        this.projects = [];
        this.challenges = [];
    }
    name;
    email;
    sanitized_email;
    picture;
    joinDate;
    lastLoggedIn;
    tokens;
    sockIds;
    projects;
    pMeta;
    challenges;
    addToken(token) {
        if (this.tokens.includes(token))
            return;
        this.tokens = []; // if on new login should we clear all the other tokens?
        this.tokens.push(token);
    }
    hasToken(token) {
        return this.tokens.includes(token);
    }
    deleteTokens() {
        this.tokens = [];
    }
    getFirstToken() {
        return this.tokens[0];
    }
    getSocketIds() {
        return this.sockIds;
    }
    addSocketId(sockId) {
        if (this.sockIds.includes(sockId))
            return;
        this.sockIds.push(sockId);
        socks.set(sockId, this.email);
    }
    removeSocketId(sockId) {
        if (!this.sockIds.includes(sockId))
            return;
        this.sockIds.splice(this.sockIds.indexOf(sockId), 1);
        socks.delete(sockId);
    }
    getTransferData() {
        return {
            name: this.name,
            email: this.email,
            sanitized_email: this.sanitized_email,
            picture: this.picture,
            _joinDate: this.joinDate,
            _lastLoggedIn: this.lastLoggedIn
        };
    }
    // _saveLock:Promise<void>; // do we need this? to prevent conflicts with saving? if there is a saveLock then await it and then proceed
    getPath() {
        return "../users/" + this.sanitized_email + ".json";
    }
    async saveToFile() {
        // if we don't save tokens this will require users to relog when there's a server restart maybe? do we need to save them?
        // let projects:string[] = [];
        // for(const p of this.projects){
        //     projects.push(p.serialize());
        // }
        let data = {
            name: this.name,
            email: this.email,
            picture: this.picture,
            joinDate: this.joinDate,
            lastLoggedIn: this.lastLoggedIn,
            // projects,
            pMeta: this.pMeta.map(v => v.serialize()),
            challenges: this.challenges
        };
        let res = await write(this.getPath(), JSON.stringify(data), "utf8");
        if (!res)
            console.log("Err: failed to save user to file");
    }
    // Projects
    createProject(meta, pid) {
        if (pid == null)
            pid = genPID();
        let p = new Project(pid, meta.name, this.email);
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
exports.User = User;
class ProjRef {
    constructor(email, pid) {
        this.email = email;
        this.pid = pid;
    }
    email;
    pid;
    static parse(str) {
        let split = str.split(":");
        let r = new ProjRef(split[0], split[1]);
        return r;
    }
    getStr() {
        return this.email + ":" + this.pid;
    }
}
exports.users = new Map();
const socks = new Map();
exports.allProjects = new Map();
const hasntFoundProject = [];
// for indexing, need to make a deloadProject at some point
function loadProject(p) {
    exports.allProjects.set(p.getRefStr(), p);
}
function getProject(ref) {
    return exports.allProjects.get(ref);
}
exports.getProject = getProject;
async function attemptToGetProject(user, pid) {
    let ref = user.email + ":" + pid;
    if (hasntFoundProject.includes(ref)) {
        console.log("$ prevented, already stored that it couldn't find it");
        return;
    }
    let p = getProject(ref);
    if (p) {
        console.log(" :: FOUND PROJECT: ", p.name);
        return p;
    }
    else {
        // console.log(" :: did not find project...",user.email,pid);
        // attemptToGetProject(user,pid);
        // return;
    }
    console.log("$ searching...");
    let uid = user.sanitized_email;
    let path = "../project/" + uid + "/" + pid;
    if (!await access(path)) {
        // await mkdir(path);
        // call(null);
        hasntFoundProject.push(ref);
        console.log("$ not found. stored new hasn't found project");
        return;
    }
    let curFiles = await readdir(path);
    if (!curFiles) {
        console.log("Err: failed to find project files");
        return;
    }
    let files = [];
    for (const f of curFiles) {
        files.push(new ULFile(f, await read(path + "/" + f, "utf8"), "", "utf8"));
    }
    console.log("$ found files! fetching meta...");
    let meta = user.pMeta.find(v => v.pid == pid);
    if (!meta) {
        meta = new ProjectMeta(user, pid, "New Project", "A project description!", false);
        console.log("$ couldn't find meta, making up some...");
        console.log("$ loading meta!", meta.name, meta.desc);
        let p1 = user.createProject(meta, pid);
        p1._owner = user;
        p1.files = files;
        return p1;
    }
    console.log("$ found meta!", meta.name, meta.desc);
    let p2 = new Project(meta.pid, meta.name, user.email);
    p2.desc = meta.desc;
    p2.isPublic = meta.isPublic;
    p2._owner = user;
    p2.files = files;
    user.projects.push(p2);
    loadProject(p2);
    return p2;
}
exports.attemptToGetProject = attemptToGetProject;
function getUserBySock(sockId) {
    let email = socks.get(sockId);
    if (!email)
        return;
    return exports.users.get(email);
}
exports.getUserBySock = getUserBySock;
app.use("/project/:userId/:auth", (req, res, next) => {
    let p = req.params;
    if (!p)
        return;
    let user = exports.users.get(p.userId);
    if (!user) {
        // console.warn("Err: user not found: "+p.userId);
        res.send("User not found");
        return;
    }
    if (!user.getSocketIds().includes(p.auth)) {
        res.send("Auth incorrect");
        return;
    }
    let arr = req.originalUrl.split("/");
    // console.log(arr,arr[4],p.userId);
    if (arr.at(4) != p.userId) {
        // console.log("Err: UserId mismatch");
        res.send("UserId Mismatch");
        return;
    }
    next();
}, express_1.default.static("../project/"));
app.use("/lesson/:userId/:auth/", (req, res, next) => {
    let p = req.params;
    if (!p)
        return;
    let user = exports.users.get(p.userId);
    if (!user) {
        res.send("User not found");
        return;
    }
    // if(!user.hasToken(p.auth)){
    // res.send("Auth incorrect");
    // return;
    // }
    // todo - add token system instead of using socketIds
    if (!user.getSocketIds().includes(p.auth)) {
        res.send("Auth incorrect");
        return;
    }
    let arr = req.originalUrl.split("/");
    if (arr.at(4) != p.userId) {
        res.send("UserId Mismatch");
        return;
    }
    next();
}, express_1.default.static("../lesson/"));
// TEMPORARY FOR SAME ORIGIN STUFF
app.use("/", express_1.default.static("../../"));
// UTIL
class ULFile {
    constructor(name, val, path, enc) {
        this.name = name;
        this.val = val;
        this.path = path;
        this.enc = enc;
    }
    name;
    val;
    path;
    enc;
}
exports.ULFile = ULFile;
function access(path) {
    return new Promise(resolve => {
        fs_1.default.access(path, err => {
            if (err) {
                console.log("err: ", err);
                resolve(false);
            }
            else
                resolve(true);
        });
    });
}
exports.access = access;
function write(path, data, encoding) {
    return new Promise(resolve => {
        fs_1.default.writeFile(path, data, { encoding }, err => {
            if (err) {
                console.log("err: ", err);
                resolve(false);
            }
            else
                resolve(true);
        });
    });
}
exports.write = write;
function read(path, encoding) {
    return new Promise(resolve => {
        fs_1.default.readFile(path, { encoding }, (err, data) => {
            if (err) {
                console.log("err: ", err);
                resolve(null);
            }
            else
                resolve(data);
        });
    });
}
exports.read = read;
function removeFile(path) {
    return new Promise(resolve => {
        fs_1.default.rm(path, err => {
            if (err) {
                console.log("err: ", err);
                resolve(false);
            }
            else
                resolve(true);
        });
    });
}
exports.removeFile = removeFile;
function mkdir(path, encoding) {
    return new Promise(resolve => {
        fs_1.default.mkdir(path, { recursive: true }, err => {
            if (err) {
                console.log("err: ", err);
                resolve(false);
            }
            else
                resolve(true);
        });
    });
}
exports.mkdir = mkdir;
function readdir(path) {
    return new Promise(resolve => {
        fs_1.default.readdir(path, (err, files) => {
            if (err) {
                console.log("err: ", err);
                resolve(null);
            }
            else
                resolve(files);
        });
    });
}
exports.readdir = readdir;
