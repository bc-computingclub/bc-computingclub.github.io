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
b_publish.addEventListener("click",e=>{
    if(!project) return;
    // if(!project.meta.submitted) submitChallenge(project.pid);
    // else unsubmitChallenge(project.pid);
    if(!project.meta.submitted) {
        new ConfirmMenu(
            "Submit Challenge", "Are you sure you want to submit your code?<br><br> You will have to un-submit it to make any changes in the future.<br><br><span class='note'>Submitted projects are publically viewable by anyone.</span>",
            () => {
                submitChallenge(project.meta.cid,project.pid)
            },
            () => { 
                // console.log("Submission canceled");
            }
        ).load();
    } else {
        new ConfirmMenu(
            "Remove submission","Are you sure you'd like to un-submit your challenge?<br><br> You'll have to re-submit in order for it to appear in the submissions page.",
            () => {
                unsubmitChallenge(project.pid);
            },
            () => { 
                // console.log("Un-submission canceled");
            }
        ).load();
    }
});

let b_openInNew = document.querySelector(".b-open-in-new") as HTMLElement;
let b_invertColors = document.querySelector(".b-invert-colors") as HTMLElement;

b_openInNew.addEventListener("click",e=>{
    if(!project) return;
    if(PAGE_ID == PAGEID.editor) open(project.getExternalURL(),"_blank");
    else if(PAGE_ID == PAGEID.lesson) open(lesson.p.getExternalURL(),"_blank");
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