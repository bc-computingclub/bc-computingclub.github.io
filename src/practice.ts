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

let cLeft:HTMLElement;
let challengePopupBody:HTMLElement;
let tempPopupBody:HTMLElement;
let cToggle:HTMLElement;
let displayedChallenges: Challenge[] = [];

const checkboxes = document.querySelectorAll('input[type="checkbox"]');
const lsUID = "BCC-01";

let bCounter = 0;
let ipCounter = 0;

class Challenge {
    constructor(cID: string, name: string, desc: string, inProgress: boolean, imgURL: string, pid: string, submitted: boolean, difficulty: string, ongoing:boolean, submission_count:string) {
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
        this.sub_highlights = [];
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
    timespan:{start:string,end:string};
    sub_highlights:Submission[];

    static from(data:any){
        let c = new Challenge(data.id,data.name,data.desc,false,data.imgUrl,null,false,data.difficulty,data.ongoing,"0");
        c.timespan = data.timespan;
        c.sub_highlights = data.hl.map((v:any)=>new Submission(v.url,v.who));
        c.inProgress = data.inProgress;
        // c.completed = data.completed;
        return c;
    }
}

class DetailedChallenge extends Challenge {
    constructor(cID: string, name: string, desc: string, inProgress: boolean, imgURL: string, pid: string, submitted: boolean, difficulty: string, ongoing:boolean, submission_count:string, submissions:Submission[]) {
        super(cID, name, desc, inProgress, imgURL, pid, submitted, difficulty, ongoing, submission_count);
        this.submissions = submissions;
    }

    submissions:Submission[]; // max size of 3 // (Claeb: I'm going to move this to Challenge)

    static fromDetails(c:Challenge,data:any){
        let dc = new DetailedChallenge(c.cID,c.name,c.desc,c.inProgress,c.imgURL,c.pid,c.submitted,c.difficulty,c.ongoing,c.submission_count,data.submissions);
        return dc;
    }
}

class Submission {
    constructor(previewURL: string, sentBy:string) {
        this.previewURL = previewURL;
        this.sentBy = sentBy;
    }
    previewURL:string;
    sentBy:string;
    //feel free to add more fields here
}

// let test1 = new Challenge("01", "Color Wheel", "Create a circular wheel which selects different colors depending on user mouse input", true, "/images/colorwheel.png", "", false, "easy",false,"1");
// let test2 = new Challenge("02", "Combination Lock", "Create a combination lock which reveals a secret message when the correct combination is entered.", false, "/images/fillerthumbnail.png", "", true, "medium",false,"3");
// let test3 = new Challenge("03", "To-Do List", "Create a to-do list, to which you can add and remove items as desired.", false, "/images/fillerthumbnail.png", "", false, "easy",false,"10");
// let test4 = new Challenge("04", "Water Wheel", "Design a button which can be dragged around a circle, controlling the water level in a cup.", false, "/images/water-level.png", "", false, "code-wizard",true,"2");
// let challengeArray = [test1, test2, test3, test4];
let challengeArray:Challenge[] = [];

let sub1 = new Submission("/images/fillerthumbnail.png", "Paul Bauer");
let sub2 = new Submission("/images/fillerthumbnail.png", "Claeb Claeb");
let sub3 = new Submission("/images/fillerthumbnail.png", "Butler Test");
let submissionArray = [sub1, sub2];

let testDetailed = new DetailedChallenge("04", "Water Wheel", "Design a button which can be dragged around a circle, controlling the water level in a cup.", false, "/images/water-level.png", "", false, "code-wizard",true,"2",submissionArray);

async function getChallenges() {
    challengeArray = await getServerChallenges();
}

let isOpen: boolean;
window.addEventListener("load", async () => {
    await loginProm; // Ensures user is logged in before challenges are fetched.
    
    await getChallenges();
    showChallenges(challengeArray,true);
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
    constructor(c:Challenge) { 
        super("Challenge Menu");
        this.c = c;
    }

    c: Challenge;

    load() {
        super.load();
        this.menu.style.width = "auto";
        this.menu.style.height = "auto";
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
                                <button class="c-view-all" onclick="showImplementations(${this.c.cID})">
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
                        <span class="c-difficulty-text">Difficulty:</span><span class="c-difficulty-number">${this.c.difficulty}</span>
                    </div>
                    <button class="c-start" onclick="${!this.c.inProgress ? `startChallenge('${this.c.cID}')` : `continueChallenge('${this.c.cID}')`}"><h3>${this.c.inProgress ? "Continue" : "Start"}</h3><span class="material-symbols-outlined c-start-arrow">arrow_forward_ios<span/></button>
                </div>
            </div>
        `;
        if(this.c.sub_highlights?.length){
            for(let i = 0; i < this.c.sub_highlights.length; i++) {
                document.querySelector(".c-implementations").innerHTML += `
                    <div class="c-implementation">
                        <div class="c-implementation-preview">
                            <img class="c-implementation-img" src="${this.c.sub_highlights[i].previewURL}" alt="challenge image">
                        </div>
                        <div class="c-implementation-credit">${this.c.sub_highlights[i].sentBy}</div>
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
        cLeft = document.querySelector(".c-popup-left") as HTMLElement;

        let cBtn = document.querySelector(".c-popup-close") as HTMLElement;
        cBtn.onclick = () => {
            this.close();
        }
        return this;
    }
}

function showImplementations(cID:string) {
    // add code to get array of all submissions from server using cID
    let subArr = submissionArray; // delete once we have server code
    
    challengePopupBody = document.querySelector(".c-popup-body") as HTMLElement;
    tempPopupBody = challengePopupBody.cloneNode(true) as HTMLElement;
    while(challengePopupBody.firstChild) challengePopupBody.removeChild(challengePopupBody.firstChild); // clear body
    challengePopupBody.append(getImplementationsHTML());
    for(let i = 0; i < subArr.length; i++) {
        let implementationsCont = document.querySelector(".c-implementations") as HTMLElement;
        implementationsCont.innerHTML += `
            <div class="c-implementation">
                <div class="c-implementation-preview">
                    <img class="c-implementation-img" src="${subArr[i].previewURL}" alt="challenge image">
                </div>
                <div class="c-implementation-credit">${subArr[i].sentBy}</div>
            </div>
        `
    }
}

function getImplementationsHTML() {
    let temp = document.createElement("div") as HTMLElement;
    temp.classList.add("c-popup-implementations");
    temp.innerHTML = `
        <div class="c-popup-implementations-header">
            <h4 class="c-popup-sub-title">Implementations</h4>
            <button class="c-back" onclick="resetChallengeBody();">
            Back <span class="material-symbols-outlined c-back-arrow">arrow_back_ios</span>
        </button>
        </div>
        <div class="c-implementations">
        </div>
    `;
    return temp;
}

function resetChallengeBody() {
    challengePopupBody.remove();
    console.log("Attempting to reset body of challenge popup");
    cLeft.append(tempPopupBody);
    tempPopupBody = challengePopupBody.cloneNode(true) as HTMLElement;
}

async function startChallenge(cid:string){
    socket.emit("startChallenge",cid,(data:number|string)=>{
        if(typeof data == "number"){
            alert("Error while trying to start challenge, error code:"+data);
            return;
        }
        // alert("Successfully started challenge with pid: "+data);
        goToProject(data);
    });
}
async function continueChallenge(cid:string){
    let pid = await new Promise<string>(resolve=>{
        socket.emit("continueChallenge",cid,(pid:any)=>{
            resolve(pid);
        });
    });
    if(pid == null) return;
    goToProject(pid);
}

let curChallengeMenu:ChallengeMenu;
async function createChallengePopup(c:Challenge) {
    console.log("Creating Challenge");
    if(curChallengeMenu) curChallengeMenu.close();
    curChallengeMenu = new ChallengeMenu(c);
    curChallengeMenu.load();
}

async function showChallenges(cArr: Challenge[], showAnim?:boolean) {
    if(showAnim) await showLoadingAnim("500"); // feel free to change delay
    for (let challenge of cArr) {
        setChallengeHTML(challenge);
    }
    await hideLoadingAnim();
    if (ipCounter <= 0) {
        inProgressDiv.classList.add("empty");
        inProgressDiv.innerHTML = "<i>Start working on a challenge, and it'll show up here!</i>";
    } else {   
        inProgressDiv.classList.remove("empty");
        cToggle = document.createElement("span") as HTMLElement;
        cToggle.classList.add("material-symbols-outlined","c-toggle");
        cToggle.innerHTML = "expand_less";
        cToggle.classList.add(localStorage.getItem(`${lsUID}toggleState`) == "closed" ? "point-down" : "point-up");
        inProgressHeader.append(cToggle);
    }
    if(bCounter == 0) {
        browseDiv.classList.add("empty");
        browseDiv.innerHTML = "<i>No challenges match your search. Try another filter option!</i>";
    } else browseDiv.classList.remove("empty");
    
    inProgressTracker.innerHTML = `(${ipCounter})`;
    browseTracker.innerHTML = `(${bCounter})`;
    addClickEventListener(cToggle);
}

function addClickEventListener(cToggle:HTMLElement) {
    if(cToggle) {
        cToggle.addEventListener("click", () => {
        if (isOpen) {
            toggleInProgressDiv(cToggle, false);
        } else {
            toggleInProgressDiv(cToggle, true);
        }
        console.log(localStorage.getItem(`${lsUID}toggleState`));
        });
    }
}

function setChallengeHTML(c: Challenge) {
    let tempCard = document.createElement("div") as HTMLElement;
    tempCard.classList.add("c-card");

    if (!c.inProgress) {
        browseDiv.appendChild(tempCard);
        bCounter++;
    } else {
        inProgressDiv.appendChild(tempCard);
        ipCounter++;
    }
    
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
    if(c.inProgress) {
        let tempSpan = document.createElement("span");
        tempSpan.className = "c-details material-symbols-outlined";
        tempSpan.innerHTML = "more_horiz";
        tempSpan.addEventListener("click", () =>  createRemoveBtn(c.cID, tempCard));
        tempCard.appendChild(tempSpan);
    }
    if (c.submitted) {
        let submittedSpan = document.createElement("span");
        submittedSpan.className = "c-submitted";
        submittedSpan.innerHTML = `<span class="material-symbols-outlined">select_check_box</span>Submitted`;
        tempCard.appendChild(submittedSpan);
    }
    return tempCard;
}

function createRemoveBtn(cID:Challenge["cID"], elm:HTMLElement) {
    console.log("Creating Remove Button")
    let deleteDiv = document.createElement("div") as HTMLElement;
    deleteDiv.classList.add("c-delete-div");
    deleteDiv.innerHTML = `
        <button class="c-delete-btn" onclick="confirmProgressDeletion('${cID}');">
            Delete progress
            <span class="material-symbols-outlined">delete</span>
        </button>
    `;
    elm.appendChild(deleteDiv);
}

class DeleteMenu extends Menu {
    constructor(cID:Challenge["cID"]) {
        super("Delete Progress","delete");
        this.cID = cID;
    }
    cID:Challenge["cID"];

    load(priority?: number){
        super.load();
        this.body.innerHTML = `
            <div class="c-confirm-div">
                <span class="c-confirm-text">Are you sure you want to delete your progress towards this challenge? You won't be able to get it back...</span>
                <div class="c-confirm-options">
                    <button class="c-confirm-btn">
                        Yes
                    </button>
                    <button class="c-cancel-btn">
                        No (Cancel)
                    </button>
                </div>
            </div>
        `;
        document.querySelector(".c-cancel-btn").addEventListener("click", () => {
            cancelProgressDeletion();
            this.close();
        })
        document.querySelector(".c-confirm-btn").addEventListener("click", () => {
            deleteProgress(this.cID);
            this.close();
        });
        return this;
    }

    onClose(): void {
        cancelProgressDeletion();
    }
}

let deleteMenu:DeleteMenu;
function confirmProgressDeletion(cID:Challenge["cID"]) {
    if(deleteMenu) deleteMenu.close();
    deleteMenu = new DeleteMenu(cID).load();
}

function cancelProgressDeletion() {
    if (document.querySelector(".c-delete-div")) document.querySelector(".c-delete-div").remove();
    if (document.querySelector(".c-confirm-div")) document.querySelector(".c-confirm-div").remove();
}

async function deleteProgress(cID:Challenge["cID"]) {
    console.log("Deleting progress on challenge: " + cID);
    // Challenge["cID"].inProgress = false; ... and then send this to the server? or does it need to be a query of its own?
    // delete any Project on the server which is associated with this challenge
    // i'm going to need your help here Caleb lol
}

async function setupButton(cID:Challenge["cID"]) {
    await createChallengePopup(challengeArray.find(v=>v.cID == cID));
}

const selectedFilters = {};
checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
        if(outerInProgressDiv.classList.contains("collapse")) { toggleInProgressDiv(cToggle, true); }
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

// Potential loading animation, if you don't like it feel free to change! CSS obtained from loading.io
// Important: This only triggers on page load for now. I added a delay property if you want to shorten it and add it to sorting?
let loadingDiv:HTMLElement;
async function showLoadingAnim(delay:string) {
    loadingDiv = document.createElement("div") as HTMLElement;
    loadingDiv.classList.add("loading-div");
    loadingDiv.innerHTML = `
        <div class="lds-cont"><div></div><div></div><div></div></div>
        <span class ="loading-text">Loading...</span>
    `;
    let temp = loadingDiv
    browseDiv.appendChild(loadingDiv);
    inProgressDiv.appendChild(loadingDiv.cloneNode(true));
    await wait(parseInt(delay));
}

async function hideLoadingAnim() {
    let loadingDivs = document.querySelectorAll(".loading-div") as NodeListOf<HTMLElement>;
    loadingDivs.forEach((div:HTMLElement) => { div.remove(); });
}

async function filterChallenges() {
    await getChallenges();

    if(false) displayedChallenges = challengeArray.filter(challenge => {
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
    else displayedChallenges = challengeArray;

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

let searchOption:string = "popularity";
let searchDesc:boolean = true;
async function sortChallenges(option:string,descending:boolean) {
    // showLoadingAnim("500"); // change delay as you see fit, i can't tell what looks good or bad
    clearChallenges();
    
    searchOption = option;
    searchDesc = descending;
    await getChallenges();
    if(challengeArray.filter(c => c.inProgress).length == 1) {toggleInProgressDiv(cToggle, false); } // if there's 1 challenge in progress, close section, since sorting it would be pointless
    showChallenges(challengeArray);
    // hideLoadingAnim();
    return; // vvv - Claeb: moved this to server side
    
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

    showChallenges(displayedChallenges);
}

function toggleSortMenu() {
    cSortDiv.classList.toggle("collapse");
}