"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("./connection");
console.log("load");
connection_1.io.on("connection", e => {
});
connection_1.server.listen(3000, () => {
    console.log('listening on *:3000');
});
