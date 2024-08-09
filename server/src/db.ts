import { MongoClient, ServerApiVersion } from "mongodb";
import mongoose, { mongo, ObjectId } from "mongoose";
import { LessonMeta, ProjectMeta, _findLessonMeta, _findProject, genPID, projectCache, users } from "./connection";
import { challenges, getDifficultyId } from "./s_challenges";
import { write, read, readdir, access, mkdir, removeFolder, ULFile, ULFolder, ULItem } from "./s_util";

export enum ServerMode{
    dev,
    public,
    main
}
let _serverModes = ["dev","public","main"];
let _dbs = [
    "code-otter-dev",
    "code-otter-public",
    "code-otter-main"
];
export let serverMode = ServerMode.dev;

function processArgs(){
    let args = process.argv;
    for(let i = 0; i < args.length; i++){
        function next(){
            i++;
            return args[i];
        }
        let s = args[i];
        if(s.startsWith("-")){
            switch(s){
                case "-mode":
                    let mode = _serverModes.indexOf(next());
                    if(mode == -1){
                        console.log("$ error: invalid server mode, valid are: ",_serverModes.join(", "));
                    }
                    else serverMode = mode;
                    break;
            }
        }
    }
}
processArgs();
console.log("SERVER MODE: ",ServerMode[serverMode]);

const dbName = _dbs[serverMode];
const uri = "mongodb+srv://claebcode:2Z6WY3Nv3AgE0vke@code-otter-0.67qhyto.mongodb.net/"+dbName+"?retryWrites=true&w=majority&appName=code-otter-0";

// Mongo Init

export const client = new MongoClient(uri,{
    serverApi:{
        version:ServerApiVersion.v1,
        strict:true,
        deprecationErrors:true
    }
});

export async function initMongoDB(){
    try{
        await client.connect();
        await client.db("code-otter-main").command({ping:1});
        console.log("pinged!!!");
        await postInitMongoDB();
    }
    finally{
        await client.close();
        console.log("-- closed");
    }
}
export async function postInitMongoDB(){
    await mongoose.connect(uri);
}

// schemas

const Schema = mongoose.Schema;

type MFolder = {
    // fid:string,
    _id:string,
    name:string,
    uid:string,
    folder:mongoose.Types.ObjectId,

    // items:{
    //     id:string|mongoose.Types.ObjectId,
    //     kind:number
    // }[],
    itemCount:number
};
const FolderSchema = new Schema({
    // fid: String,
    name:{
        type: String,
        required: true
    },
    uid:{
        type: String,
        required: true
    },

    folder:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Folder"
    },
    file:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"File"
    },
    
    itemCount:{
        type: Number,
        default: 0
    },

    // items:[{
    //     id: mongoose.Schema.Types.ObjectId,
    //     kind: Number,
    //     _id: false
    // }]
});
FolderSchema.index({
    name:"text",
    desc:"text"
});

export class FolderInst{
    constructor(meta:any){
        this.meta = meta;
    }
    meta:MFolder;

    async save(){
        // @ts-ignore
        await this.meta.save();
    }

    /**
     * Add to folder's item count
     */
    // add(_id:mongoose.Types.ObjectId,kind:number){
    add(){
        this.meta.itemCount++;
        // addUniquePred(this.meta.items,{
        //     id:_id,kind
        // },item=>_id.equals(item.id));
        // this.meta.itemCount = this.meta.items.length;
    }
    /**
     * Remove from folder's item count
     */
    // remove(_id:mongoose.Types.ObjectId){
    remove(){
        this.meta.itemCount--;
        // removeFromListPred(this.meta.items,item=>_id.equals(item.id));
        // this.meta.itemCount = this.meta.items.length;
    }

    serialize(){
        return {
            fid:this.meta._id,
            name:this.meta.name,
            itemCount:this.meta.itemCount,
            folder:this.meta.folder
        };
    }

    // 

    async moveToFolder(fid:string){
        if(!this.meta.folder) return false; // can't move the root
        
        if(this.meta.folder == null ? (fid == null) : this.meta.folder.equals(fid)) return false; // trying to move it to the same folder
        
        // last folder
        let thisFolder = await getFolderInst(this.meta.uid,this.meta.folder);
        if(!thisFolder) return false;

        thisFolder.remove();
        await thisFolder.save();
        
        // new folder
        let folder = await getFolderInst(this.meta.uid,fid);
        if(!folder) return false;

        folder.add();
        await folder.save();

        // save
        this.meta.folder = new mongoose.Types.ObjectId(fid);
        await this.save();

        return true;
    }

    async deleteThis(uid:string,isFirst=true){ // uid is only here for permissions that may be added in the future
        let projectList = await ProjectModel.find({
            uid:this.meta.uid,
            folder:this.meta._id
        });
        if(!projectList) return false;
        
        let folderList = await FolderModel.find({
            uid:this.meta.uid,
            folder:this.meta._id
        });
        if(!folderList) return false;

        // 

        for(const project of projectList){
            let inst = new ProjectInst(project);
            await inst.deleteThis(uid);
        }
        for(const folder of folderList){
            let inst = new FolderInst(folder);
            await inst.deleteThis(uid,false);
        }

        // 

        if(isFirst && this.meta.folder){
            let parentFolder = await getFolderInst(uid,this.meta.folder);
            if(parentFolder){
                parentFolder.remove();
                await parentFolder.save();
            }
        }
        
        let res = await FolderModel.deleteOne({
            _id:this.meta._id,
            uid:this.meta.uid
        });
        return (res.deletedCount == 1);
    }
}

// FolderSchema.index({
//     fid:"asc"
// });

// async function genFID(){ // not really sure if this is needed
//     let len = 16;
//     let s = "";
//     let abc = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
//     for(let i = 0; i < len; i++){
//         s += abc[Math.floor(Math.random()*abc.length)];
//     }
//     if(await ) return genFID();
//     else return s;
// }

// type MFile = {
//     file:mongoose.Types.ObjectId,
//     uid:string,

//     name:string,
//     desc:string,
//     starred:boolean,
    
//     folder:mongoose.Types.ObjectId,
//     kind:number
// };
// const FileSchema = new Schema({
//     file:mongoose.Schema.Types.ObjectId,
//     uid: String,

//     name: String,
//     desc: String,
//     starred:{
//         type: Boolean,
//         default: false
//     },

//     folder:{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:"Folder"
//     },
//     kind:{
//         type: Number,
//         required: true
//     }
// });

type MUser = {
    _id:ObjectId;
    uid:string,
    name:string,
    email:string,
    picture:string,
    joinDate:Date,
    lastLoggedIn:Date,

    recentProjects:string[],
    // projects:string[],
    starredProjects:string[],

    inprogressChallenges:{
        cid:string,
        pid:string
    }[], // cid
    submittedChallenges:{
        cid:string,
        pid:string
    }[],
    completedChallenges:string[],

    // stats
    lessonsCompleted:number, // total number of unique lessons completed
    challengesCompleted:number,
    projectCount:number,

    settings:UserSettings;

    // 
    rootFolder:mongoose.Types.ObjectId,

    save:()=>Promise<void>
};
interface UserSettings{
    lessonStatsPublic:boolean;
    challengeStatsPublic:boolean;
    projectStatsPublic:boolean;
}
// type UserStatID = "lesson" | "challenge" | "project";
const UserSchema = new Schema({
    // _id: ObjectId,
    uid:{
        type: String,
        required: true,
        unique: true
    },
    name: String,
    email:{
        type: String,
        required: true,
        unique: true
    },
    picture: String,
    joinDate: Date,
    lastLoggedIn: Date,

    recentProjects: [String],
    projects: [String],
    starredProjects: [String],

    inprogressChallenges: [{
        cid: String,
        pid: String
    }], // cid
    submittedChallenges: [{
        cid: String,
        pid: String
    }],
    completedChallenges: [String],

    // stats
    lessonsCompleted:{
        type:Number,
        default:0
    },
    challengesCompleted:{
        type:Number,
        default:0
    },
    projectCount:{
        type:Number,
        default:0
    },
    settings:{
        type:{
            lessonStatsPublic:Boolean,
            challengeStatsPublic:Boolean,
            projectStatsPublic:Boolean
        },
        default:{
            lessonStatsPublic:false,
            challengeStatsPublic:false,
            projectStatsPublic:false
        }
    },

    rootFolder:{
        type:mongoose.Types.ObjectId,
        ref:"Folder"
    }

    // recentProjects:{
    //     type: [mongoose.Schema.Types.ObjectId],
    //     ref: "Project",
    //     // validate:{
    //     //     validator:(value:number)=>{

    //     //     }
    //     // }
    // },
    // projects:{
    //     type:[mongoose.Schema.Types.ObjectId],
    //     ref: "Project"
    // },
    // starredProjects:{
    //     type:[mongoose.Schema.Types.ObjectId],
    //     ref: "Project"
    // }
    // challenges:{
    //     type:[mongoose.Schema.Types.ObjectId],
    //     ref: "ChallengeIteration"
    // }
});
UserSchema.pre("save",function(next){
    this.challengesCompleted = this.completedChallenges.length; // future proofing just in case
    next();
});

type MProject = {
    _id:mongoose.Types.ObjectId,
    
    pid:string,
    uid:string,
    name:string,
    desc:string,

    public:boolean,
    starred:boolean,

    submitted:boolean,
    cid:string|undefined,

    // lid:string,

    dateCreated:Date,
    dateSubmitted:Date,
    dateLastSaved:Date,

    time:number,

    folder:mongoose.Types.ObjectId
};
const ProjectSchema = new Schema({
    pid:{
        type: String,
        required: true,
        unique: true
    },
    name: String,
    desc: String,
    uid: String, // owner
    
    public: Boolean,
    starred: Boolean, // do we need this?

    // challenges
    submitted: Boolean,
    cid: String,

    // lessons
    // lid: String,

    dateCreated: Date,
    dateSubmitted: Date,
    dateLastSaved: Date,
    
    time: Number,

    folder:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Folder"
    },
    // file:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:"File"
    // }
});
ProjectSchema.index({
    name:"text",
    desc:"text"
});

// const ChallengeIterationSchema = new Schema({
    
// });

type MLesson = {
    lid:string,
    uid:string,
    
    eventI:number,
    taskI:number,
    sceneI:number,
    final_order:string[],
    progress:number,
    mode:number,

    time:number,
    dateLastSaved?:Date,

    unlocked:boolean,
    dateUnlocked?:Date,

    started:boolean,
    dateStarted?:Date,

    hasFinished:boolean,

    times:number,

    save:()=>Promise<void>
};
const LessonProgressSchema = new Schema({
    lid: String, // corresponding lesson
    uid: String, // user who owns this progress data
    
    eventI:{
        type:Number,
        default:-1
    },
    taskI:{
        type:Number,
        default:-1
    },
    sceneI:{
        type:Number,
        default:0,
    },
    final_order:{
        type:[String],
        default:[]
    },
    progress:{
        type:Number,
        default:0
    },
    mode:{
        type:Number,
        default:0
    },

    time:{
        type:Number,
        default:0
    },
    dateLastSaved: Date,

    unlocked:{
        type:Boolean,
        default:false
    },
    dateUnlocked: Date,

    started:{
        type:Boolean,
        default:false
    },
    dateStarted: Date,

    hasFinished:{
        type:Boolean,
        default:false
    }, // has finished once

    // do we need a field for new?

    times:{
        type:Number,
        default:0
    }
});
export class LessonMetaInst{
    constructor(meta:any){
        this.meta = meta;
    }
    meta:MLesson;

    serialize(){
        return {
            eventI:this.meta.eventI,
            taskI:this.meta.taskI,
            prog:this.meta.progress,
            mode:this.meta.mode,
            wu:this.meta.dateUnlocked?.toISOString(),
            s:this.meta.started,
            n:false, // should we depricate new?
            u:this.meta.unlocked,
            times:this.meta.times,
            ws:this.meta.dateStarted?.toISOString(),
            hf:this.meta.hasFinished,
            _hp:0,
            wls:this.meta.dateLastSaved?.toISOString(),
            time:this.meta.time,
            sceneI:this.meta.sceneI,
            final_order:this.meta.final_order
        };
    }

    updateWhenLastSaved(){
        if(!this.meta.dateLastSaved){
            this.meta.time = 0;
            this.meta.dateLastSaved = new Date();
            return;
        }
        let last = this.meta.dateLastSaved;
        this.meta.dateLastSaved = new Date();
        let dif = this.meta.dateLastSaved.getTime()-last.getTime();
        dif = Math.min(dif,900000); // 15 min
        this.meta.time += dif;
    }

    async save(){
        await this.meta.save();
    }

    getPath(){
        return "../lesson/"+this.meta.uid+"/"+this.meta.lid;
    }
    async createPath(){
        let path = this.getPath();
        if(!await access(path)) await mkdir(path);
        return path;
    }
    async getFileItems(){
        let list:ULItem[] = [];
        async function search(folder:ULItem[],path:string){
            let names = await readdir(path);
            if(!names) return;
            for(const name of names){
                if(!name.includes(".")){
                    let subFolder = new ULFolder(name,[]);
                    folder.push(subFolder);
                    await search(subFolder.items,path+name+"/");
                }
                else{
                    let buf = await read(path+name+"/") as Buffer;
                    folder.push(ULFile.make2(name,buf));
                }
            }
        }
        await search(list,this.getPath()+"/");
        return list;
    }
}

export enum ChallengeDifficulty{
    easy,
    medium,
    hard,
    code_wizard
}
type MChallenge = {
    cid:string,
    name:string,
    desc:string,
    imgUrl:string,
    difficulty:ChallengeDifficulty,

    startDate?:Date,
    endDate?:Date,
    
    submissions:mongoose.Types.ObjectId[],
    submission_count:number,

    save:()=>Promise<void>
};
const ChallengeSchema = new Schema({
    cid: String,
    name: String,
    desc: String,
    imgUrl: String,
    difficulty: Number,

    startDate: Date,
    endDate: Date,

    submissions: [{
        type:mongoose.Types.ObjectId,
        ref:"Challenge_Submission"
    }],
    submission_count:{
        type: Number,
        default: 0
    }
});
ChallengeSchema.index({
    name:"text",
    desc:"text"
});

ChallengeSchema.pre("save",function(next){
    this.submission_count = this.submissions.length;
    next();
});

export class ChallengeInst{
    constructor(meta:any){
        this.meta = meta;
    }
    meta:MChallenge;

    async save(){
        await this.meta.save();
    }

    async serialize(user:UserSessionItem,mode=0){ // mode: 0 is just hl, 1 is both, 2 is just sub
        let hl:ChallengeSubmissionInst[] = [];
        let sub:ChallengeSubmissionInst[] = [];

        if(mode <= 1){
            for(const id of this.meta.submissions.slice(0,2)){
                let inst = await findChallengeSubmission(id);
                if(!inst) continue;
                hl.push(inst);
            }
        }
        if(mode >= 1){
            for(const id of this.meta.submissions){
                let inst = await findChallengeSubmission(id);
                if(!inst) continue;
                sub.push(inst);
            }
        }
        
        return {
            id:this.meta.cid,
            name:this.meta.name,
            desc:this.meta.desc,
            imgUrl:this.meta.imgUrl,
            difficulty:ChallengeDifficulty[this.meta.difficulty],
            timespan:null,
            ongoing:true, // temp for now
            hl:hl?.map(v=>v.serialize()),sub:sub?.map(v=>v.serialize()),
            submission_count:this.meta.submissions.length,

            completed:(user ? this.isCompleted(user) : false), // temp
            inProgress:(user ? this.isInProgress(user) : false)
        };
    }

    isCompleted(user:UserSessionItem){
        return user.meta.completedChallenges.includes(this.meta.cid);
        // let res = await ProjectModel.exists({
        //     uid:user.uid,
        //     cid:this.meta.cid,
        //     submitted:true
        // });
        // return res != null;
    }
    isInProgress(user:UserSessionItem){
        return user.meta.inprogressChallenges.some(v=>v.cid == this.meta.cid);
        // let res = await ProjectModel.exists({
        //     uid:user.uid,
        //     cid:this.meta.cid,
        //     submitted:false
        // });
        // return res != null;
    }
    isOngoing(){
        return true; // not implemented yet
    }

    async submitProject(user:UserSessionItem,p:ProjectInst){
        let pid = p.meta.pid;
        
        let exists = await ChallengeSubmissionModel.exists({
            _id:{
                $in:this.meta.submissions
            },
            uid:user.uid,
            pid
        }) != null;
        if(exists) return -5;

        let items = await p.getFileItems();
        if(items.length == 0){
            return -6; // you can't submit a project with nothing in it xD
        }

        // 
        
        p.meta.submitted = true;
        p.meta.public = true;
        p.meta.dateSubmitted = new Date();
        p.meta.cid = this.meta.cid; // override this just in case you tried to submit a regular project as a challenge project, it should just work instead of do nothing :)

        // 

        function calcSubmissionLang(){
            if(!p) return [];
            let lang:string[] = [];
            let allowed = ["html","css","js"];
            function search(list:ULItem[]){
                for(const item of list){
                    if(item instanceof ULFolder){
                        search(item.items);
                        continue;
                    }
                    let ind = item.name.lastIndexOf(".");
                    if(ind == -1) continue;
                    let ext = item.name.substring(ind+1);
                    if(allowed.includes(ext)) lang.push(ext);
                }
            }
            if(items) search(items);
            return lang;
        }
        let allowed = ["html","css","js"];

        let decoder = new TextDecoder();

        function calcSubmissionCharCount(){
            if(!p) return 0;
            let amt = 0;
            function search(list:ULItem[]){
                for(const item of list){
                    if(item instanceof ULFolder){
                        search(item.items);
                        continue;
                    }
                    let it = item as ULFile;
                    let ind = item.name.lastIndexOf(".");
                    if(ind == -1) continue;
                    let ext = item.name.substring(ind+1);
                    if(allowed.includes(ext)){
                        let val = decoder.decode(it.buf);
                        let after = val.replace(/\s/g,"");
                        amt += after.length;
                    }
                }
            }
            if(items) search(items);
            return amt;
        }
        function calcLineCount(){
            if(!p) return 0;
            let amt = 0;
            function search(list:ULItem[]){
                for(const item of list){
                    if(item instanceof ULFolder){
                        search(item.items);
                        continue;
                    }
                    let it = item as ULFile;
                    let ind = item.name.lastIndexOf(".");
                    if(ind == -1) continue;
                    let ext = item.name.substring(ind+1);
                    if(allowed.includes(ext)){
                        let val = decoder.decode(it.buf); // TODO - might be able to optimize this? it may call decode twice per file but maybe it doesn't really matter
                        val = val.replace(/\r/g,"");
                        let lines = val.split("\n");
                        for(const l of lines){
                            if(l.length > 0) amt++;
                        }
                    }
                }
            }
            if(items) search(items);
            return amt;
        }
        
        let data = new ChallengeSubmissionModel({
            uid:user.uid,
            pid,cid:this.meta.cid,
            name:user.meta.name,
            
            dateSubmitted:p.meta.dateSubmitted,

            characterCount:calcSubmissionCharCount(),
            lineCount:calcLineCount(),
            lang:calcSubmissionLang(),
            time:p.meta.time
        });

        this.meta.submissions.push(data._id);
        
        user.meta.submittedChallenges.push({
            cid:this.meta.cid,
            pid
        });
        addUnique(user.meta.completedChallenges,this.meta.cid);
        removeFromListPred(user.meta.inprogressChallenges,item=>item.pid == pid);
        
        // save
        await p.save();
        await data.save();
        await this.save();
        await user.save();

        return 0;
    }

    async unsubmitProject(user:UserSessionItem,p:ProjectInst){
        let pid = p.meta.pid;
        
        let subData = await ChallengeSubmissionModel.findOne({
            _id:{
                $in:this.meta.submissions
            },
            uid:user.uid,
            pid
        });
        if(!subData) return -5;

        removeFromListPred(this.meta.submissions,item=>item.equals(subData?._id)); // not sure why I need the ?, vscode thinks it's good but tsc no

        p.meta.submitted = false;
        p.meta.public = false;
        removeFromListPred(user.meta.submittedChallenges,item=>item.pid == pid);
        user.meta.inprogressChallenges.push({cid:this.meta.cid,pid});

        await ChallengeSubmissionModel.deleteOne({
            _id:subData._id
        });

        // save

        await p.save();
        await this.save();
        await user.save();

        return 0;
    }
}

type MChallengeSubmission = {
    name:string,
    uid:string,
    pid:string,
    cid:string,

    characterCount:number,
    lineCount:number,
    lang:string[],

    time:number,
    dateSubmitted:Date,

    save:()=>Promise<void>
};
const ChallengeSubmissionSchema = new Schema({
    name: String,
    uid: String,
    pid: String,
    cid: String,

    characterCount: Number,
    lineCount: Number,
    lang: [String],

    time:{
        type: Number,
        default: 0
    },
    dateSubmitted: Date
});
export class ChallengeSubmissionInst{
    constructor(meta:any){
        this.meta = meta;
    }
    meta:MChallengeSubmission;

    async save(){
        await this.meta.save();
    }

    serialize(){
        return {
            who:this.meta.name,
            uid:this.meta.uid,
            pid:this.meta.pid,
            cid:this.meta.cid,
            cc:this.meta.characterCount,
            lc:this.meta.lineCount,
            lang:this.meta.lang,
            ws:this.meta.dateSubmitted?.toISOString(),
            t:this.meta.time
        };
    }
}

// models

export const UserModel = mongoose.model("User",UserSchema);
export const ProjectModel = mongoose.model("Project",ProjectSchema);
export const LessonProgressModel = mongoose.model("Lesson_Prog",LessonProgressSchema);
export const ChallengeModel = mongoose.model("Challenge",ChallengeSchema);
export const ChallengeSubmissionModel = mongoose.model("Challenge_Submission",ChallengeSubmissionSchema);
// export const FolderItemModel = mongoose.model("Folder_Item",FolderItemSchema);
// export const FileModel = mongoose.model("File",FileSchema);
export const FolderModel = mongoose.model("Folder",FolderSchema);

// export const userSessions = new Map<string,{token:string,user:typeof UserModel}>();
export class UserSessionItem{
    constructor(token:string,data:any){
        this.token = token;
        this.meta = data;
    }
    token:string;
    meta:MUser;

    isNotMainCache = false;
    _dirty = false;
    makeDirty(){
        this._dirty = true;
    }

    // 

    project:ProjectInst|undefined;
    lessonMeta:LessonMetaInst|undefined;
    
    // 

    async getProject(pid:string,uid?:string){
        if(uid == null) uid = this.meta.uid;
        if(this.project){
            if(this.project.meta.uid == uid && this.project.meta.pid == pid) return this.project;
        }
        let inst = await _findProject(uid,pid);
        this.project = inst;
        if(inst) inst.session = this;
        return inst;
    }
    async getProjectOrLesson(pid?:string,lid?:string){
        if(lid != null) return await this.getLessonMeta(lid);
        else if(pid != null) return await this.getProject(pid);
    }
    async getUnfinishedChallengeProject(cid:string){
        let data = await ProjectModel.findOne({
            uid:this.uid,
            cid,
            submitted:{
                $eq:false
            }
        });
        if(!data) return;
        return new ProjectInst(data);
    }

    async getLessonMeta(lid:string,nostore=false,nonew=true){
        if(!nostore) if(this.lessonMeta){
            if(this.lessonMeta.meta.lid == lid) return this.lessonMeta;
        }
        let inst = await _findLessonMeta(this.meta.uid,lid);
        if(!nonew) if(!inst){ // create some
            let data = new LessonProgressModel({
                lid,uid:this.uid
            });
            await data.save();
            inst = new LessonMetaInst(data);
        }
        if(!nostore) this.lessonMeta = inst;
        return inst;
    }
    async hasStartedLesson(lid:string){
        let res = await LessonProgressModel.exists({
            lid,uid:this.uid
        });
        return (res != null);
    }

    get uid(){
        return this.meta.uid;
    }
    get email(){
        return this.meta.email;
    }

    // 

    /**
     * Saves changes from the local copy to the database.
     */
    async save(){
        await this.meta.save();

        if(this.isNotMainCache){
            // this.makeDirty();
            
            // TODO - REALLY NEED TO FIX AND INDEX THIS BC THIS IS VERY SLOW RIGHT NOW - well when scaling
            for(const [sid,session] of userSessions){
                if(session.uid != this.uid) continue;
                
                session.meta = this.meta; // this is the "de-stale" the cache hahaha
            }
        }
    }
    
    /**
     * Adds the following pid to the list of recent projects.
     */
    addToRecents(pid:string){
        if(!this.meta.recentProjects.includes(pid)) this.meta.recentProjects.push(pid);
    }
    /**
     * Removes the following pid from the list of recent projects.
     */
    removeFromRecents(pid:string){
        removeFromList(this.meta.recentProjects,pid);
    }

    /**
     * Adds the following pid to the list of starred projects.
     */
    addToStarred(pid:string){
        if(!this.meta.starredProjects.includes(pid)) this.meta.starredProjects.push(pid);
    }
    /**
     * Removes the following pid from the list of starred projects.
     */
    removeFromStarred(pid:string){
        removeFromList(this.meta.starredProjects,pid);
    }

    async _createProjectBase(data:any,fid?:string){
        let pid = genPID();

        // defaults
        if(data.public == null) data.public = false;

        let folder = await this.getFolder(fid);

        // let file = new FileModel({
        //     uid:this.uid,
        //     folder:folder?.meta._id,
        //     kind:1, // project
        // });
        
        let p = new ProjectModel({
            pid,
            uid:this.uid,
            
            ...data,
            
            starred:false,

            submitted:false,

            dateCreated:new Date(),
            dateLastSaved:new Date(),

            time:0,

            folder:folder?.meta._id,
            // file:file._id
        });

        // this.addToRecents(pid); // this might already happen not sure, disabled for now

        // file.file = p._id;

        // await file.save();

        // post
        // this.meta.projects.push(pid);
        this.meta.projectCount++;
        if(folder){
            // folder.add(p._id,1); // 0 for folder, 1 for project
            folder.add();
            await folder.save();
        }

        return p;
    }

    async createProject(data:{
        name:string,desc:string,
        public?:boolean,
        fid?:string
    }){
        let p = await this._createProjectBase(data,data.fid);
        let inst = new ProjectInst(p);

        // create path
        let path = await inst.createPath();
        await write(path+"/index.html","","utf8");
        
        // finish/flush
        await p.save();
        await this.meta.save();

        return inst;
    }
    async createChallengeProject(cid:string){
        let challenge = await findChallenge(cid);
        if(!challenge) return;

        let iteration = await ProjectModel.countDocuments({
            cid:challenge.meta.cid,
            uid:this.uid
        }); // not implemented for mongo yet

        let p = await this._createProjectBase({
            cid,
            name:challenge.meta.name+(iteration != 0 ? " "+(iteration+1) : ""),
            desc:`An attempt at the ${challenge.meta.name} challenge.`
        });
        let inst = new ProjectInst(p);

        this.meta.inprogressChallenges.push({
            cid,pid:p.pid
        });

        // create path
        let path = await inst.createPath();
        await write(path+"/index.html","","utf8");

        // finish/flush
        await p.save();
        await this.meta.save();

        return inst;
    }


    // old/depricated
    addToken(token:string){}
    hasToken(token:string){}
    deleteTokens(){}
    getFirstToken(){return ""}

    sockId:string = "";
    // private sockIds:string[] = [];
    // getSocketIds(){
    //     return this.sockIds;
    // }
    // addSocketId(sockId:string){
    //     if(this.sockIds.includes(sockId)) return;
    //     this.sockIds.push(sockId);
    //     // socks.set(sockId,this.uid);
    // }
    // removeSocketId(sockId:string){
    //     removeFromList(this.sockIds,sockId);
    // }
    // deleteSocketIds(){
    //     let list = [...this.sockIds];
    //     for(const id of list){
    //         this.removeSocketId(id);
    //     }
    // }

    // Stat Functions
    async getLessonStats(){
        let val = await LessonProgressModel.aggregate([
            {
                $match:{
                    uid:this.uid
                }
            },
            {
                $group:{
                    _id:"$uid",
                    totalLessonTime:{
                        $sum:"$time"
                    },
                    // averageTime:{
                    //     $avg:"$time"
                    // }
                }
            }
        ]);
        let v = val[0];
        delete v._id;
        
        v.averageLessonTime = v.totalLessonTime/this.meta.lessonsCompleted; // calc this so it's a little faster hopefully :D
        return v as {
            totalLessonTime:number,
            averageLessonTime:number
        };
    }
    async getProjectStats(){
        let val = await ProjectModel.aggregate([
            {
                $match:{
                    uid:this.uid
                }
            },
            {
                $group:{
                    _id:"$uid",
                    totalProjectTime:{
                        $sum:"$time"
                    },
                    oldestProjectStarted:{
                        $min:"$dateCreated"
                    }
                }
            }
        ]);
        let v = val[0];
        delete v._id;

        // v.averageProjectTime = v.totalProjectTime/this.meta.projects.length;
        v.averageProjectTime = v.totalProjectTime/this.meta.projectCount;
        return v as {
            totalProjectTime:number,
            averageProjectTime:number
        };
    }

    getSettings(){
        let s = this.meta.settings ?? {};
        return {
            lessonStatsPublic:s.lessonStatsPublic ?? false,
            challengeStatsPublic:s.challengeStatsPublic ?? false,
            projectStatsPublic:s.projectStatsPublic ?? false,
        } as UserSettings;
    }

    // 
    
    async getFolder(_id:string|mongoose.Types.ObjectId|undefined){
        if(_id == null) return;
        let data = await FolderModel.findById(_id);
        if(!data) return;

        if(data.uid != this.uid) return; // found but you didn't own the folder xD

        return new FolderInst(data);
    }
    async createFolder(name:string,parentId?:string|FolderInst){
        let parent = (parentId ? (typeof parentId == "string" ? await this.getFolder(parentId) : parentId) : undefined);
        
        let data = new FolderModel({
            name,uid:this.uid,
            folder:parent?.meta._id
        });
        await data.save();

        if(parent){
            // parent.add(data._id,0);
            parent.add();
            await parent.save();
        }

        return new FolderInst(data);
    }
    // async folderExists(_id:string){ // probably don't want this bc it doesn't do ownership check
    //     let res = await FolderModel.exists({
    //         _id
    //     });
    //     return res != null;
    // }
}

export class ProjectInst{
    constructor(meta:any){
        this.meta = meta;
    }
    meta:MProject;
    session:UserSessionItem|undefined;

    async save(){
        // @ts-ignore
        await this.meta.save();

        let cacheItem = projectCache.get(this.meta.pid);
        if(cacheItem){
            cacheItem.makeDirty();
        }
    }
    
    getPath(){
        return "../project/"+this.meta.uid+"/"+this.meta.pid;
    }
    async createPath(){
        let path = this.getPath();
        if(!await access(path)) await mkdir(path);
        return path;
    }

    hasPermissionToView(uid:string){
        if(!this.meta.public){
            if(uid != this.meta.uid){ // for now
                return false;
            }
        }

        return true;
    }
    canEdit(uid:string){
        if(!this.hasPermissionToView(uid)) return false;

        let canEdit = true;
        if(this.meta.submitted) canEdit = false;

        // for now
        if(!this.isOwner(uid)) canEdit = false;

        return canEdit;
    }
    isOwner(uid:string){
        return this.meta.uid == uid;
    }
    serialize(uid:string){ // who's getting it
        let items:any[] = [];
        return {
            pid:this.meta.pid,
            name:this.meta.name,
            owner:this.meta.uid,
            desc:this.meta.desc,

            isPublic:this.meta.public,
            items,
            
            cid:this.meta.cid,
            submitted:this.meta.submitted,
            sub:this.meta.submitted, // why two????
            // starred:this.session?this.session.meta.starredProjects.includes(this.meta.pid):false,
            starred:this.meta.starred,

            canEdit:this.canEdit(uid),
            isOwner:true,

            folder:this.meta.folder, // folder that this project is in

            meta:{
                pid:this.meta.pid,
                name:this.meta.name,
                desc:this.meta.desc,
                isPublic:this.meta.public,
                cid:this.meta.cid,
                sub:this.meta.submitted,

                starred:this.meta.starred, //

                wc:this.meta.dateCreated,
                time:this.meta.time,
                ws:this.meta.dateSubmitted,
                wls:this.meta.dateLastSaved,
                owner:this.meta.uid,

                canEdit:this.canEdit(uid), // seems weird??
                isOwner:true // hmm ^^^
            }
        };
    }

    updateWhenLastSaved(){
        if(!this.meta.dateLastSaved){
            this.meta.time = 0;
            this.meta.dateLastSaved = new Date();
            return;
        }
        let last = this.meta.dateLastSaved;
        this.meta.dateLastSaved = new Date();
        let dif = this.meta.dateLastSaved.getTime()-last.getTime();
        dif = Math.min(dif,900000); // 15 min
        this.meta.time += dif;
    }

    async deleteThis(uid:string){
        if(this.meta.uid != uid) return 1; // you can only delete a project if you own it, even if you have edit access (for now)
        
        let ownerSession = await findUser(uid);
        if(!ownerSession){
            console.warn("% err: couldn't find owner while trying to delete project");
            return 2;
        }
        
        let owner = ownerSession.meta;
        let pid = this.meta.pid;

        let folder = await ownerSession.getFolder(this.meta.folder);
        if(folder){
            // folder.remove(this.meta._id);
            folder.remove();
            await folder.save();
        }
        
        // removeFromList(owner.projects,pid);
        removeFromList(owner.recentProjects,pid);
        removeFromList(owner.starredProjects,pid);

        // clear from challenges
        removeFromListPred(owner.inprogressChallenges,item=>item.pid == pid);
        removeFromListPred(owner.submittedChallenges,item=>item.pid == pid);
        // remove from submissions of challenge...
        if(this.meta.cid){
            let res = await ChallengeSubmissionModel.findOne({
                uid,
                pid,
                cid:this.meta.cid
            });
            if(res){
                let c = await findChallenge(this.meta.cid);
                if(c){
                    removeFromListPred(c.meta.submissions,item=>item.equals(res?._id));
                    await c.save();
                }
                await ChallengeSubmissionModel.deleteOne({_id:res._id});
            }
        }
        
        // save
        // await owner.save();
        await ownerSession.save();

        // finish deletion
        await ProjectModel.deleteOne({
            pid:this.meta.pid
        });

        await removeFolder(this.getPath(),true);

        if(this.session){
            if(this.session.project?.meta.pid == this.meta.pid) this.session.project = undefined;
        }

        return 0;
    }

    isChallengeProject(){
        return this.meta.cid != null;
    }

    async unlinkFromChallenge(user:UserSessionItem){
        if(this.meta.cid == null){ // project wasn't even a challenge project
            return -5;
        }
        if(this.meta.submitted){
            return -6; // can't unlink if it's submitted
        }
        // 
        
        let challenge = await findChallenge(this.meta.cid);
        if(!challenge){
            return -7; // couldn't find challenge
        }

        removeFromListPred(user.meta.inprogressChallenges,item=>item.pid == this.meta.pid);

        this.meta.cid = undefined;

        // save
        await user.save();
        await this.save();

        return 0;
    }

    async getFileItems(){
        let list:ULItem[] = [];
        async function search(folder:ULItem[],path:string){
            let names = await readdir(path);
            if(!names) return;
            for(const name of names){
                if(!name.includes(".")){
                    let subFolder = new ULFolder(name,[]);
                    folder.push(subFolder);
                    await search(subFolder.items,path+name+"/");
                }
                else{
                    // let file = await read(path+name+"/","utf8",true);
                    // folder.push(new ULFile(name,file,"","utf8"));
                    // let b = await read(path+name+"/","utf8") as string;
                    let buf = await read(path+name+"/") as Buffer;

                    // await write(path+name,buf); // only for testing
                    
                    // let enc = getEncodingType2(buf);
                    // let fEnc = enc == "ASCII-7-bit" ? "utf8" : "binary";
                    // console.log("ENCODE TYPE 2:",fEnc);

                    // await write(path+name+"/",buf,fEnc); // works directly with Buffer

                    // let b2 = Buffer.from(await new Blob([buf]).arrayBuffer()); // works with blob converted
                    // await write(path+name+"/",b2,fEnc);
                    
                    // console.log("PATH:",path+name);
                    // let type = await getMimeType(path+name);
                    // console.log("TYPE:",type);
                    folder.push(ULFile.make2(name,buf));
                }
            }
        }
        await search(list,this.getPath()+"/");
        return list;
    }

    async moveToFolder(fid:string){
        if(!this.meta.folder) return false; // can't move the root
        
        if(this.meta.folder == null ? (fid == null) : this.meta.folder.equals(fid)) return false; // trying to move it to the same folder
        
        // last folder
        let thisFolder = await getFolderInst(this.meta.uid,this.meta.folder);
        if(!thisFolder) return false;

        thisFolder.remove();
        await thisFolder.save();
        
        // new folder
        let folder = await getFolderInst(this.meta.uid,fid);
        if(!folder) return false;

        folder.add();
        await folder.save();

        // save
        this.meta.folder = new mongoose.Types.ObjectId(fid);
        await this.save();

        return true;
    }
}

/**
 * Get's a folder instance when you don't have the user instance. But UserInst.getFolder() should be used instead of this when possible for future proofing.
 * @param uid owner
 * @param _id fid
 */
export async function getFolderInst(uid:string,_id:string|mongoose.Types.ObjectId|undefined){
    if(_id == null) return;
    let data = await FolderModel.findById(_id);
    if(!data) return;

    if(data.uid != uid) return; // found but you didn't own the folder xD

    return new FolderInst(data);
}

export function removeFromList(list:any[],item:any){
    let ind = list.indexOf(item);
    if(ind != -1) list.splice(ind,1);
}
export function removeFromListPred<T>(list:T[],pred:(item:T)=>boolean){
    let ind = list.findIndex(v=>pred(v));
    if(ind != -1) list.splice(ind,1);
}
export function addUnique(list:any[],item:any){
    if(!list.includes(item)) list.push(item);
}
export function addUniquePred<T>(list:T[],item:T,pred:(item:T)=>boolean){
    if(!list.some(v=>pred(v))) list.push(item);
}

export const userSessions = new Map<string,UserSessionItem>();

export const challengeCache = new Map<string,ChallengeInst>();
export async function findChallenge(cid:string){
    let inst = challengeCache.get(cid);
    if(!inst){
        let data = await ChallengeModel.findOne({
            cid
        });
        if(!data) return;
        inst = new ChallengeInst(data);
        challengeCache.set(cid,inst);
    }
    return inst;
}
export async function findChallengeSubmission(id:any){
    let data = await ChallengeSubmissionModel.findOne({
        _id:id
    });
    if(!data) return;
    return new ChallengeSubmissionInst(data);
}

export async function findUser(uid:string){
    // let inst = users.get(uid);
    // if(inst?._dirty ? false : true) if(inst) return inst;
    // if(inst) inst._dirty = false;
    
    let res = await UserModel.findOne({
        uid
    });
    if(!res) return;
    let session = new UserSessionItem("",res);
    session.isNotMainCache = true;
    return session;
}

async function testModel(){
    let test2 = new UserModel({
        // _id:new mongoose.Types.ObjectId(),
        name:"Bobert",
        joinDate:new Date()
    });
    test2.email = "bob@bob.com";
    console.log("...saving...");
    await test2.save();
    console.log("...SAVED...");
}
// testModel();

// 

export async function uploadChallenges(){
    for(const [cid,challenge] of challenges){
        let data = await ChallengeModel.findOne({
            cid
        });
        let difficulty = getDifficultyId(challenge.difficulty);
        if(!data) data = new ChallengeModel({
            cid,
            name:challenge.name,
            desc:challenge.desc,
            imgUrl:challenge.imgUrl,
            difficulty
        });
        else{
            data.name = challenge.name;
            data.desc = challenge.desc;
            data.imgUrl = challenge.imgUrl;
            data.difficulty = difficulty;
        }
        await data.save();
    }
    console.log("$ finished updating challenges");
}
export async function uploadUsers(){
    let uids = await readdir("../users");
    if(!uids) return;
    let allProjs = new Map<string,ProjectInst[]>;
    for(const uid1 of uids){
        if(!uid1.endsWith(".json")) continue;
        let uid = uid1.replace(".json","");

        let str = await read("../users/"+uid1);
        if(!str) continue;
        let data = JSON.parse(str);
        if(!data) continue;

        let pMeta = data.pMeta;
        if(typeof pMeta[0] == "string") pMeta = pMeta.map((v:any)=>JSON.parse(v));

        // upload projects
        console.log("$ uploading projects");
        // console.log("\n\nPMETA:\n",pMeta,"\n\n");
        let projs:ProjectInst[] = [];
        for(const p of pMeta){
            let pInst = await uploadProject(uid,p);
            if(!pInst) continue;
            projs.push(pInst);
        }
        allProjs.set(uid,projs);
        // 
    }

    await uploadUsersStage2(allProjs);
}
export async function uploadUsersStage2(allProjs:Map<string,ProjectInst[]>){
    let uids = await readdir("../users");
    if(!uids) return;
    for(const uid1 of uids){
        if(!uid1.endsWith(".json")) continue;
        let uid = uid1.replace(".json","");

        let projs = allProjs.get(uid);
        if(!projs) continue;

        let str = await read("../users/"+uid1);
        if(!str) continue;
        let data = JSON.parse(str);
        if(!data) continue;

        let pMeta = data.pMeta as ProjectMeta[];
        if(typeof pMeta[0] == "string") pMeta = pMeta.map((v:any)=>JSON.parse(v));

        console.log("...started making user: "+uid);

        let inprogressChallenges:ProjectInst[] = [];
        let submittedChallenges:ProjectInst[] = [];
        for(const pm of pMeta){
            let cid = pm.cid;
            let pid = pm.pid;
            if(cid == null) continue;

            let cInst = await findChallenge(cid);
            if(!cInst){
                console.warn("! err - challenge not found: "+cid);
                continue;
            }
            let proj = await _findProject(uid,pid);
            if(!proj){
                console.warn("! err - project not found associated with challenge, not good!",uid,pid);
                continue;
            }
            // let proj = projs.find(v=>v.meta.pid == c.pid);
            // if(!proj){
            //     console.warn("! err - not good! couldn't find project associated with challenge data");
            //     continue;
            // }

            let chData = challenges.get(cid);
            if(!chData){
                console.warn("! err - chData not found: "+cid);
                continue;
            }

            if(proj.meta.submitted){
                console.log("--- found submitted challenge",cid);
                submittedChallenges.push(proj);
                
                let subData = chData.sub.find(v=>v.pid == pid);
                if(!subData){
                    console.warn("! err - could not find subData: ",pid,cid);
                    continue;
                }
                let subMeta = new ChallengeSubmissionModel({
                    name:subData.who,
                    cid,
                    uid:subData.uid,
                    pid:subData.pid,
                    characterCount:subData.cc,
                    lineCount:subData.lc,
                    lang:subData.lang,
                    dateSubmitted:subData.ws != "" ? new Date(subData.ws) : null,
                    time:subData.t
                });
                await subMeta.save();
                console.log("saved challenge sub: "+cid);

                cInst.meta.submissions.push(subMeta._id);
                await cInst.save();
            }
            else{
                console.log("--- found IN-PROGRESS challenge",cid);
                inprogressChallenges.push(proj);
            }
        }

        let userExists = await UserModel.exists({uid}) != null;
        if(userExists) continue;

        let userMeta = new UserModel({
            uid,
            name:data.name,
            email:data.email,
            picture:data.picture,
            joinDate:data.joinDate != "" ? new Date(data.joinDate) : null,
            lastLoggedIn:data.lastLoggedIn != "" ? new Date(data.lastLoggedIn) : null,
            
            projects:pMeta.map((v:any)=>v.pid),
            recentProjects:data.recent,
            starredProjects:data.starred,

            completedChallenges:[...new Set(submittedChallenges.map(v=>v.meta.cid))],
            submittedChallenges:submittedChallenges.map(v=>{
                return {
                    cid:v.meta.cid,
                    pid:v.meta.pid
                };
            }),
            inprogressChallenges:inprogressChallenges.map(v=>{
                return {
                    cid:v.meta.cid,
                    pid:v.meta.pid
                };
            })
        });
        await userMeta.save();
        console.log("saved user: "+uid);
    }
}

export async function uploadProject(uid:string,meta:ProjectMeta){
    let exists = (await ProjectModel.exists({uid,pid:meta.pid})) != null;
    if(exists){
        console.log("% (skipping) project already exists: "+meta.pid);
        return;
    }

    // if(meta.wls == null){
    //     console.warn("---skipped, could not find WLS");
    //     return;
    // }

    let dateCreated = new Date(meta.wc);
    let dateLastSaved = new Date(meta.wls);
    let dateSubmitted = new Date(meta.ws);

    let data = {
        uid,pid:meta.pid,
        name:meta.name,
        desc:meta.desc,
        public:meta.isPublic,
        submitted:meta.sub,
        starred:meta.starred,
        cid:meta.cid,
        
        time:meta.time,
    } as MProject;

    if(isValidDate(dateCreated)) data.dateCreated = dateCreated;
    if(isValidDate(dateLastSaved)) data.dateLastSaved = dateLastSaved;
    if(isValidDate(dateSubmitted)) data.dateSubmitted = dateSubmitted;

    let pMeta = new ProjectModel(data);
    await pMeta.save();
    console.log("saved project: ",meta.pid);

    return new ProjectInst(pMeta);
}

export function isValidDate(date:Date){
    return !isNaN(date.getTime());
}

export async function uploadLessonProgs(){
    let uids = await readdir("../users");
    if(!uids) return;
    for(const uid of uids){
        if(uid.endsWith(".json")) continue;

        let lids = await readdir("../users/"+uid+"/lesson");
        if(!lids) continue;
        
        for(const lid of lids){
            let metaStr = await read("../users/"+uid+"/lesson/"+lid+"/meta.json");
            if(!metaStr) continue;
            let meta = JSON.parse(metaStr) as LessonMeta;

            let exists = await LessonProgressModel.exists({lid,uid}) != null;
            if(exists) continue;

            let lessonMeta = new LessonProgressModel({
                lid,uid,
                eventI:meta.eventI,
                taskI:meta.taskI,
                // no concept of scene or section in the old version
                progress:meta.prog,
                mode:meta.mode,
                dateUnlocked:meta.wu != "" && meta.wu ? new Date(meta.wu) : null,
                started:meta.s,
                unlocked:meta.u,
                times:meta.times,
                dateStarted:meta.ws != "" && meta.ws ? new Date(meta.ws) : null,
                hasFinished:meta.hf,
                dateLastSaved:meta.wls != "" && meta.wls ? new Date(meta.wls) : null,
                time:meta.time,
                sceneI:meta.sceneI,
                final_order:meta.final_order
            });
            await lessonMeta.save();

            let userMeta = await findUser(uid);
            if(userMeta){
                userMeta.meta.lessonsCompleted++;
                userMeta.makeDirty();
                await userMeta.save();
            }

            console.log("saved lesson meta: "+lid);
        }
    }
}