function registerDropdown(btn, list, onclick) {
    btn.onmousedown = function () {
        var rect = btn.getBoundingClientRect();
        var div = document.createElement("div");
        div.className = "dropdown";
        var _loop_1 = function (i) {
            var label = document.createElement("div");
            label.className = "dropdown-item";
            label.textContent = list[i];
            label.onclick = function () {
                onclick(i);
                back.style.pointerEvents = "none";
                overlay.textContent = "";
                btn.textContent = list[i];
            };
            div.appendChild(label);
        };
        for (var i = 0; i < list.length; i++) {
            _loop_1(i);
        }
        overlay.appendChild(div);
        div.style.left = (rect.x) + "px";
        div.style.top = (rect.y + rect.height + 3) + "px";
        back.style.pointerEvents = "all";
    };
}
