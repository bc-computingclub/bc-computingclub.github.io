function registerDropdown(btn:Element,list:string[],onclick:(i:number)=>void){
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
            };
            div.appendChild(label);
        }
        overlay.appendChild(div);
        div.style.left = (rect.x)+"px";
        div.style.top = (rect.y+rect.height+3)+"px";
        back.style.pointerEvents = "all";
    };
}