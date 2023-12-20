function wait(delay:number){
    return new Promise<void>(resolve=>{
        setTimeout(()=>{
            resolve();
        },delay);
    });
}

let themes:Record<string,{style:string}> = {
    light:{
        style:"light"
    },
    dark:{
        style:"dark"
    }
};

// Theme System

let editorThemeNeedsReload = true;
let curTheme = localStorage.getItem("theme");
let _defaultTheme = "light";
function setDefaultTheme(){
    localStorage.setItem("theme",_defaultTheme);
    curTheme = "light";
    return themes[curTheme];
}
if(!curTheme) setDefaultTheme();

function loadTheme(){
    let tData = themes[localStorage.getItem("theme")];
    if(!tData){
        console.warn("Err: couldn't find theme data, reverting to default");
        tData = setDefaultTheme();
    }
    for(const c of document.body.classList){
        if(c.startsWith("theme-")) document.body.classList.remove(c);
    }
    document.body.classList.remove("themestyle-dark","themestyle-light");
    document.body.classList.add("themestyle-"+tData.style,"theme-"+curTheme);

    loadEditorTheme(tData);
}
function loadEditorTheme(tData?:any){
    if(!tData){
        tData = themes[curTheme];
        if(!tData) return;
    }
    
    if("monaco" in window && editorThemeNeedsReload){
        monaco.editor.setTheme("vs-"+tData.style);
        editorThemeNeedsReload = false;
    }
    else editorThemeNeedsReload = true;
}
function setTheme(theme:string){
    if(!themes[theme]){
        console.log("Err: that theme does not exist");
        return;
    }
    editorThemeNeedsReload = true;
    localStorage.setItem("theme",theme);
    curTheme = theme;
    loadTheme();
}
loadTheme();

// 