function wait(delay:number){
    return new Promise<void>(resolve=>{
        setTimeout(()=>{
            resolve();
        },delay);
    });
}

// callouts
const callouts = document.querySelectorAll(".callout");
