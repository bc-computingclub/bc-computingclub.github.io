import * as a from "../../../../src/lesson";
return [
    new LE_AddGBubble([
        "Hello!",
        "Let's do this."
    ],BubbleLoc.global),
    new LE_AddGBubble([
        "Let's start by setting up our index.html file."
        // "In this tutorial we'll look at how to setup a basic particle simulator which will be the basis or core that we'll start out with for all other particle simulators."
    ],BubbleLoc.global,[
        new AddFileTask("index.html"),
        new MoveCursorTo(1,1), // just in case
        new AddCode([
            new CP_HTML("html",true,true),
            new CP_HTML("head",true,true),
            new CP_HTML("title",false,false,"Particle Sim 1.0"),
            new CP_Wait(350),
            new CP_MoveBy(0,1,true),
            // new CP_Wait(500),
            new CP_LineBelow(1),
            // new CP_Wait(500),
            // new CP_EnsureIndent(1), // not sure if we need this
            new CP_HTML("body",true,true),
        ])
    ]),
    new LE_AddGBubble([
        "Now that we have our page set up, we need something that will display our particles."
    ]),
    new LE_AddGBubble([
        "We're going to use the b[HTML Canvas] here which is like a blank image we can draw other images, lines, and pixels onto.",
        "i[Let's add a canvas to our document.]"
    ],BubbleLoc.global,[
        new AddCode([
            new CP_HTML("canvas",false,false,undefined,{
                attr:{
                    id:"can"
                }
            }),
            new CP_Bubble("I like to give mine an id of \"can\" but you can use whatever you like.")
        ]),
        new DoRefreshTask("Now if you refresh you won't see anything different but our canvas is still there.\ni[Let's set up our CSS so we can see where the canvas is.]"),

        // init CSS
        new AddFileTask("style.css"),
        new SwitchFileTask("index.html","Let's link our CSS file to our document real quick."),
        new MoveCursorTo(3,9),
        new AddCode([
            new CP_LineBelow(1),
            new CP_HTML("link",false,false,null,{
                attr:{
                    rel:"stylesheet",
                    href:"style.css"
                },
                noClosingTag:true
            })
        ],null),
        
        new SwitchFileTask("style.css"),
        new AddCode([
            new CP_CSS("#can",{
                border:"solid 1px gray"
            })
        ],"Let's add some styling to our canvas."),

        new DoRefreshTask("Refresh to see how it looks.")
    ]),
    new LE_AddGBubble([
        "Hmm, so the canvas is pretty small by default.",
        "i[Let's make it fill up the page.]"
    ],BubbleLoc.global,[
        new AddCode([
            new CP_LineBelow(1),
            new CP_EnsureIndent(1),
            new CP_StyleRule("width","100%")
        ])
    ]),
    new LE_AddGBubble([
        "Alright let's get to the JavaScript good stuff."
    ],BubbleLoc.global,[
        new AddFileTask("main.js"),
        new SwitchFileTask("index.html","Let's go link this script to our page as well."),
        new MoveCursorTo(7,9),
        new AddCode([
            new CP_LineBelow(1),
            new CP_HTML("script",false,false,null,{
                attr:{
                    src:"main.js"
                }
            })
        ],null),
        
        new SwitchFileTask("main.js"),
        new AddCode([
            new CP_Text(`let canvas = document.getElementById("can");`),
            new CP_LineBelow(2),
            
            new CP_Bubble("Let's alert the current dimensions of our canvas to see what we're working with."),
            new CP_Text(`alert(canvas.width);`),
            new CP_Bubble("Hmm, before we finish this let's fix our types."),
            new CP_Bubble(`Did you notice?\nWhen typing b["canvas.width"] there wasn't any autocomplete?`),
            new CP_Bubble(`This is because the editor doesn't know that our variable b["canvas"] is actually an HTML Canvas Element.\ni[Let's check what type it is.]`),

            new CP_MoveTo(8,1),
            new CP_ShowHover()
        ],"Alright, let's get a reference to our canvas so we can start using it."),
        new AddCode([
            new CP_Wait(500),
            
            new CP_Bubble(`This shows that it thinks it's just a standard b["HTMLElement"] which doesn't have a width or height property on it like the HTML Canvas does.\ni[Let's fix that.]`),
            new CP_LineAbove(1),
            new CP_Text(`/**@type {HTMLCanvasElement}`), // rest is auto completed
        ],null),
        new AddCode([
            new CP_Bubble("Now let's see what type it is."),
            new CP_MoveTo(8,2),
            new CP_ShowHover()
        ],null),
        new AddCode([
            new CP_Bubble("Okay, let's finish that alert statement."),
            new CP_MoveTo(19,4),
            new CP_Delete(6),
            new CP_Wait(50),
            new CP_Text("."),
            new CP_Wait(50),
            new CP_Text("width"),
            new CP_Wait(300),
            new CP_Text(` + " x " + canvas.height`)
        ],null),
        
        new DoRefreshTask("Alright let's see what our canvas dimensions are.")
    ]),
    new LE_AddGBubble([
        "In order to draw anything on the canvas we need to make a i[b[\"context\"]] which we usually abbriviate with h[\"ctx\"].",
        "i[Let's comment out our alert and create a b[\"ctx\"] and draw a rectangle in the top left corner to make sure it works."
    ],BubbleLoc.global,[
        new AddCode([
            new CP_Wait(500),
            new CP_Comment(), // comment out the alert
            new CP_LineAbove(1),
            
            new CP_MoveTo(1,2),
            new CP_LineBelow(1),
            new CP_Text(`let ctx = can.getContext("2d");`),
            new CP_LineBelow(2),
            new CP_Text(`ctx.fillRect(0,0,canvas.width/2,canvas.height/2)`),
        ],null),

        new DoRefreshTask("Refresh"),
        
    ])
]

/**
 * in the js file I need to make a thing where you get the can and then hover over can and show that it's type is labeled as "Element" and then do let ctx = can.getContext and stop and say how we need to use this method but it doesn't exist on type "Element" so we need to tell it that can is an "HTMLCanvasElement" and also hover over ctx and show that it doesn't know what type it is so it puts "any".
 * 
 * - Go back up and put the JSDoc type on there and then hover again to show that now it has the correct type
 * - now go back down delete ".getContext" and start again and now the method is there and complete it out, and then finally hover over ctx which should say "CanvasRenderingContext2D".
 * 
 * - if you think this is a lot of unecessary work, just delete the type annotation and try to use ctx through this tutorial without auto-complete.
 */