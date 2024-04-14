import { User, read, readdir, write } from "./connection";

export class CSubmission{
    constructor(url:string,who:string,uid:string,pid:string){
        this.url = url;
        this.who = who;
        this.uid = uid;
        this.pid = pid;
    }
    url:string;
    who:string;
    uid:string;
    pid:string;
    cc = 0; // char count
    lc = 0; // line count
    lang:string[] = [];
    ws = ""; // when submitted
    t = 0; // time taken
    static from(data:any){
        let c = new CSubmission(data.url,data.who,data.uid,data.pid);
        c.cc = data.cc ?? 0;
        c.lc = data.lc ?? 0;
        c.lang = data.lang ?? [];
        c.ws = data.ws ?? new Date().toISOString();
        c.t = data.t ?? 0;
        return c;
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
    }
    name:string;
    desc:string;
    imgUrl:string;
    difficulty:string;
    id:string;
    timespan:Timespan|null;
    // hl:CSubmission[];
    sub:CSubmission[];
    // cnt:number; // submission count

    isCompleted(user:User){
        let existing = user.pMeta.filter(v=>v.cid == this.id);
        if(!existing) return false;
        if(!existing.length) return false;
        return !existing.some(v=>!v.submitted);
        // let p = user.pMeta.find(v=>v.cid == this.id);
        // if(!p) return false;
        // return p.submitted;
    }
    isInProgress(user:User){
        if(this.isCompleted(user)) return false;
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
            sub:this.sub
        };
        await write("../challenges/"+this.id+".json",JSON.stringify(data,null,4));
    }

    get ongoing(){
        let ongoing = false;
        if(this.timespan){
            let now = new Date().getUTCDate();
            if(new Date(this.timespan.end).getUTCDate() > now && now > new Date(this.timespan.start).getUTCDate()) ongoing = true;
        }
        return ongoing;
    }

    serializeGet(user:User|null,minimal=false){
        return {
            id:this.id,
            name:this.name,
            desc:this.desc,
            imgUrl:this.imgUrl,
            difficulty:this.difficulty,
            timespan:this.timespan,
            ongoing:this.ongoing,
            hl:(minimal ? this.sub.slice(0,2) : null),
            sub:(minimal ? null : this.sub),
            submission_count:this.sub.length,
            completed:(user ? this.isCompleted(user) : false),
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
        if(id.startsWith("_")) continue;
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

// THIS ERROR CHECKING CODE NEEDS TO GO SOMEWHERE BUT THAT PLACE DOESN'T EXIST YET
/**if(p.cid) if(!p.meta.submitted){ 
        let ch = challenges.get(p.cid);
        if(!ch) return;
        let sub = ch.sub.find(v=>v.pid == p.pid);
        if(!sub) return;
        if(sub){
            console.log("$ error: submission misalignment, correcting...");
            p.meta.submitted = true;
            p._owner?.saveToFile();
        }
    } */