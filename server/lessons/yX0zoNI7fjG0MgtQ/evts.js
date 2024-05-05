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
        "Well, we can use h[CSS (Cascading Style Sheets)] which let us stylize the looks of our page and in the future, add animations to it."
    ],BubbleLoc.global,[
        new AddFileTask("style.css",true,"Let's start by adding and linking a CSS file to our page."),
        new AddCode([
            new CP_CSS("body",{
                "background-color":"darkcyan"
            })
        ],"Let's try to change the background of our page."),
        new BubbleTask("i[Feel free to experiment and change the color to whatever you like!]",undefined,undefined,"left"),
        new PonderBoardTask("css_board","Let's take a closer look at this structure."),
        new DoRefreshTask("Now, if you try to refresh the preview you'll see nothing changed."),
    ]),
    new LE_AddGBubble([
        "Since the preview only displays our HTML page, we need to tell our HTML page where our CSS file is so it knows how to load it."
    ],BubbleLoc.global,[
        new SwitchFileTask("index.html","Let's go back to our index page."),
        new AddIgnoreCode([
            new CP_MoveTo(8,3),
            new CP_EnsureIndent(2)
        ]),
        new AddCode([
            new CP_Text('<link rel="stylesheet" href="style.css">')
        ],"We can link our CSS file to our page by adding a line in the h[head] of our page."),
        new DoRefreshTask("Refresh the preview to see our new background color applied."),
        new PonderBoardTask("attr_board","So what does this even mean?"),
        
        // 

        // new SwitchFileTask("style.css","Alright, let's go back and see what else we can do with CSS."),
        // new AddIgnoreCode([
        //     new CP_MoveBy(0,2,true),
        //     new CP_LineBelow(2)
        // ]),
        // new AddCode([
        //     new CP_CSS("p",{
        //         "font-size":"32px"
        //     })
        // ],"How about making the text twice as large? The default size of text is 16px or pixels so we can set it to 32px."),
        // new BubbleTask(`NOTE: This says that we want u[ALL paragraph elements] on our page to have a font size of 32px.`,undefined,undefined,"left"),
        // new AddCode([
        //     new CP_LineBelow(1),
        //     new CP_Text("color:darkorchid;")
        // ],"We can also change the text color."),
        // new AddCode([
        //     new CP_LineBelow(1),
        //     new CP_Text("background-color:yellow;")
        // ],"We can change the background-color of the paragraph element itself, like a highlight.")
    ]),
    new LE_AddGBubble([
        "Alright, now that we've set up our CSS file and linked it to our page, we can start to look into the real power that CSS can give us.\nSee you in the next one 👋"
    ])
]