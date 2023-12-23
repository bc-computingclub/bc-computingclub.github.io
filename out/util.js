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
        // this.body.innerHTML = `
        //     <div class="i-username"></div>
        //     <div class="i-password"></div>
        //     <div class="b-submit"></div>
        // `;
        // this.setupTextInput(".i-username",{
        //     label:"Username",
        //     title:"username",
        //     noErrorCheck:true,
        //     async validate(v){
        //         return v.length >= 5;
        //     }
        // });
        // this.setupTextInput(".i-password",{
        //     label:"Password",
        //     title:"password",
        //     noErrorCheck:true,
        //     async validate(v){
        //         return v.length >= 8;
        //     },
        //     isPassword:true
        // });
        // this.setupTextInput(".b-submit",{
        //     buttonText:"Submit",
        //     onClick(){
        //     }
        // });
        if (false)
            this.body.innerHTML = `
            <div class="two-col">
                <div>
                    <div id="g_id_onload"
                        data-client_id="639454147876-f7ehoq29hcqnmis69l7shgbr2nbtv02o.apps.googleusercontent.com"
                        data-context="use"
                        data-ux_mode="popup"
                        data-callback="handleCredentialResponse"
                        data-auto_prompt="false">
                    </div>
                    
                    <div class="g_id_signin"
                        data-type="standard"
                        data-shape="rectangular"
                        data-theme="outline"
                        data-text="signin_with"
                        data-size="large"
                        data-logo_alignment="left">
                    </div>
                </div>
                <div>
                    <button>Continue</button>
                </div>
            </div>
        
        `;
        else {
            if (!socket.connected) {
                this.body.textContent = "Failed to connect to the server.";
                return;
            }
            this.body.innerHTML = `
                <div class="two-col">
                    <div>
                        <div class="sign-in-cont">
                            <div>Sign in with Google</div>
                            <div class="si-icon-cont"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="LgbsSe-Bz112c"><g><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></g></svg></div>
                        </div>
                    </div>
                    <div>
                        <!--<button>Continue</button>-->
                    </div>
                </div>
            `;
            let signInBtn = this.body.querySelector(".sign-in-cont");
            signInBtn.addEventListener("click", e => {
                promptSignIn();
            });
        }
    }
}
function decodeJwtResponse(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}
let initializedSignInPrompt = false;
function promptSignIn() {
    if (!initializedSignInPrompt) {
        google.accounts.id.initialize({
            client_id: '639454147876-f7ehoq29hcqnmis69l7shgbr2nbtv02o',
            callback: handleCredentialResponse,
            context: "use",
            ux_mode: "popup",
            auto_prompt: "false"
        });
        initializedSignInPrompt = true;
    }
    google.accounts.id.prompt();
}
function handleCredentialResponse(response) {
    console.log("LOGGED IN: ", response);
    // Your code here
    let data = decodeJwtResponse(response.credential);
    console.log("DATA", data);
    logUserIn(data, response.credential);
    closeAllMenus();
}
function logUserIn(data, token) {
    if (!data)
        data = JSON.parse(localStorage.getItem("logData"));
    if (!token)
        token = localStorage.getItem("token");
    if (!data || !token)
        return;
    if (data) {
        localStorage.setItem("token", token);
        localStorage.setItem("logData", JSON.stringify(data));
        h_profile.innerHTML = `
            <img src="${data.picture}">
        `;
        _login(data, token);
        return;
    }
    // clear user - log out
    h_profile.innerHTML = `<span class="material-symbols-outlined">Person</span>`;
    localStorage.removeItem("logData");
    localStorage.removeItem("token");
    _logout(data);
}
// let testMenu = new SignUpMenu();
// let testMenu2 = new LogInMenu();
// testMenu2.load();
// testMenu.load();
//# sourceMappingURL=util.js.map