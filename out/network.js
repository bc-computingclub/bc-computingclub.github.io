// import type { Socket } from "socket.io-client";
// declare let socket:Socket;
// @ts-ignore
let socket = io("http://127.0.0.1:3000");
let connected = false;
function setConneted(val) {
    connected = val;
    console.log("NEW Connection Status: ", connected);
}
socket.on("connect", () => {
    if (!connected) {
        // reconnect
        logUserIn();
    }
    setConneted(true);
});
socket.on("disconnect", () => {
    setConneted(false);
});
// 
function _logout(data) {
    console.log("...starting logout");
    socket.emit("logout", data, (data) => {
        console.log("Log out successful");
    });
}
function _login(data, token) {
    console.log("...starting login");
    socket.emit("login", data, token, (data) => {
        console.log("Log in successful: ", data);
    });
}
// header
let h_profile = document.querySelector(".h-profile");
h_profile.addEventListener("click", e => {
    new LogInMenu().load();
});
//# sourceMappingURL=network.js.map