// learn to code or something, it's really up to you, you have to put in the work

let jsCont = document.querySelector(".cont-js") as HTMLElement;
let d_files = document.querySelector(".d-open-files");
let main = document.querySelector(".main") as HTMLElement;

class Project{
    constructor(title:string){
        this.title = title;
        this.files = [];
        this.openFiles = [];
    }
    title:string;
    files:FFile[];
    openFiles:FFile[];

    createFile(name:string,text:string,lang?:string){
        let f = new FFile(this,name,text,lang);
        this.files.push(f);
    }
}

class FFile{
    constructor(p:Project,name:string,text:string,lang?:string){
        this.p = p;
        this.name = name;
        this.text = text;
        this.lang = lang;
    }
    p:Project;
    name:string;
    text:string;
    lang:string;

    cont:HTMLElement;
    editor:monaco.editor.IStandaloneCodeEditor;

    editorHandle:HTMLElement;

    open(){
        if(!this.p.openFiles.includes(this)){
            let link = document.createElement("div");
            link.textContent = this.name;
            link.className = "file-link";
            d_files.appendChild(link);
            this.p.openFiles.push(this);
        }
        let editor = monaco.editor.create(jsCont, {
            value: [`<html>
    <body>
        <div>Hello</div>
    </body>
</html>`].join('\n'),
            language: 'html',
            theme:"vs-light",
            bracketPairColorization:{
                enabled:false
            },
            minimap:{
                enabled:false
            }
        });
    }
}

let project:Project;

async function init(){
    // @ts-ignore
    require.config({paths:{vs:"../lib/monaco/min/vs"}});
    await new Promise<void>(resolve=>{
        // @ts-ignore
        require(['vs/editor/editor.main'], function () {
            resolve();
        });
    });

    project = new Project("Test Project");
    project.createFile("index.html",`<html>
    <body>
        <div>Hello</div>
    </body>
</html>`,"html");

    project.files[0].open();
}
init();

document.addEventListener("resize",e=>{
    onResize();
});
function onResize(){
    main.style.height = (innerHeight - 60)+"px";
}
onResize();





// // @ts-ignore
// require.config({paths:{vs:"../lib/monaco/min/vs"}});
// // @ts-ignore
// require(['vs/editor/editor.main'], function () {
//     var editor = monaco.editor.create(jsCont, {
//         value: [`<html>
//     <body>
//         <div>Hello</div>
//     </body>
// </html>`].join('\n'),
//         language: 'html',
//         theme:"vs-light",
//         bracketPairColorization:{
//             enabled:false
//         },
//         minimap:{
//             enabled:false
//         }
//     });
// });