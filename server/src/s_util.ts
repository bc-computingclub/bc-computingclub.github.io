import { mkdir, readdir, write } from "./connection";
import { LessonData } from "./s_lesson";

async function genLID(){
    let list = await readdir("../lessons");
    if(!list) return;
    let len = 16;
    let s = "";
    let abc = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for(let i = 0; i < len; i++){
        s += abc[Math.floor(Math.random()*abc.length)];
    }
    if(list.includes(s)) return genLID();
    else return s;
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
    let data = {
        ver:"0",
        name,
        banner:{
            sections:[
                {
                    head:"What Will We Be Doing in This Lesson?",
                    text:[
                        "Want to start coding?"
                    ]
                }
            ]
        },
        finalInstance:null,
        boards:[]
    };
    let path = "../lessons/"+lid+"/";
    await mkdir(path);
    await write(path+"meta.json",JSON.stringify(data),"utf8");
    await write(path+"evts.js",`import * as a from "../../../src/lesson";
return [
    new LE_AddGBubble([
        "Hello!"
    ])
]`,"utf8");
    console.log("lesson created");
}