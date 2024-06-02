import { read, readdir } from "./connection";
import { LessonType } from "./s_util";

export class TextSection{
    constructor(text:string[]){
        this.text = text;
    }
    text:string[];
}
export class LessonBanner{
    constructor(sections:TextSection[]){
        this.sections = sections;
    }
    sections:TextSection[];
}
export class LessonEvent{
    constructor(data:any){
        this.id = data.id || "g";
        let id = this.id;
        if(id == "g"){
            if(data.text ? !Array.isArray(data.text) : true) this.text = ["[Error no valid text found]"];
            else this.text = data.text;

            if(data.tasks ? !Array.isArray(data.tasks) : true) this.tasks = [];
            else this.tasks = data.tasks.map((v:any)=>new LessonTask(v));
        }
        else{
            this.text = ["[Error no valid text found]"];
            this.tasks = [];
        }
    }
    
    id:string;
    text:string[];
    tasks:LessonTask[];
}
export class LessonTask{
    constructor(data:any){
        let id = data.id;
        this.id = id;
        if(!id) return;
        
        if(id == "addFile"){
            this.name = data.name;
            this.required = data.required;
        }
        else if(id == "addCode"){
            this.text = data.text;
            this.lang = data.lang;
        }
        else if(id == "refresh"){
            this.text = data.text;
            this.com = data.com;
        }
        else if(id == "board"){
            this.bid = data.bid;
            this.text = data.text;
        }
        else if(id == "sideText"){
            this.text = data.text;
            this.com = data.com;
        }
    }

    id:string;

    // addFile
    name?:string;
    required?:boolean;
    
    // addCode
    text?:string;
    lang?:string;
    
    // 
    com?:string;

    // board
    bid?:string;
}
export class LessonData{
    constructor(data:any){
        this.ver = data.ver;
        if(this.ver == null){
            console.log("$ there was an error loading lesson data");
            return;
        }
        this.name = data.name;
        // this.banner = new LessonBanner()
        if(data.events != null ? !Array.isArray(data.events) : true){
            console.log("$ err can't find lesson events");
            return;
        }
        this.events = data.events.map((v:any)=>new LessonEvent(v));
    }

    ver:string = "";
    name:string = "";
    banner?:LessonBanner;
    finalInstance?:null;

    events:LessonEvent[] = [];

    // continueFrom:string|null = null;
}

class PTreeLink{
    constructor(to:string,flip=false){
        this.to = to;
        this.flip = flip;
    }
    to:string;
    flip:boolean;
}
class PTreeLesson{
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
}
type PTLessonOps = {
    unlocked?:boolean;
    type?:LessonType;
};
type PTreeOps = {
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

export let globalLessonFolders = new Map<string,PTreeFolder>();
export function getLessonFolder(keys:string[]){
    let folder = globalLessonFolders.get(keys[0]);
    for(let i = 1; i < keys.length; i++){
        let key = keys[i];
        folder = folder?.folders[key];
    }
    return folder;
}

class LessonCacheItem{
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
export const lessonCache = new Map<string,LessonCacheItem>();
async function registerLessonFolder(name:string,firstLID:string,pathKeys:string[]=[],ops?:PTreeOps){
    let path = "../lessons/"+name+"/";
    for(const key of pathKeys){
        path += key+"/";
    }
    let lids = await readdir(path);
    if(!lids){
        console.log("failed to register lesson folder: "+path);
        return;
    }
    let folder = new PTreeFolder(name,[],undefined,ops);
    globalLessonFolders.set(name,folder);
    // let first1:PTreeLesson|null = null;
    for(const lid of lids){
        let metaStr = await read(path+lid+"/meta.json","utf8",true);
        if(!metaStr){
            console.log("couldn't find lesson while loading: "+lid);
            continue;
        }
        let meta = JSON.parse(metaStr);
        let l = new PTreeLesson(meta.name,lid,meta.x??Math.random()*100,meta.y??Math.random()*100,[],{
            type:meta.type??0
        });
        folder.lessons.push(l);

        if(meta.req){
            for(const link of meta.req){
                l.links.push(new PTreeLink(link.lid,!!link.flip));
            }
        }

        lessonCache.set(lid,new LessonCacheItem(lid,path,l,folder));

        // if(first1){
        //     l.links.push(new PTreeLink(first1.lid));
        // }
        // else first1 = l;
    }
    let first = folder.lessons.find(v=>v.lid == firstLID);
    if(first) first.ops.unlocked = true;

    initPTreeMappings(folder);
}

registerLessonFolder("theBeginnings","AqCOreapkT8uu8sC");

const progressTree = new PTreeFolder("root",[],{
    __0_theBeginnings:new PTreeFolder("The Beginnings",[
        new PTreeLesson("The First Lesson","AqCOreapkT8uu8sC",0,0,[
            new PTreeLink("yX0zoNI7fjG0MgtQ")
        ],{unlocked:true}),
        new PTreeLesson("Simple Styling","yX0zoNI7fjG0MgtQ",35,20,[
            new PTreeLink("_dummy03",true),
            new PTreeLink("_dummy04"),
        ]),
        new PTreeLesson("Dummy","_dummy03",70,40,[]), // javascript intro
        new PTreeLesson("Dummy","_dummy04",75,-5,[]) // transitions - more intermediate css

        // new PTreeLesson("The First Lesson","0001",0,0,[
        //     new PTreeLink("GUR5zKAcaZgObqWk")
        // ],{
        //     unlocked:true
        // }),
        // new PTreeLesson("The Second","GUR5zKAcaZgObqWk",35,20,[
        //     new PTreeLink("RYRFcZXnLyJJm1Jc",true)
        // ]),
        // new PTreeLesson("The Quick Lesson","RYRFcZXnLyJJm1Jc",70,40),
    ]),
    theBeginnings:new PTreeFolder("The Beginnings",[
        new PTreeLesson("The First Lesson","AqCOreapkT8uu8sC",0,0,[
            new PTreeLink("aw5HFgPdsxJPHMcg")
        ],{unlocked:true}),
        new PTreeLesson("Basic HTML Structure","aw5HFgPdsxJPHMcg",35,20,[
            new PTreeLink("yX0zoNI7fjG0MgtQ")
        ]),
        // new PTreeLesson("Simple Styling","yX0zoNI7fjG0MgtQ",70,-5,[
        //     new PTreeLink("_dummy_PpcVdfjdzo7TfWBL",true)
        // ]),
        // new PTreeLesson("ID & Class Attributes","_dummy_PpcVdfjdzo7TfWBL",100,-35,[
        //     new PTreeLink("_dummy04",true)
        // ]),
        new PTreeLesson("Simple Styling","yX0zoNI7fjG0MgtQ",70,-5,[
            new PTreeLink("PpcVdfjdzo7TfWBL",true),
            new PTreeLink("FI8EQAfpS5eh6jkY")
        ]),
        new PTreeLesson("ID & Class Attributes","PpcVdfjdzo7TfWBL",100,-35,[
            new PTreeLink("_dummy04",true)
        ]),

        new PTreeLesson("Dummy","_dummy04",130,-10,[
            new PTreeLink("_dummy03",false),
        ]), // transitions - more intermediate css
        new PTreeLesson("Dummy","_dummy03",165,45,[]), // javascript intro
        // new PTreeLesson("Dummy","_dummy03",110,25,[]), // javascript intro



        new PTreeLesson("Simple Menu Bar","FI8EQAfpS5eh6jkY",100,50,[],{
            type:LessonType.project
        }),
    ])
});

export const ptreeMap = new Map<string,PTreeLesson>();
function initPTreeMappings(folder:PTreeFolder){
    for(const lesson of folder.lessons){
        ptreeMap.set(lesson.lid,lesson);
    }
    if(folder.folders){
        let ok = Object.keys(folder.folders);
        for(const k of ok){
            initPTreeMappings(folder.folders[k]);
        }
    }
}
function initPTreeMap(){
    // initPTreeMappings(progressTree);

    // console.log("$ loaded ptree mappings");
}
initPTreeMap();

/*const progressTree_raw = {
    theBeginnings:{
        lessons:[
            {
                name:"The First Lesson",
                lid:"0001",
                x:0,y:0,
                links:[
                    {
                        to:"GUR5zKAcaZgObqWk",
                    }
                ]
            },
            {
                name:"The Second",
                lid:"GUR5zKAcaZgObqWk",
                x:35,y:20,
                links:[
                    {
                        to:"RYRFcZXnLyJJm1Jc",
                        flip:true
                    }
                ]
            },
            {
                name:"The First Lesson",
                lid:"RYRFcZXnLyJJm1Jc",
                x:70,y:40,
                links:[]
            }
        ]
    }
};*/