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
exports.Socket = exports.getUserBySock = exports.users = exports.User = exports.sanitizeEmail = exports.io = exports.server = void 0;
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
class User {
    constructor(name, email, picture, _joinDate, _lastLoggedIn, sockId) {
        this.name = name;
        this.email = email;
        this.sanitized_email = sanitizeEmail(email);
        this.picture = picture;
        this.joinDate = _joinDate;
        this.lastLoggedIn = _lastLoggedIn;
        this.tokens = [];
        this.sockIds = [];
    }
    name;
    email;
    sanitized_email;
    picture;
    joinDate;
    lastLoggedIn;
    tokens;
    sockIds;
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
            picture: this.picture,
            _joinDate: this.joinDate,
            _lastLoggedIn: this.lastLoggedIn
        };
    }
    // _saveLock:Promise<void>; // do we need this? to prevent conflicts with saving? if there is a saveLock then await it and then proceed
    getPath() {
        return "../users/" + this.sanitized_email + ".json";
    }
    saveToFile() {
        // if we don't save tokens this will require users to relog when there's a server restart maybe? do we need to save them?
        let data = {
            name: this.name,
            email: this.email,
            picture: this.picture,
            joinDate: this.joinDate,
            lastLoggedIn: this.lastLoggedIn
        };
        fs_1.default.writeFile(this.getPath(), JSON.stringify(data), { encoding: "utf8" }, err => {
            if (err)
                console.log("Err while saving file: ", err);
        });
    }
}
exports.User = User;
exports.users = new Map();
const socks = new Map();
function getUserBySock(sockId) {
    let email = socks.get(sockId);
    if (!email)
        return;
    return exports.users.get(email);
}
exports.getUserBySock = getUserBySock;
app.use("/projects/:userId/:auth", (req, res, next) => {
    let p = req.params;
    if (!p)
        return;
    let user = exports.users.get(p.userId);
    if (!user) {
        // console.warn("Err: user not found: "+p.userId);
        res.send("User not found");
        return;
    }
    if (!user.hasToken(p.auth)) {
        // console.log("Err: auth incorrect");
        res.send("Auth incorrect");
        return;
    }
    // console.log("User: "+p.userId+" - successful");
    // console.log("URL:",req.url,req.baseUrl,req.originalUrl);
    let arr = req.originalUrl.split("/");
    // console.log(arr,arr[4],p.userId);
    if (arr.at(4) != p.userId) {
        // console.log("Err: UserId mismatch");
        res.send("UserId Mismatch");
        return;
    }
    next();
}, express_1.default.static("../projects/"));
