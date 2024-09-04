import fs from "fs";

// const mimeProm = import("mime");

// export async function getMimeType(path:string){
//     let mime = await mimeProm;
//     let m = new mime.Mime();
//     return m.getType(path);
// }

export function access(path:string){
    return new Promise<boolean>(resolve=>{
        fs.access(path,err=>{
            if(err){
                // console.log("err: ",err);
                resolve(false);
            }
            else resolve(true);
        });
    });
}
export function write(path:string,data:any,encoding?:BufferEncoding){
    return new Promise<boolean>(resolve=>{
        fs.writeFile(path,data??"",{encoding:encoding as BufferEncoding},err=>{
            if(err){
                console.log("err: ",err);
                resolve(false);
            }
            else resolve(true);
        });
    });
}
export function read(path:string,encoding?:BufferEncoding,nolog=false){
    return new Promise<any>(resolve=>{
        fs.readFile(path,{encoding},(err,data)=>{
            if(err){
                if(!nolog) console.log("err (file): ",err,path);
                resolve(null);
            }
            else resolve(data);
        });
    });
}
export function lstat(path:string){
    return new Promise<fs.Stats|undefined>(resolve=>{
        fs.lstat(path,(err,stats)=>{
            if(err){
                resolve(undefined);
            }
            else resolve(stats);
        });
    });
}
export function removeFile(path:string){
    return new Promise<boolean>(resolve=>{
        fs.rm(path,err=>{
            if(err){
                console.log("err: ",err);
                resolve(false);
            }
            else resolve(true);
        });
    });
}
export function removeFolder(path:string,noerr=false){
    return new Promise<boolean>(resolve=>{
        fs.rm(path,{recursive:true},err=>{
            if(err){
                if(!noerr) console.log("err: ",err);
                resolve(false);
            }
            else resolve(true);
        });
    });
}
export function mkdir(path:string,encoding?:BufferEncoding){
    return new Promise<boolean>(resolve=>{
        fs.mkdir(path,{recursive:true},err=>{
            if(err){
                console.log("err: ",err);
                resolve(false);
            }
            else resolve(true);
        });
    });
}
export function readdir(path:string){
    return new Promise<string[]|null>(resolve=>{
        fs.readdir(path,(err,files)=>{
            if(err){
                // console.log("err: ",err);
                resolve(null);
            }
            else resolve(files);
        });
    });
}
export function rename(fromPath:string,toPath:string){
    return new Promise<boolean>(resolve=>{
        fs.rename(fromPath,toPath,err=>{
            if(err){
                console.log("err renaming...",err);
                resolve(false);
            }
            else resolve(true);
        });
    });
}
export function internalCP(fromPath:string,toPath:string){
    return new Promise<boolean>(resolve=>{
        fs.copyFile(fromPath,toPath,err=>{
            if(err){
                resolve(false);
            }
            else resolve(true);
        });
    });
}
export function internalCPDir(fromPath:string,toPath:string){
    return new Promise<boolean>(resolve=>{
        fs.cp(fromPath,toPath,{ recursive: true },err=>{
            if(err){
                console.log("$ error copying",err);
                resolve(false);
            }
            else resolve(true);
        });
    });
}

// UTIL
export class ULItem{
    constructor(name:string){
        this.name = name;
    }
    name:string;
    static from(d:any):ULItem{
        function sanitize(data:any){
            if(data.items){
                return new ULFolder(data.name,data.items.map((v:any)=>sanitize(v)));
            }
            else{
                let f = new ULFile(data.name,data.buf);
                // f.blob = data.blob;
                return f;
            }
        }
        return sanitize(d);
    }
}
export class ULFolder extends ULItem{
    constructor(name:string,items:ULItem[]=[]){
        super(name);
        this.items = items;
    }
    items:ULItem[];
}
export class ULFile extends ULItem{
    constructor(name:string,buf:Buffer){
        super(name);
        this.buf = buf;
        // this.val = val;
        // this.path = path;
        this.type = name.split(".").pop();
    }
    static make2(name:string,buf:Buffer){
        let f = new ULFile(name,buf);
        // f.blob = blob;
        f.type = name.split(".").pop();
        
        return f;
    }
    // val:string;
    // path:string;

    // blob:Blob|undefined;
    buf:Buffer|undefined;
    type:string|undefined;
}

export enum LessonType{
    none = -1,
    lesson,
    project,
    rush,
    review
}

export class PTreeLink{
    constructor(to:string,flip=false){
        this.to = to;
        this.flip = flip;
    }
    to:string;
    flip:boolean;
}
export type ReviewSection = {
    id:string,
    scenes:ReviewScene[]
};
export type ReviewScene = {
    id:string,

    // server data
    initial_files?:ULFolder,
    custom_evts?:string,
    _data?:PTreeLesson;
};
export type ReviewOrderSet = {
    includes:string[],
    sort:"asc"|"random",

    // server data
};
export class PTreeLesson{
    constructor(name:string,lid:string,x:number,y:number,links:PTreeLink[]=[],ops:PTLessonOps={},type:LessonType=0){
        this.name = name;
        this.lid = lid;
        this.x = x;
        this.y = y;
        this.links = links;
        this.ops = ops;
        this.type = type;
    }
    name:string;
    lid:string;
    x:number;
    y:number;
    links:PTreeLink[];
    ops:PTLessonOps;
    type:LessonType = 0;

    desc:string[] = [];
    takeaways:string[] = [];

    parent:string|undefined; // lid

    preview:{
        type:"code",
        ref?:string, // rel path to folder containing files for preview
    }[] = [];
    previewData:ULFolder|undefined;

    // review lesson meta
    sections:ReviewSection[] = [];
    order:ReviewOrderSet[] = [];

    /**
     * Path does NOT end with `/`
     */
    async loadExtraData(data:any,folder:PTreeFolder|undefined,lesson:PTreeLesson|undefined,path:string){
        this.parent = data.parent;
        this.desc = data.desc ?? [];
        this.takeaways = data.takeaways ?? [];
        this.preview = data.preview ?? [];
        this.type = data.type ?? 0;
        for(const d of this.preview){
            if(d.type == "code"){
                if(d.ref){
                    let fullPath = path+"/"+d.ref;
                    if(isValidPath(d.ref)) this.previewData = makeTempFolder(await getFolderItems(fullPath));
                }

                // don't have a way of knowing what folder it's in at this time --> do now though! and the solution is above
                // this.previewData = new ULFolder("root",await getFolderItems("../lessons/"+this.));
            }
        }

        // review lesson metadata
        // if(this.type == LessonType.review){
        //     this.
        // }
        this.sections = data.sections;
        this.order = data.order;
        
        // cache server data for review sections
        if(this.sections) for(const section of this.sections){
            let sectionPath = path+"/scenes/"+section.id;
            if(section.scenes) for(const scene of section.scenes){
                let scenePath = sectionPath+"/"+scene.id;
                
                scene.initial_files = makeTempFolder(await getFolderItems(scenePath+"/initial_files"));
                let evtStr = await read(scenePath+"/evts.js","utf8") as string|undefined;
                if(evtStr){
                    let evtSplit = evtStr.split("\n");
                    evtSplit.splice(0,1);
                    evtStr = evtSplit.join("\n");
                    scene.custom_evts = evtStr;
                }

                // 
                scene._data = new PTreeLesson("sub^"+section.id+"^"+scene.id,this.lid,0,0,[],{type:LessonType.none,unlocked:true},LessonType.none);
                let meta = {
                    "finalInstance": null,
                    "boards": []
                };
                await scene._data.loadExtraData(meta,undefined,undefined,sectionPath);
            }
        }
    }
}
function isValidPath(path:string){
    if(path.includes("..")) return false;
    if(path.startsWith("/")) return false;
    return true;
}
function makeTempFolder(items?:ULItem[]){
    if(!items) return undefined;
    return new ULFolder("root",items);
}
async function getFolderItems(path:string){
    if(!await lstat(path)) return undefined;
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
    await search(list,path+"/");
    return list;
}
export type PTLessonOps = {
    unlocked?:boolean;
    type?:LessonType;
};
export type PTreeOps = {
    initialUnlocks?:string[]
};
export type AllLearnObjTypes = {
    // sign
    title:string,
    desc:string[]
};
export type PTreeFolderObj = { // probably don't actually need this server side, or at least right now, but I'll define it for now for documentation purposes
    type:number, // type of object: warp zone, sign (as enum number)
    id?:string, // id for relation purposes
    rel?:string, // format: `type@id` examples: `o:id` (position relative to object with the id), `l:lid` (position relative to lesson item with lid)
    x:number,
    y:number,
    data?:AllLearnObjTypes; // custom data for the particular type
};
export type PTreeFolderMeta = {
    name:string,
    objs:PTreeFolderObj[]
};
export class PTreeFolder{
    constructor(name:string,lessons:PTreeLesson[]=[],folders:Record<string,PTreeFolder>={},ops:PTreeOps={}){
        this.name = name;
        this.lessons = lessons;
        this.folders = folders;
        this.ops = ops;

        // if(ops){
        //     if(ops.initialUnlocks)
        // }
    }
    name:string;
    lessons:PTreeLesson[];
    folders:Record<string,PTreeFolder>;
    ops:PTreeOps;
    meta:PTreeFolderMeta|undefined;
}

export class LessonCacheItem{
    constructor(lid:string,path:string,lesson:PTreeLesson,folder:PTreeFolder){
        this.lid = lid;
        this.path = path;
        this.lesson = lesson;
        this.folder = folder;
    }
    lid:string;
    path:string;
    lesson:PTreeLesson;
    folder:PTreeFolder;
    get fullPath(){
        return this.path+this.lid+"/";
    }
}
export const lessonCache = new Map<string,LessonCacheItem>(); // lid, LCI
export const registeredLessonFolders = new Map<string,{
    firstLID:string,
    pathKeys:string[],
    ops:PTreeOps|undefined
}>();
async function genLID(){
    let len = 16;
    let s = "";
    let abc = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for(let i = 0; i < len; i++){
        s += abc[Math.floor(Math.random()*abc.length)];
    }
    if(lessonCache.has(s)) return genLID();
    else return s;
}

function getStandardLessonMeta(name:string){
    return {
        ver:"0",
        author:"<blank>",
        name,
        desc:[],
        preview:[],
        takeaways:[],
        dateCreated:new Date().toISOString(),
        banner:{
            sections:[
                {
                    head:"What Will We Be Doing in This Lesson?",
                    text:[
                        "<Short summary of lesson here>"
                    ]
                }
            ]
        },
        finalInstance:null,
        boards:[],
        x:-30, // put it off the screen a little bit
        y:-30,
        req:[]
    };
}
function getStandardLessonEvts(){
    return `import * as a from "../../../src/lesson";
return [
    new LE_Bubble([
        "Hello!"
    ])
]`;
}

export async function createLesson(name:string){
    function err(){
        console.log("$ Something went wrong while trying to create the lesson");
    }
    let lid = await genLID();
    if(!lid){
        err();
        return;
    }
    let data = getStandardLessonMeta(name);
    let path = "../lessons/"+lid+"/";
    await mkdir(path);
    await write(path+"meta.json",JSON.stringify(data,undefined,4),"utf8");
    await write(path+"evts.js",getStandardLessonEvts(),"utf8");
    console.log(":: lesson created:",lid);
}
export async function createGuidedProject(name:string){
    function err(){
        console.log("$ Something went wrong while trying to create the project");
    }
    let lid = await genLID();
    if(!lid){
        err();
        return;
    }
    let data = {
        ...getStandardLessonMeta(name),
        type:LessonType.project
    };
    let path = "../lessons/"+lid+"/";
    await mkdir(path);
    await write(path+"meta.json",JSON.stringify(data,undefined,4),"utf8");
    await write(path+"evts.js",getStandardLessonEvts(),"utf8");
    console.log(":: guided project created:",lid);
}
export async function createRushLesson(name:string){
    function err(){
        console.log("$ Something went wrong while trying to create the rush lesson");
    }
    let lid = await genLID();
    if(!lid){
        err();
        return;
    }
    let data = {
        ...getStandardLessonMeta(name),
        type:LessonType.rush
    };
    let path = "../lessons/"+lid+"/";
    await mkdir(path);
    await write(path+"meta.json",JSON.stringify(data,undefined,4),"utf8");
    await write(path+"evts.js",getStandardLessonEvts(),"utf8");
    console.log(":: rush lesson created: ",lid);
}
export async function createReviewLesson(name:string){
    function err(){
        console.log("$ Something went wrong while trying to create the review lesson");
    }
    let lid = await genLID();
    if(!lid){
        err();
        return;
    }
    let data = {
        ...getStandardLessonMeta(name),
        type:LessonType.review
    };
    let path = "../lessons/"+lid+"/";
    await mkdir(path);
    await write(path+"meta.json",JSON.stringify(data,undefined,4),"utf8");
    await write(path+"evts.js",getStandardLessonEvts(),"utf8");
    console.log(":: review lesson created: ",lid);
}

// 

let nonTextFileFormats = [
    {
        ext:"png"
    }
];
export function isExtTextFile(ext:string){
    if(!ext || ext == "") return false; // false or true here?
    return !nonTextFileFormats.some(v=>v.ext == ext);
}
export function getExt(name:string){
    return name.split(".").pop() ?? "";
}