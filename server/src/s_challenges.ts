import { User, read, readdir } from "./connection";

export class Challenge{
    constructor(id:string,name:string,desc:string,imgUrl:string,difficulty:string){
        this.id = id;
        this.name = name;
        this.desc = desc;
        this.imgUrl = imgUrl;
        this.difficulty = difficulty;
        this.timespan = null;
        this.hl = [];
        this.cnt = 0;
    }
    name:string;
    desc:string;
    imgUrl:string;
    difficulty:string;
    id:string;
    timespan:Timespan|null;
    hl:any[];
    cnt:number; // submission count

    isCompleted(){
        return false;
    }
    isInProgress(user:User){
        return user.challenges.some(v=>v.cid == this.id);
    }

    [key:string]:any;
    static from(id:string,data:any){
        let d = new Challenge(id,data.name,data.desc,data.imgUrl,data.difficulty);
        let ok = Object.keys(data);
        for(const k of ok){
            d[k] = data[k];
        }
        return d;
    }

    get ongoing(){
        let ongoing = false;
        if(this.timespan){
            let now = new Date().getUTCDate();
            if(new Date(this.timespan.end).getUTCDate() > now && now > new Date(this.timespan.start).getUTCDate()) ongoing = true;
        }
        return ongoing;
    }

    serializeGet(user:User){
        return {
            id:this.id,
            name:this.name,
            desc:this.desc,
            imgUrl:this.imgUrl,
            difficulty:this.difficulty,
            timespan:this.timespan,
            ongoing:this.ongoing,
            hl:this.hl,
            submission_count:this.cnt,
            completed:this.isCompleted(),
            inProgress:this.isInProgress(user)
        } as ChallengeGet;
    }
}
export type ChallengeGet = {
    id:string;
    name:string,
    desc:string,
    imgUrl:string,
    difficulty:string,
};
export class Timespan{
    constructor(start:string,end:string){
        this.start = start;
        this.end = end;
    }
    start:string;
    end:string
}
export class ChallengeData{
    constructor(){
        this.submissions = [];
    }
    submissions:any[];

    static async fromCID(cid:string){
        let str = await read("../challenges/"+cid+".json") as string;
        if(!str) return;
        let data = new ChallengeData();
        return data;
    }

    serializeGet(){
        return {
            submissions:this.submissions
        };
    }
}

export const challenges = new Map<string,Challenge>();

async function initChallenges(){
    let names = await readdir("../challenges");
    if(!names) return;
    for(const id of names){
        let dataStr = await read("../challenges/"+id,"utf8") as string|null;
        let data:any;
        if(!dataStr) continue;
        try{
            data = JSON.parse(dataStr);
        }
        catch(e){
            return;
        }
        let cid = id.substring(0,id.length-5);
        challenges.set(cid,Challenge.from(cid,data));
    }
}
initChallenges();