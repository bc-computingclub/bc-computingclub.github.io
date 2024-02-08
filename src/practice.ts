const inProgressDiv = document.querySelector(
  ".c-in-progress-container",
) as HTMLElement;
const outerInProgressDiv = document.querySelector(
  ".c-outer-in-progress",
) as HTMLElement;
const browseDiv = document.querySelector(".c-browse-container") as HTMLElement;
const inProgressHeader = document.querySelector(
  ".c-ip-container-header",
) as HTMLElement;
const inProgressTracker = document.querySelector(
  ".c-in-progress-counter",
) as HTMLElement;
const browseTracker = document.querySelector(
  ".c-browse-counter",
) as HTMLElement;
const browseHeader = document.querySelector(
  ".c-browse-container-header",
) as HTMLElement;
const cHome = document.querySelector(".c-home") as HTMLElement;
const clearFiltersButton = document.querySelector(
  ".clear-filters",
) as HTMLElement;
const cSortDiv = document.querySelector(".c-sort-div") as HTMLElement;
const cSort = document.querySelector(".c-sort-btn") as HTMLElement;

let cToggle: HTMLElement;
let displayedChallenges: Challenge[] = [];

const checkboxes = document.querySelectorAll('input[type="checkbox"]');
const lsUID = "BCC-01";

let cURL = new URL(location.href);
let popupCID = cURL.searchParams.get("cid") || "";

let bCounter = 0;
let ipCounter = 0;

// let test1 = new Challenge("01", "Color Wheel", "Create a circular wheel which selects different colors depending on user mouse input", true, "/images/colorwheel.png", "", false, "easy",false,"1");
// let test2 = new Challenge("02", "Combination Lock", "Create a combination lock which reveals a secret message when the correct combination is entered.", false, "/images/fillerthumbnail.png", "", true, "medium",false,"3");
// let test3 = new Challenge("03", "To-Do List", "Create a to-do list, to which you can add and remove items as desired.", false, "/images/fillerthumbnail.png", "", false, "easy",false,"10");
// let test4 = new Challenge("04", "Water Wheel", "Design a button which can be dragged around a circle, controlling the water level in a cup.", false, "/images/water-level.png", "", false, "code-wizard",true,"2");
// let challengeArray = [test1, test2, test3, test4];
let challengeArray: Challenge[] = [];

async function getChallenges() {
  challengeArray = await getServerChallenges();
}

let shouldBeOpen: boolean;
window.addEventListener("load", async () => {
  await loginProm; // Ensures user is logged in before challenges are fetched.

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
  if (popupCID) {
    await setupButton(popupCID);
    // could remove cID from url to prevent user from getting popup again on refresh?
  }
});

function toggleInProgressDiv(btn: HTMLElement, opening: boolean) {
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
  outerInProgressDiv.classList.remove("window-load");
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
  if (showAnim) await showLoadingAnim([browseDiv,inProgressDiv],"400");
  for (let challenge of cArr) {
    setChallengeHTML(challenge);
  }
  await hideLoadingAnim();

  // console.log("Showing Challenges. In Progress: " + ipCounter + " Browse: " + bCounter);
  if (ipCounter <= 0) {
    inProgressDiv.classList.add("empty");
    inProgressDiv.innerHTML =
      "<i>Start working on a challenge, and it'll show up here!</i>";
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
  addClickEventListener(cToggle);
}

function createCToggle() {
  cToggle = document.createElement("span") as HTMLElement;
  cToggle.classList.add("material-symbols-outlined", "c-toggle");
  cToggle.innerHTML = "expand_less";
  inProgressHeader.append(cToggle);
}

function addClickEventListener(cToggle: HTMLElement) {
  if (cToggle) {
    cToggle.addEventListener("click", () => {
      if (shouldBeOpen) {
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
  if (c.inProgress) {
    let tempSpan = document.createElement("span");
    tempSpan.className = "c-details material-symbols-outlined";
    tempSpan.innerHTML = "more_horiz";
    tempSpan.addEventListener("click", (e) => {
      openDropdown(
        tempSpan,
        () => ["Delete Progress"],
        (i) => {
          if (i == 0) {
            confirmProgressDeletion(c.cID);
          }
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
  // Challenge["cID"].inProgress = false; ... and then send this to the server? or does it need to be a query of its own?
  // delete any Project on the server which is associated with this challenge
  // i'm going to need your help here Caleb lol
}

async function setupButton(cID: Challenge["cID"]) {
  await createChallengePopup(challengeArray.find((v) => v.cID == cID));
}

const selectedFilters = {};
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

async function filterChallenges() {
  await getChallenges();

  if (false)
    displayedChallenges = challengeArray.filter((challenge) => {
      return Object.keys(selectedFilters).every((filterType) => {
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

let searchOption: string = "popularity";
let searchDesc: boolean = true;
async function sortChallenges(option: string, descending: boolean) {
  // showLoadingAnim("500"); // change delay as you see fit, i can't tell what looks good or bad
  clearChallenges();

  searchOption = option;
  searchDesc = descending;
  await getChallenges();
  if (challengeArray.filter((c) => c.inProgress).length == 1) {
    toggleInProgressDiv(cToggle, false);
  } // if there's 1 challenge in progress, close section, since sorting it would be pointless
  showChallenges(challengeArray);
  // hideLoadingAnim();
  return; // vvv - Claeb: moved this to server side

  clearChallenges();
  displayedChallenges = challengeArray.sort((a, b) => {
    switch (option) {
      case "popularity":
        if (descending) {
          return parseInt(b.submission_count) - parseInt(a.submission_count);
        } else
          return parseInt(a.submission_count) - parseInt(b.submission_count);
      case "alphabetical":
        if (descending) {
          return a.name.localeCompare(b.name);
        }
        return b.name.localeCompare(a.name);
    }
  });

  showChallenges(displayedChallenges);
}

cSortDiv.addEventListener("click", () => {
  toggleSortMenu();
});

function toggleSortMenu() {
  cSortDiv.classList.toggle("collapse");
}
