import * as a from "../../../src/lesson";
return [
    // new LE_AddGBubble([
    //     "I haven't got to writing this lesson yet but stay tuned"
    // ],BubbleLoc.global,[
    //     new InfiniteTask(),
    //     new InfiniteTask(),
    //     new InfiniteTask(),
    //     new InfiniteTask(),
    // ])
    new LE_AddGBubble([
        "Let's start by creating index.html and our basic HTML structure."
    ],BubbleLoc.global,[
        new AddFileTask("index.html"),
        snips.basicHTMLStructure(),
        new AddCode([
            new CP_HTML("p",false,true,"Text One"),
            new CP_LineBelow(1),
            new CP_HTML("p",false,true,"Text Two"),
            new CP_LineBelow(1),
            new CP_HTML("p",false,true,"Text Three")
        ],"Now let's add 3 paragraph elements to our page.")
    ]),
    
    new LE_AddGBubble([
        "So what if we wanted to change the background color, the color of our text, or the text font size?",
        "Well, we can use CSS (Cascading Style Sheets) which let us stylize the looks of our page and in the future, add animations to it."
    ],BubbleLoc.global,[
        new AddFileTask("style.css",true,"Let's start by adding and linking a css file to our page."),
        new AddCode([
            new CP_CSS("body",{
                "background-color":"darkcyan"
            })
        ],"Let's try to change the background of our page."),
        new BubbleTask("i[Feel free to experiment and change the color to whatever you like!]",undefined,undefined,"left"),
        // new PonderBoardTask("board_css","CSS Style Sets"),
        
    ]),
]