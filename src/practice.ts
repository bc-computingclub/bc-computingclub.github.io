const inProgressDiv = document.querySelector(".c-in-progress-container") as HTMLElement;
const browseDiv = document.querySelector(".c-browse-container") as HTMLElement;
// const cToggle = document.querySelector(".c-toggle") as HTMLElement;
let challengeInProgress = false;
let browseCounter = 0;
let inProgressCounter = 0;

class Challenge {
    constructor(name: string, desc: string, inProgress: boolean, imgURL: string, pid: string, submitted: boolean) {
        this.name = name;
        this.desc = desc;
        this.inProgress = inProgress;
        this.imgURL = imgURL;
        this.pid = pid;
        this.submitted = submitted;
    }

    name: string;
    desc: string;
    inProgress: boolean;
    imgURL: string;
    pid: string;
    submitted:boolean
}

let test1 = new Challenge("Color Wheel", "Create a circular wheel which selects different colors depending on user mouse input", true, "/images/fillerthumbnail.png", "",false);
let test2 = new Challenge("Combination Lock", "Create a combination lock which reveals a secret message when the correct combination is entered.", false, "/images/fillerthumbnail.png", "",true);
let test3 = new Challenge("To-Do List", "Create a to-do list, to which you can add and remove items as desired.", false, "/images/fillerthumbnail.png", "",false);

let challengeArray = [test1,test2,test3];
console.log(challengeArray);

async function getChallenges() {
    // code to fetch challenges here
    await wait(0);
}

window.addEventListener("load", async () => {
    await getChallenges();
    showChallenges();
    const cToggle = document.querySelector(".c-toggle") as HTMLElement;
    if(!cToggle) { console.log("cToggle does not exist"); }
    else {
        cToggle.addEventListener("click", () => {
            cToggle.classList.toggle("spin");
            inProgressDiv.classList.toggle("collapse");
        });
    }
});

function showChallenges() {
    for (let challenge of challengeArray) {
        if(challenge.inProgress) {challenge.submitted = false;}
        let tempElm = document.createElement("div") as HTMLElement;
        tempElm.classList.add("c-card");
        setChallengeHTML(tempElm,challenge);

        if (!challenge.inProgress) { 
            browseDiv.appendChild(tempElm); 
            browseCounter++;
        } else {
            inProgressDiv.appendChild(tempElm);
            inProgressCounter++;
            challengeInProgress = true;
        }
    }
    if(challengeInProgress == false) {
        inProgressDiv.innerHTML = "<i>Start working on a challenge, and it'll show up here!</i>";
        inProgressDiv.classList.add("empty");
    } else {
        inProgressDiv.classList.remove("empty");
        inProgressDiv.innerHTML += `<span class="material-symbols-outlined c-toggle">expand_less</span>` // Toggle button is added if there are challenges in progress to show/hide
    }
}

function setChallengeHTML(elm:HTMLElement,c:Challenge) {
    elm.innerHTML =`
        <img class="c-img" src="${c.imgURL}" alt="challenge image">
        <h3 class="c-name">
            ${c.name}
        </h3>
        <span class="c-text">${c.desc}</span>
        <button class="c-btn">Open Preview</button>
    `;
    if(c.submitted) {
        elm.innerHTML += `<span class="c-submitted"><span class="material-symbols-outlined">select_check_box</span> Submitted</span>`;
    }
}