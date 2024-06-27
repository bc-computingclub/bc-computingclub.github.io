import * as a from "../../../../src/lesson";
return [
    new LE_AddGBubble([
        "Hello!",
        "This is a Rush Lesson about the Basic HTML Structure.",
        // "i[You ready?]"
        "Let's begin!"
    ],BubbleLoc.global,[
        new AddFileTask("index.html"),
        new AddRushCode([
            new CP_HTML("html",true,true),
            new CP_HTML("head",true,true),
            new CP_HTML("title",false,false,"Home Page"),
            new CP_MoveByY(1),
            new CP_LineBelow(),
            new CP_HTML("body",true,true),
            new CP_HTML("h1",false,false,"Hello World")
        ])
    ])
]