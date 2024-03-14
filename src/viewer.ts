function initViewer(){
    let param = new URL(location.href);
    const viewerFrame = document.querySelector("iframe");
    let t = param.searchParams.get("t");
    let a = param.searchParams.get("a");
    let b = param.searchParams.get("b");
    let c = param.searchParams.get("c");
    let d = param.searchParams.get("d");
    
    let url = serverURL+"/public/"+a+"/"+b;
    if(t == "p") url = serverURL+`/project/${a}/${b}/${c}/${d}`;
    else if(t == "l") url = serverURL+`/lesson/${a}/${b}/${a}/${c}`;
    
    // viewerFrame.onload = function(){
    //     setTimeout(()=>{
    //         // document.title = viewerFrame.contentDocument.title;
    //         console.log(viewerFrame.contentWindow);
    //     },400);
    // };
    viewerFrame.src = url;
    viewerFrame.setAttribute("style","width:100%;height:100%;border:none;outline:none");

    setTimeout(()=>{
        scrollTo(0,0);
    },500);
}
initViewer();