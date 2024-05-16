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
};
type PTreeOps = {
    initialUnlocks?:string[]
};
class PTreeFolder{
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

export const progressTree = new PTreeFolder("root",[],{
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
            new PTreeLink("PpcVdfjdzo7TfWBL",true)
        ]),
        new PTreeLesson("ID & Class Attributes","PpcVdfjdzo7TfWBL",100,-35,[
            new PTreeLink("_dummy04",true)
        ]),

        new PTreeLesson("Dummy","_dummy04",130,-10,[
            new PTreeLink("_dummy03",false),
        ]), // transitions - more intermediate css
        new PTreeLesson("Dummy","_dummy03",165,45,[]), // javascript intro
        // new PTreeLesson("Dummy","_dummy03",110,25,[]), // javascript intro
    ])
});

export const ptreeMap = new Map<string,PTreeLesson>();
function initPTreeMap(){
    function search(folder:PTreeFolder){
        for(const lesson of folder.lessons){
            ptreeMap.set(lesson.lid,lesson);
        }
        if(folder.folders){
            let ok = Object.keys(folder.folders);
            for(const k of ok){
                search(folder.folders[k]);
            }
        }
    }
    search(progressTree);

    console.log("$ loaded ptree mappings");
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