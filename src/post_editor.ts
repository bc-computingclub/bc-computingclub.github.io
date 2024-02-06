b_refresh = document.querySelector(".b-refresh") as HTMLButtonElement;
b_save = document.querySelector(".b-save");

b_refresh.addEventListener("click",e=>{ 
    if(PAGE_ID == PAGEID.editor) refreshProject();
    else if(PAGE_ID == PAGEID.lesson) refreshLesson();
});
b_save.addEventListener("click",e=>{
    if(PAGE_ID == PAGEID.editor) saveProject();
    else if(PAGE_ID == PAGEID.lesson) saveLesson();
});

// 
let b_openInNew = document.querySelector(".b-open-in-new") as HTMLElement;
let b_invertColors = document.querySelector(".b-invert-colors") as HTMLElement;

b_openInNew.addEventListener("click",e=>{
    if(PAGE_ID == PAGEID.editor) open(project.getURL(),"_blank");
    else if(PAGE_ID == PAGEID.lesson) open(lesson.p.getURL(),"_blank");
});
function updateIFrameContrast(){
    // iframe.classList.toggle("invert");
    // b_invertColors.classList.toggle("invert");
    let v = settings.invertContrast.get();
    if(v){
        iframe.classList.add("invert");
        b_invertColors.classList.add("invert");
    }
    else{
        iframe.classList.remove("invert");
        b_invertColors.classList.remove("invert");
    }
}
b_invertColors.addEventListener("click",e=>{
    let v = settings.invertContrast.v;
    settings.invertContrast.set(!v);
    updateIFrameContrast();
});
if(settings.invertContrast.get()) updateIFrameContrast();

setTimeout(()=>{
    initCallouts();
},500);