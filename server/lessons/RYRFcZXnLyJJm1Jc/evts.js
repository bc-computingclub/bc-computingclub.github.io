import * as a from "../../../src/lesson";
return [
    new LE_AddGBubble([
        "Hello!"
    ],BubbleLoc.global,[
        new AddFileTask("main.js",true),
        new AddGenericCodeTask('console.log("hello");',"javascript")
    ]),
]