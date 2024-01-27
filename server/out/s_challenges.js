"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.challenges = exports.Challenge = void 0;
const connection_1 = require("./connection");
class Challenge {
    constructor(name, desc, imgUrl, difficulty) {
        this.name = name;
        this.desc = desc;
        this.imgUrl = imgUrl;
        this.difficulty = difficulty;
    }
    name;
    desc;
    imgUrl;
    difficulty;
    static from(data) {
        let d = new Challenge(data.name, data.desc, data.imgUrl, data.difficulty);
        let ok = Object.keys(data);
        for (const k of ok) {
            d[k] = data[k];
        }
        return d;
    }
}
exports.Challenge = Challenge;
exports.challenges = new Map();
async function initChallenges() {
    let names = await (0, connection_1.readdir)("../challenges");
    if (!names)
        return;
    for (const name of names) {
        let dataStr = await (0, connection_1.read)("../challenges/" + name, "utf8");
        let data;
        if (!dataStr)
            continue;
        try {
            data = JSON.parse(dataStr);
        }
        catch (e) {
            return;
        }
        exports.challenges.set(name, Challenge.from(data));
    }
}
initChallenges();
