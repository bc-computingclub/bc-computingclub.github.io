import { io, server, CredentialResData, User, users, getUserBySock, sanitizeEmail, getProject, attemptToGetProject, access, readdir, read, mkdir, removeFile, write, ULFile } from "./connection";
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
                    user = new User(data.name,data.email,data.picture,data._joinDate,data._lastLoggedIn,socket.id,[]);
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
                    user = new User(fdata.name,fdata.email,fdata.picture,fdata._joinDate,fdata._lastLoggedIn,socket.id,fdata.pMeta);
                    user.saveToFile();
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

    // lesson
    socket.on("uploadLessonFiles",async (lessonId:string,list:ULFile[],call:()=>void)=>{
        if(!valVar(list,"object")) return;
        if(!valVar(lessonId,"string")) return;
        if(!valVar(call,"function")) return;
        
        let user = getUserBySock(socket.id);
        if(!user) return;
        // need to validate type integrity here
        
        console.log("uploading...");
        let uid = user.sanitized_email;

        let path = "../lesson/"+uid+"/"+lessonId;
        if(!await access(path)) await mkdir(path);

        let curFiles = await readdir(path);
        if(!curFiles) return;

        curFiles = curFiles.filter(v=>!list.some(w=>w.name == v));
        for(const f of curFiles){
            console.log("...removing file:",path+"/"+f);
            await removeFile(path+"/"+f);
        }
        for(const f of list){
            console.log("...writing file:",path+"/"+f.name,f.enc);
            await write(path+"/"+f.name,f.val,f.enc);
        }

        // todo - cache file values so if they're the same then they don't need to be reuploaded, or do this on the client maybe to speed it up

        console.log(":: done uploading");
        call();
    });
    socket.on("restoreLessonFiles",async (lessonId:string,call:(data:any)=>void)=>{
        if(!valVar(lessonId,"string")) return;
        if(!valVar(call,"function")) return;

        let user = getUserBySock(socket.id);
        if(!user) return;

        console.log("restoring...");
        let uid = user.sanitized_email;
        let path = "../lesson/"+uid+"/"+lessonId;
        if(!await access(path)){
            await mkdir(path);
            // call(null);
            // return;
        }
        let curFiles = await readdir(path);
        let files:ULFile[] = [];
        for(const f of curFiles){
            files.push(new ULFile(f,await read(path+"/"+f,"utf8"),"","utf8"));
        }
        call(files);
    });
    // editor
    socket.on("uploadProjectFiles",async (pid:string,list:ULFile[],call:()=>void)=>{
        if(!valVar(list,"object")) return;
        if(!valVar(pid,"string")) return;
        if(!valVar(call,"function")) return;
        
        let user = getUserBySock(socket.id);
        if(!user) return;
        // need to validate type integrity here
        
        console.log("uploading...");
        let uid = user.sanitized_email;

        let path = "../project/"+uid+"/"+pid;
        if(!await access(path)) await mkdir(path);

        let curFiles = await readdir(path);
        if(!curFiles) return;

        curFiles = curFiles.filter(v=>!list.some(w=>w.name == v));
        for(const f of curFiles){
            console.log("...removing file:",path+"/"+f);
            await removeFile(path+"/"+f);
        }
        for(const f of list){
            console.log("...writing file:",path+"/"+f.name,f.enc);
            await write(path+"/"+f.name,f.val,f.enc);
        }

        let p = user.projects.find(v=>v.pid == pid);
        for(const f of list){
            let ff = p.files.find(v=>v.name == f.name);
            ff.val = f.val;
        }

        // todo - cache file values so if they're the same then they don't need to be reuploaded, or do this on the client maybe to speed it up

        console.log(":: done uploading");
        call();
    });
    socket.on("restoreProjectFiles",async (pid:string,call:(data:any)=>void)=>{
        if(!valVar(pid,"string")){
            console.log("Err: pid incorrect format");
            call(null);
            return;
        }
        if(!valVar(call,"function")){
            console.log("Err: call incorrect format");
            call(null);
            return;
        }

        let user = getUserBySock(socket.id);
        if(!user){
            console.log("Err: could not find user");
            call(null);
            return;
        }

        console.log("restoring... from PID: ",pid);

        let p = await attemptToGetProject(user,pid);
        
        call(p?.files);

        return;
        
        let uid = user.sanitized_email;
        let path = "../project/"+uid+"/"+pid;
        if(!await access(path)){
            // await mkdir(path);
            call(null);
            return;
        }
        let curFiles = await readdir(path);
        let files:ULFile[] = [];
        for(const f of curFiles){
            files.push(new ULFile(f,await read(path+"/"+f,"utf8"),"","utf8"));
        }
        call(files);
    });
});

server.listen(3000,()=>{
    console.log('listening on *:3000');
});