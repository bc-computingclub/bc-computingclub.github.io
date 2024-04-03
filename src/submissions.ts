let url = new URL(location.href);
let cid = url.searchParams.get("cid") || "" as string;
let popupPid = url.searchParams.get("pid") || "" as string;
const cTitle = document.querySelector<HTMLElement>(".c-title");
const cDetails = document.querySelector<HTMLElement>(".c-details");
const cBack = document.querySelector<HTMLElement>(".c-back");
const sSortDiv = document.querySelector<HTMLElement>(".c-sort-div");
const sContainer = document.querySelector<HTMLElement>(".s-container");
const sCheckboxes = document.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
let previewButtons: NodeListOf<HTMLElement>;

// Get submissions based on cID
// Get challenge based on cID
let submissionArray:Submission[];
let currentChallenge:Challenge;

window.onload = async () => {
  await loginProm;
  if(!g_user){
    alertNotLoggedIn();
    return;
  }

  currentChallenge = await getChallenge(cid);
  submissionArray = currentChallenge.submissions;
  cTitle.style.opacity = "1";
  cTitle.textContent = `${currentChallenge.name} Challenge`;
  await displaySubmissions(submissionArray,true);
  if(popupPid) {
    let sub = submissionArray.find((v) => v.pid == popupPid);
    if(!sub){
      return;
    }
    console.log("Creating popup with " + sub.who + "'s Submission details");
    createSubmissionMenu(sub);
  }
};

async function displaySubmissions(submissionArray: Submission[],showAnim?:boolean) {
  if (showAnim) await showLoadingAnim([sContainer], 400);
  for (const sub of submissionArray) {
    let tempSub: HTMLElement = getSubmissionElement(sub);
    sContainer.appendChild(tempSub);
  }
  if(!submissionArray.length) { 
    sContainer.innerHTML += `<i>There are currently no submissions to this challenge. Upload one to be featured here!</i>`
    sContainer.classList.add("empty");
  }
  previewButtons = document.querySelectorAll(".s-open-preview");
  addClickListeners(previewButtons);
  await hideLoadingAnim();
}

function addClickListeners(elm: NodeListOf<HTMLElement>) {
  for (let i = 0; i < elm.length; i++) {
    elm[i].addEventListener("click", () => {
      let pid = elm[i].getAttribute("pid");
      // console.log(pid);
      let sub = submissionArray.find((s) => s.pid == pid);
      createSubmissionMenu(sub);
    });
  }
}

function toggleLineCount() {
  let sLineCount: NodeListOf<HTMLElement> = document.querySelectorAll(".s-line-count");
  sLineCount.forEach((el) => {
    el.classList.toggle("show-count");
    // todo: store in localstorage and get value on page load?
  });
}

cDetails.addEventListener("click", async () => {
  await createChallengePopup(currentChallenge); // replace with reference to actual challenge
});

cBack.addEventListener("click", () => {
  window.location.href = `index.html?cid=${cid}`; // redirects to challenge page and opens challenge corresponding to cId
});

async function getSubmission(uid:string,pid:string){
  return new Promise<any>(resolve=>{
    socket.emit("getSubmission",uid,pid,(data:any)=>{
      resolve(data);
    });
  });
}

sCheckboxes.forEach((cb:HTMLInputElement) => {
    cb.addEventListener("change", (event) => {
        const checkboxValue = (event.target as HTMLInputElement).value;
        console.log(checkboxValue);
        if(checkboxValue == "show-lines-of-code") toggleLineCount();
    });
});

sSortDiv.addEventListener("mousedown", () => {
  openDropdown(
    sSortDiv,
    () => ["Popularity", "Popularity", "Alphabetical (A-Z)", "Alphabetical (Z-A)"],
    (i) => {
      if (i == 0) sortChallenges("popularity", true);
      if (i == 1) sortChallenges("popularity", false);
      if (i == 2) sortChallenges("alphabetical", true);
      if (i == 3) sortChallenges("alphabetical", false);
      closeAllSubMenus(); // Close menu when a sort option is clicked
    },
    {
      getIcons() {
        return [
          "keyboard_double_arrow_down",
          "keyboard_double_arrow_up",
          "keyboard_double_arrow_down",
          "keyboard_double_arrow_up"
      ];
      },
      openToLeft: true
    },
  );
});