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
        "An HTML document defines what is h[in the page.]",
        "For example, this is where you would put b[buttons, text, and images.]",
        "i[Let's try adding a button.]"
    ],BubbleLoc.global,[
        // new AddGenericCodeTask("<button>\x05\x05Click Me!\x05\x05</button>\x05\x01\x01\x05","html"),
        new AddGenericCodeTask("<button>Click Me!</button>","html"),
        new DoRefreshTask("Refresh the preview to see how it looks.","Refresh the preview"),
        new PonderBoardTask("board0","Alright, let's look a little closer at this."),

        new AddTutorSideText("\n\n","Add some space"),
        new AddGenericCodeTask(`<button>Click</button>

<div></div>\x01\x01\x01\x01\x01\x01
<h1>Test</h1>
<p>Test paragrph</p>`,"html"),
        new AddFileTask("main.js",false),
        new AddGenericCodeTask('alert("hi");',"javascript"),
        new AddTutorSideText("\n\n","Add some space"),
        new AddGenericCodeTask('alert("hi");',"javascript"),
    ]),
    new LE_AddGBubble([
        "Awesome!"
    ],BubbleLoc.global,[])
];