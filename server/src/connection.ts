import * as http from "http";
import express, { NextFunction, Request, Response } from "express";
import {Server, Socket} from "socket.io";
console.log("started...");
const app = express();
export const server = http.createServer(app);
export const io = new Server(server,{
    cors:{
        // origin:"http://127.0.0.1:5500"
        origin:"*"
    }
});

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

class User{
    constructor(username:string,pw:string){
        this.username = username;
        this.pw = pw;
    }
    username:string;
    pw:string;

    add(){
        users.set(this.username,this);
    }
}
let users = new Map<string,User>();
new User("claeb","0897").add();
new User("bob","123").add();

app.use("/projects/:userId/:auth",(req,res,next)=>{
    let p = req.params;
    if(!p) return;
    let user = users.get(p.userId);
    if(!user){
        // console.warn("Err: user not found: "+p.userId);
        res.send("User not found");
        return;
    }
    if(user.pw != p.auth){
        // console.log("Err: auth incorrect");
        res.send("Auth incorrect");
        return;
    }
    // console.log("User: "+p.userId+" - successful");
    // console.log("URL:",req.url,req.baseUrl,req.originalUrl);
    let arr = req.originalUrl.split("/");
    // console.log(arr,arr[4],p.userId);
    if(arr.at(4) != p.userId){
        // console.log("Err: UserId mismatch");
        res.send("UserId Mismatch");
        return;
    }
    next();

},express.static("../projects/"));


// app.get("/test/:userId/books/:bookId",(req,res)=>{
//     // res.send(req.params);
//     // res.redirect("/public/test.txt");
//     res.
// });
// router.get("/test",async function(req:Request,res:Response,next:NextFunction){
//     res.redirect("/public");
// });
// app.use("/public",checkAuth,express.static("../public"));



export {Socket};