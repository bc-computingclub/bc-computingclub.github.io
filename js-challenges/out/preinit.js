var back = document.createElement("div");
back.className = "back";
var overlay = document.createElement("div");
overlay.className = "overlay";
var header = document.createElement("header");
var _pathname = location.pathname;
header.innerHTML = "\n<div class=\"icon-btn\">\n    <div class=\"material-symbols-outlined\">terminal</div>\n    <div style=\"display:flex;justify-content:space-between;align-items:center\">\n        <span class=\"material-symbols-outlined\" style=\"font-size:50px;line-height:50px;width:50px;height:50px;margin-right:-3px\">javascript</span> \n        <span>Challenges _</span>\n    </div>\n\n    <!--<div>JS Challenges _</div>-->\n</div>\n<div class=\"flx nav-list\">\n    <a href=\"index.html\" class=\"nav-link nav-challenges ".concat(_pathname.endsWith("index.html") || !_pathname.includes(".html") ? "cur" : "", "\">\n        <div class=\"material-symbols-outlined\">exercise</div>\n        <div>Challenges</div>\n    </a>\n    <a href=\"tutorials.html\" class=\"nav-link nav-tutorials ").concat(_pathname.endsWith("tutorials.html") ? "cur" : "", "\">\n        <div class=\"material-symbols-outlined\">school</div>\n        <div>Tutorials</div>\n    </a>\n</div>\n");
document.body.appendChild(back);
document.body.appendChild(overlay);
document.body.appendChild(header);
document.addEventListener("DOMContentLoaded", function (e) {
    var main = document.querySelector(".main");
    // let navType = performance.getEntriesByType("navigation")[0].toJSON();
    // console.log(navType);
    // if(navType.type == "back_forward" || navType.type == "navigate"){
    //     main.style.animation = "BodyInit 0.2s cubic-bezier(0.075, 0.82, 0.165, 1)";
    // }
});
window.addEventListener("beforeunload", function (e) {
    var mainCont = document.querySelector(".main");
    for (var i = 0; i < mainCont.children.length; i++) {
        var c = mainCont.children[i];
        c.classList.add("fade-away");
    }
});
//# sourceMappingURL=preinit.js.map