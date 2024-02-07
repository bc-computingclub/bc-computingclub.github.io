import { User, read, readdir, write } from "./connection";

export class CSubmission{
    constructor(url:string,who:string,pid:string){
        this.url = url;
        this.who = who;
        this.pid = pid;
    }
    url:string;
    who:string;
    pid:string;
    static from(data:any){
        return new CSubmission(data.url,data.who,data.pid);
    }
}
export class Challenge{
    constructor(id:string,name:string,desc:string,imgUrl:string,difficulty:string){
        this.id = id;
        this.name = name;
        this.desc = desc;
        this.imgUrl = imgUrl;
        this.difficulty = difficulty;
        this.timespan = null;
        // this.hl = [];
        this.sub = [];
        this.cnt = 0;
    }
    name:string;
    desc:string;
    imgUrl:string;
    difficulty:string;
    id:string;
    timespan:Timespan|null;
    // hl:CSubmission[];
    sub:CSubmission[];
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
        d.sub = [];
        if(data.sub) for(const s of data.sub){
            d.sub.push(CSubmission.from(s));
        }
        return d;
    }
    async save(){
        let data = {
            name:this.name,
            desc:this.desc,
            imgUrl:this.imgUrl,
            difficulty:this.difficulty,
            timespan:this.timespan,
            cnt:this.cnt,
            sub:this.sub
        };
        await write("../challenges/"+this.id+".json",JSON.stringify(data));
    }

    get ongoing(){
        let ongoing = false;
        if(this.timespan){
            let now = new Date().getUTCDate();
            if(new Date(this.timespan.end).getUTCDate() > now && now > new Date(this.timespan.start).getUTCDate()) ongoing = true;
        }
        return ongoing;
    }

    serializeGet(user:User|null){
        return {
            id:this.id,
            name:this.name,
            desc:this.desc,
            imgUrl:this.imgUrl,
            difficulty:this.difficulty,
            timespan:this.timespan,
            ongoing:this.ongoing,
            hl:this.sub.slice(0,2),
            sub:this.sub,
            submission_count:this.cnt,
            completed:this.isCompleted(),
            inProgress:(user ? this.isInProgress(user) : null)
        } as ChallengeGet;
    }
}
export type ChallengeGet = {
    id:string;
    name:string,
    desc:string,
    imgUrl:string,
    difficulty:string,
    hl?:CSubmission[];
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