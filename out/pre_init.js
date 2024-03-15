// let serverURL = "http://localhost:3000";
// let serverURL = "http://claebcode.top:3000";
//let serverURL = "http://157.245.10.20:3000" // DigitalOcean URL
// let serverURL = "https://baboon-tender-enormously.ngrok-free.app";
let serverURL = "https://725248753e517c1a9b5addc7cb0b60e5.serveo.net";
let themes = {
    light: {
        style: "light"
    },
    dark: {
        style: "dark"
    }
};
// Theme System
let editorThemeNeedsReload = true;
let curTheme = localStorage.getItem("theme");
let _defaultTheme = "light";
function setDefaultTheme() {
    localStorage.setItem("theme", _defaultTheme);
    curTheme = "light";
    return themes[curTheme];
}
if (!curTheme)
    setDefaultTheme();
function loadTheme() {
    let tData = themes[localStorage.getItem("theme")];
    if (!tData) {
        console.warn("Err: couldn't find theme data, reverting to default");
        tData = setDefaultTheme();
    }
    for (const c of document.body.classList) {
        if (c.startsWith("theme-"))
            document.body.classList.remove(c);
    }
    document.body.classList.remove("themestyle-dark", "themestyle-light");
    document.body.classList.add("themestyle-" + tData.style, "theme-" + curTheme);
    // page icon
    // let allLinks = document.querySelectorAll("link");
    // for(const link of allLinks){
    //     if(!link.hasAttribute("icon")) continue;
    //     // link.setAttribute("href","/images/icon.svg");
    //     link.setAttribute("href","/images/CO_logo_v2-light");
    // }
    loadEditorTheme(tData);
}
function loadEditorTheme(tData) {
    if (!tData) {
        tData = themes[curTheme];
        if (!tData)
            return;
    }
    if ("monaco" in window && editorThemeNeedsReload) {
        monaco.editor.setTheme("vs-" + tData.style);
        editorThemeNeedsReload = false;
        console.log("set theme");
    }
    else
        editorThemeNeedsReload = true;
}
function setTheme(theme) {
    if (!themes[theme]) {
        console.log("Err: that theme does not exist");
        return;
    }
    editorThemeNeedsReload = true;
    localStorage.setItem("theme", theme);
    curTheme = theme;
    loadTheme();
}
loadTheme();
// 
function genFilesPane(hasOps = false, hasAdds = false) {
    return `
        <div class="pane-files pane resize" resize="r">
            <div class="header flx-sb">
                <div>Files</div>
                <div>
                    ${hasAdds ? `
                        <button class="icon-btn-single b-new-folder co-item" co-label="Create folder">
                            <div class="material-symbols-outlined">create_new_folder</div>
                        </button>
                        <button class="icon-btn-single b-new-file co-item" co-label="Create file">
                            <div class="material-symbols-outlined">note_add</div>
                        </button>
                    ` : `
                        <button class="icon-btn-single b-fullscreen co-item" co-label="Fullscreen">
                            <div class="material-symbols-outlined">open_in_full</div>
                        </button>
                    `}
                </div>
            </div>
            <div class="file-list">
                <!-- <div class="file-item">index.html</div> -->
                <!-- <div class="file-item">style.css</div> -->
                <!-- <div class="file-item">script.js</div> -->
            </div>
            ${hasOps ? `<div class="file-ops">
                <button class="icon-btn-single ops-rename">
                    <div class="material-symbols-outlined">edit</div>
                </button>
                <button class="icon-btn-single ops-delete">
                    <div class="material-symbols-outlined">delete</div>
                </button>
                <button class="icon-btn-single ops-cut">
                    <div class="material-symbols-outlined">content_cut</div>
                </button>
                <button class="icon-btn-single ops-copy">
                    <div class="material-symbols-outlined">content_copy</div>
                </button>
                <button class="icon-btn-single ops-paste">
                    <div class="material-symbols-outlined">content_paste</div>
                </button>
            </div>` : ""}
        </div>
    `;
}
//# sourceMappingURL=pre_init.js.map
