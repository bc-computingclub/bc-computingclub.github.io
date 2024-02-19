import * as a from "../../../src/lesson";
return [
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
    ])).finalize(this.board),
    new BE_GlobalBubble(`This line adds a button to the page with "Click Me!" as the button's text.\nLet's break down it's structure.`),
    new BE_SetOpacity(["textContent","fullTag"],0,500),
    new BE_Wait(300),
    new BE_CircleObj(new MultiBORef("tagName").with((o,i)=>{
        if(i == 1) o.extraPad.l = this.board.getCharWidthInPX();
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
    new BE_GlobalBubble(`Elements need an "opening" and "closing" tag.\nWe can use a / slash in the closing tag to say we're done creating the element.`),
    new BE_RemoveObj(["circle"]),
    new BE_SetOpacity(["tagName"],1),
    new BE_Wait(250),
    new BE_GlobalBubble(`So what goes in the middle?`),

    new BE_SetOpacity(["textContent"],1),
    // vvv - use underline target bubble?
    new BE_GlobalBubble("Anything in between the opening and closing tag of the element will be used as text!")
];