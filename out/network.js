"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// declare let socket:Socket;
// @ts-ignore
let socket = io("http://127.0.0.1:3000");
let connected = false;
function setConneted(val) {
    connected = val;
    console.log("NEW Connection Status: ", connected);
}
socket.on("connect", () => {
    setConneted(true);
});
socket.on("disconnect", () => {
    setConneted(false);
});
// 
function signup() {
}
function login() {
}
//# sourceMappingURL=network.js.map