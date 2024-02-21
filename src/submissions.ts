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
  currentChallenge = await getChallenge(cid);
  submissionArray = currentChallenge.submissions;
  cTitle.style.opacity = "1";
  cTitle.textContent = `${currentChallenge.name} Challenge`;
  await displaySubmissions(submissionArray,true);
  if(popupPid) {
    console.log("Creating popup with " + submissionArray.find((v) => v.pid == popupPid)?.sentBy + "'s Submission details");
    createSubmissionMenu(submissionArray.find((v) => v.pid == popupPid));
  }
};

async function displaySubmissions(submissionArray: Submission[],showAnim?:boolean) {
  if (showAnim) await showLoadingAnim([sContainer], "400");
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

function getSubmissionElement(submission: Submission): HTMLElement {
  let subDiv = document.createElement("div");
  subDiv.className = "s-card";
  subDiv.innerHTML = `
    <div class="s-img-div">
      <img src="${submission.previewURL}" alt="Submission Thumbnail" class="s-img">
      <span class="s-line-count">${submission.lineCount || "0 lines"}</span>
    </div>
    <div class="s-card-info">
      <div>${submission.sentBy}</div>
      <button class="s-open-preview" pid="${submission.pid}">
        Open
      </button>
    </div>
  `;
  return subDiv;
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
async function createSubmissionMenu(sub: Submission) {
  console.log("Creating Submission Menu");
  if (curSubMenu) {
    curSubMenu.close();
    console.log("already a menu");
  }
  let subData = await getSubmission(sub.uid,sub.pid);
  curSubMenu = new SubmissionMenu(subData,sub);
  curSubMenu.load();
}
class SubmissionData{
  p:ProjectMeta;
  lines:number;
  lang:string[];
  date_submitted:string;
}

let curSubMenu: SubmissionMenu;
class SubmissionMenu extends Menu {
  constructor(data: SubmissionData, sub:Submission) {
    super("Submission Menu");
    this.data = data;
    console.log("loaded data",data);
    this.submission = sub;
  }

  data:SubmissionData;
  submission: Submission;

  load() {
    let p = this.data.p;
    let url = getProjectURL(this.submission.uid,this.submission.pid);

    super.load();
    this.menu.innerHTML = `
      <div class="s-popup">
        <div class="s-popup-header">
          <h1 class="s-popup-title">${this.submission.sentBy}'s Submission</h1>
          <span class="s-popup-close material-symbols-outlined">close</span>
        </div>
        <div class="s-popup-body">
          <div class="s-popup-code">
            <h2 class="s-popup-code-title">Code</h2>
            <div class="s-popup-code-contents">${p.name}<br><br>${p.desc}<!--I'm starting to wonder how far I'm willing to take these class names, it's getting bad...--></div>
          </div>
          <div class="s-popup-preview">
            <div class="s-popup-preview-header">
              <h2 class="s-popup-preview-title">Preview</h2>
              <div class="s-preview-title-nested">
                <button class="b-refresh icon-btn">
                  <div class="icon-refresh material-symbols-outlined">sync</div>
                  <div class="label s-b-refresh">Refresh</div>
                </button>
                <div style="margin-left:auto;gap:10px" class="flx-h flx-al">
                  <div class="material-symbols-outlined b-open-in-new co-item" co-label="Open in new tab">open_in_new</div>
                </div>
              </div>
            </div>
            <div class="s-popup-preview-iframe-cont">
              <iframe src="${url}" class="s-popup-iframe"></iframe>
            </div>
            <div class="s-popup-preview-details">
              <h3 class="s-popup-preview-details-title">Details</h3>
              <div class="s-popup-preview-details-contents">
                <div class="s-popup-preview-details-item">
                  <h4 class="s-popup-preview-details-item-title">Line Count</h4>
                  <div class="s-popup-preview-details-item-contents">${this.submission.lineCount || 0}</div>
                </div>
                <div class="s-popup-preview-details-item">
                  <h4 class="s-popup-preview-details-item-title">Language(s)</h4>
                  <div class="s-popup-preview-details-item-contents">${this.data.lang?.join(", ") || "None"}<!--JavaScript--></div>
                </div>
                <div class="s-popup-preview-details-item">
                  <h4 class="s-popup-preview-details-item-title">Date Submitted</h4>
                  <div class="s-popup-preview-details-item-contents">2021-09-09</div>
                </div>
                <div class="s-popup-preview-details-item">
                  <h4 class="s-popup-preview-details-item-title">Detail Field</h4>
                  <div class="s-popup-preview-details-item-contents">Detail Contents Test</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    let b_refresh = this.menu.querySelector(".s-b-refresh") as HTMLButtonElement;
    let frame = this.menu.querySelector(".s-popup-iframe") as HTMLIFrameElement;

    b_refresh.addEventListener("click",e=>{
      frame.src = url;
      // icon_refresh.style.rotate = _icRef_state ? "360deg" : "0deg";
      // _icRef_state = !_icRef_state;
    });

    let sPopupClose = document.querySelector(".s-popup-close") as HTMLElement;
    sPopupClose.onclick = () => {
      this.close();
    };
    return this;
  }
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