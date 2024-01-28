"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.challenges = exports.ChallengeData = exports.Timespan = exports.Challenge = void 0;
const connection_1 = require("./connection");
class Challenge {
    constructor(id, name, desc, imgUrl, difficulty) {
        this.id = id;
        this.name = name;
        this.desc = desc;
        this.imgUrl = imgUrl;
        this.difficulty = difficulty;
        this.timespan = null;
        this.hl = [];
    }
    name;
    desc;
    imgUrl;
    difficulty;
    id;
    timespan;
    hl;
    static from(id, data) {
        let d = new Challenge(id, data.name, data.desc, data.imgUrl, data.difficulty);
        let ok = Object.keys(data);
        for (const k of ok) {
            d[k] = data[k];
        }
        return d;
    }
    get ongoing() {
        let ongoing = false;
        if (this.timespan) {
            let now = new Date().getUTCDate();
            if (new Date(this.timespan.end).getUTCDate() > now && now > new Date(this.timespan.start).getUTCDate())
                ongoing = true;
        }
        return ongoing;
    }
    serializeGet() {
        return {
            id: this.id,
            name: this.name,
            desc: this.desc,
            imgUrl: this.imgUrl,
            difficulty: this.difficulty,
            timespan: this.timespan,
            ongoing: this.ongoing,
            hl: this.hl
        };
    }
}
exports.Challenge = Challenge;
class Timespan {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
    start;
    end;
}
exports.Timespan = Timespan;
class ChallengeData {
    constructor() {
        this.submissions = [];
    }
    submissions;
    static async fromCID(cid) {
        let str = await (0, connection_1.read)("../challenges/" + cid + ".json");
        if (!str)
            return;
        let data = new ChallengeData();
        return data;
    }
    serializeGet() {
        return {
            submissions: this.submissions
        };
    }
}
exports.ChallengeData = ChallengeData;
exports.challenges = new Map();
async function initChallenges() {
    let names = await (0, connection_1.readdir)("../challenges");
    if (!names)
        return;
    for (const id of names) {
        let dataStr = await (0, connection_1.read)("../challenges/" + id, "utf8");
        let data;
        if (!dataStr)
            continue;
        try {
            data = JSON.parse(dataStr);
        }
        catch (e) {
            return;
        }
        let cid = id.substring(0, id.length - 5);
        exports.challenges.set(cid, Challenge.from(cid, data));
    }
}
initChallenges();
