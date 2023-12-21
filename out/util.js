function wait(delay) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, delay);
    });
}
// callouts
const callouts = document.querySelectorAll(".callout");
// menus
let menuCont = document.createElement("div");
menuCont.className = "menu-cont";
document.body.insertBefore(menuCont, document.body.children[0]);
let menusOpen = [];
function closeAllMenus() {
    let list = [...menusOpen];
    for (const m of list) {
        m.close();
    }
}
class Menu {
    constructor(title, icon) {
        this.title = title;
        this.icon = icon;
    }
    icon;
    title;
    menu;
    body;
    reset() {
        this.menu = null;
        this.body = null;
    }
    load() {
        let t = this;
        let menu = document.createElement("div");
        menu.className = "menu";
        this.menu = menu;
        menuCont.appendChild(menu);
        let head = document.createElement("div");
        head.className = "menu-header";
        head.innerHTML = `
            <div class="menu-title">
                <div class="material-symbols-outlined">${this.icon || ""}</div>
                <div>${this.title}</div>
            </div>
            <div class="material-symbols-outlined b-close">close</div>
        `;
        menu.appendChild(head);
        let b_close = head.querySelector(".b-close");
        b_close.addEventListener("click", e => {
            t.close();
        });
        let cont = document.createElement("div");
        cont.className = "menu-body";
        menu.appendChild(cont);
        this.body = cont;
        if (!menusOpen.length)
            menuCont.classList.add("show");
        menusOpen.push(this);
    }
    close() {
        if (this.menu.parentElement) {
            this.menu.parentElement.removeChild(this.menu);
            this.reset();
            menusOpen.splice(menusOpen.indexOf(this), 1);
            if (!menusOpen.length)
                menuCont.classList.remove("show");
        }
    }
    // 
    setupTextInput(query, ops = {}) {
        let div = this.body.querySelector(query);
        div.classList.add("inp-cont");
        div.innerHTML = `
            <div>${ops.label || ""}</div>
            ${ops.buttonText ? `<button>${ops.buttonText}</button>` : '<input type="text">'}
            ${ops.buttonText ? "" : ops.hasCheck ? `<div><div class="material-symbols-outlined icon-check">progress_activity</div></div>` : ""}
        `;
        let check = div.querySelector(".icon-check");
        if (!ops.buttonText) {
            let inp = div.querySelector("input");
            inp.spellcheck = !ops.noErrorCheck;
            if (check)
                inp.addEventListener("input", async (e) => {
                    if (ops.validate) {
                        check.classList.remove("accept", "deny");
                        check.textContent = "progress_activity";
                        await wait(250);
                        let res = await ops.validate(inp.value);
                        check.classList.remove("accept", "deny");
                        check.classList.add(res ? "accept" : "deny");
                        check.textContent = (res ? "check" : "close");
                    }
                });
            if (ops.isPassword)
                inp.type = "password";
            if (ops.title)
                inp.title = ops.title;
            if (check) {
                check.classList.add("deny");
                check.textContent = "close";
            }
        }
        else {
            let btn = div.querySelector("button");
            btn.addEventListener("click", e => {
                if (ops.onClick)
                    ops.onClick();
            });
        }
    }
}
class SignUpMenu extends Menu {
    constructor() {
        super("Sign Up", "person_add");
    }
    load() {
        super.load();
        this.body.innerHTML = `
            <div class="i-email"></div>
            <div class="i-username"></div>
            <div class="i-password"></div>
            <div class="b-submit"></div>
        `;
        this.setupTextInput(".i-email", {
            label: "Email",
            title: "email",
            noErrorCheck: true,
            async validate(v) {
                return v.length >= 5;
            },
            hasCheck: true
        });
        this.setupTextInput(".i-username", {
            label: "Username",
            title: "username",
            noErrorCheck: true,
            async validate(v) {
                return v.length >= 5;
            },
            hasCheck: true
        });
        this.setupTextInput(".i-password", {
            label: "Password",
            title: "password",
            noErrorCheck: true,
            async validate(v) {
                return v.length >= 8;
            },
            isPassword: true,
            hasCheck: true
        });
        this.setupTextInput(".b-submit", {
            buttonText: "Submit",
            onClick() {
            }
        });
    }
}
class LogInMenu extends Menu {
    constructor() {
        super("Log In", "login");
    }
    load() {
        super.load();
        this.body.innerHTML = `
            <div class="i-username"></div>
            <div class="i-password"></div>
            <div class="b-submit"></div>
        `;
        this.setupTextInput(".i-username", {
            label: "Username",
            title: "username",
            noErrorCheck: true,
            async validate(v) {
                return v.length >= 5;
            }
        });
        this.setupTextInput(".i-password", {
            label: "Password",
            title: "password",
            noErrorCheck: true,
            async validate(v) {
                return v.length >= 8;
            },
            isPassword: true
        });
        this.setupTextInput(".b-submit", {
            buttonText: "Submit",
            onClick() {
            }
        });
    }
}
let testMenu = new SignUpMenu();
let testMenu2 = new LogInMenu();
testMenu2.load();
testMenu.load();
//# sourceMappingURL=util.js.map