function registerDropdown(btn:Element,list:string[],onclick:(i:number)=>void){
    if(!btn) return;
    (btn as HTMLElement).onmousedown = function(){
        let rect = btn.getBoundingClientRect();
        let div = document.createElement("div");
        div.className = "dropdown";
        for(let i = 0; i < list.length; i++){
            let label = document.createElement("div");
            label.className = "dropdown-item";
            label.textContent = list[i];
            label.onclick = function(){
                onclick(i);
                back.style.pointerEvents = "none";
                overlay.textContent = "";
                btn.textContent = list[i];
            };
            div.appendChild(label);
        }
        overlay.appendChild(div);
        div.style.left = (rect.x)+"px";
        div.style.top = (rect.y+rect.height+3)+"px";
        back.style.pointerEvents = "all";
    };
}

function wait(delay:number){
    return new Promise<void>(resolve=>{
        setTimeout(()=>{
            resolve();
        },delay);
    });
}