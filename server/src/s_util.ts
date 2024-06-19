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
                if(!nolog) console.log("err: ",err);
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

export enum LessonType{
    lesson,
    project
}

export class PTreeLink{
    constructor(to:string,flip=false){
        this.to = to;
        this.flip = flip;
    }
    to:string;
    flip:boolean;
}
export class PTreeLesson{
    constructor(name:string,lid:string,x:number,y:number,links:PTreeLink[]=[],ops:PTLessonOps={}){
        this.name = name;
        this.lid = lid;
        this.x = x;
        this.y = y;
        this.links = links;
        this.ops = ops;
    }
    name:string;
    lid:string;
    x:number;
    y:number;
    links:PTreeLink[];
    ops:PTLessonOps;

    parent:string|undefined; // lid

    loadExtraData(data:any){
        this.parent = data.parent;
    }
}
export type PTLessonOps = {
    unlocked?:boolean;
    type?:LessonType;
};
export type PTreeOps = {
    initialUnlocks?:string[]
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
        name,
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
    await write(path+"evts.js",`import * as a from "../../../src/lesson";
return [
    new LE_AddGBubble([
        "Hello!"
    ])
]`,"utf8");
    console.log(":: lesson created");
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
    await write(path+"evts.js",`import * as a from "../../../src/lesson";
return [
    new LE_AddGBubble([
        "Hello!"
    ])
]`,"utf8");
    console.log("guided project created");
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