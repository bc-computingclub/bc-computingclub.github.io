let url = new URL(location.href);
let cId = url.searchParams.get("cid") || "";
const cTitle = document.querySelector<HTMLElement>(".c-title");
const cDetails = document.querySelector<HTMLElement>(".c-details");
const cBack = document.querySelector<HTMLElement>(".c-back");
const sSort = document.querySelector<HTMLElement>(".s-sort");
const sContainer = document.querySelector<HTMLElement>(".s-container");
let showAnim = true;

// Get submissions based on cID
// Get challenge based on cID

let sub1 = new Submission("/images/fillerthumbnail.png", "Paul Bauer", "112","01");
let sub2 = new Submission("/images/fillerthumbnail.png", "Claeb Claeb", "367","02");
let sub3 = new Submission("/images/fillerthumbnail.png", "Butler Test", "245","03");
let submissionArray = [sub1, sub2, sub1, sub2, sub1, sub2];

let test1 = new Challenge("01", "Color Wheel", "Create a circular wheel which selects different colors depending on user mouse input", true, "/images/colorwheel.png", "", false, "easy", false, "1");

async function showSubmissions(submissionArray: Submission[]) {
  if (showAnim) await showLoadingAnim([sContainer],"400");
  showAnim = false;
  for (const sub of submissionArray) {
    let tempSub: HTMLElement = getSubmissionElement(sub);
    sContainer.appendChild(tempSub);
  }
  await hideLoadingAnim();
}

function toggleLineCount(sub: HTMLElement) {
  let sLineCount: HTMLElement = sub.querySelector(".s-line-count");
  sLineCount.classList.toggle("show-count");
}

function getSubmissionElement(submission: Submission): HTMLElement {
  let subDiv = document.createElement("div");
  subDiv.className = "s-card";
  subDiv.innerHTML = `
    <div class="s-img-div">
      <img src="${submission.previewURL}" alt="Submission Thumbnail" class="s-img">
      <i class="s-line-count">${submission.lineCount}</i>
    </div>
    <div class="s-card-info">
      <div>${submission.sentBy}</div>
      <button class="s-open-preview" pID="${submission.pID}">
        Open
      </button>
    </div>
  `;
  return subDiv;
}

cDetails.addEventListener("click", async () => {
  await createChallengePopup(test1); // replace with reference to actual challenge
});

cBack.addEventListener("click", () => {
  window.location.href = `index.html?cid=${cId}`;
});

window.onload = () => {
  cTitle.style.opacity = "1";
  cTitle.textContent = `${test1.name} Challenge`;
  showSubmissions(submissionArray);
  const previewButtons = document.querySelectorAll(".s-open-preview") as NodeListOf<HTMLElement>;
  previewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      createSubmissionMenu(submissionArray[button.getAttribute("pID")]);
    })
  })
}

function createSubmissionMenu(sub:Submission) {
  console.log("Creating Submission Menu");
  if (curSubMenu) {
    curSubMenu.close();
    console.log("already a menu");
  }
  curSubMenu = new SubmissionMenu(sub);
  curSubMenu.load();
}

sSort.addEventListener('click', () => {
  sSort.classList.toggle("collapse");
});

let curSubMenu: SubmissionMenu;
class SubmissionMenu extends Menu {
  constructor(submission:Submission) {
    super("Submission Menu");
    this.submission = submission;
  }

  submission:Submission;
  
  load() {
    super.load();
    this.menu.innerHTML = `
      <div class="s-popup">
        
      </div>
    `;

    let sPopupClose = document.querySelector(".c-popup-close") as HTMLElement;
    sPopupClose.onclick = () => { this.close(); };
    return this;
  }
}

// class ChallengeMenu extends Menu {
//   constructor(c: Challenge) {
//     super("Challenge Menu");
//     this.c = c;
//   }

//   c: Challenge;

//   load() {
//     super.load();
//     this.menu.style.width = "auto";
//     this.menu.style.height = "auto";
//     let areSubmissions: boolean =
//       parseInt(this.c.submission_count) <= 0 ? false : true;
//     this.menu.innerHTML = `
//             <div class="c-popup">
//                 <div class ="c-popup-left">
//                     <div class="c-popup-header">
//                         <h2 class="c-popup-title">${this.c.name}</h2>
//                         <i class="c-attempted"> ${this.c.submitted ? "Attempted" : "Not Attempted"}</i>
//                     </div>
//                     <div class="c-popup-body">
//                         <div class ="c-popup-task">
//                             <h4 class="c-popup-sub-title">Task</h4>
//                             <span class="c-popup-task-text">${this.c.desc}</span>
//                         </div>
//                         <div class ="c-popup-implementations">
//                             <div class="c-popup-implementations-header">
//                                 <h4 class="c-popup-sub-title">Submissions</h4>
//                                 <button class="c-view-all" onclick="showImplementations('${this.c.cID}','${areSubmissions}')">
//                                     View All (${this.c.submission_count})
//                                 </button>
//                             </div>
//                             <div class="c-implementations">
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                 <div class="c-popup-right">
//                     <div class="c-popup-close material-symbols-outlined">
//                         close
//                     </div>
//                     <div class="c-popup-img-div">
//                         <img class="c-popup-img" src="${this.c.imgURL}" alt="challenge image">
//                         <i class="c-popup-img-text">Sketch Mockup</i>
//                     </div>
//                     <div class="c-difficulty">
//                         <span class="c-difficulty-text">Difficulty:</span><span class="c-difficulty-number">${this.c.difficulty}</span>
//                     </div>
//                     <button class="c-start" onclick="${!this.c.inProgress ? `startChallenge('${this.c.cID}')` : `continueChallenge('${this.c.cID}')`}"><h3>${this.c.inProgress ? "Continue" : "Start"}</h3><span class="material-symbols-outlined c-start-arrow">arrow_forward_ios<span/></button>
//                 </div>
//             </div>
//         `;
//     if (this.c.sub_highlights?.length) {
//       for (let i = 0; i < this.c.sub_highlights.length; i++) {
//         document.querySelector(".c-implementations").innerHTML += `
//                     <div class="c-implementation">
//                         <div class="c-implementation-preview">
//                             <img class="c-implementation-img" src="${this.c.sub_highlights[i].previewURL}" alt="challenge image">
//                         </div>
//                         <div class="c-implementation-credit">${this.c.sub_highlights[i].sentBy}</div>
//                     </div>
//                 `;
//       }
//     } else {
//       document.querySelector(".c-implementations").innerHTML =
//         "<i>There are currently no submissions to this challenge. Upload one to be featured here!</i>";
//       document.querySelector(".c-implementations").classList.add("empty");
//       document.querySelector(".c-view-all").classList.add("empty");
//       console.log("No submissions found for this challenge.");
//     }

//     this.menu.style.right = "0px";
//     cLeft = document.querySelector(".c-popup-left") as HTMLElement;

//     let cBtn = document.querySelector(".c-popup-close") as HTMLElement;
//     cBtn.onclick = () => {
//       this.close();
//     };
//     return this;
//   }
// }