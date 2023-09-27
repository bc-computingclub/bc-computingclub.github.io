let list = document.querySelector(".challenge-list");
/**@type {HTMLIFrameElement} */
let frame = document.getElementById("frame");
let codeCont = document.querySelector(".code-cont");

// From Jaredcheeda, https://stackoverflow.com/questions/7381974/which-characters-need-to-be-escaped-in-html
function escapeMarkup (dangerousInput) {
    const dangerousString = String(dangerousInput);
    const matchHtmlRegExp = /["'&<>]/;
    const match = matchHtmlRegExp.exec(dangerousString);
    if (!match) {
      return dangerousInput;
    }
  
    const encodedSymbolMap = {
      '"': '&quot;',
      '\'': '&#39;',
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;'
    };
    const dangerousCharacters = dangerousString.split('');
    const safeCharacters = dangerousCharacters.map(function (character) {
      return encodedSymbolMap[character] || character;
    });
    const safeString = safeCharacters.join('');
    return safeString;
}

let sel;

function registerProject(name,date,/**@type {string[]}*/files,htmlOverride){
    let div = document.createElement("div");
    let i = list.children.length+1;
    div.innerHTML = `
        <div>${i}</div>
        <div>${date}</div>
        <div>${name}</div>
    `;
    list.appendChild(div);

    div.onclick = async function(){
        function close(){
            codeCont.textContent = "";
            frame.src = "";
            sel.classList.remove("sel");
            sel = null;
            let url = new URL(location.href);
            url.searchParams.delete("index");
            history.replaceState("","",url);
            document.title = "View JS Challenge Code";
        }
        if(sel == div){
            close();
            return;
        }
        if(sel) close();

        div.classList.add("sel");
        sel = div;
        let url = new URL(location.href);
        url.searchParams.set("index",i-1);
        history.replaceState("","",url);
        document.title = "Challenge "+i+" - "+name;

        for(const file of files){
            let div2 = document.createElement("div");
            let text = await (await fetch("files/"+i+"/"+file)).text();
            let ogText = text;
            let ext = file.split(".")[1];
            if(ext == "html"){
                if(htmlOverride){
                    text = escapeMarkup(htmlOverride);
                    ogText = htmlOverride;
                }
                else text = escapeMarkup(text);
            }
            div2.innerHTML = `
                <div class="file-title">
                    <div>${file}</div>
                    <button class="copy-code">Copy Code</button>
                </div>
                <pre><code class="language-${ext}">${text}</code></pre>
            `;
            codeCont.appendChild(div2);

            let copyCode = div2.querySelector(".copy-code");
            if(copyCode) copyCode.onclick = function(){
                navigator.clipboard.writeText(ogText);
                copyCode.textContent = "Copied!";
                setTimeout(()=>{
                    copyCode.textContent = "Copy Code";
                },1000);
            };
    
            Prism.highlightElement(div2.children[1].children[0]);
        }

        setTimeout(()=>{
            frame.src = "files/"+i+"/index.html";
        },0);
    };
}
let b_fullscreen = document.getElementById("fullscreen");
b_fullscreen.onclick = function(){
    frame.requestFullscreen();
};

// registry

registerProject("Timer","9/27/23",["main.js","index.html"],`<!-- A Basic Example of a Timer -->

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>1 - Timer - Lv 1</title>
</head>
<body>
    <p id="time-left">60</p>
    <p>Seconds Remaining</p>

    <script src="main.js"></script>
</body>
</html>`);
// registerProject("Timer","9/27/23",["main.js","index.html"]);

// load

let url = new URL(location.href);
let searchIndex = url.searchParams.get("index");
if(searchIndex != null){
    list.children[searchIndex]?.click();
}