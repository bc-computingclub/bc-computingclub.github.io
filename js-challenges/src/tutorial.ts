console.log("Loading tutorials...");

showMainCont();

async function testStartOnLoad(){
    currentFile = await createCodeFile("","js","TestFile.js");
    
    if(false) executeActions(currentFile,[
        // new ActionText("// Line 1\n"),
        // new ActionText("// Line 3\n"),
        // new ActionText("// Line 4\n"),
        // new ActionMoveRel(""),
        // new ActionMoveRel("uu\n"),
        // new ActionText("// Line 2")

        new ActionText("// this is the start of the file\n"),
        new ActionText(`
function start(){

}`
        ),
        new ActionMoveRel("uu"),

        new ActionIndent("set",1),

        new ActionText('\nconsole.log("hello");'),
        new ActionText('\n\nconsole.log("hello");'),
        new ActionComment('\n// test comment'),
        new ActionText('\n\nlet a = 123;'),

        new ActionText(`
if(true){
}`
        ),
        new ActionMoveRel("u\n"),
        new ActionIndent("add",1),
        new ActionText('console.log("inside");'),
        new ActionText('\nconsole.log("inside 2");'),
        
    ]);

    else if(false) executeActions(currentFile,[
        // new ActionText("// Line 1\n"),
        // new ActionText("// Line 3\n"),
        // new ActionText("// Line 4\n"),
        // new ActionMoveRel(""),
        // new ActionMoveRel("uu\n"),
        // new ActionText("// Line 2")

        new ActionText("// this is the start of the file\n"),
        new ActionText(`
function start(){

}`
        ),
        new ActionMoveRel("uu"),

        new ActionIndent("set",1),

        new ActionText('\nconsole.log("hello");'),
        new ActionText('\n\nconsole.log("hello");'),
        new ActionComment('\n// test comment'),
        new ActionText('\n\nlet a = 123;'),

        new ActionText(`
if(true){
}`
        ),
        new ActionMoveRel("u\n"),
        new ActionIndent("add",1),
        new ActionText('console.log("inside");'),
        new ActionText('\nconsole.log("inside 2");'),
        
    ]);
    else executeActions(currentFile,[
        new ActionText("// start of file"),
        new ActionText("\n// start of file"),
        new ActionText("\n// start of file"),
        new ActionText("\n// start of file"),
        new ActionText("\n// start of file"),
        new ActionText("\n// start of file"),
    ]);
}
testStartOnLoad();