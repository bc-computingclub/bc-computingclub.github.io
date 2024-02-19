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
}