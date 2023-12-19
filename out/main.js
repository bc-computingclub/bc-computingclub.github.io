"use strict";
// import * as monaco from "monaco-editor";
// import type monaco from "../lib/monaco/monaco";
Object.defineProperty(exports, "__esModule", { value: true });
// import type * as monaco from "../lib/monaco/monaco";
let jsCont = document.querySelector(".cont-js");
// monaco.editor.create(cont,{});
// @ts-ignore
require.config({ paths: { vs: "../lib/monaco/min/vs" } });
// @ts-ignore
require(['vs/editor/editor.main'], function () {
    // monaco.languages.registerCompletionItemProvider("javascript",{
    //     provideCompletionItems:function(model,position){
    //         return null;
    //     }
    // })
    var editor = monaco.editor.create(jsCont, {
        value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
        language: 'javascript',
        theme: "vs-dark",
        bracketPairColorization: {
            enabled: false
        },
        minimap: {
            enabled: false
        },
        // codeLens:false
    });
    console.log(editor);
    console.log(editor.getValue());
    // editor.setValue("console.log('hello there!');");
});
//# sourceMappingURL=main.js.map