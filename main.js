let list = document.querySelector(".challenge-list");

function registerProject(name,/**@type {string[]}*/files){
    let div = document.createElement("div");
    div.innerHTML = `
        <div>${list.children.length+1}</div>
        <div>${name}</div>
    `;
    list.appendChild(div);
    
}

registerProject("Timer",["index.html","main.js"]);