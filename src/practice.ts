const inProgressDiv = document.querySelector(".c-in-progress-container") as HTMLElement;
const outerInProgressDiv = document.querySelector(".c-outer-in-progress") as HTMLElement;
const browseDiv = document.querySelector(".c-browse-container") as HTMLElement;
const inProgressTracker = document.querySelector(".c-in-progress-counter") as HTMLElement;
const inProgressHeader = document.querySelector(".c-ip-container-header") as HTMLElement;
const browseTracker = document.querySelector(".c-browse-counter") as HTMLElement;
const browseHeader = document.querySelector(".c-browse-container-header") as HTMLElement;
const cHome = document.querySelector(".c-home") as HTMLElement;
const body = document.querySelector("body") as HTMLElement;

const lsUID = "BCC-01";

let challengeInProgress = false;
let bCounter = 0;
let ipCounter = 0;

class Challenge {
    constructor(cID: string, name: string, desc: string, inProgress: boolean, imgURL: string, pid: string, submitted: boolean) {
        this.name = name;
        this.desc = desc;
        this.inProgress = inProgress;
        this.imgURL = imgURL;
        this.pid = pid;
        this.submitted = submitted;
        this.cID = cID;
    }

    name: string;
    desc: string;
    inProgress: boolean;
    imgURL: string;
    pid: string;
    submitted: boolean;
    cID: string;
}

class DetailedChallenge extends Challenge {
    difficulty: string;

    constructor(cID: string, name: string, desc: string, inProgress: boolean, imgURL: string, pid: string, submitted: boolean, difficulty: string) {
        super(cID, name, desc, inProgress, imgURL, pid, submitted);
        this.difficulty = difficulty;
    }
}

let test1 = new Challenge("", "Color Wheel", "Create a circular wheel which selects different colors depending on user mouse input", false, "/images/water-level.png", "", false);
let test2 = new Challenge("", "Combination Lock", "Create a combination lock which reveals a secret message when the correct combination is entered.", true, "/images/fillerthumbnail.png", "", true);
let test3 = new Challenge("", "To-Do List", "Create a to-do list, to which you can add and remove items as desired.", false, "/images/fillerthumbnail.png", "", false);
let test4 = new Challenge("", "Water Wheel", "Design a button which can be dragged around a circle, controlling the water level in a cup.", false, "/images/water-level.png", "", false);

let detailedTest = new DetailedChallenge("", "Water Wheel", "Design a button which can be dragged around a circle, controlling the water level in a cup.", false, "/images/water-level.png", "", false, "Easy -> Expert");

let challengeArray = [test1, test2, test3, test4];

console.log(challengeArray);

async function getChallenges() {
    // challengeArray = await (code goes here)
    await wait(0);
}

let isOpen:boolean;
window.addEventListener("load", async () => {
    await getChallenges();
    showChallenges();
    const cToggle = document.querySelector(".c-toggle") as HTMLElement;

    let toggleState = localStorage.getItem(`${lsUID}toggleState`) || "open";
    isOpen = toggleState == "open" ? true : false;

    if (isOpen == false) {
        console.log("loading, and it's closed in localStorage - collapsing")
        cToggle.classList.remove("point-up");
        cToggle.classList.add("point-down");
        outerInProgressDiv.classList.add("collapse","window-load");
    }

    if (cToggle) {
        cToggle.addEventListener("click", () => {
            outerInProgressDiv.classList.remove("window-load");
            if (isOpen) {
                isOpen = false;
                localStorage.setItem(`${lsUID}toggleState`, "closed");
                cToggle.classList.remove("point-up");
                cToggle.classList.add("point-down");
                outerInProgressDiv.classList.add("collapse");
            } else {
                isOpen = true;
                localStorage.setItem(`${lsUID}toggleState`, "open");
                cToggle.classList.remove("point-down");
                cToggle.classList.add("point-up");
                outerInProgressDiv.classList.remove("collapse");
            }
            console.log(localStorage.getItem(`${lsUID}toggleState`));
        });
    }
    const cPreview = document.querySelectorAll(".c-preview") as NodeListOf<HTMLElement>;
    cPreview.forEach((e: HTMLElement) => {
        e.addEventListener("click", async () => {
            await createChallengePopup(e.getAttribute("c-id"));
        });
    });
});

class ChallengeMenu extends Menu {
    constructor(){
        super("help");
    }

    load(){
        super.load();
        let head = this.menu.children[0];
        head.innerHTML = "...";
    
       this.body.innerHTML = "...";
    }
}

async function createChallengePopup(cID) {
    // get detailed challenge data from server using cID
    let cDetailed = detailedTest;
    let attempted = cDetailed.submitted ? "Completed" : "Not Attempted";
}

function showChallenges() {
    for (let challenge of challengeArray) {
        if (challenge.inProgress) { challenge.submitted = false; } // IMPORTANT: REMOVE THIS LINE WHEN SUBMISSIONS ARE IMPLEMENTED
        let tempElm = document.createElement("div") as HTMLElement;
        tempElm.classList.add("c-card");
        setChallengeHTML(tempElm, challenge);

        if (!challenge.inProgress) {
            browseDiv.appendChild(tempElm);
            bCounter++;
        } else {
            inProgressDiv.appendChild(tempElm);
            ipCounter++;
            challengeInProgress = true;
        }
    }
    if (challengeInProgress == false) {
        inProgressDiv.classList.add("empty");
        inProgressDiv.innerHTML = "<i>Start working on a challenge, and it'll show up here!</i>";
    } else {
        inProgressDiv.classList.remove("empty");
        inProgressDiv.innerHTML += `<span class="material-symbols-outlined c-toggle">expand_less</span>` // Toggle button is added if there are challenges in progress to show/hide
        inProgressHeader.innerHTML += `<h3 class="c-in-progress-counter">(${ipCounter})</h3>`;
        browseHeader.innerHTML += `<h3 class="c-browse-counter">(${bCounter})</h3>`;
    }
}

function setChallengeHTML(elm: HTMLElement, c: Challenge) {
    elm.innerHTML = `
        <div class="c-img-div">
            <img class="c-img" src="${c.imgURL}" alt="challenge image">
        </div>
        <h3 class="c-name">
            ${c.name}
        </h3>
        <span class="c-text">${c.desc}</span>
        <button class="c-preview" c-id="${c.cID}">Open Preview</button>
    `;
    if (c.submitted) {
        elm.innerHTML += `<span class="c-submitted"><span class="material-symbols-outlined">select_check_box</span> Submitted</span>`;
    }
}

// Caleb, if you're reading this - this is the stuff I made for my menu

// <div class ="c-popup">
// <div class ="c-popup-left">
//     <div class="c-popup-header">
//         <h2 class="c-popup-title">${cDetailed.name}</h2>
//         <div class="c-attempted">${attempted}</div>
//     </div>
//     <div class="c-popup-body">
//         <div class ="c-popup-task">
//             <h4 class="c-popup-sub-title">Task</h4>
//             <span class="c-popup-task-text">${cDetailed.desc}</span>
//         </div>
//         <div class ="c-popup-implementations">
//             <h4 class="c-popup-sub-title">Implementations</h4>
//             <div class="c-implementations">
//                 <div class="c-implementation">
//                     <div class="c-implementation-preview">
//                         <img class="c-implementation-img" src="images/error.png" alt="challenge image">
//                     </div>
//                     <div class="c-implementation-credit"></div>
//                 </div>
//             </div>
//         </div>
//     </div>
// </div>
// <div class="c-popup-right">
//     <div class="c-popup-close material-symbols-outlined">
//         close
//     </div>
//     <div class="c-popup-img-div">
//         <img class="c-popup-img" src="${cDetailed.imgURL}" alt="challenge image">
//         <span class="c-popup-img-text">Sketch Mockup</span>
//     </div>
//     <div class="c-difficulty">
//         <span class="c-difficulty-text">Difficulty: <span class="c-difficulty-number">${cDetailed.difficulty}</span></span>
//     </div>
// </div>
// </div>

// let cPopup = document.createElement("div") as HTMLElement;
// body.style.overflow = "hidden";
// cHome.appendChild(cPopup);
// cPopup.className = "c-popup-cont";
// console.log("Creating Popup");
// popupExists = true;
// const previewBtnArr = document.querySelectorAll(".c-preview") as NodeListOf<HTMLElement>;
// previewBtnArr.forEach((btn: HTMLElement) => {
//     btn.classList.toggle("disabled");
// });
// cPopup.style.top = window.scrollY + 10 + "px";
// cPopup.addEventListener("click", (e) => {
//     const targetElement = e.target as HTMLElement;
//     if (targetElement.classList.contains("c-popup-close")) {
//         cPopup.remove();
//         body.style.overflow = "auto";
//         popupExists = false;
//         previewBtnArr.forEach((btn: HTMLElement) => {
//             btn.classList.toggle("disabled");
//         });
//     }
// });