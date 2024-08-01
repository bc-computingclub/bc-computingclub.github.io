import * as a from "../../../../src/lesson";
return [
    new LE_AddGBubble([
        "First, let's make our index.html file."
    ],BubbleLoc.global,[
        new AddFileTask("index.html"),
        new BubbleTask("Let's start by looking at some various text elements."),

        new AddCode([
            new CP_HTML("h1",false,false,"Heading"),
            // new CP_Wait(500),
            // new CP_Bubble("Headings just act as larger text within your page."),
        ],"Headings just act as larger text within your page."),
        new AddIgnoreCode([
            new CP_LineBelow(2)
        ]),

        new AddCode([
            new CP_HTML("p",false,false,"This is a paragraph"),
        ],"Paragraph elements are for standard text."),
        new AddIgnoreCode([
            new CP_LineBelow(2)
        ]),

        new AddCode([
            new CP_HTML("u",false,false,"This is a underlined"),
        ],"You can use the t[u] element to create underlined text."),
        new AddIgnoreCode([
            new CP_LineBelow(2)
        ]),

        new AddCode([
            new CP_HTML("b",false,false,"This is a bolded"),
        ],"You can use the t[b] element to create bolded text."),
        
        // 
        // new AddGenericCodeTask("<h1>Heading</h1>","html","Headings just act as larger text within your page."),
        // new AddTutorSideText("\n\n"),
        // new AddGenericCodeTask("<p>This is a paragraph</p>","html","Paragraph elements are for standard text."),
        // new AddTutorSideText("\n\n"),
        // new AddGenericCodeTask("<u>This is underlined</u>","html","You can use the &lt;u&gt; element to create underlined text."),
        // new AddTutorSideText("\n\n"),
        // new AddGenericCodeTask("<b>This is bolded</b>","html","You can use the &lt;b&gt; element to create bolded text."),

        new DoRefreshTask("Refresh to see how they all look.")
        // new ChangePreviewURLTask("Change the URL to our new page"),
        // new InfiniteTask()
    ]),
    new LE_AddGBubble([
        "What if we wanted to underline the &lt;h1&gt; element?",
        "Well, a nice and important thing about HTML is that you can put elements inside of other elements, like a container or wrapper around them.",
        "i[Let's wrap the &lt;u&gt; element around our &lt;h1&gt;.]"
    ],BubbleLoc.global,[
        new MoveCursorTo(1,1),
        // new AddGenericCodeTask("<u>\x08</u>","html"),
        new AddCode([
            new CP_Text("<u>"),
            new CP_MoveByX(16),
            new CP_Text("</u>"),
        ]),
        new BubbleTask("This applies the underline style to our header because everything within the &lt;u&gt; element will become underlined."),
                new AddIgnoreCode([
            new CP_LineBelow(2)
        ]),

        // new AddTutorSideText("\n\n"),
        // new AddGenericCodeTask("<u></u>\x01\x01\x01\x01\n<h3>Sub Heading</h3>\n<p>some text</p>","html","You can also put multiple elements within elements."),
        new AddCode([
            new CP_HTML("u",true,true),
            new CP_HTML("h3",false,true,"Sub Heading"),
            new CP_HTML("p",false,false,"some text"),
        ],"You can also put multiple elements within elements."),
        new AddIgnoreCode([new CP_MoveByY(1),new CP_LineBelow(2)]),
        // new AddTutorSideText("\x04\n\n"),
        // new AddGenericCodeTask("<div></div>\x01\x01\x01\x01\x01\x01\n<h3>Sub Heading</h3>\n<p>some text</p>","html","Div elements are often used as generic containers around elements."),
        new AddCode([
            new CP_HTML("div",true,true),
            new CP_HTML("h3",false,true,"Sub Heading"),
            new CP_HTML("p",false,false,"some text"),
        ],"&lt;div&gt; elements are often used as generic containers around elements because they don't add any extra styling.\nThey're just a container for whatever elements or text are inside."),
        
        // new AddTutorSideText("\x04\n\n"),
        new AddIgnoreCode([new CP_MoveBy(0,1),new CP_LineBelow(2)]),
        new InstructTask("Try to use a &lt;div&gt; element to make a container of two buttons"),
        // new AddGenericCodeTask("<div></div>\x01\x01\x01\x01\x01\x01\n<button>First</button>\n<button>Second</button>","html",null,false),
        new AddCode([
            new CP_HTML("div",true,true),
            new CP_HTML("button",false,true,"First"),
            new CP_HTML("button",false,false,"Second"),
        ],null)
    ]),
    new LE_AddGBubble([
        "Nice!, so sure, we can nest elements within each other, but what's the point?"
    ]),
    new LE_AddGBubble([
        "Ultimately it's for better organization of our page which will become extremely important for tutorials and projects down the road.",
        "i[So now, let's build the basic html structure that every page should have.]"
    ],BubbleLoc.global,[
        new AddFileTask("page2.html"),
        new ChangePreviewURLTask("Change the preview to display our page2.html file","page2.html"),

        // new AddGenericCodeTask("<html></html>\x01\x01\x01\x01\x01\x01\x01\n","html"),
        new AddCode([
            new CP_HTML("html",true,true)
        ],null),
        new BubbleTask("The t[html] element contains everything in our whole html page"),
        // new AddGenericCodeTask("<head></head>\x01\x01\x01\x01\x01\x01\x01\n\x04","html","This element will hold everything in our whole html page"),
        new AddCode([
            new CP_HTML("head",true,true)
        ],null),
        new BubbleTask("The t[head] element contains elements that hold information like the title of our site, it's icon, and external CSS files which let us style our page."),
        new AddCode([
            new CP_HTML("title",false,false,"Page 2")
        ],null),
        // new AddGenericCodeTask("<body></body>\x01\x01\x01\x01\x01\x01\x01\n","html","This will hold elements that hold information like the title of our site, it's icon, and external css files which let us style our page"),
        new AddIgnoreCode([new CP_MoveByY(1),new CP_LineBelow(1)]),
        new AddCode([
            new CP_HTML("body",true,true)
        ],null),
        new BubbleTask("The body is where all of your elements that actually make up the physical page go, as well as JavaScript files that we'll use to control these."),

        new BubbleTask("If this seems like a lot of information, it is, but don't worry we'll be using it in every web tutorial from now on so there will be ways to practice."),

        new AddCode([
            new CP_HTML("h1",false,false,"Welcome!")
        ],null),

        new AddFileTask("page3.html"),
        new ChangePreviewURLTask("Change the preview to display our page3.html file","page3.html"),
        new MoveCursorTo(1,1),
        new InstructTask("Test yourself to see how much you can remember of the basic structure of an HTML page, and if you remember it all, try to add a Header 1 and a button to the page as well.\n(feel free to look back at page2.html but I encourage you to challenge yourself)"),

        new AddCode([
            new CP_HTML("html",true,true),
            new CP_HTML("head",true,true),
            new CP_HTML("title",false,false,"Page 3"),
            new CP_MoveByY(1),
            new CP_LineBelow(),
            new CP_HTML("body",true,true),
            new CP_HTML("h1",false,true,"Welcome!"),
            new CP_HTML("button",false,false,"Start")
        ],null),
        // new AddGenericCodeTask("<html></html>\x01\x01\x01\x01\x01\x01\x01\n<head></head>\x01\x01\x01\x01\x01\x01\x01\n","html",null,false),
        // new AddGenericCodeTask("<html></html>\x01\x01\x01\x01\x01\x01\x01\n<head></head>\x01\x01\x01\x01\x01\x01\x01\n\x04\x08\n<body></body>\x01\x01\x01\x01\x01\x01\x01\n<h1>Welcome!</h1>\n<button>Start</button>","html",null,false)
        // new AddGenericCodeTask("<html>\n\t<head>\n</head>\n<body>\n<h1>Welcome!</h1>\n<button>Start</button></body></html>","html",null,false)
        // new AddCode([
        //     new CP_HTML("html",true,true),
        //     new CP_HTML("head",true,true),
        //     new CP_MoveBy(0,1),
        //     new CP_Text("\n"),
        //     new CP_HTML("body",true,true),
        //     new CP_HTML("h1",false,true,"Welcome!"),
        //     new CP_HTML("button",false,false,"Start")
        // ])
    ]),
    new LE_AddGBubble([
        "Nice Job! Remember, if you're finding it hard to remember the structure, in time you'll know it by heart since we'll use it in every web tutorial from now on.",
        "In the next tutorial we will look at adding an external CSS file to stylize our html page."
    ])
]