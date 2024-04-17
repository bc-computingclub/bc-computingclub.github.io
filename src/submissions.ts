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
const clearSubmissionFiltersButton = document.querySelector(".clear-sub-filters") as HTMLElement;

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

  currentChallenge = await getChallenge(cid,1);
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

/**
 * Clears submission page, then displays submissions passed in by submissionArray.
 * If showAnim is true, a 400ms loading animation is applied.
 */
async function displaySubmissions(submissionArray: Submission[],showAnim?:boolean) {
  clearSubmissions();
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
      let sub = submissionArray.find((s) => s.pid == pid);
      createSubmissionMenu(sub);
    });
  }
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
async function getSubmissions(cid:string,filter:{mine:boolean},sort:string,desc:boolean,perPage=20,pageI=0){
  return new Promise<Submission[]>(resolve=>{
    socket.emit("getSubmissions",cid,perPage,pageI,filter,sort,desc,(data:any)=>{
      if(typeof data == "number" || data == null){
        alert(`Error ${data} while trying to get Submissions`);
        resolve([]);
      }
      resolve(data);
    });
  });
}

sSortDiv.addEventListener("mousedown", () => {
  openDropdown(
    sSortDiv,
    () => ["Number of Lines", "Number of Characters", "Time Taken", "Most Recent","Oldest First"],
    (i) => {
      if (i == 0) sortSubmissions("lines", true);
      if (i == 1) sortSubmissions("chars", true);
      if (i == 2) sortSubmissions("time", true);
      if (i == 3) sortSubmissions("recent", true);
      if (i == 4) sortSubmissions("recent", false);
      closeAllSubMenus(); // Close menu when a sort option is clicked
    },
    {
      getIcons() {
        return [
          "keyboard_double_arrow_down",
          "keyboard_double_arrow_down",
          "keyboard_double_arrow_down",
          "keyboard_double_arrow_down",
          "keyboard_double_arrow_down",
      ];
      },
      openToLeft: true
    },
  );
});

async function sortSubmissions(sortType: string, desc: boolean,) {
  let temp = await getSubmissions(cid,{mine:false},sortType,desc);
  displaySubmissions(temp);
}

const submissionFilters = {};
sCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", (event) => {
    const checkboxValue = (event.target as HTMLInputElement).value;
    const isChecked = (event.target as HTMLInputElement).checked;
    const checkboxName = (event.target as HTMLInputElement).name;

    if (isChecked) {
      submissionFilters[checkboxName] = checkboxValue;
    } else {
      delete submissionFilters[checkboxName];
    }

    filterSubmissions();
  });
});

async function filterSubmissions() {
  let tempsubs = await getSubmissions(cid,{mine:submissionFilters["madebyuser"]!=null},"recent",false);
  await displaySubmissions(tempsubs);
}

clearSubmissionFiltersButton.addEventListener("click", () => {
  sCheckboxes.forEach((checkbox: HTMLInputElement) => {
    if(checkbox.checked == true) checkbox.click();
  });

  filterSubmissions();
});

function clearSubmissions() {
  sContainer.innerHTML = "";
}