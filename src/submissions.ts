let url = new URL(location.href);
let cId = url.searchParams.get("cid") || "";
const cTitle = document.querySelector<HTMLElement>(".c-title");
const cDetails = document.querySelector<HTMLElement>(".c-details");
const cBack = document.querySelector<HTMLElement>(".c-back");
const sSort = document.querySelector<HTMLElement>(".s-sort");
const sContainer = document.querySelector<HTMLElement>(".s-container");
const sCheckboxes = document.querySelectorAll('input[type="checkbox"]');
let showAnim = true;
let previewButtons: NodeListOf<HTMLElement>;

// Get submissions based on cID
// Get challenge based on cID

let sub1 = new Submission("/images/fillerthumbnail.png", "Paul Bauer", "112","01");
let sub2 = new Submission("/images/fillerthumbnail.png", "Claeb Claeb", "367","02");
let sub3 = new Submission("/images/fillerthumbnail.png", "Butler Test", "245","03");
let submissionArray = [sub1, sub2, sub1, sub2, sub1, sub2];

let test1 = new Challenge("01", "Color Wheel", "Create a circular wheel which selects different colors depending on user mouse input", true, "/images/colorwheel.png", "", false, "easy", false, "1");

window.onload = async () => {
  await loginProm;
  cTitle.style.opacity = "1";
  cTitle.textContent = `${test1.name} Challenge`;
  showSubmissions(submissionArray);
};

async function showSubmissions(submissionArray: Submission[]) {
  if (showAnim) await showLoadingAnim([sContainer], "400");
  showAnim = false;
  for (const sub of submissionArray) {
    let tempSub: HTMLElement = getSubmissionElement(sub);
    sContainer.appendChild(tempSub);
  }
  previewButtons = document.querySelectorAll(".s-open-preview");
  addClickListeners(previewButtons);
  await hideLoadingAnim();
}

function addClickListeners(elm: NodeListOf<HTMLElement>) {
  for (let i = 0; i < elm.length; i++) {
    elm[i].addEventListener("click", () => {
      let pid = elm[i].getAttribute("pid");
      console.log(pid);
      let sub = submissionArray.find((s) => s.pid == pid);
      createSubmissionMenu(sub);
    });
  }
}

function toggleLineCount() {
  let sLineCount: NodeListOf<HTMLElement> = document.querySelectorAll(".s-line-count");
  sLineCount.forEach((el) => {
    el.classList.toggle("show-count");
  });
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
      <button class="s-open-preview" pid="${submission.pid}">
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
  window.location.href = `index.html?cid=${cId}`; // redirects to challenge page and opens challenge corresponding to cId
});

function createSubmissionMenu(sub: Submission) {
  console.log("Creating Submission Menu");
  if (curSubMenu) {
    curSubMenu.close();
    console.log("already a menu");
  }
  curSubMenu = new SubmissionMenu(sub);
  curSubMenu.load();
}

sSort.addEventListener("click", () => {
  sSort.classList.toggle("collapse");
});

let curSubMenu: SubmissionMenu;
class SubmissionMenu extends Menu {
  constructor(submission: Submission) {
    super("Submission Menu");
    this.submission = submission;
  }

  submission: Submission;

  load() {
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
            <div class="s-popup-code-contents">I'm starting to wonder how far I'm willing to take these class names, it's getting bad...</div>
          </div>
          <div class="s-popup-preview">
            <div class="s-popup-preview-header">
              <h2 class="s-popup-preview-title">Preview</h2>
              <div class="s-preview-title-nested">
                <button class="b-refresh icon-btn">
                  <div class="icon-refresh material-symbols-outlined">sync</div>
                  <div class="label">Refresh</div>
                </button>
                <div style="margin-left:auto;gap:10px" class="flx-h flx-al">
                  <div class="material-symbols-outlined b-open-in-new co-item" co-label="Open in new tab">open_in_new</div>
                </div>
              </div>
            </div>
            <div class="s-popup-preview-iframe-cont">
              <iframe src="https://www.google.com" class="s-popup-iframe"></iframe>
            </div>
            <div class="s-popup-preview-details">
              <h3 class="s-popup-preview-details-title">Details</h3>
              <div class="s-popup-preview-details-contents">
                <div class="s-popup-preview-details-item">
                  <h4 class="s-popup-preview-details-item-title">Line Count</h4>
                  <div class="s-popup-preview-details-item-contents">${this.submission.lineCount}</div>
                </div>
                <div class="s-popup-preview-details-item">
                  <h4 class="s-popup-preview-details-item-title">Language(s)</h4>
                  <div class="s-popup-preview-details-item-contents">JavaScript</div>
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