import * as a from "../../../src/lesson"; declare data = {board:Board};
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
                " ",
                "attr rel attr1",
                ". attr1", // = is grammer
                "str attr1", // string
                " ",
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
    new BE_GlobalBubble("Notice, &lt;link&gt; elements don't have closing tags; it doesn't make since for them to contain text because they don't display anything."),
    new BE_RemoveObj(["cir"]),
    new BE_SetOpacity(["attr1","attr2"],1),
    
    new BE_CircleObj(["attr"]).applyToObjs(o=>o.addTag("cir")),
    new BE_GlobalBubble(`Let's look at these two parts. Notice, they are within the opening tag. (Meaning they are before the ">" at the end.\ni[These are called h[attributes] and they let us add extra information to an element.]`),
    new BE_RemoveObj(["cir"]),
    new BE_GlobalBubble(`Each attribute will have some name, such as "rel" and "href" in this case, and usually have values assigned to the attributes, "stylesheet" and "style.css" in our case.`),

    new BE_Wait(300),
    new BE_SetOpacity(["attr2","tag","<>"],0.25),
    new BE_GlobalBubble(`"rel" stands for h[relationship].\nThink about it like we're linking something to this file, what's going to be the relationship between them, what's the purpose of linking them?\nIn our case here, the relationship is "stylesheet" because it's a CSS (Cascading Style Sheets) file.`),
    new BE_SetOpacity(["attr1"],0.25),
    new BE_SetOpacity(["attr2"],1),
    new BE_GlobalBubble(`"href" stands for h[hyperlink reference] but just think of it like some path to a file we want to link to, which is our style.css file we just made.`),
    
    new BE_SetOpacity(["attr1","tag","<>"],1),

];