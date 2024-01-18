let inProgressDiv = document.querySelector(".c-in-progress-container");
let browseDiv = document.querySelector(".c-browse-container");
class Challenge {
    constructor(name, desc, inProgress, imgURL, pid) {
        this.name = name;
        this.desc = desc;
        this.inProgress = inProgress;
        this.imgURL = imgURL;
        this.pid = pid;
    }
    name;
    desc;
    inProgress;
    imgURL;
    pid;
}
// let chall1 = new Challenge("Color Wheel", "Create a circular wheel which selects different colors based on the place the user clicks", true, "", "");
let chall2 = new Challenge("Combination Lock", "Create a combination lock which reveals a secret message when the correct combination is entered.", false, "", "");
let challengeArray = [chall2];
console.log(challengeArray);
async function getChallenges() {
    // code to fetch challenges here
    await wait(0);
}
window.addEventListener("load", async () => {
    await getChallenges();
    showChallenges();
});
let challengeInProgress = false;
function showChallenges() {
    for (let challenge of challengeArray) {
        let input = getChallengeHTML(challenge);
        if (!challenge.inProgress) {
            browseDiv.innerHTML += input;
        }
        else if (challenge.inProgress) {
            inProgressDiv.innerHTML += input;
            challengeInProgress = true;
        }
    }
    if (challengeInProgress == false) {
        inProgressDiv.innerHTML = "<i>No challenges in progress</i>";
    }
}
function getChallengeHTML(c) {
    return `
        <div class="chall">
            <img class="c-img" src="${c.imgURL}" alt="challenge image">
            <h3 class="c-name">
                ${c.name}
            </h3>
            <span>${c.desc}</span>
            <button>Open Preview</button>
        </div>
    `;
}
//# sourceMappingURL=practice.js.map