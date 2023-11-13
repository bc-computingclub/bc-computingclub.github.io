var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
console.log("Loading tutorials...");
showMainCont();
function testStartOnLoad() {
    return __awaiter(this, void 0, void 0, function* () {
        currentFile = yield createCodeFile("", "js", "TestFile.js");
        if (false)
            executeActions(currentFile, [
                // new ActionText("// Line 1\n"),
                // new ActionText("// Line 3\n"),
                // new ActionText("// Line 4\n"),
                // new ActionMoveRel(""),
                // new ActionMoveRel("uu\n"),
                // new ActionText("// Line 2")
                new ActionText("// this is the start of the file\n"),
                new ActionText(`
function start(){

}`),
                new ActionMoveRel("uu"),
                new ActionIndent("set", 1),
                new ActionText('\nconsole.log("hello");'),
                new ActionText('\n\nconsole.log("hello");'),
                new ActionComment('\n// test comment'),
                new ActionText('\n\nlet a = 123;'),
                new ActionText(`
if(true){
}`),
                new ActionMoveRel("u\n"),
                new ActionIndent("add", 1),
                new ActionText('console.log("inside");'),
                new ActionText('\nconsole.log("inside 2");'),
            ]);
        else if (false)
            executeActions(currentFile, [
                // new ActionText("// Line 1\n"),
                // new ActionText("// Line 3\n"),
                // new ActionText("// Line 4\n"),
                // new ActionMoveRel(""),
                // new ActionMoveRel("uu\n"),
                // new ActionText("// Line 2")
                new ActionText("// this is the start of the file\n"),
                new ActionText(`
function start(){

}`),
                new ActionMoveRel("uu"),
                new ActionIndent("set", 1),
                new ActionText('\nconsole.log("hello");'),
                new ActionText('\n\nconsole.log("hello");'),
                new ActionComment('\n// test comment'),
                new ActionText('\n\nlet a = 123;'),
                new ActionText(`
if(true){
}`),
                new ActionMoveRel("u\n"),
                new ActionIndent("add", 1),
                new ActionText('console.log("inside");'),
                new ActionText('\nconsole.log("inside 2");'),
            ]);
        else
            executeActions(currentFile, [
                new ActionText("// start of file"),
                new ActionText("\n// start of file"),
                new ActionText("\n// start of file"),
                new ActionText("\n// start of file"),
                new ActionText("\n// start of file"),
                new ActionText("\n// start of file"),
            ]);
    });
}
testStartOnLoad();
//# sourceMappingURL=tutorial.js.map