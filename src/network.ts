import type { Socket } from "socket.io-client"

// declare let socket:Socket;

// @ts-ignore
let socket:Socket = io("http://127.0.0.1:3000");

let connected = false;

function setConneted(val:boolean){
    connected = val;
    console.log("NEW Connection Status: ",connected);
}

socket.on("connect",()=>{
    setConneted(true);
});
socket.on("disconnect",()=>{
    setConneted(false);
});

// 

function signup(){
    
}
function login(){

}