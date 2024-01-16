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
        g_user = null;
    });
}
function _login(data, token) {
    console.log("...starting login");
    socket.emit("login", data, token, (data) => {
        console.log("Log in successful: ", data);
        if (g_user)
            if (g_user.email != data.email) {
                location.reload();
                return;
            }
        g_user = data;
        if (loginProm) {
            _loginRes();
            _loginRes = null;
            loginProm = null;
        }
    });
}
// header
let h_profile = document.querySelector(".h-profile");
h_profile.addEventListener("click", e => {
    new LogInMenu().load();
});
// lesson
class ULFile {
    constructor(name, val, path, enc) {
        this.name = name;
        this.val = val;
        this.path = path;
        this.enc = enc;
    }
    name;
    val;
    path;
    enc;
}
function uploadLessonFiles(lesson) {
    let list = [];
    for (const f of lesson.p.files) {
        list.push(new ULFile(f.name, f.editor.getValue(), "", "utf8"));
    }
    return new Promise(resolve => {
        socket.emit("uploadLessonFiles", "tmp_lesson", list, (err) => {
            if (err)
                console.log("ERR while uploading files:", err);
            resolve();
        });
    });
}
async function restoreLessonFiles(lesson) {
    let files = await new Promise(resolve => {
        socket.emit("restoreLessonFiles", "tmp_lesson", (files) => {
            if (!files) {
                console.log("ERR while restoring files");
                resolve([]);
                return;
            }
            resolve(files);
        });
    });
    for (const f of files) {
        lesson.p.createFile(f.name, f.val);
    }
}
// 
function uploadProjectFiles(project) {
    let list = [];
    for (const f of project.files) {
        list.push(new ULFile(f.name, f.editor.getValue(), "", "utf8"));
    }
    return new Promise(resolve => {
        socket.emit("uploadProjectFiles", project.pid || "tmp_project", list, (err) => {
            if (err)
                console.log("ERR while uploading files:", err);
            resolve();
        });
    });
}
async function restoreProjectFiles(project) {
    let files = await new Promise(resolve => {
        socket.emit("restoreProjectFiles", project.pid || "tmp_project", (files) => {
            if (!files) {
                console.log("ERR while restoring files");
                resolve([]);
                return;
            }
            resolve(files);
        });
    });
    for (const f of files) {
        project.createFile(f.name, f.val);
    }
}
//# sourceMappingURL=network.js.map