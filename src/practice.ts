const inProgressDiv = document.querySelector(".c-in-progress-container") as HTMLElement;
const browseDiv = document.querySelector(".c-browse-container") as HTMLElement;
// const cToggle = document.querySelector(".c-toggle") as HTMLElement;
let challengeInProgress = false;
let bCounter = 0;
let ipCounter = 0;

class Challenge {
    constructor(cID:string, name: string, desc: string, inProgress: boolean, imgURL: string, pid: string, submitted: boolean) {
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
    submitted:boolean;
    cID:string;
}

let test1 = new Challenge("","Color Wheel", "Create a circular wheel which selects different colors depending on user mouse input", true, "/images/fillerthumbnail.png", "",false);
let test2 = new Challenge("","Combination Lock", "Create a combination lock which reveals a secret message when the correct combination is entered.", false, "/images/fillerthumbnail.png", "",true);
let test3 = new Challenge("","To-Do List", "Create a to-do list, to which you can add and remove items as desired.", false, "/images/fillerthumbnail.png", "",false);

let challengeArray = [test1,test2,test3];
console.log(challengeArray);

async function getChallenges() {
    // challengeArray = await (code goes here)
    await wait(0);
}

window.addEventListener("load", async () => {
    await getChallenges();
    showChallenges();
    const cToggle = document.querySelector(".c-toggle") as HTMLElement;
    cToggle.addEventListener("click", () => {
        cToggle.classList.toggle("spin");
        inProgressDiv.classList.toggle("collapse");
    });
    const cPreview = document.querySelectorAll(".c-preview") as NodeListOf<HTMLElement>;
    cPreview.forEach((e:HTMLElement) => {
        e.addEventListener("click", () => {
            createChallengePopup(e.getAttribute("c-id"));
        });
    });
});

async function createChallengePopup(cID) {
    // get detailed challenge data from server using cID
    let cPopup = document.createElement("div") as HTMLElement;
    cPopup.classList.add("c-popup");
    console.log("Creating Popup");    
    cPopup.innerHTML = `
    `
}

function showChallenges() {
    for (let challenge of challengeArray) {
        if(challenge.inProgress) {challenge.submitted = false;}
        let tempElm = document.createElement("div") as HTMLElement;
        tempElm.classList.add("c-card");
        setChallengeHTML(tempElm,challenge);

        if (!challenge.inProgress) { 
            browseDiv.appendChild(tempElm);
            bCounter++;
        } else {
            inProgressDiv.appendChild(tempElm);
            ipCounter++;
            challengeInProgress = true;
        }
    }
    if(challengeInProgress == false) {
        inProgressDiv.classList.add("empty");
        inProgressDiv.innerHTML = "<i>Start working on a challenge, and it'll show up here!</i>";
    } else {
        inProgressDiv.classList.remove("empty");
        inProgressDiv.innerHTML += `<span class="material-symbols-outlined c-toggle">expand_less</span>` // Toggle button is added if there are challenges in progress to show/hide
    }
}

function setChallengeHTML(elm:HTMLElement,c:Challenge) {
    elm.innerHTML =`
        <div class="c-img-div">
            <img class="c-img" src="${c.imgURL}" alt="challenge image">
        </div>
        <h3 class="c-name">
            ${c.name}
        </h3>
        <span class="c-text">${c.desc}</span>
        <button class="c-preview" c-id="${c.cID}">Open Preview</button>
    `;
    if(c.submitted) {
        elm.innerHTML += `<span class="c-submitted"><span class="material-symbols-outlined">select_check_box</span> Submitted</span>`;
    }
}