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
        // new AddCode([
        //     new CP_CSS("p",{
        //         "font-size":"32px"
        //     })
        // ],"How about making the text twice as large? The default size of text is 16px (pixels) so let's change it to 32px."),
        new AddCode([
            new CP_CSS("p",{
                "background-color":"yellow"
            })
        ],"What if we put a background color on t[p] elements?"),
        // ],"How about changing the background-color of the paragraph element itself, like a highlight?"),
        new DoRefreshTask("Refresh to see how this changes our page."),
    ]),
    new LE_AddGBubble([
        "Wait, it applied to all of them?"
    ],BubbleLoc.global,[
        new AddIgnoreCode([
            // new CP_Select(5,4,5,1)
            new CP_MoveTo(0,5),
            // new CP_EditorAction(actions=>actions.moveByX.name,[3,true,false]) // SELECT is buggy right now because is the user clicks to deselect it it could affect the tutor, well only if the tutor types without deselecting
            new CP_MoveByX(3,true,false)
        ]),
        new BubbleTask(`Note, this says that we want<br>h[ALL paragraph elements] on our page to have a background color of yellow.`,undefined,undefined,"left"),
        new BubbleTask("CSS is applied to ALL elements in your page as long as they match the selector.\nIn our case, we'll selecting all t[p] elements, so all of them will be changed to have the styles we specified here."),
        // new AddIgnoreCode([
        //     new CP_CancelSelection()
        // ]),
        new T_CancelSelection(),

        new AddIgnoreCode([
            new CP_MoveByY(1),
            new CP_LineBelow(1)
        ]),
        new BubbleTask("Alright, let's look at some other styles."),
        new BubbleTask("i[I encourage you to refresh after each line added to see how it affects the page.]"),
        new AddCode([
            new CP_StyleRule("font-size","32px"),
        ],"We can change the font size of the text.\ni[16px (16 pixels) is the default size.]"),
        new AddCode([
            new CP_LineBelow(1),
            new CP_StyleRule("color","tomato")
        ],"We can also change the text color."),
        // new AddCode([
        //     new CP_LineBelow(1),
        //     new CP_StyleRule("background-color:yellow;")
        // ],"We can change the background-color of the paragraph element itself, like a highlight."),
        new AddCode([
            new CP_LineBelow(1),
            new CP_StyleRule("font-style","italic"),
            new CP_LineBelow(1),
            new CP_StyleRule("font-weight","bold")
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
            new CP_Text(` id="cool-text"`)
        ],null),
        new SwitchFileTask("style.css"),
        new MoveCursorTo(12,1),
        new AddCode([
            new CP_LineBelow(2),
            new CP_Bubble(`Let's add a new styleset here to customize our "cool-text" element.`),
            new CP_CSS("p#cool-text",{
                "background-color":"lightblue"
            })
        ],null),
        new MoveCursorTo(13,5),
        new BubbleTask("Hover over the selector \"p#cool-text\" to see what it's trying to match."),
        new ShowHoverTask(),
        new DoRefreshTask("If you refresh, only our 3rd paragraph element should have the lightblue background color."),

        // 
        new AddCode([
            new CP_MoveByY(2),
            new CP_LineBelow(2),
            new CP_CSS("#cool-text",{
                "color":"navy"
            }),
            // 
            new CP_MoveByY(1),
            new CP_LineBelow(2),
            new CP_CSS("p #cool-text",{
                "font-size":"60px"
            }),
            // 
            // new CP_MoveByY(1),
            // new CP_LineBelow(2),
            // new CP_CSS("p# cool-text",{
            //     "font-size":"10px"
            // })
        ],"Alright, so let's look at some variations of this."),
        new BubbleTask("Look closely at all of these and hover over the selectors to see how they differ.\ni[Type them in your editor too to see if they work or not!]",undefined,undefined,"top"),

        new AddIgnoreCode([
            new CP_MoveTo(8,17),
            new CP_ShowHover(),
            new CP_Bubble("This one has the same selector as the original but doesn't have the \"p\"."),
            new CP_Bubble("All this means is we want to select all elements that have the id of<br>\"cool-text\"."),
            new CP_Bubble(`There's no restriction on what type of element it has to be, so if you had:\nt[h1 id=\"cool-text\"]<br>or<br>t[p id=\"cool-text\"]\neither element would have those styles applied to it.]`)
        ]),

        new AddIgnoreCode([
            new CP_MoveTo(8,21),
            new CP_ShowHover(),
            new CP_Bubble("This one's selector is the same as the first but there is a space between p and <br>#cool-label."),
            new CP_Bubble("This means select all elements that have the id \"cool-text\" that is a child of (or is inside of) a t[p] element."),
            new CP_Bubble("We have an element with id of \"cool-text\", but it is inside our t[body] and t[html] elements, not another t[p] element.\ni[Since it doesn't satisfy the condition, the font-size of 60px is NOT applied.]")
            // new CP_Bubble("In our example we have a t[p] element with the id of \"cool-text\" and is only inside of our t[body] and t[html] elements.\ni[Since our element doesn't satisfy the condition, the font-size of 60px is NOT applied.]")
        ]),

        new AddCode([
            // new CP_MoveTo(3,21),
            new CP_MoveByX(-2,false,true),
            new CP_Wait(500),
            new CP_Delete(1)
        ],"Let's remove the space."),
        new DoRefreshTask("Now if you refresh, our third paragraph element should be large."),
        new BubbleTask("So this shows that we can have two different rule sets that both have the same selector.\n"),

        // 
        new AddCode([
            // new CP_MoveByY(1),
            // new CP_MoveByX(3),
            // new CP_End(true),
            // new CP_Wait(300),
            // new CP_Cut(),
            // new CP_Wait(500),
            // new CP_MoveByY(-1),
            // new CP_DeleteLines(2),
            // new CP_MoveTo(1,15),
            // new CP_LineAbove(1),
            // new CP_Delete2(1,false,true),
            // new CP_Paste(),

            // // new CP_MoveTo(7,20),
            // new CP_MoveByY(3),
            // new CP_MoveByX(3),
            // new CP_End(true),
            // new CP_Wait(300),
            // new CP_Cut(),
            // new CP_Wait(500),
            // new CP_MoveByY(-1),
            // new CP_DeleteLines(2),
            // new CP_MoveTo(1,16),
            // new CP_LineAbove(1),
            // new CP_Delete2(1,false,true),
            // new CP_Paste(),

            // ^^^ this works TT but is hard for the user to follow so might as well just type it out
            new CP_Wait(500),
            new CP_Select(17,1,23,2),
            new CP_Wait(300),
            new CP_Delete2(3),
            // new CP_DeleteLines(3),
            // new CP_Wait(300),
            // new CP_DeleteLines(1),
            // new CP_Wait(300),
            // new CP_DeleteLines(3),
            new CP_Wait(300),
            new CP_LineAbove(),
            new CP_StyleRule("color","navy"),
            new CP_LineBelow(),
            new CP_StyleRule("font-size","60px")
        ],"But, even though we i[can] do this, it's better not to because it's less organized."),
        
        new AddCode([
            new CP_Comment()            
        ],"I'm going to disable this so all our text will be the same size."),

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
    ]),

    // classes!
    new LE_AddGBubble([
        "Alright, so IDs can give us some control with selecting i[specific] elements, but what if we wanted to apply styling to a group or set of elements?"
    ],BubbleLoc.global,[]),
    new LE_AddGBubble([
        `We can use the h[class attribute] to achieve this.`,
        `Recall, IDs are unique so if you already have an element with the id "button1" in your page, then you can't have another one with that same id.`,
        `But with classes, i[multiple elements can have the same class, and we can add multiple classes onto each of those elements.]`
    ],BubbleLoc.global,[]),
    new LE_AddGBubble([
        `CSS classes can be extremely powerful and useful for creating i[reusable and consistent] styling in our page.`,
        `This topic is way too large to cover in one lesson, but we'll continue to build and dabble with them for many lessons down the road as well as using them extensively for more complicated projects.`,
    ],BubbleLoc.global,[]),
    new LE_AddGBubble([
        "Let's start out with a simple example.",
        `What if we wanted to indent our "Text Two" and "Text Three" elements?`,
        "i[Let's do this using CSS classes.]"
    ],BubbleLoc.global,[
        new AddCode([
            new CP_MoveTo(1,17),
            new CP_LineBelow(2),
            new CP_CSS(".indent",{
                "margin-left":"40px"
            })
        ],"Let's first define what our indent styling will look like."),
        // new BubbleTask(`So we can write the name to select element types:<br>p for t[p]\nUsing a "#" to specify id:<br>#text1 for t[element id="text1"]\nUsing a "." to specify class:<br>.text2 for t[element class="text2"]`),

        new AddIgnoreCode([
            new CP_MoveByY(-1),
            new CP_MoveByX(-2),
            new CP_ShowHover(),
            new CP_Bubble(`This means we want any element that<br>h[has the class indent].\nMeaning that the element can have other classes on it, but if it at least has "indent" on it then it matches the selector and the style will be applied.`),
        ]),
        
        new BubbleTask(`So,\np selects t[p]<br>#text1 selects t[element id="text1"]<br>.text2 selects t[element class="text2"]\ni[Also keep in mind these are<br>h[case sensitive] which means that .text2 is NOT the same thing as .Text2]`),
        new BubbleTask("We can also chain these together like we did with \"p#cool-text\" but we'll look at that more in later lessons."),

        // 
        new SwitchFileTask("index.html","Alright let's add this class to our elements."),
        new AddIgnoreCode([
            new CP_MoveTo(11,8),
        ]),
        new AddCode([
            new CP_Text(' class="indent"')
        ]),
        new BubbleTask("Note, it doesn't matter what order the attributes come in so it doesn't matter if you type id or class first."),

        new BubbleTask("We won't use it for this lesson, but if you wanted multiple classes you separate them by spaces.\ni[For example if we had another class \".text2\"...]"),
        new AddCode([
            new CP_MoveByY(-1),
            new CP_Home(),
            new CP_MoveByX(2),
            new CP_Text(` class="indent text2"`)
        ],null),

        new DoRefreshTask("Our second and third paragraph elements should be indented in now."),

        new BubbleTask("I forgot to mention before, but if you hover over the different element tag names or attributes, it'll show a description about them as well as provide a link to learn more."),
        new AddCode([
            new CP_MoveByX(-6,false,true),
            new CP_ShowHover()
        ],null),

        // last bit
        new SwitchFileTask("style.css","Let's see what happens when we change how large the indent is."),
        new AddCode([
            new CP_MoveTo(17,20),
            new CP_End(),
            new CP_Wait(300),
            new CP_Delete2(5),
            new CP_Wait(300),
            new CP_Text("150px;"),
            new CP_Bubble("Feel free to change the indent size to whatever you like!\nThis value represents how far away the element should be pushed away from the left edge in pixels.\n(and negative values are allowed)")
        ],null)
    ]),
    
    // wrapping up
    new LE_AddGBubble([
        "Wrapping up, in this lesson we introduced what CSS IDs and classes are and simple examples of how to use them.",
        `We also saw some new CSS styling rules including "font-size", "color", "font-style", and "font-weight".`,
        "CSS can be a very powerful tool and we hope you enjoy it as much as we do!",
        "See you in the next one 👋"
    ],BubbleLoc.global,[])
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