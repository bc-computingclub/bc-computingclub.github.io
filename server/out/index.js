"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("./connection");
const fs_1 = __importDefault(require("fs"));
function valVar(v, type) {
    if (v == null)
        return false;
    return (typeof v == type);
}
connection_1.io.on("connection", socket => {
    socket.on("login", (data, token, call) => {
        if (!valVar(data, "object"))
            return;
        if (!valVar(data.email, "string"))
            return;
        if (!valVar(token, "string"))
            return;
        if (token.length < 20)
            return;
        let wasNewUser = false;
        let user = connection_1.users.get(data.email);
        if (!user) { // create account
            if (!connection_1.users.has(data.email)) {
                let san = (0, connection_1.sanitizeEmail)(data.email);
                // try to read from file first
                let fdataStr;
                try {
                    fdataStr = fs_1.default.readFileSync("../users/" + san + ".json", { encoding: "utf8" });
                }
                catch (e) { }
                function newUser() {
                    user = new connection_1.User(data.name, data.email, data.picture, data._joinDate, data._lastLoggedIn, socket.id);
                    user.joinDate = new Date().toISOString();
                    user.saveToFile();
                    wasNewUser = true;
                    console.log(":: created new user: ", user.email);
                }
                if (!fdataStr) {
                    // create new user if couldn't find their file
                    newUser();
                }
                else {
                    let fdata = JSON.parse(fdataStr);
                    if (!fdata) {
                        console.log("# Err couldn't read user file! using provided data instead");
                        newUser();
                        return;
                    }
                    user = new connection_1.User(fdata.name, fdata.email, fdata.picture, fdata._joinDate, fdata._lastLoggedIn, socket.id);
                }
                connection_1.users.set(user.email, user);
            }
        }
        user.lastLoggedIn = new Date().toISOString();
        // login
        let _prevToken = user.getFirstToken();
        user.addToken(token);
        user.addSocketId(socket.id);
        // if(!wasNewUser) user.saveToFile(); // disabled for testing
        if (valVar(call, "function"))
            call(user.getTransferData());
        console.log(":: user logged in: ", user.email, ` (New session? ${user.getFirstToken() != _prevToken}) (SockIds: ${user.getSocketIds().join(", ")})`);
    });
    socket.on("disconnect", () => {
        let user = (0, connection_1.getUserBySock)(socket.id);
        if (!user)
            return;
        user.removeSocketId(socket.id);
    });
    socket.on("getUserLastLoggedIn", (token) => {
    });
});
connection_1.server.listen(3000, () => {
    console.log('listening on *:3000');
});
