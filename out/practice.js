const inProgressDiv = document.querySelector(".c-in-progress-container");
const outerInProgressDiv = document.querySelector(".c-outer-in-progress");
const browseDiv = document.querySelector(".c-browse-container");
const inProgressTracker = document.querySelector(".c-in-progress-counter");
const inProgressHeader = document.querySelector(".c-ip-container-header");
const browseTracker = document.querySelector(".c-browse-counter");
const browseHeader = document.querySelector(".c-browse-container-header");
const cHome = document.querySelector(".c-home");
const checkboxes = document.querySelectorAll('input[type="checkbox"]');
const lsUID = "BCC-01";
let challengeInProgress = false;
let bCounter = 0;
let ipCounter = 0;
class Challenge {
    constructor(cID, name, desc, inProgress, imgURL, pid, submitted, difficulty) {
        this.name = name;
        this.desc = desc;
        this.inProgress = inProgress;
        this.imgURL = imgURL;
        this.pid = pid;
        this.submitted = submitted;
        this.cID = cID;
        this.difficulty = difficulty;
    }
    name;
    desc;
    inProgress;
    imgURL;
    pid;
    submitted;
    cID;
    difficulty;
}
class DetailedChallenge extends Challenge {
    constructor(cID, name, desc, inProgress, imgURL, pid, submitted, difficulty) {
        super(cID, name, desc, inProgress, imgURL, pid, submitted, difficulty);
    }
}
let test1 = new Challenge("01", "Color Wheel", "Create a circular wheel which selects different colors depending on user mouse input", false, "/images/colorwheel.png", "", false, "Easy");
let test2 = new Challenge("02", "Combination Lock", "Cxreate a combination lock which reveals a secret message when the correct combination is entered.", true, "/images/fillerthumbnail.png", "", true, "Medium");
let test3 = new Challenge("03", "To-Do List", "Create a to-do list, to which you can add and remove items as desired.", false, "/images/fillerthumbnail.png", "", false, "Hard");
let test4 = new Challenge("04", "Water Wheel", "Design a button which can be dragged around a circle, controlling the water level in a cup.", false, "/images/water-level.png", "", false, "Code Wizard");
let detailedTest = new DetailedChallenge("04", "Water Wheel", "Design a button which can be dragged around a circle, controlling the water level in a cup.", false, "/images/water-level.png", "", false, "Easy -> Expert");
let challengeArray = [test1, test2, test3, test4];
console.log(challengeArray);
async function getChallenges() {
    // challengeArray = await (code goes here)
    await wait(0);
}
let isOpen;
window.addEventListener("load", async () => {
    await getChallenges();
    showChallenges();
    const cToggle = document.querySelector(".c-toggle");
    let toggleState = localStorage.getItem(`${lsUID}toggleState`) || "open";
    isOpen = toggleState == "open" ? true : false;
    if (isOpen == false) {
        console.log("loading, and it's closed in localStorage - collapsing");
        cToggle.classList.remove("point-up");
        cToggle.classList.add("point-down");
        outerInProgressDiv.classList.add("collapse", "window-load");
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
            }
            else {
                isOpen = true;
                localStorage.setItem(`${lsUID}toggleState`, "open");
                cToggle.classList.remove("point-down");
                cToggle.classList.add("point-up");
                outerInProgressDiv.classList.remove("collapse");
            }
            console.log(localStorage.getItem(`${lsUID}toggleState`));
        });
    }
    const cPreview = document.querySelectorAll(".c-preview");
    cPreview.forEach((e) => {
        e.addEventListener("click", async () => {
            await createChallengePopup(e.getAttribute("c-id"));
        });
    });
});
class ChallengeMenu extends Menu {
    constructor() {
        super("help");
    }
    load() {
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
        if (challenge.inProgress) {
            challenge.submitted = false;
        } // IMPORTANT: WHEN SUBMISSIONS ARE IMPLEMENTED, REMOVE THIS LINE. PROGRESS ON A CHALLENGE IS RESET IF A USER RE-SUBMITS
        let tempElm = document.createElement("div");
        tempElm.classList.add("c-card");
        setChallengeHTML(tempElm, challenge);
        if (!challenge.inProgress) {
            browseDiv.appendChild(tempElm);
            bCounter++;
        }
        else {
            inProgressDiv.appendChild(tempElm);
            ipCounter++;
            challengeInProgress = true;
        }
    }
    if (challengeInProgress == false) {
        inProgressDiv.classList.add("empty");
        inProgressDiv.innerHTML = "<i>Start working on a challenge, and it'll show up here!</i>";
    }
    else {
        inProgressDiv.classList.remove("empty");
        inProgressDiv.innerHTML += `<span class="material-symbols-outlined c-toggle">expand_less</span>`; // Toggle button is added if there are challenges in progress to show/hide
        inProgressHeader.innerHTML += `<h3 class="c-in-progress-counter">(${ipCounter})</h3>`;
        browseHeader.innerHTML += `<h3 class="c-browse-counter">(${bCounter})</h3>`;
    }
}
function setChallengeHTML(elm, c) {
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
checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
        const checkboxValue = event.target.value;
        const isChecked = event.target.checked;
        if (isChecked) {
            console.log(`Checkbox ${checkboxValue} is checked.`);
            filterChallenges(checkboxValue, true);
        }
        else {
            console.log(`Checkbox ${checkboxValue} is unchecked.`);
            filterChallenges(checkboxValue, false);
        }
    });
});
function filterChallenges(value, checked) {
    challengeArray.forEach((challenge) => {
    });
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
//# sourceMappingURL=practice.js.map