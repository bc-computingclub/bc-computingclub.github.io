import { MongoClient, ServerApiVersion } from "mongodb";
import mongoose, { mongo } from "mongoose";
import { Project, ProjectMeta, ULItem, access, genPID, mkdir, removeFolder, socks } from "./connection";
import { readdir } from "fs";

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
async function postInitMongoDB(){
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

    save:()=>Promise<void>
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

const LessonProgressSchema = new Schema({
    lid: String, // corresponding lesson
    uid: String, // user who owns this progress data
    
    eventI: Number,
    taskI: Number,
    progress: Number,
    mode: Number,

    time: Number,
    dateLastSave: Date,

    unlocked: Boolean,
    dateUnlocked: Date,

    start: Boolean,
    dateStarted: Date,

    hasFinished: Boolean, // has finished once

    // do we need a field for new?

    times: Number,   
});

// models

export const UserModel = mongoose.model("User",UserSchema);
export const ProjectModel = mongoose.model("Project",ProjectSchema);
export const LessonProgressModel = mongoose.model("LessonProg",LessonProgressSchema);

// export const userSessions = new Map<string,{token:string,user:typeof UserModel}>();
export class UserSessionItem{
    constructor(token:string,data:MUser){
        this.token = token;
        this.meta = data;
    }
    token:string;
    meta:MUser;

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
        this.meta.projects.push(pid);
    }
    /**
     * Removes the following pid from the list of recent projects.
     */
    removeFromRecents(pid:string){
        this.meta.projects.splice(this.meta.projects.indexOf(pid,1));
    }

    /**
     * Adds the following pid to the list of starred projects.
     */
    addToStarred(pid:string){

    }
    /**
     * Removes the following pid from the list of starred projects.
     */
    removeFromStarred(pid:string){

    }

    /**
     * 
     */
    async createProject(data:{
        name:string,desc:string,
        public?:boolean
    }){
        let pid = genPID();

        // defaults
        if(data.public == null) data.public = false;
        
        let p = new ProjectModel({
            pid,
            uid:this.meta.uid,
            name:data.name,desc:data.desc,

            public:data.public,
            starred:false,

            submitted:false,

            dateCreated:new Date(),
            dateLastSaved:new Date(),

            time:0
        });

        // post
        this.meta.projects.push(pid);

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

    async save(){
        await this.meta.save();
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
            starred:false, // too expensive to calc right now

            meta:{
                pid:this.meta.pid,
                name:this.meta.name,
                desc:this.meta.desc,
                isPublic:this.meta.public,
                cid:this.meta.cid,
                sub:this.meta.submitted,

                starred:false, //

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
        
        let owner = await UserModel.findOne({
            uid:this.meta.uid
        });
        if(!owner){
            console.warn("% err: couldn't find owner while trying to delete project");
            return 2;
        }
        
        owner.projects.splice(owner.projects.indexOf(this.meta.pid),1);
        owner.recentProjects.splice(owner.recentProjects.indexOf(this.meta.pid),1);
        owner.starredProjects.splice(owner.starredProjects.indexOf(this.meta.pid),1);

        // clear from challenges
        // todo...
        
        // save
        await owner.save();

        // finish deletion
        await ProjectModel.deleteOne({
            pid:this.meta.pid
        });

        await removeFolder(this.getPath());

        return 0;
    }
}

export const userSessions = new Map<string,UserSessionItem>();

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