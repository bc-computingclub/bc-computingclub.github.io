import * as a from "../../../src/lesson";
return [
    new LE_AddGBubble([
        "Hello!",
        "In order to do anything, we first need to create an HTML document."
    ],BubbleLoc.global,[
        new AddFileTask("index.html",false)
    ]),
    new LE_AddGBubble([
        "Cool! Now you have an HTML document!",
        'Note: Using the name "index" for our file name means the browser will automatically pick this page when someone tries to go to your site!',
        "i[So what even is an HTML document and what can we do with it?]"
    ],BubbleLoc.global,[]),
    new LE_AddGBubble([
        "An HTML document defines what is h[in the page.] is is make up of pieces called elements.",
        "For example, this is where you would put b[buttons, text, and images.] which will be elements in our page.",
        "i[Let's try adding a some text.]"
    ],BubbleLoc.global,[
        // new AddGenericCodeTask("<button>\x05\x05Click Me!\x05\x05</button>\x05\x01\x01\x05","html"),
        new AddGenericCodeTask("<h1>Welcome</h1>"),
        new DoRefreshTask("Refresh the preview to see how it looks.","Refresh the preview"),
        new BubbleTask(`b[&lt;h1&gt;] stands for "Header 1" and is the largest of the built in headers you can use. h2, h3, h4, and so on are often used for sub headers.`),
        
        new AddTutorSideText("\n\n"),
        new AddGenericCodeTask("<button>Click Me!</button>","html","Let's add a button here"),
        new DoRefreshTask("Refresh the preview to see how the button looks.","Refresh the preview"),

        new PonderBoardTask("board0","Alright, let's look a little closer at all this."),

        new BubbleTask("Adding more buttons is as easy as adding them on another line."),
        new AddTutorSideText("\n",""),
        new AddGenericCodeTask("<button>Or Click Me!</button>","html",null,false),

        new AddTutorSideText("\n\n",""),
        new InstructTask(`i[Try to add 2 more buttons to the page]\nOne with the text "Button Three" and the other with the text "Button Four".`),
        new AddGenericCodeTask(`<button>Button Three</button>\n<button>Button Four</button>`,"html",null,false),
        
        new MoveCursorTo(3,27),
        new AddGenericCodeTask("<button>In the middle</button>","html","It doesn't matter how you layout elements in your HTML file, they just get read in order.",true,null,null,"left"),

//         new AddTutorSideText("\n\n","Add some space"),
//         new AddGenericCodeTask(`<button>Click</button>

// <div></div>\x01\x01\x01\x01\x01\x01
// <h1>Test</h1>
// <p>Test paragrph</p>`,"html"),
//         new AddFileTask("main.js",false),
//         new AddGenericCodeTask('alert("hi");',"javascript"),
//         new AddTutorSideText("\n\n","Add some space"),
//         new AddGenericCodeTask('alert("hi");',"javascript"),
    ]),
    new LE_AddGBubble([
        "As we can see, no matter how we write the HTML code, our buttons will always be placed side-by-side.",
        "i[Let's make them stack vertically.]"
    ],BubbleLoc.global,[
        new MoveCursorTo(3,27),
        new BubbleTask("First let's tidy up our code a bit."),
        new AddTutorSideText("\n"),
        new MoveCursorTo(6,27),
        new AddTutorSideText("\x06"),
        new MoveCursorTo(3,27),
        new AddGenericCodeTask("\n<br>","html","To do this we'll use the &lt;br&gt; element which stands for i[break], as in line break and can be used to force elements to go onto a new line.\nb[Note: the &lt;br&gt; element doesn't have a closing tag because it doesn't display any text.]"),
        new DoRefreshTask("Check out what this does to the layout."),

        new MoveCursorTo(5,31),
        new AddGenericCodeTask("\n<br>\x04\x08\n<br>\x04\x08\n<br>","html","Now let's add it to the rest so that each button is on its own line by putting a break between each one."),
        new DoRefreshTask("All the buttons should now be stacked vertically."),
    ]),
    new LE_AddGBubble([
        // "Next time we'll look at some simple styling, or adjusting how the elements look."
        "Next time we'll take a look at structuring HTML elements within your page."
    ],BubbleLoc.global,[])
];