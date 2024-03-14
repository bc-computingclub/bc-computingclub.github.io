// import type { Socket } from "socket.io-client";
// declare let socket:Socket;
// @ts-ignore
let socket = io(serverURL);
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
function reconnectUser() {
    _usedConfirmLeavePopup = true;
    socket.disconnect();
    socket.connect();
}
function _logout() {
    socket.emit("logout", (data) => {
        if (data != 0) {
            alert(`Error ${data} failed to logout`);
            return;
        }
        h_profile.classList.remove("logged-in");
        h_profile.innerHTML = `<span class="material-symbols-outlined">Person</span>`;
        localStorage.removeItem("logData");
        localStorage.removeItem("token");
        g_user = null;
        location.href = "/index.html";
        google.accounts.id.disableAutoSelect();
    });
}
let _usedConfirmLeavePopup = false;
function _login(data, token) {
    console.log("...starting login");
    socket.emit("login", data, token, (data) => {
        console.log("Log in successful: ", data);
        if (!_usedConfirmLeavePopup) {
            if (g_user || _hasAlertedNotLoggedIn) {
                location.reload();
                return;
            }
            if (g_user)
                if (g_user.email != data.email) {
                    location.reload();
                    return;
                }
        }
        _usedConfirmLeavePopup = false;
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
h_profile.addEventListener("mousedown", e => {
    let labels = [
        g_user ? "Switch Account" : "Log In",
        g_user ? "Log Out" : " --- ",
        "Switch Theme",
        "Reconnect to Server"
    ];
    openDropdown(h_profile, () => labels, async (i) => {
        let l = labels[i];
        // if(l == "Switch Account" || l == "Log In"){
        if (i == 0) {
            new LogInMenu().load();
        }
        // else if(l == "Log Out"){
        if (i == 1 && g_user) {
            _logout();
        }
        // else if(l == "Switch Theme"){
        if (i == 2) {
            setTheme(curTheme == "dark" ? "light" : "dark");
            return;
        }
        else if (i == 3) {
            socket.disconnect();
            await wait(500);
            socket.connect();
        }
        closeAllSubMenus();
    }, {
        openToLeft: true,
        getIcons() {
            return ["person", "logout", "light", "wifi"];
        },
        useHold: false // true doesn't quite work right yet
    });
});
// lesson
class ULItem {
    constructor(name) {
        this.name = name;
    }
    name;
}
class ULFolder extends ULItem {
    constructor(name, items = []) {
        super(name);
        this.items = items;
    }
    items;
}
class ULFile extends ULItem {
    constructor(name, val, path, enc) {
        super(name);
        this.val = val;
        this.path = path;
        this.enc = enc;
    }
    val;
    path;
    enc;
}
function uploadLessonFiles(lesson) {
    let list = [];
    for (const f of lesson.p.files) {
        list.push(new ULFile(f.name, f.editor.getValue(), "", "utf8"));
    }
    let prog = {
        eventI: lesson.progress.eventI,
        taskI: lesson.progress.taskI,
        prog: lesson.progress.prog
        // tutFiles:[]
    };
    // for(const f of lesson.tut.files){
    //     prog.tutFiles.push(new ULFile(f.name,f.editor.getValue(),"","utf8"));
    // }
    return new Promise(resolve => {
        console.log(".......uploading");
        socket.emit("uploadLessonFiles", lesson.lid, list, prog, (err) => {
            if (err)
                alert("ERR while uploading files: " + err);
            resolve();
        });
    });
}
async function restoreLessonFiles(lesson) {
    let data = await new Promise(resolve => {
        socket.emit("restoreLessonFiles", lesson.lid, (data) => {
            if (!data) {
                console.log("ERR while restoring files");
                resolve(null);
                return;
            }
            resolve(data);
        });
    });
    if (!data) {
        alert("Err: while trying to restore lesson files");
        return;
    }
    for (const f of data.files) {
        lesson.p.createFile(f.name, f.val);
    }
    // if(data.tutFiles) for(const f of data.tutFiles){
    //     lesson.tut.createFile(f.name,f.val);
    // }
    if (data.files.length)
        lesson.p.hasSavedOnce = true;
    console.log("LESSON META", data);
    lesson.progress.eventI = data.meta.eventI;
    lesson.progress.taskI = data.meta.taskI;
    return data;
}
// 
function old_uploadProjectFiles(project) {
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
function uploadProjectFiles(project) {
    let list = [];
    function sant(l) {
        let ll = [];
        for (const f of l) {
            if (f instanceof FFile)
                ll.push(new ULFile(f.name, (f.editor ? f.editor.getValue() : f.text), "", "utf8"));
            else if (f instanceof FFolder)
                ll.push(new ULFolder(f.name, sant(f.items)));
        }
        return ll;
    }
    list = sant(project.items);
    return new Promise(resolve => {
        socket.emit("uploadProjectFiles", project.meta.owner, project.pid || "tmp_project", list, (err) => {
            if (err)
                console.log("ERR while uploading files:", err);
            resolve();
        });
    });
}
/**@deprecated */
async function _restoreProjectFiles(project) {
    let files = await new Promise(resolve => {
        socket.emit("restoreProjectFiles", project.pid || "tmp_project", (files) => {
            if (!files) {
                console.log("ERR while restoring files");
                resolve([]);
                return;
            }
            console.log("FOUND FILES", files);
            resolve(files);
        });
    });
    for (const f of files) {
        project.createFile(f.name, f.val);
    }
    if (files.length)
        project.hasSavedOnce = true;
}
async function restoreProjectFiles(uid, pid) {
    let data = await new Promise(resolve => {
        socket.emit("restoreProjectFiles", uid, pid, (meta, err, canEdit) => {
            console.warn("CAN EDIT THIS PROJECT: ", canEdit);
            if (meta == null) {
                console.log("ERR while restoring files", "code", err);
                if (err == -2)
                    alert("You don't have permission to view this project");
                resolve(null);
                return;
            }
            console.log("FOUND META", meta);
            resolve({ meta, canEdit });
        });
    });
    if (!data)
        return { meta: null, canEdit: false };
    return data;
}
// Challenge
async function getServerChallenges() {
    let list = await new Promise(resolve => {
        socket.emit("getChallenges", 20, 0, selectedFilters, searchOption, searchDesc, (list) => {
            resolve(list);
        });
    });
    if (list)
        list = list.map(v => Challenge.from(v));
    return list || [];
}
async function getChallengeData(cid) {
    return await new Promise(resolve => {
        socket.emit("getChallengeDetails", cid, (data) => {
            resolve(data);
        });
    });
}
//# sourceMappingURL=network.js.map