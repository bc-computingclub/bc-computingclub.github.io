import { read, readdir } from "./connection";

export class Challenge{
    constructor(name:string,desc:string,imgUrl:string,difficulty:string){
        this.name = name;
        this.desc = desc;
        this.imgUrl = imgUrl;
        this.difficulty = difficulty;
    }
    name:string;
    desc:string;
    imgUrl:string;
    difficulty:string;

    [key:string]:any;
    static from(data:any){
        let d = new Challenge(data.name,data.desc,data.imgUrl,data.difficulty);
        let ok = Object.keys(data);
        for(const k of ok){
            d[k] = data[k];
        }
        return d;
    }
}

export const challenges = new Map<string,Challenge>();

async function initChallenges(){
    let names = await readdir("../challenges");
    if(!names) return;
    for(const name of names){
        let dataStr = await read("../challenges/"+name,"utf8") as string|null;
        let data:any;
        if(!dataStr) continue;
        try{
            data = JSON.parse(dataStr);
        }
        catch(e){
            return;
        }
        challenges.set(name,Challenge.from(data));
    }
}
initChallenges();