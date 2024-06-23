import * as a from "../../../../src/lesson";
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
        ],"How about making the text twice as large? The default size of text is 16px (pixels) so let's change it to 32px."),

        new DoRefreshTask("Refresh to see how this changes our page."),
        new BubbleTask(`Note, this says that we want<br>h[ALL paragraph elements] on our page to have a font size of 32px.`,undefined,undefined,"left"),
        new BubbleTask("CSS is applied to ALL elements in your page as long as they match the selector.\nIn our case, we'll selecting all i[] elements so all of them will be changed on our page."),

        new AddCode([
            new CP_LineBelow(1),
            new CP_Text("color:tomato;")
        ],"We can also change the text color."),
        new BubbleTask("i[I encourage you to refresh after each line added to see how it affects the page.]"),
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
            new CP_Comment()
        ],"You can also quickly comment out or disable lines for testing by pressing:\nh[Ctrl/Cmd + /].\nComments are ignored so they're an easy way to quickly disable code!"),
        new AddIgnoreCode([
            new CP_Comment()
        ])
    ]),
    new LE_AddGBubble([
        "So, now that we have all our text customized, what if we wanted to change just h[i[one]] of them?\ni[For example, what if we wanted to change the highlight color of our 3rd paragraph element to light blue?]"
    ]),
    new LE_AddGBubble([
        "Well, in order to do this we can put an h[id] on our element so we can target i[that one specifically] from CSS."
    ],BubbleLoc.global,[
        new SwitchFileTask("index.html"),
        new AddCode([
            new CP_MoveBy(8+2,7),
            new CP_Text(` id="cool-label"`)
        ],null),
        new SwitchFileTask("style.css"),
        new MoveCursorTo(11,1),
        new AddCode([
            new CP_LineBelow(2),
            new CP_Bubble(`Let's add a new styleset here to customize our "cool-label" element.`),
            new CP_CSS("p#cool-label",{
                "background-color":"lightblue"
            })
        ],null),
        new MoveCursorTo(13,5),
        new BubbleTask("Hover over the selector \"p#cool-label\" to see the type of element we are modifying."),
        new ShowHoverTask(),
        new DoRefreshTask("If you refresh, only our 3rd paragraph element should have the lightblue background color."),

        // need to say something like: we don't really need the "p" here, it just allows us to be more specific, if we take it away it means we're selecting "any type of element with the id cool-label" instead of "p elements with the id cool-label"

        // 
        // 

        // NEW FEATURE TEST
        /*new BubbleTask("We'll look more into selectors in the next tutorials, but keep in mind that in a selector, b[spaces matter]."),
        new AddCode([
            new CP_MoveTo(7,13),
            new CP_Delete(4),
            new CP_Wait(500),
            new CP_Select(13,3,14,25),
            new CP_Wait(500),
            new CP_Delete(1)
        ],null),
        new AddCode([

        ],null),*/
    ])
]

/**

// 
# probably need to make a tutorial after this one about why spaces matter p#cool versus p #cool but encourage the user to experiment and see what works and what doesn't and what the hover preview shows
- "try to remove the p"
    - it just means any kind of element with the id "cool-label"
- or just a tutorial about nitty gritty syntax what you can and cannot do like spaces after selectors or not, spaces in between rules/values

// 
1. add id="cool-label"
2. go back to CSS and add:
p#cool-label{ // I'm putting the p there so I don't have to explain it with it later, I can just explain it without it
    background-color:lightblue;
}

3. hover over the selector (p#cool-label) to see the HTML representation of which type of elements we are wanting to modify.


 */