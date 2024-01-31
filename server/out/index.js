"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("./connection");
const s_challenges_1 = require("./s_challenges");
const readline_1 = require("readline");
const crypto_1 = __importDefault(require("crypto"));
function valVar(v, type) {
    if (v == null)
        return false;
    return (typeof v == type);
}
function valVar2(v, type, f) {
    if (typeof f != "function")
        return false;
    if (v == null) {
        f();
        return false;
    }
    return (typeof v == type);
}
connection_1.io.on("connection", socket => {
    socket.on("login", async (data, token, call) => {
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
                let fdataStr = null;
                try {
                    fdataStr = await (0, connection_1.read)("../users/" + san + ".json", "utf8");
                }
                catch (e) {
                    console.log("aaaaaaaa");
                }
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
                    user.challenges = (fdata.challenges || []).map(v => new connection_1.UserChallengeData(v.i, v.cid, v.pid));
                    user.saveToFile();
                }
                if (user)
                    connection_1.users.set(user.email, user);
            }
        }
        if (!user)
            return;
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
        if (!curFiles) {
            console.log("Err: failed to find project curFiles");
            return;
        }
        let files = [];
        for (const f of curFiles) {
            files.push(new connection_1.ULFile(f, await (0, connection_1.read)(path + "/" + f, "utf8"), "", "utf8"));
        }
        call(files);
    });
    // editor
    socket.on("uploadProjectFiles", async (pid, listData, call) => {
        if (!valVar(listData, "object"))
            return;
        if (!valVar(pid, "string"))
            return;
        if (!valVar(call, "function"))
            return;
        let user = (0, connection_1.getUserBySock)(socket.id);
        if (!user)
            return;
        let list = listData.map(v => connection_1.ULItem.from(v));
        let p = user.projects.find(v => v.pid == pid);
        if (!p) {
            console.log("Warn: project not found while uploading");
            return;
        }
        console.log("uploading...");
        let uid = user.sanitized_email;
        let path = "../project/" + uid + "/" + pid;
        if (!await (0, connection_1.access)(path))
            await (0, connection_1.mkdir)(path);
        let curFiles = await (0, connection_1.readdir)(path);
        if (!curFiles)
            return;
        // curFiles = curFiles.filter(v=>!list.some(w=>w.name == v));
        // for(const f of curFiles){
        //     console.log("...removing file:",path+"/"+f);
        //     await removeFile(path+"/"+f);
        // }
        // for(const f of list){
        //     console.log("...writing file:",path+"/"+f.name,f.enc);
        //     await write(path+"/"+f.name,f.val,f.enc);
        //     if(!p.files.find(v=>v.name == f.name)){
        //         p.files.push(f);
        //     }
        // }
        async function _write(l, pth, ffL) {
            let i = 0;
            for (const item of l) {
                let ff = null;
                if (ffL) {
                    ff = ffL[i];
                    if (!ff)
                        ffL.splice(i, 0, item);
                }
                if (item instanceof connection_1.ULFile) {
                    await (0, connection_1.write)(path + "/" + pth + "/" + item.name, item.val, item.enc);
                    if (ff) {
                        if (ff instanceof connection_1.ULFile) {
                            ff.name = item.name;
                            ff.val = item.val;
                        }
                        else
                            console.log("$ err: ff wasn't a file..?", ff.name, item.name);
                    }
                    else
                        console.log("$ err: no ff ref found");
                }
                else if (item instanceof connection_1.ULFolder) {
                    await (0, connection_1.mkdir)(path + "/" + pth + "/" + item.name);
                    await _write(item.items, pth + "/" + item.name, ff?.items);
                    if (ff)
                        if (ff instanceof connection_1.ULFolder) {
                            ff.name = item.name;
                        }
                }
                i++;
            }
        }
        await _write(list, "", p.items);
        if (p)
            for (const f of list) {
                // let ff = p.files.find(v=>v.name == f.name);
                // if(ff) ff.val = f.val;
                // else console.log("Err: null file in project files list");
            }
        else {
            console.log("Err: couldn't find project while uploading files: " + pid, "$ attempting to search");
            p = await (0, connection_1.attemptToGetProject)(user, pid);
            if (p)
                console.log("$ found");
            else
                console.log("$ still failed to find project");
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
        // let p = getProject2(user.email,pid);
        call(p?.serializeGet());
        return;
        // let uid = user.sanitized_email;
        // let path = "../project/"+uid+"/"+pid;
        // if(!await access(path)){
        //     // await mkdir(path);
        //     call(null);
        //     return;
        // }
        // let curFiles = await readdir(path);
        // let files:ULFile[] = [];
        // for(const f of curFiles){
        //     files.push(new ULFile(f,await read(path+"/"+f,"utf8"),"","utf8"));
        // }
        // call(files);
    });
    // User get stuff
    socket.on("user-getProjectList", (section, f) => {
        let user = (0, connection_1.getUserBySock)(socket.id);
        if (!user) {
            f(null);
            return;
        }
        let data;
        switch (section) {
            case ProjectGroup.personal:
                {
                    // data = user.projects.map(v=>v.serialize()?.serialize());
                    data = user.pMeta.map(v => v.serialize());
                }
                break;
        }
        f(data);
    });
    // Request stuff
    socket.on("getChallengeDetails", async (cid, f) => {
        if (!valVar2(cid, "string", f))
            return;
        // let c = challenges.get(cid);
        let data = await s_challenges_1.ChallengeData.fromCID(cid);
        f(data?.serializeGet());
    });
    socket.on("getChallenges", (perPage, pageI, filter, option, desc, f) => {
        let user = (0, connection_1.getUserBySock)(socket.id);
        if (!user)
            return;
        if (!option)
            option = "popularity";
        if (desc == null)
            desc = true;
        if (!valVar2(perPage, "number", f))
            return;
        if (!valVar2(pageI, "number", f))
            return;
        if (!valVar2(filter, "object", f))
            return;
        if (!valVar2(option, "string", f))
            return;
        if (!valVar2(desc, "boolean", f))
            return;
        let list = [];
        let clist = [];
        for (const [k, v] of s_challenges_1.challenges) {
            clist.push(v);
        }
        clist = clist.sort((a, b) => {
            switch (option) {
                case "popularity":
                    if (desc) {
                        return b.cnt - a.cnt;
                    }
                    return a.cnt - b.cnt;
                case "alphabetical":
                    if (desc) {
                        return a.name.localeCompare(b.name);
                    }
                    return b.name.localeCompare(a.name);
                default:
                    return 0;
            }
        });
        // my optimized method
        let i = 0;
        let skip = pageI * perPage;
        for (const v of clist) {
            if (filter.difficulty?.length) {
                if (!filter.difficulty.includes(v.difficulty))
                    continue;
            }
            // else continue; // comment this so if no boxes are checked to default to all checked
            let ongoing = v.ongoing;
            if (filter.ongoing?.length)
                if (!ongoing)
                    continue;
            // if(filter.ongoing?.length ? !ongoing : ongoing) continue;
            // if(filter.completed?.length) if(!v.isCompleted(user)) continue;
            if (i >= skip)
                list.push(v.serializeGet(user));
            if (list.length >= perPage)
                break;
            i++;
        }
        // partly chatgpt from Paul
        if (false) {
            let challengeList = [];
            for (const [k, v] of s_challenges_1.challenges) {
                list.push(v);
            }
            list = challengeList.filter(challenge => {
                Object.keys(filter).every(filterType => {
                    switch (filterType) {
                        case "difficulty":
                            return filter[filterType].includes(challenge.difficulty);
                        // case "ongoing":
                        // return challenge.ongoing === true;
                        // case "completed":
                        // return challenge.submitted === true;
                        default:
                            return true;
                    }
                });
            });
        }
        f(list);
    });
    socket.on("startChallenge", async (cid, f) => {
        if (!valVar2(cid, "string", f))
            return;
        console.log("starting challenge...", cid);
        let user = (0, connection_1.getUserBySock)(socket.id);
        if (!user)
            return;
        let p = await createChallengeProject(user, cid);
        if (typeof p == "number") {
            console.log("Err: failed starting challenge with error code: " + p);
            f(p);
            return;
        }
        f(p.pid);
        console.log(">> created challenge project");
    });
    socket.on("continueChallenge", async (cid, f) => {
        if (!valVar2(cid, "string", f))
            return;
        let user = (0, connection_1.getUserBySock)(socket.id);
        if (!user)
            return;
        let m = user.challenges.find(v => v.cid == cid);
        if (!m) {
            f(null);
            return;
        }
        f(m.pid);
    });
    // 
    socket.on("createProject", async (name, desc, f) => {
        if (!valVar2(name, "string", f))
            return;
        if (!valVar2(desc, "string", f))
            return;
        let user = (0, connection_1.getUserBySock)(socket.id);
        if (!user)
            return;
        let p = await createProject(user, name, desc, false);
        f(p.pid);
    });
});
function genPID() {
    return crypto_1.default.randomUUID();
}
async function createChallengeProject(user, cid) {
    let c = s_challenges_1.challenges.get(cid);
    if (!c)
        return 3; // couldn't find challenge
    let pid = genPID();
    if (user.challenges.some(v => v.cid == cid))
        return 1; // already exists
    let path = "../project/" + user.email + "/" + pid; //__c- prefix (THIS WILL BE INCLUDED ON CHALLENGES DATA EVENTUALLY)
    // if(await access(path)) return 1; // already exists
    let res = await (0, connection_1.mkdir)(path);
    if (!res)
        return 2; // failed to create
    user.challenges.push(new connection_1.UserChallengeData(0, cid, pid));
    await user.saveToFile();
    // setup/create project
    let p = new connection_1.Project(pid, c.name, user.email);
    connection_1.allProjects.set(pid, p);
    p.cid = cid;
    // let m = user.pMeta.find(v=>v.pid == pid);
    // if(m) m.cid = cid;
    // else console.log(">> Err: couldn't find meta when starting challenge");
    let m = new connection_1.ProjectMeta(user, pid, p.name, p.desc, p.isPublic);
    m.cid = p.cid;
    user.pMeta.push(m);
    user.saveToFile();
    return p;
}
async function createProject(user, name, desc, isPublic = false) {
    let pid = crypto_1.default.randomUUID();
    let meta = new connection_1.ProjectMeta(user, pid, name, desc, isPublic);
    let p = user.createProject(meta, pid);
    let path = "../project/" + user.email + "/" + p.pid;
    await (0, connection_1.mkdir)(path);
    return p;
}
var ProjectGroup;
(function (ProjectGroup) {
    ProjectGroup[ProjectGroup["personal"] = 0] = "personal";
    ProjectGroup[ProjectGroup["recent"] = 1] = "recent";
    ProjectGroup[ProjectGroup["saved"] = 2] = "saved";
    ProjectGroup[ProjectGroup["custom"] = 3] = "custom";
})(ProjectGroup || (ProjectGroup = {}));
connection_1.server.listen(3000, () => {
    console.log('listening on *:3000');
});
let rl = (0, readline_1.createInterface)(process.stdin, process.stdout);
rl.on("line", (line) => {
    line = line.trim();
    let s = line.split(" ");
    if (line == "challenges") {
        console.log(s_challenges_1.challenges);
        return;
    }
    else if (line == "stop") {
        process.exit();
    }
    else if (s[0] == "cdata") {
        let c = s_challenges_1.challenges.get(s[1]);
        console.log(c);
        return;
    }
    else if (s[0] == "users") {
        console.log(connection_1.users);
        return;
    }
    else if (s[0] == "udata") {
        let u = connection_1.users.get(s[1]);
        console.log(u);
        return;
    }
    else if (s[0] == "pitems") {
        let u = connection_1.users.get(s[1]);
        if (!u) {
            console.log("couldn't find user.");
            return;
        }
        let p = u.projects.find(v => v.pid == s[2]);
        if (!p) {
            console.log("couldn't find project.");
            return;
        }
        let cur = p.items;
        for (let i = 3; i < s.length; i++) {
            let res = cur[parseInt(s[i])];
            if (!res) {
                console.log("Cannot find.");
                return;
            }
            if (res instanceof connection_1.ULFile) {
                console.log("FILE: ", res);
                return;
            }
            cur = res.items;
        }
        console.log(cur);
        // pitems gyhar.ce@gmail.com e8bc2db5-9443-4c8d-a894-7d8a1deea591
        return;
    }
    else if (s[0] == "cls" || s[0] == "clear") {
        process.stdout.cursorTo(0, 0);
        process.stdout.clearScreenDown();
        return;
    }
    console.log("Unknown command: ", s[0]);
});
