import * as a from "../../../../src/lesson";
return [
    new LE_Bubble([
        "Hello!"
    ],[
        new AddFileTask("index.html",undefined,"Let's first setup our page."),
        new AddCode([
            snips.basicHTMLStructure()
        ],null),

        new AddFileTask("style.css",undefined,"Let's also setup our CSS file."),
        new SwitchFileTask("index.html"),

        // 
        
    ])
]