import { io, server, CredentialResData, User, users, getUserBySock, sanitizeEmail } from "./connection";
import fs from "fs";

function valVar(v:any,type:string){
    if(v == null) return false;
    return (typeof v == type);
}

io.on("connection",socket=>{
    socket.on("login",(data:CredentialResData,token:string,call:(data:CredentialResData)=>void)=>{
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
                let fdataStr:string;
                try{
                    fdataStr = fs.readFileSync("../users/"+san+".json",{encoding:"utf8"});
                }
                catch(e){}

                function newUser(){
                    user = new User(data.name,data.email,data.picture,data._joinDate,data._lastLoggedIn,socket.id);
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
                    user = new User(fdata.name,fdata.email,fdata.picture,fdata._joinDate,fdata._lastLoggedIn,socket.id);
                }
                users.set(user.email,user);
            }
        }
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
});

server.listen(3000,()=>{
    console.log('listening on *:3000');
});