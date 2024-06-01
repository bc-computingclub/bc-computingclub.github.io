import * as a from "../../../src/lesson"; declare data = {board:Board};
let op = 0.125; // 0.25
return [
    new BE_AddCode(null,0.5,0.5,Anchor.CENTER,Anchor.CENTER,new TypeAnim([
        ...parseCodeStr(`<$link$ $rel$=$"stylesheet"$ $href$=$"style.css"$>`,
        [
            COL.gram,
            COL.tag,
            COL.gram,
            COL.attr,
            COL.gram,
            COL.str,
            COL.gram,
            COL.attr,
            COL.gram,
            COL.str,
            COL.gram
        ],"$",(i,t)=>{
            t.obj.addTag([
                "<>",
                "tag",
                "_",
                "attr rel attr1",
                ". attr1", // = is grammer
                "str attr1", // string
                "_",
                "attr href attr2",
                ". attr2",
                "str attr2",
                "<> end"
            ][i]);
        })
    ])).finalize(data.board),
    new BE_Wait(500),
    new BE_GlobalBubble(`This line of code creates a new &lt;link&gt; element that points to our CSS file to load.\ni[Let's break down its structure.]`),
    new BE_SetOpacity(["attr1","attr2"],0),
    new BE_CircleObj(["end"]).applyToObjs(o=>{
        o.addTag("cir");
    }),
    new BE_GlobalBubble("Notice, &lt;link&gt; elements don't have closing tags; it doesn't make sense for them to contain text because they don't display anything."),
    new BE_RemoveObj(["cir"]),
    new BE_SetOpacity(["attr1","attr2"],1),
    
    new BE_UnderlineObj(["attr"]).applyToObjs(o=>o.addTag("cir")),
    new BE_GlobalBubble(`Let's look at these two parts. Notice, they are within the opening tag. (Meaning they are before the ">" at the end.\ni[These are called h[attributes] and they let us add extra information to an element.]`),
    new BE_RemoveObj(["cir"]),
    new BE_GlobalBubble(`Each attribute will have some name, such as "rel" and "href" in this case, and usually have values assigned to the attributes, "stylesheet" and "style.css" in our case.`),

    // 

    new BE_GlobalBubble(`Let's look at another example.`),
    new BE_AddCode(null,0.5,0.65,Anchor.CENTER,Anchor.CENTER,new TypeAnim([
        ...parseCodeStr(`<$button$ $id$=$"submit"$ $disabled$>$Submit$<$/$button$>`,
        [
            COL.gram,
            COL.tag,
            COL._,
            COL.attr,
            COL.gram,
            COL.str,
            COL._,
            COL.attr,
            COL.gram,
            COL.text,
            COL.gram,
            COL.text,
            COL.tag,
            COL.gram
        ],"$",(i,t)=>{
            t.obj.addTag([
                "<>",
                "tag",
                "_",
                "attr ex2-attr1",
                ". ex2-attr1", // = is grammer
                "str ex2-attr1", // string
                "_",
                "attr ex2-attr2",
                "<> end",
                "text",
                "<>",
                "/",
                "tag",
                "<>"
            ][i]);
            t.obj.addTag("ex2");
        })
    ])).finalize(data.board),
    new BE_GlobalBubble(`Here's another example of a submit button that has an id of "submit" and is disabled (it won't be clickable until enabled again).`),
    new BE_GlobalBubble(`Alright, let's look at what all these attributes do.`),

    // 

    new BE_Wait(300),
    new BE_SetOpacity(["attr2","tag","<>","ex2"],op),
    new BE_GlobalBubble(`"rel" stands for h[relationship].\nThink about it like we're linking something to this file, what's going to be the relationship between them? What's the purpose of linking them?\nIn our case here, the relationship is "stylesheet" because it's a CSS (Cascading Style Sheets) file.`),

    new BE_SetOpacity(["attr1"],op),
    new BE_SetOpacity(["attr2"],1),
    new BE_GlobalBubble(`"href" stands for h[hyperlink reference] but just think of it like some path to a file we want to link to, which is our style.css file we just made.`),

    new BE_SetOpacity(["attr2"],op),
    new BE_SetOpacity(["ex2-attr1"],1),
    new BE_GlobalBubble(`"id" is used for putting a h[unique identifier] on an element so we can find that specific element from somewhere else.`),

    new BE_SetOpacity(["ex2-attr1"],op),
    new BE_SetOpacity(["ex2-attr2"],1), 
    new BE_GlobalBubble(`Notice, there's no value set to this attribute.\ni[We're just saying the button is disabled, plain and simple.]`),
    
    new BE_SetOpacity(["attr1","tag","<>","attr2","ex2"],1),
    
    // 

    new BE_GlobalBubble(`Wrapping up, attributes are like bits of data or changes we can make and store on our elements.\ni[And keep in mind this structure for a link element because we'll use it every time we want to link a CSS file to an HTML page.]`)
];