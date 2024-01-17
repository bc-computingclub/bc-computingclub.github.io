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
                    user = new connection_1.User(data.name, data.email, data.picture, data._joinDate, data._lastLoggedIn, socket.id, []);
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
                    user = new connection_1.User(fdata.name, fdata.email, fdata.picture, fdata._joinDate, fdata._lastLoggedIn, socket.id, fdata.pMeta);
                    user.saveToFile();
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
    // lesson
    socket.on("uploadLessonFiles", async (lessonId, list, call) => {
        if (!valVar(list, "object"))
            return;
        if (!valVar(lessonId, "string"))
            return;
        if (!valVar(call, "function"))
            return;
        let user = (0, connection_1.getUserBySock)(socket.id);
        if (!user)
            return;
        // need to validate type integrity here
        console.log("uploading...");
        let uid = user.sanitized_email;
        let path = "../lesson/" + uid + "/" + lessonId;
        if (!await (0, connection_1.access)(path))
            await (0, connection_1.mkdir)(path);
        let curFiles = await (0, connection_1.readdir)(path);
        if (!curFiles)
            return;
        curFiles = curFiles.filter(v => !list.some(w => w.name == v));
        for (const f of curFiles) {
            console.log("...removing file:", path + "/" + f);
            await (0, connection_1.removeFile)(path + "/" + f);
        }
        for (const f of list) {
            console.log("...writing file:", path + "/" + f.name, f.enc);
            await (0, connection_1.write)(path + "/" + f.name, f.val, f.enc);
        }
        // todo - cache file values so if they're the same then they don't need to be reuploaded, or do this on the client maybe to speed it up
        console.log(":: done uploading");
        call();
    });
    socket.on("restoreLessonFiles", async (lessonId, call) => {
        if (!valVar(lessonId, "string"))
            return;
        if (!valVar(call, "function"))
            return;
        let user = (0, connection_1.getUserBySock)(socket.id);
        if (!user)
            return;
        console.log("restoring...");
        let uid = user.sanitized_email;
        let path = "../lesson/" + uid + "/" + lessonId;
        if (!await (0, connection_1.access)(path)) {
            await (0, connection_1.mkdir)(path);
            // call(null);
            // return;
        }
        let curFiles = await (0, connection_1.readdir)(path);
        let files = [];
        for (const f of curFiles) {
            files.push(new connection_1.ULFile(f, await (0, connection_1.read)(path + "/" + f, "utf8"), "", "utf8"));
        }
        call(files);
    });
    // editor
    socket.on("uploadProjectFiles", async (pid, list, call) => {
        if (!valVar(list, "object"))
            return;
        if (!valVar(pid, "string"))
            return;
        if (!valVar(call, "function"))
            return;
        let user = (0, connection_1.getUserBySock)(socket.id);
        if (!user)
            return;
        // need to validate type integrity here
        console.log("uploading...");
        let uid = user.sanitized_email;
        let path = "../project/" + uid + "/" + pid;
        if (!await (0, connection_1.access)(path))
            await (0, connection_1.mkdir)(path);
        let curFiles = await (0, connection_1.readdir)(path);
        if (!curFiles)
            return;
        curFiles = curFiles.filter(v => !list.some(w => w.name == v));
        for (const f of curFiles) {
            console.log("...removing file:", path + "/" + f);
            await (0, connection_1.removeFile)(path + "/" + f);
        }
        for (const f of list) {
            console.log("...writing file:", path + "/" + f.name, f.enc);
            await (0, connection_1.write)(path + "/" + f.name, f.val, f.enc);
        }
        let p = user.projects.find(v => v.pid == pid);
        for (const f of list) {
            let ff = p.files.find(v => v.name == f.name);
            ff.val = f.val;
        }
        // todo - cache file values so if they're the same then they don't need to be reuploaded, or do this on the client maybe to speed it up
        console.log(":: done uploading");
        call();
    });
    socket.on("restoreProjectFiles", async (pid, call) => {
        if (!valVar(pid, "string")) {
            console.log("Err: pid incorrect format");
            call(null);
            return;
        }
        if (!valVar(call, "function")) {
            console.log("Err: call incorrect format");
            call(null);
            return;
        }
        let user = (0, connection_1.getUserBySock)(socket.id);
        if (!user) {
            console.log("Err: could not find user");
            call(null);
            return;
        }
        console.log("restoring... from PID: ", pid);
        let p = await (0, connection_1.attemptToGetProject)(user, pid);
        call(p?.files);
        return;
        let uid = user.sanitized_email;
        let path = "../project/" + uid + "/" + pid;
        if (!await (0, connection_1.access)(path)) {
            // await mkdir(path);
            call(null);
            return;
        }
        let curFiles = await (0, connection_1.readdir)(path);
        let files = [];
        for (const f of curFiles) {
            files.push(new connection_1.ULFile(f, await (0, connection_1.read)(path + "/" + f, "utf8"), "", "utf8"));
        }
        call(files);
    });
});
connection_1.server.listen(3000, () => {
    console.log('listening on *:3000');
});
