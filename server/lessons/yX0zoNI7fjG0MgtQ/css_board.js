import * as a from "../../../src/lesson"; declare data = {board:Board};
let x = 0.125;
let yOff = 0.1;
return [
    new BE_AddCode(null,x,0.35+yOff,Anchor.START,Anchor.CENTER,new TypeAnim([
        ...parseCodeStr("body$ ${",[2,0,0],"$",(i,t)=>{
            t.obj.addTag([
                "selector",
                " ",
                "{}"
            ][i]);
        })
    ])).finalize(data.board),
    new BE_AddCode(null,x,0.425+yOff,Anchor.START,Anchor.CENTER,new TypeAnim([
        ...parseCodeStr("    $background-color$: $darkcyan$;",[0,3,0,4,0],"$",(i,t)=>{
            t.obj.addTag([
                " ",
                "style1",
                ".",
                "val1",
                "."
            ][i]);
        })
    ])).finalize(data.board),
    new BE_AddCode(null,x,0.5+yOff,Anchor.START,Anchor.CENTER,new TypeAnim([
        ...parseCodeStr("}",[0],"$",(i,t)=>{
            t.obj.addTag([
                "{}"
            ][i]);
        })
    ])).finalize(data.board),

    new BE_GlobalBubble(`This code changes the background color of the body of our page to darkcyan.\nLet's break down it's structure.`),
    new BE_SetOpacity([".","style1","val1"],0),
    new BE_Wait(300),
    new BE_CircleObj(["selector"]).applyToObjs(o=>{
        o.addTag("_circle");
    }),
    new BE_GlobalBubble(`The first part is called the h[selector.]\nIt specifies the type of elements we want to change here, and in this example we want to select our body element.`),
    new BE_RemoveObj(["_circle"]),
    new BE_SetOpacity(["selector",0]),
    new BE_GlobalBubble(`Everything within these curly braces will be the i["styles"] that we add to those elements.`),
    new BE_SetOpacity([".","style1","val1"],1),
    new BE_GlobalBubble(`All styles follow the same pattern starting with the name of the style property you want, a colon (:), the value you want to change the style to, and then a semicolon (;).\ni[name: value;]`),
    new BE_GlobalBubble(`The selector along with it's properties is called a h[Style Set], because it contains a set of properties or styles.`),
    // new BE_GlobalBubble(`This is the basic structure of `),

    new BE_GlobalBubble(`We'll look more into the power of CSS in later tutorials.`)

    // new BE_GlobalBubble(`Let's look at another example.`),
    // new BE_RemoveObj(["selector","{}","."," ","style1","val1"]),

    // new BE_Wait(300),
    // new BE_AddCode(null,x,0.35+yOff,Anchor.START,Anchor.CENTER,new TypeAnim([
    //     ...parseCodeStr("p$ ${",[2,0,0],"$",(i,t)=>{
    //         t.obj.addTag([
    //             "selector",
    //             "{}"
    //         ]);
    //     })
    // ])).finalize(data.board),
    // new BE_AddCode(null,x,0.425+yOff,Anchor.START,Anchor.CENTER,new TypeAnim([
    //     ...parseCodeStr("    $background-color$: $darkcyan$;",[0,3,0,4,0],"$",(i,t)=>{
    //         t.obj.addTag([
    //             " ",
    //             "style1",
    //             ".",
    //             "val1",
    //             "."
    //         ]);
    //     })
    // ])).finalize(data.board),
    // new BE_AddCode(null,x,0.5+yOff,Anchor.START,Anchor.CENTER,new TypeAnim([
    //     ...parseCodeStr("    $font-size$: $32px$;",[0,3,0,4,0],"$",(i,t)=>{
    //         t.obj.addTag([
    //             " ",
    //             "style1",
    //             ".",
    //             "val1",
    //             "."
    //         ]);
    //     })
    // ])).finalize(data.board),
    // new BE_AddCode(null,x,0.575+yOff,Anchor.START,Anchor.CENTER,new TypeAnim([
    //     ...parseCodeStr("}",[0],"$",(i,t)=>{
    //         t.obj.addTag([
    //             "{}"
    //         ]);
    //     })
    // ])).finalize(data.board),
];

let other = [
    new BE_AddCode(null,0.5,0.5,Anchor.CENTER,Anchor.CENTER,new TypeAnim([
        ...parseCodeStr("<$button$>$         $<$/$button$>",[0,2,0,3,0,3,2,0],"$",(i,t)=>{
            t.obj.addTag([
                "<>",
                "tagName fullTag",
                "<>",
                "textContent",
                "<>",
                "closingTagMark fullTag",
                "tagName fullTag closingTagName",
                "<>"
            ][i]);
        }),
        new TA_Wait(500),
        new TA_Move(-18,0),
        new TA_ReplaceText("textContent","Click Me!",3)
    ])).finalize(data.board),
    new BE_GlobalBubble(`This line adds a button to the page with "Click Me!" as the button's text.\nLet's break down it's structure.`),
    new BE_SetOpacity(["textContent","fullTag"],0,500),
    new BE_Wait(300),
    new BE_CircleObj(new MultiBORef("tagName").with((o,i)=>{
        if(i == 1) o.extraPad.l = data.board.getCharWidthInPX();
    })).applyToObjs(o=>{
        console.log("AFTER APPLY",o);
        o.addTag("<>_circle");
    }),
    new BE_GlobalBubble(`Notice, we have two groups here.\nTwo sets of "< >"\nThese symbols are called angle brackets.\n`),
    new BE_GlobalBubble(`i[NOTE: This is similar to how you would call $$SB as square brackets, { } as curly braces, and ( ) as parenthesis.]\nAngle Brackets are just grouping symbols like: < some text >`),
    new BE_GlobalBubble(`So what are they even grouping here?`),
    new BE_RemoveObj(["<>_circle"]),
    new BE_SetOpacity(new MultiBORef("fullTag"),1),
    new BE_GlobalBubble(`In HTML, we use angle brackets to specify what type of element we want in our page.\nFor example, a button!`),

    // vvv - use underline target bubble?
    new BE_GlobalBubble(`Did you notice something special about the second group of angle brackets?\nLet's hide the tag names.`),
    new BE_SetOpacity(new MultiBORef("tagName"),0),
    new BE_Wait(500),
    new BE_CircleObj(["closingTagMark"]).applyToObjs(o=>o.addTag("circle")),
    // new BE_GlobalBubble(`Most elements in HTML need an "opening tag" and a "closing tag".\nThe opening tag is just the tag name (button) surrounded by angle brackets.\nThe closing tag is the same thing but there's a / (slash) just before the tag name.`),
    new BE_GlobalBubble(`Elements start with an h[opening tag] and end with a h[closing tag].\nWe use a / slash in the closing tag to mark that it's the end of the element.`),
    new BE_RemoveObj(["circle"]),
    new BE_SetOpacity(["tagName"],1),
    new BE_Wait(250),
    new BE_GlobalBubble(`So what goes in the middle?`),

    new BE_SetOpacity(["textContent"],1),
    // vvv - use underline target bubble?
    new BE_GlobalBubble("Anything in between the opening and closing tag of the element will be used as text on it!")
];