b_save = document.querySelector(".b-save");
b_save.addEventListener("click",e=>{
    if(PAGE_ID == PAGEID.editor) saveProject();
    else if(PAGE_ID == PAGEID.lesson) saveLesson();
});

setTimeout(()=>{
    initCallouts();
},500);