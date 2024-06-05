import { MongoClient, ServerApiVersion } from "mongodb";
import mongoose, { mongo } from "mongoose";
import { Project, ProjectMeta, ULFile, ULFolder, ULItem, _findLessonMeta, _findProject, access, genPID, mkdir, projectCache, read, readdir, removeFolder, socks, users } from "./connection";

const dbName = "code-otter-main";
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

type MUser = {
    uid:string,
    name:string,
    email:string,
    picture:string,
    joinDate:Date,
    lastLoggedIn:Date,

    recentProjects:string[],
    projects:string[],
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

    save:()=>Promise<void>
};
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

    dateCreated:Date,
    dateSubmitted:Date,
    dateLastSaved:Date,

    time:number,
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

    submitted: Boolean,
    cid: String,

    dateCreated: Date,
    dateSubmitted: Date,
    dateLastSaved: Date,
    
    time: Number
});

// const ChallengeIterationSchema = new Schema({
    
// });

type MLesson = {
    lid:string,
    uid:string,
    
    eventI:number,
    taskI:number,
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
            time:this.meta.time
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
                    let file = await read(path+name+"/","utf8",true);
                    folder.push(new ULFile(name,file,"","utf8"));
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

        // 
        
        p.meta.submitted = true;
        p.meta.public = true;
        p.meta.dateSubmitted = new Date();
        p.meta.cid = this.meta.cid; // override this just in case you tried to submit a regular project as a challenge project, it should just work instead of do nothing :)

        // 

        let items = await p.getFileItems();

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
                        let after = it.val.replace(/\s/g,"");
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
                        it.val = it.val.replace(/\r/g,"");
                        let lines = it.val.split("\n");
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
export const LessonProgressModel = mongoose.model("LessonProg",LessonProgressSchema);
export const ChallengeModel = mongoose.model("Challenge",ChallengeSchema);
export const ChallengeSubmissionModel = mongoose.model("Challenge_Submission",ChallengeSubmissionSchema);

// export const userSessions = new Map<string,{token:string,user:typeof UserModel}>();
export class UserSessionItem{
    constructor(token:string,data:any){
        this.token = token;
        this.meta = data;
    }
    token:string;
    meta:MUser;

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
        this.meta.recentProjects.splice(this.meta.recentProjects.indexOf(pid,1));
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
        this.meta.starredProjects.splice(this.meta.starredProjects.indexOf(pid,1));
    }

    async _createProjectBase(data:any){
        let pid = genPID();

        // defaults
        if(data.public == null) data.public = false;
        
        let p = new ProjectModel({
            pid,
            uid:this.meta.uid,
            
            ...data,
            
            starred:false,

            submitted:false,

            dateCreated:new Date(),
            dateLastSaved:new Date(),

            time:0
        });

        // post
        this.meta.projects.push(pid);

        return p;
    }

    async createProject(data:{
        name:string,desc:string,
        public?:boolean
    }){
        let p = await this._createProjectBase(data);

        // finish/flush
        await p.save();
        await this.meta.save();

        // @ts-ignore
        return new ProjectInst(p);
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

        this.meta.inprogressChallenges.push({
            cid,pid:p.pid
        });

        // finish/flush
        await p.save();
        await this.meta.save();

        // @ts-ignore
        return new ProjectInst(p);
    }


    // old/depricated
    addToken(token:string){}
    hasToken(token:string){}
    deleteTokens(){}
    getFirstToken(){return ""}

    private sockIds:string[] = [];
    getSocketIds(){
        return this.sockIds;
    }
    addSocketId(sockId:string){
        if(this.sockIds.includes(sockId)) return;
        this.sockIds.push(sockId);
        // socks.set(sockId,this.uid);
    }
    removeSocketId(sockId:string){
        if(!this.sockIds.includes(sockId)) return;
        this.sockIds.splice(this.sockIds.indexOf(sockId),1);
        // socks.delete(sockId);
    }
    deleteSocketIds(){
        let list = [...this.sockIds];
        for(const id of list){
            this.removeSocketId(id);
        }
    }
}

export class ProjectInst{
    // constructor(meta:MProject){
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
            if(uid != this.meta.uid){
                return false;
            }
        }
        return true;
    }
    canEdit(uid:string){
        if(!this.hasPermissionToView(uid)) return false;

        let canEdit = true;
        if(this.meta.submitted) canEdit = false;
        return canEdit;
    }
    isOwner(uid:string){
        return this.meta.uid == uid;
    }
    serialize(){
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

            canEdit:this.canEdit(this.meta.uid),
            isOwner:true,

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

                canEdit:this.canEdit(this.meta.uid), // seems weird??
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
        
        owner.projects.splice(owner.projects.indexOf(pid),1);
        owner.recentProjects.splice(owner.recentProjects.indexOf(pid),1);
        owner.starredProjects.splice(owner.starredProjects.indexOf(pid),1);

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
                console.log("ID: ",res._id);
                if(c){
                    removeFromListPred(c.meta.submissions,item=>item.equals(res?._id));
                    await c.save();
                }
                await ChallengeSubmissionModel.deleteOne({_id:res._id});
            }
        }
        
        // save
        await owner.save();

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
                    let file = await read(path+name+"/","utf8",true);
                    folder.push(new ULFile(name,file,"","utf8"));
                }
            }
        }
        await search(list,this.getPath()+"/");
        return list;
    }
}

export function removeFromList(list:any[],item:any){
    list.splice(list.indexOf(item),1);
}
export function removeFromListPred<T>(list:T[],pred:(item:T)=>boolean){
    list.splice(list.findIndex(pred),1);
}
export function addUnique(list:any[],item:any){
    if(!list.includes(item)) list.push(item);
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
    let inst = users.get(uid);
    if(inst) return inst;
    
    let res = await UserModel.findOne({
        uid
    });
    if(!res) return;
    return new UserSessionItem("",res);
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