const inProgressDiv = document.querySelector(".c-in-progress-container") as HTMLElement;
const outerInProgressDiv = document.querySelector(".c-outer-in-progress") as HTMLElement;
const browseDiv = document.querySelector(".c-browse-container") as HTMLElement;
const inProgressHeader = document.querySelector(".c-ip-container-header") as HTMLElement;
const inProgressTracker = document.querySelector(".c-in-progress-counter") as HTMLElement;
const browseTracker = document.querySelector(".c-browse-counter") as HTMLElement;
const browseHeader = document.querySelector(".c-browse-container-header") as HTMLElement;
const cHome = document.querySelector(".c-home") as HTMLElement;
const clearFiltersButton = document.querySelector(".clear-filters") as HTMLElement;
const cSortDiv = document.querySelector(".c-sort-div") as HTMLElement;
const cSort = document.querySelector(".c-sort-btn") as HTMLElement;

let cToggle;
let displayedChallenges: Challenge[] = [];

const checkboxes = document.querySelectorAll('input[type="checkbox"]');

const lsUID = "BCC-01";

let bCounter = 0;
let ipCounter = 0;``

class Challenge {
    constructor(cID: string, name: string, desc: string, inProgress: boolean, imgURL: string, pid: string, submitted: boolean, difficulty: string, ongoing: boolean, submission_count:string) {
        this.name = name;
        this.desc = desc;
        this.inProgress = inProgress;
        this.imgURL = imgURL;
        this.pid = pid;
        this.submitted = submitted;
        this.cID = cID;
        this.difficulty = difficulty;
        this.ongoing = ongoing;
        this.submission_count = submission_count;
    }

    name: string;
    desc: string;
    inProgress: boolean;
    imgURL: string;
    pid: string;
    submitted: boolean;
    cID: string;
    difficulty: string;
    ongoing: boolean;
    submission_count: string;
}

class DetailedChallenge extends Challenge {
    constructor(cID: string, name: string, desc: string, inProgress: boolean, imgURL: string, pid: string, submitted: boolean, difficulty: string, ongoing:boolean, submission_count:string, submissions) {
        super(cID, name, desc, inProgress, imgURL, pid, submitted, difficulty, ongoing, submission_count);
        this.submissions = submissions;
    }

    submissions;
}

class Submission {
    constructor(previewURL: string, sentBy:string) {
        this.previewURL = previewURL;
        this.sentBy = sentBy;
    }
    previewURL:string;
    sentBy:string;
}

let test1 = new Challenge("01", "Color Wheel", "Create a circular wheel which selects different colors depending on user mouse input", true, "/images/colorwheel.png", "", false, "easy",false,"1");
let test2 = new Challenge("02", "Combination Lock", "Create a combination lock which reveals a secret message when the correct combination is entered.", false, "/images/fillerthumbnail.png", "", true, "medium",false,"3");
let test3 = new Challenge("03", "To-Do List", "Create a to-do list, to which you can add and remove items as desired.", false, "/images/fillerthumbnail.png", "", false, "easy",false,"10");
let test4 = new Challenge("04", "Water Wheel", "Design a button which can be dragged around a circle, controlling the water level in a cup.", false, "/images/water-level.png", "", false, "code-wizard",true,"2");
let challengeArray = [test1, test2, test3, test4];

let testDetailed = new DetailedChallenge("04", "Water Wheel", "Design a button which can be dragged around a circle, controlling the water level in a cup.", false, "/images/water-level.png", "", false, "code-wizard",true,"2",[]);

let sub1 = new Submission("/images/fillerthumbnail.png", "Paul Bauer");
let sub2 = new Submission("/images/fillerthumbnail.png", "Claeb Claeb");
let sub3 = new Submission("/images/fillerthumbnail.png", "Butler Test");
let submissionArray = [sub1, sub2];

async function getChallenges() {
    // challengeArray = await (code goes here)
    return challengeArray;
}

let isOpen: boolean;
window.addEventListener("load", async () => {
    let temp = await getChallenges();
    showChallenges(temp);
    let toggleState = localStorage.getItem(`${lsUID}toggleState`) || "open";
    isOpen = toggleState == "open" ? true : false;

    if (isOpen == false) {
        if(challengeArray.filter(c => c.inProgress).length > 0) {
            toggleInProgressDiv(cToggle, false);
        }
        outerInProgressDiv.classList.add("window-load");
    }
});

function toggleInProgressDiv(btn: HTMLElement, opening: boolean) {
    outerInProgressDiv.classList.remove("window-load");
    if (opening) {
        isOpen = true;
        localStorage.setItem(`${lsUID}toggleState`, "open");
        btn.classList.remove("point-down");
        btn.classList.add("point-up");
        outerInProgressDiv.classList.remove("collapse");
    } else {
        isOpen = false;
        localStorage.setItem(`${lsUID}toggleState`, "closed");
        btn.classList.remove("point-up");
        btn.classList.add("point-down");
        outerInProgressDiv.classList.add("collapse");
    }
}

class ChallengeMenu extends Menu {
    constructor(c:DetailedChallenge,submissions:Submission[]) {
        super("Challenge Menu");
        this.c = c;
        this.submissions = submissions;
    }

    c: DetailedChallenge;
    submissions: Submission[];

    load() {
        super.load();
        this.menu.innerHTML = `
            <div class="c-popup">
                <div class ="c-popup-left">
                    <div class="c-popup-header">
                        <h2 class="c-popup-title">${this.c.name}</h2>
                        <i class="c-attempted"> ${this.c.submitted ? "Attempted" : "Not Attempted"}</i>
                    </div>
                    <div class="c-popup-body">
                        <div class ="c-popup-task">
                            <h4 class="c-popup-sub-title">Task</h4>
                            <span class="c-popup-task-text">${this.c.desc}</span>
                        </div>
                        <div class ="c-popup-implementations">
                            <div class="c-popup-implementations-header">
                                <h4 class="c-popup-sub-title">Implementations</h4>
                                <button class="c-view-all">
                                    View All (${this.c.submission_count})
                                </button>
                            </div>
                            <div class="c-implementations">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="c-popup-right">
                    <div class="c-popup-close material-symbols-outlined">
                        close
                    </div>
                    <div class="c-popup-img-div">
                        <img class="c-popup-img" src="${this.c.imgURL}" alt="challenge image">
                        <i class="c-popup-img-text">Sketch Mockup</i>
                    </div>
                    <div class="c-difficulty">
                        <span class="c-difficulty-text">Difficulty: <span class="c-difficulty-number">${this.c.difficulty}</span></span>
                    </div>
                    <button class="c-start" onclick="alert("starting challenge");"><h3>${this.c.inProgress ? "Continue" : "Start"}</h3><span class="material-symbols-outlined c-start-arrow">arrow_forward_ios<span/></button>
                </div>
            </div>
        `;
        if(this.submissions != null){
            for(let i = 0; i < this.submissions.length; i++) {
                document.querySelector(".c-implementations").innerHTML += `
                    <div class="c-implementation">
                        <div class="c-implementation-preview">
                            <img class="c-implementation-img" src="${this.submissions[i].previewURL}" alt="challenge image">
                        </div>
                        <div class="c-implementation-credit">${this.submissions[i].sentBy}</div>
                    </div>
                `
            }
        } else {
            document.querySelector(".c-implementations").innerHTML = "<i>There are currently no submissions to this challenge. Upload one to be featured here!</i>";
            document.querySelector(".c-implementations").classList.add("empty");
            document.querySelector(".c-view-all").classList.add("empty");
            console.log("No submissions found for this challenge.");
        }

        this.menu.style.width = (document.querySelector(".c-popup") as HTMLElement).getBoundingClientRect().width + "px";
        this.menu.style.right = "0px";
        
        let cBtn = document.querySelector(".c-popup-close") as HTMLElement;
        cBtn.onclick = () => {
            this.close();
        }

        let viewAllBtn = document.querySelector(".c-view-all") as HTMLElement;
        viewAllBtn.onclick = () => {
            let temp = document.querySelector(".c-popup-body").innerHTML;
            document.querySelector(".c-popup-body").innerHTML = `
            <div class ="c-popup-implementations">
                <div class="c-popup-implementations-header">
                    <h4 class="c-popup-sub-title">Implementations</h4>
                    <button class="c-back">
                        Back <span class="material-symbols-outlined c-back-arrow">arrow_back_ios</span>
                    </button>
                </div>
                <div class="c-implementations">
                </div>
            </div>
            `;
            document.querySelector(".c-back").addEventListener("click", () => {
                document.querySelector(".c-popup-body").innerHTML = temp;
                this.load(); // this is big time broken but it's late and i need sleep lol 
            });
        }
    }
}


async function createChallengePopup(cID) {
    // get detailed challenge data from server using cID
    console.log("Creating Challenge");
    let cDetailed = testDetailed;
    let cSubmissions = submissionArray;
    new ChallengeMenu(cDetailed,cSubmissions).load();
}

function showChallenges(cArr: Challenge[]) {
    for (let challenge of cArr) {
        let cardElm = setChallengeHTML(challenge);
        if (!challenge.inProgress) {
            browseDiv.appendChild(cardElm);
            bCounter++;
        } else {
            inProgressDiv.appendChild(cardElm);
            ipCounter++;
        }
    }
    if (ipCounter == 0) {
        inProgressDiv.classList.add("empty");
        inProgressDiv.innerHTML = "<i>Start working on a challenge, and it'll show up here!</i>";
    } else {
        inProgressDiv.classList.remove("empty");
        inProgressDiv.innerHTML += `<span class="material-symbols-outlined c-toggle">expand_less</span>` // Toggle button is added if there are challenges in progress to show/hide
        cToggle = document.querySelector(".c-toggle") as HTMLElement;
        cToggle.classList.add(localStorage.getItem(`${lsUID}toggleState`) == "closed" ? "point-down" : "point-up");
        cToggle.addEventListener("click", () => {
            if (isOpen) {
                toggleInProgressDiv(cToggle, false);
            } else {
                toggleInProgressDiv(cToggle, true);
            }
            console.log(localStorage.getItem(`${lsUID}toggleState`));
        });
    }
    if(bCounter == 0) {
        browseDiv.classList.add("empty");
        browseDiv.innerHTML = "<i>No challenges match your search. Try another filter option!</i>";
    } else browseDiv.classList.remove("empty");
    
    inProgressTracker.innerHTML = `(${ipCounter})`;
    browseTracker.innerHTML = `(${bCounter})`;
}

function setChallengeHTML(c: Challenge) {
    let tempCard = document.createElement("div") as HTMLElement;
    tempCard.classList.add("c-card");
    tempCard.innerHTML = `
        <div class="c-img-div">
            <img class="c-img" src="${c.imgURL}" alt="challenge image">
        </div>
        <h3 class="c-name">
            ${c.name}
        </h3>
        <span class="c-text">${c.desc}</span>
        <button class="c-preview" onclick="setupButton(${c.cID});">
            Open Preview
        </button>
    `;
    if (c.submitted) {
        tempCard.innerHTML += `<span class="c-submitted"><span class="material-symbols-outlined">select_check_box</span> Submitted</span>`;
    }
    return tempCard;
}

async function setupButton(cID:Challenge["cID"]) {
    await createChallengePopup(cID);
}

const selectedFilters = {};
checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
        if(outerInProgressDiv.classList.contains("collapse")) { toggleInProgressDiv(cToggle, true);}
        const checkboxValue = (event.target as HTMLInputElement).value;
        const isChecked = (event.target as HTMLInputElement).checked;
        const filterType = (event.target as HTMLInputElement).name;

        if (isChecked) {
            if (!selectedFilters[filterType]) {
                selectedFilters[filterType] = [];
            }
            selectedFilters[filterType].push(checkboxValue);
        } else {
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

let loadingDiv:HTMLElement;
async function showLoadingAnim(elm:HTMLElement) {
    loadingDiv = document.createElement("div") as HTMLElement;
    loadingDiv.classList.add("loading-div");
    loadingDiv.innerHTML = `
        <div class="loading-elm material-symbols-outlined">
            progress_activity
        </div>
        <span class ="loading-text">Loading...</span>
    `;
    elm.appendChild(loadingDiv);
}

async function hideLoadingAnim() {
    loadingDiv.remove();
}

function filterChallenges() { 
    displayedChallenges = challengeArray.filter(challenge => {
        return Object.keys(selectedFilters).every(filterType => {
            switch (filterType) {
                case "difficulty":
                    return selectedFilters[filterType].includes(challenge.difficulty);
                case "ongoing":
                        return challenge.ongoing === true;
                case "completed":
                        return challenge.submitted === true;
                default:
                    return true;
            }
        });
    });

    clearChallenges();
    showChallenges(displayedChallenges);
}

function clearChallenges() { // resets challenge containers and counters
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
    checkboxes.forEach((checkbox:HTMLInputElement) => {
        checkbox.checked = false;
    });

    filterChallenges();
});

cSortDiv.addEventListener('click', () => {
    toggleSortMenu();
});

function sortChallenges(option:string,descending:boolean) {
    clearChallenges();
    displayedChallenges = challengeArray.sort((a,b) => {
        switch(option) {
            case "popularity":
                if(descending) {
                    return parseInt(b.submission_count) - parseInt(a.submission_count);
                } else return parseInt(a.submission_count) - parseInt(b.submission_count);
            case "alphabetical":
                if(descending) {
                    return a.name.localeCompare(b.name);
                } return b.name.localeCompare(a.name);
        }
    });
    if(challengeArray.filter(c => c.inProgress).length == 1) {toggleInProgressDiv(cToggle, false); } // if there's 1 challenge in progress, close it

    showChallenges(displayedChallenges);
}

function toggleSortMenu() {
    if(cSortDiv.classList.contains("collapse")) {
        cSortDiv.classList.remove("collapse");
        cSort.classList.add("point-up");
        cSort.classList.remove("point-down");
    } else {
        cSortDiv.classList.add("collapse");
        cSort.classList.remove("point-up");
        cSort.classList.add("point-down");
    }
}