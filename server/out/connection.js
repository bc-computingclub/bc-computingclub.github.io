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
exports.Socket = exports.io = exports.server = void 0;
const http = __importStar(require("http"));
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
Object.defineProperty(exports, "Socket", { enumerable: true, get: function () { return socket_io_1.Socket; } });
console.log("started...");
const app = (0, express_1.default)();
exports.server = http.createServer(app);
exports.io = new socket_io_1.Server(exports.server, {
    cors: {
        // origin:"http://127.0.0.1:5500"
        origin: "*"
    }
});
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
    constructor(username, pw) {
        this.username = username;
        this.pw = pw;
    }
    username;
    pw;
    add() {
        users.set(this.username, this);
    }
}
let users = new Map();
new User("claeb", "0897").add();
new User("bob", "123").add();
app.use("/projects/:userId/:auth", (req, res, next) => {
    let p = req.params;
    if (!p)
        return;
    let user = users.get(p.userId);
    if (!user) {
        // console.warn("Err: user not found: "+p.userId);
        res.send("User not found");
        return;
    }
    if (user.pw != p.auth) {
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
