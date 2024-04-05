import * as a from "../../../src/lesson";
return [
    new LE_AddGBubble([
        "I've brought over both our sets of files for this tutorial because we're going to add on to it."
    ],BubbleLoc.global,[
        new DoRefreshTask("Let's load the preview so we have a sense of what we're working with right now."),
        new SwitchFileTask("style.css","Alright, let's see what else we can do with CSS."),
        new AddIgnoreCode([
            new CP_MoveBy(0,2,true),
            new CP_LineBelow(2)
        ]),
        new AddCode([
            new CP_CSS("p",{
                "font-size":"32px"
            })
        ],"How about making the text twice as large? The default size of text is 16px (pixels) so we can set it to 32px."),
        new BubbleTask(`NOTE: This says that we want h[ALL paragraph elements] on our page to have a font size of 32px.`,undefined,undefined,"left"),
        new AddCode([
            new CP_LineBelow(1),
            new CP_Text("color:tomato;")
        ],"We can also change the text color."),
        new AddCode([
            new CP_LineBelow(1),
            new CP_Text("background-color:yellow;")
        ],"We can change the background-color of the paragraph element itself, like a highlight."),
        new AddCode([
            new CP_LineBelow(1),
            new CP_Text("font-style:italic;\nfont-weight:bold;")
        ],"We can also make our text italic and bold by using the font-style and font-weight properties."),
        new DoRefreshTask("If you haven't already, refresh to see all the changes we've made."),
        new AddCode([
            // new CP_MoveBy
        ],"You can also quickly comment out or disable lines for testing by pressing h[Ctrl/Cmd + /].")
    ]),
    new LE_AddGBubble([
        "So, now we have all our text customized, what if we wanted to change just h[i[one]] of them?\ni[For example, what if we wanted to change the highlight color of our 3rd paragraph element to green?]"
    ]),
    new LE_AddGBubble([
        "Well, in order to do this we can put an id on our element so we can target that one specifically from CSS.",
        new SwitchFileTask("index.html"),
        new AddIgnoreCode([
            new CP_MoveBy(8,9),
            new CP_Text("(test)")
        ])
    ])
]