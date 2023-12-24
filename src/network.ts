// import type { Socket } from "socket.io-client";

// declare let socket:Socket;

// @ts-ignore
let socket:Socket = io("http://127.0.0.1:3000");

let connected = false;

function setConneted(val:boolean){
    connected = val;
    console.log("NEW Connection Status: ",connected);
}

socket.on("connect",()=>{
    if(!connected){
        // reconnect
        logUserIn();
    }
    
    setConneted(true);
});
socket.on("disconnect",()=>{
    setConneted(false);
});

// 

function _logout(data:CredentialResData){
    console.log("...starting logout");
    socket.emit("logout",data,(data:CredentialResData)=>{
        console.log("Log out successful");
    });
}
function _login(data:CredentialResData,token:string){
    console.log("...starting login");
    socket.emit("login",data,token,(data:CredentialResData)=>{
        console.log("Log in successful: ",data);
    });
}

// header
let h_profile = document.querySelector(".h-profile") as HTMLElement;
h_profile.addEventListener("click",e=>{
    new LogInMenu().load();
});