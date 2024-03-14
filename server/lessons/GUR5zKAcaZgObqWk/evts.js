import * as a from "../../../src/lesson";
return [
    new LE_AddGBubble([
        "Hello!"
    ],BubbleLoc.global,[
        new AddFileTask("main.js",true),
        new AddGenericCodeTask('console.log("hello");',"javascript")
    ]),
    new LE_AddGBubble([
        "This is the second bubble"
    ],BubbleLoc.global,[
        new AddGenericCodeTask('\n\nconsole.log("hello");',"javascript")
    ]),
    // new LE_AddGBubble([
    //     "This is the 3rd bubble"
    // ],BubbleLoc.global,[
    //     new AddGenericCodeTask('\n\nconsole.log("hello");',"javascript")
    // ]),
    // new LE_AddGBubble([
    //     "This is the 4th bubble"
    // ],BubbleLoc.global,[
    //     new AddGenericCodeTask('\n\nconsole.log("hello");',"javascript")
    // ]),
    // new LE_AddGBubble([
    //     "This is the 5th bubble"
    // ],BubbleLoc.global,[
    //     new AddGenericCodeTask('\n\nconsole.log("hello");',"javascript")
    // ])
]