const inProgressDiv = document.querySelector(".c-in-progress-container");
const outerInProgressDiv = document.querySelector(".c-outer-in-progress");
const browseDiv = document.querySelector(".c-browse-container");
const inProgressHeader = document.querySelector(".c-ip-container-header");
const inProgressTracker = document.querySelector(".c-in-progress-counter");
const browseTracker = document.querySelector(".c-browse-counter");
const browseHeader = document.querySelector(".c-browse-container-header");
const cHome = document.querySelector(".c-home");
const clearFiltersButton = document.querySelector(".clear-filters");
const sortBtn = document.querySelector(".c-sort");
let cToggle;
let displayedChallenges = [];
const checkboxes = document.querySelectorAll('input[type="checkbox"]');
const lsUID = "BCC-01";
let bCounter = 0;
let ipCounter = 0;
class Challenge {
    constructor(cID, name, desc, inProgress, imgURL, pid, submitted, difficulty, ongoing, submission_count) {
        this.name = name;
        this.desc = desc;
        this.inProgress = inProgress;
        this.imgURL = imgURL;
        this.pid = pid;
        this.submitted = submitted;
        this.cID = cID;
        this.difficulty = difficulty;
        this.ongoing = ongoing;
    }
    name;
    desc;
    inProgress;
    imgURL;
    pid;
    submitted;
    cID;
    difficulty;
    ongoing;
}
class DetailedChallenge extends Challenge {
    constructor(cID, name, desc, inProgress, imgURL, pid, submitted, difficulty, ongoing, submission_count, submissions) {
        super(cID, name, desc, inProgress, imgURL, pid, submitted, difficulty, ongoing, submission_count);
        this.submissions = submissions;
    }
    submissions;
}
let test1 = new Challenge("01", "Color Wheel", "Create a circular wheel which selects different colors depending on user mouse input", true, "/images/colorwheel.png", "", false, "easy", false, "1");
let test2 = new Challenge("02", "Combination Lock", "Create a combination lock which reveals a secret message when the correct combination is entered.", false, "/images/fillerthumbnail.png", "", true, "medium", false, "3");
let test3 = new Challenge("03", "To-Do List", "Create a to-do list, to which you can add and remove items as desired.", false, "/images/fillerthumbnail.png", "", false, "easy", false, "10");
let test4 = new Challenge("04", "Water Wheel", "Design a button which can be dragged around a circle, controlling the water level in a cup.", false, "/images/water-level.png", "", false, "code-wizard", true, "2");
let challengeArray = [test1, test2, test3, test4];
// console.log(challengeArray);
async function getChallenges() {
    // challengeArray = await (code goes here)
    return challengeArray;
}
let isOpen;
window.addEventListener("load", async () => {
    let temp = await getChallenges();
    showChallenges(temp);
    let toggleState = localStorage.getItem(`${lsUID}toggleState`) || "open";
    isOpen = toggleState == "open" ? true : false;
    if (isOpen == false) {
        console.log("LocalStorage claims section should be closed. Collapsing");
        toggleInProgressDiv(cToggle, false);
        outerInProgressDiv.classList.add("window-load");
    }
    const cPreview = document.querySelectorAll(".c-preview");
    cPreview.forEach((e) => {
        e.addEventListener("click", async () => {
            await createChallengePopup(e.getAttribute("c-id"));
        });
    });
});
function toggleInProgressDiv(btn, opening) {
    outerInProgressDiv.classList.remove("window-load");
    if (opening) {
        isOpen = true;
        localStorage.setItem(`${lsUID}toggleState`, "open");
        btn.classList.remove("point-down");
        btn.classList.add("point-up");
        outerInProgressDiv.classList.remove("collapse");
    }
    else {
        isOpen = false;
        localStorage.setItem(`${lsUID}toggleState`, "closed");
        btn.classList.remove("point-up");
        btn.classList.add("point-down");
        outerInProgressDiv.classList.add("collapse");
    }
}
class ChallengeMenu extends Menu {
    constructor() {
        super("help");
    }
    load() {
        super.load();
        let head = this.menu.children[0];
        head.innerHTML = "i do not know what I am doing";
        this.body.innerHTML = "i am overriding every css class and i think i'm messing this up";
    }
}
async function createChallengePopup(cID) {
    // get detailed challenge data from server using cID
    new ChallengeMenu().load();
}
function showChallenges(cArr) {
    for (let challenge of cArr) {
        let cardElm = setChallengeHTML(challenge);
        if (!challenge.inProgress) {
            browseDiv.appendChild(cardElm);
            bCounter++;
        }
        else {
            inProgressDiv.appendChild(cardElm);
            ipCounter++;
        }
    }
    if (ipCounter == 0) {
        inProgressDiv.classList.add("empty");
        inProgressDiv.innerHTML = "<i>Start working on a challenge, and it'll show up here!</i>";
    }
    else {
        inProgressDiv.classList.remove("empty");
        inProgressDiv.innerHTML += `<span class="material-symbols-outlined c-toggle">expand_less</span>`; // Toggle button is added if there are challenges in progress to show/hide
        cToggle = document.querySelector(".c-toggle");
        cToggle.addEventListener("click", () => {
            if (isOpen) {
                toggleInProgressDiv(cToggle, false);
            }
            else {
                toggleInProgressDiv(cToggle, true);
            }
            console.log(localStorage.getItem(`${lsUID}toggleState`));
        });
    }
    if (bCounter == 0) {
        browseDiv.classList.add("empty");
        browseDiv.innerHTML = "<i>No challenges match your search. Try another filter option!</i>";
    }
    else
        browseDiv.classList.remove("empty");
    inProgressTracker.innerHTML = `(${ipCounter})`;
    browseTracker.innerHTML = `(${bCounter})`;
}
function setChallengeHTML(c) {
    let tempCard = document.createElement("div");
    tempCard.classList.add("c-card");
    tempCard.innerHTML = `
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
        tempCard.innerHTML += `<span class="c-submitted"><span class="material-symbols-outlined">select_check_box</span> Submitted</span>`;
    }
    return tempCard;
}
const selectedFilters = {};
checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
        if (outerInProgressDiv.classList.contains("collapse")) {
            toggleInProgressDiv(cToggle, true);
        }
        const checkboxValue = event.target.value;
        const isChecked = event.target.checked;
        const filterType = event.target.name;
        if (isChecked) {
            if (!selectedFilters[filterType]) {
                selectedFilters[filterType] = [];
            }
            selectedFilters[filterType].push(checkboxValue);
        }
        else {
            const index = selectedFilters[filterType].indexOf(checkboxValue);
            if (index > -1) {
                selectedFilters[filterType].splice(index, 1);
            }
            if (selectedFilters[filterType].length === 0) {
                delete selectedFilters[filterType];
            }
        }
        filterChallenges();
    });
});
function filterChallenges() {
    displayedChallenges = challengeArray.filter(challenge => {
        return Object.keys(selectedFilters).every(filterType => {
            switch (filterType) {
                case "difficulty":
                    return selectedFilters[filterType].includes(challenge.difficulty);
                case "ongoing":
                    return challenge.ongoing === true;
                default:
                    return true;
            }
        });
    });
    clearChallenges();
    showChallenges(displayedChallenges);
}
function clearChallenges() {
    browseDiv.innerHTML = "";
    inProgressDiv.innerHTML = "";
    bCounter = 0;
    ipCounter = 0;
    inProgressTracker.innerHTML = "";
    browseTracker.innerHTML = "";
}
clearFiltersButton.addEventListener('click', () => {
    Object.keys(selectedFilters).forEach(filterType => {
        delete selectedFilters[filterType];
    });
    checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
    });
    filterChallenges();
});
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