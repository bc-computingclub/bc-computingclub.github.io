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

let cToggle: HTMLElement;
let displayedChallenges: Challenge[] = [];

const checkboxes = document.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
const lsUID = "BCC-01";

let cURL = new URL(location.href);
let popupCID = cURL.searchParams.get("cid") || "";
let tempFilterOptions:string = cURL.searchParams.get("filteroptions")
let urlFilterOptions:string[] = [];
if(tempFilterOptions) {
  urlFilterOptions = tempFilterOptions.split(",") || []; // makes array out of filteroptions parameter in URL
}

let bCounter = 0;
let ipCounter = 0;
let challengeArray: Challenge[] = [];

checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", (event) => {
    if (outerInProgressDiv.classList.contains("collapse")) {
      toggleInProgressDiv(cToggle, true);
    }
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

let shouldBeOpen: boolean;
window.addEventListener("load", async () => {
  await loginProm; // Ensures user is logged in before challenges are fetched.
  if(!g_user){
    alertNotLoggedIn();
    return;
  }

  await getChallenges();
  await showChallenges(challengeArray, true);
  let toggleState = localStorage.getItem(`${lsUID}toggleState`) || "open";
  shouldBeOpen = toggleState == "open" ? true : false;

  outerInProgressDiv.classList.add("window-load");
  if (shouldBeOpen == false) {
    // console.log("Should be closed, closing (no animation)");
    outerInProgressDiv.classList.add("collapse");
    cToggle.classList.remove("point-up");
    cToggle.classList.add("point-down");
  }
  if (popupCID && popupCID != '""') {
    await setupButton(popupCID);
    let tempURL = new URL(location.href);
    tempURL.searchParams.delete("cid");
    window.history.replaceState({}, document.title, tempURL.toString());
  }
  
  if(urlFilterOptions.length > 0) {
    let checkThis;
    console.log(urlFilterOptions);
    for(let option of urlFilterOptions) {
      checkThis = document.querySelector(`input#${option}`) as HTMLInputElement;
      console.log(checkThis);
      if(checkThis) {
        checkThis.checked = true;
        checkThis.dispatchEvent(new Event('change'));
      }
    }
  }
  // if(urlFilterOptions.includes("completed")) {
  //   let checkThis = document.querySelector("input#completed")as HTMLInputElement;
  //   checkThis.checked = true;
  //   checkThis.dispatchEvent(new Event('change'));
  // }
  // if(urlFilterOptions.includes("featured")) {
  //   let checkThis = document.querySelector("input#ongoing")as HTMLInputElement;
  //   checkThis.checked = true;
  //   checkThis.dispatchEvent(new Event('change'));
  // }
});

function toggleInProgressDiv(btn: HTMLElement, opening: boolean) {
  if(btn) {
    if (opening == true) {
      localStorage.setItem(`${lsUID}toggleState`, "open");
      shouldBeOpen = true;
      btn.classList.remove("point-down");
      btn.classList.add("point-up");
      outerInProgressDiv.classList.remove("collapse");
    } else if (opening == false) {
      localStorage.setItem(`${lsUID}toggleState`, "closed");
      shouldBeOpen = false;
      btn.classList.remove("point-up");
      btn.classList.add("point-down");
      outerInProgressDiv.classList.add("collapse");
    }
  }
  outerInProgressDiv.classList.remove("window-load");
}

function giveCToggleEventListener(cToggle: HTMLElement) {
    if (cToggle) {
      cToggle.onclick = function(){
        toggleInProgressDiv(cToggle, localStorage.getItem(`${lsUID}toggleState`) == "open" ? false : true);
      };
  }
}

async function startChallenge(cid: string) {
  socket.emit("startChallenge", cid, (data: number | string) => {
    if (typeof data == "number") {
      alert("Error while trying to start challenge, error code:" + data);
      return;
    }
    // alert("Successfully started challenge with pid: "+data);
    goToProject(data);
  });
}
async function continueChallenge(cid: string) {
  let pid = await new Promise<string>((resolve) => {
    socket.emit("continueChallenge", cid, (pid: any) => {
      resolve(pid);
    });
  });
  if (pid == null) return;
  goToProject(pid);
}

async function showChallenges(cArr: Challenge[], showAnim?: boolean) {
  if (showAnim) await showLoadingAnim([browseDiv, inProgressDiv], 400);
  for (let challenge of cArr) {
    setChallengeHTML(challenge);
  }
  await hideLoadingAnim();

  // console.log("Showing Challenges. In Progress: " + ipCounter + " Browse: " + bCounter);
  if (ipCounter <= 0) {
    inProgressDiv.classList.add("empty");
    inProgressDiv.innerHTML = "<i>Start working on a challenge, and it'll show up here!</i>";
    if (cToggle) {
      cToggle.remove();
    }
  } else {
    inProgressDiv.classList.remove("empty");
    if (!inProgressHeader.contains(cToggle)) {
      createCToggle();
    }
  }
  if (bCounter == 0) {
    browseDiv.classList.add("empty");
    browseDiv.innerHTML =
      "<i>No challenges match your search. Try another filter option!</i>";
  } else browseDiv.classList.remove("empty");

  inProgressTracker.innerHTML = `(${ipCounter})`;
  browseTracker.innerHTML = `(${bCounter})`;
  giveCToggleEventListener(cToggle);
}

function createCToggle() {
  cToggle = document.createElement("span") as HTMLElement;
  cToggle.classList.add("material-symbols-outlined", "c-toggle");
  cToggle.innerHTML = "expand_less";
  inProgressHeader.append(cToggle);
}

/** 
 * Returns HTML element creating card for Challenge.
 */
function setChallengeHTML(c: Challenge) {
  let tempCard = document.createElement("div") as HTMLElement;
  tempCard.classList.add("c-card");
  tempCard.setAttribute("cID", c.cID);

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
        <div class="flx-sb flx-al">
          <h3 class="c-name">
              ${c.name}
          </h3>
          <span class="c-diff" d="${c.difficulty}">${c.difficulty}</span>
        </div>
        <span class="c-text">
        ${(c.desc.length > 120) ? c.desc.slice(0, 120) + "..." : c.desc}
        </span>
        <div class="c-button-options">
            <button class="c-preview" onclick="setupButton(${c.cID});">
                Details <span class="material-symbols-outlined">info</span>
            </button>
            <button class="c-submissions" onclick="showSubmissions('${c.cID}','')">
                <span>Submissions</span>
            </button>
        </div>
    `;
  if (c.inProgress) {
    let tempSpan = document.createElement("span");
    tempSpan.className = "c-details material-symbols-outlined";
    tempSpan.innerHTML = "more_horiz";
    tempSpan.addEventListener("mousedown", (e) => {
      openDropdown(
        tempSpan,
        () => ["Delete Progress"],
        (i) => {
          if (i == 0) confirmProgressDeletion(c.cID);
        },
        {
          getIcons() {
            return ["delete"];
          },
          openToLeft: true,
        },
      );
    });
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

class DeleteMenu extends Menu {
  constructor(cID: Challenge["cID"]) {
    super("Delete Progress", "delete");
    this.cID = cID;
  }
  cID: Challenge["cID"];

  load(priority?: number) {
    super.load();
    let challengeName = challengeArray.find((v) => v.cID == this.cID).name;
    this.body.innerHTML = `
            <div class="c-confirm-div">
                <span class="c-confirm-text">Are you sure you want to delete your progress on the <strong>${challengeName}</strong> Challenge? You won't be able to get it back...</span>
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
    });
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

let deleteMenu: DeleteMenu;
function confirmProgressDeletion(cID: Challenge["cID"]) {
  if (deleteMenu) deleteMenu.close();
  deleteMenu = new DeleteMenu(cID).load();
}

function cancelProgressDeletion() {
  if (document.querySelector(".c-delete-div"))
    document.querySelector(".c-delete-div").remove();
  if (document.querySelector(".c-confirm-div"))
    document.querySelector(".c-confirm-div").remove();
}

async function deleteProgress(cID: Challenge["cID"]) {
  console.log("Deleting progress on challenge: " + cID);
  let res = await new Promise<number>((resolve) => {
    socket.emit("deleteChallengeProgress", cID, (res: number) => {
      resolve(res);
    });
  });
  console.log("delete progress res: ", res);
  if (res != 0){
    alert("Failed to delete challenge progress, error code: " + res);
  } else { // refresh challenges
    await getChallenges();
    clearChallenges();
    showChallenges(challengeArray);
  }
}

async function setupButton(cID: Challenge["cID"]) {
  await createChallengePopup(challengeArray.find((v) => v.cID == cID));
}

async function filterChallenges() {
  await getChallenges();
  clearChallenges();
  showChallenges(challengeArray);
}

function clearChallenges() {
  // resets challenge containers and counters
  browseDiv.innerHTML = "";
  inProgressDiv.innerHTML = "";
  bCounter = 0;
  ipCounter = 0;
  inProgressTracker.innerHTML = "";
  browseTracker.innerHTML = "";
}

clearFiltersButton.addEventListener("click", () => {
  Object.keys(selectedFilters).forEach((filterType) => {
    delete selectedFilters[filterType];
  });
  checkboxes.forEach((checkbox: HTMLInputElement) => {
    checkbox.checked = false;
  });

  filterChallenges();
});

async function sortChallenges(option: string, descending: boolean) {
  clearChallenges();

  searchOption = option;
  searchDesc = descending;
  await getChallenges();
  showChallenges(challengeArray);
  if (challengeArray.filter((c) => c.inProgress).length == 1) {
    toggleInProgressDiv(cToggle, false);
  } // if there's 1 challenge in progress, close section, since it's not being sorted and that may confuse the user.
  return;
}

cSortDiv.addEventListener("mousedown", () => {
  openDropdown(
    cSortDiv,
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
