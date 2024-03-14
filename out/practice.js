const inProgressDiv = document.querySelector(".c-in-progress-container");
const outerInProgressDiv = document.querySelector(".c-outer-in-progress");
const browseDiv = document.querySelector(".c-browse-container");
const inProgressHeader = document.querySelector(".c-ip-container-header");
const inProgressTracker = document.querySelector(".c-in-progress-counter");
const browseTracker = document.querySelector(".c-browse-counter");
const browseHeader = document.querySelector(".c-browse-container-header");
const cHome = document.querySelector(".c-home");
const clearFiltersButton = document.querySelector(".clear-filters");
const cSortDiv = document.querySelector(".c-sort-div");
let cToggle;
let displayedChallenges = [];
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
let challengeArray = [];
async function getChallenges() {
    challengeArray = await getServerChallenges();
}
let shouldBeOpen;
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
    if (popupCID && popupCID != '""') {
        await setupButton(popupCID);
        let tempURL = new URL(location.href);
        tempURL.searchParams.delete("cid");
        window.history.replaceState({}, document.title, tempURL.toString());
    }
});
function toggleInProgressDiv(btn, opening) {
    if (btn) {
        if (opening == true) {
            localStorage.setItem(`${lsUID}toggleState`, "open");
            shouldBeOpen = true;
            btn.classList.remove("point-down");
            btn.classList.add("point-up");
            outerInProgressDiv.classList.remove("collapse");
        }
        else if (opening == false) {
            localStorage.setItem(`${lsUID}toggleState`, "closed");
            shouldBeOpen = false;
            btn.classList.remove("point-up");
            btn.classList.add("point-down");
            outerInProgressDiv.classList.add("collapse");
        }
    }
    outerInProgressDiv.classList.remove("window-load");
}
function giveCToggleEventListener(cToggle) {
    if (cToggle) {
        cToggle.addEventListener("click", () => {
            toggleInProgressDiv(cToggle, localStorage.getItem(`${lsUID}toggleState`) == "open" ? false : true);
        });
    }
}
async function startChallenge(cid) {
    socket.emit("startChallenge", cid, (data) => {
        if (typeof data == "number") {
            alert("Error while trying to start challenge, error code:" + data);
            return;
        }
        // alert("Successfully started challenge with pid: "+data);
        goToProject(data);
    });
}
async function continueChallenge(cid) {
    let pid = await new Promise((resolve) => {
        socket.emit("continueChallenge", cid, (pid) => {
            resolve(pid);
        });
    });
    if (pid == null)
        return;
    goToProject(pid);
}
async function showChallenges(cArr, showAnim) {
    if (showAnim)
        await showLoadingAnim([browseDiv, inProgressDiv], 400);
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
    }
    else {
        inProgressDiv.classList.remove("empty");
        if (!inProgressHeader.contains(cToggle)) {
            createCToggle();
        }
    }
    if (bCounter == 0) {
        browseDiv.classList.add("empty");
        browseDiv.innerHTML =
            "<i>No challenges match your search. Try another filter option!</i>";
    }
    else
        browseDiv.classList.remove("empty");
    inProgressTracker.innerHTML = `(${ipCounter})`;
    browseTracker.innerHTML = `(${bCounter})`;
    giveCToggleEventListener(cToggle);
}
function createCToggle() {
    cToggle = document.createElement("span");
    cToggle.classList.add("material-symbols-outlined", "c-toggle");
    cToggle.innerHTML = "expand_less";
    inProgressHeader.append(cToggle);
}
/**
 * Returns HTML element creating card for Challenge.
 */
function setChallengeHTML(c) {
    let tempCard = document.createElement("div");
    tempCard.classList.add("c-card");
    tempCard.setAttribute("cID", c.cID);
    if (!c.inProgress) {
        browseDiv.appendChild(tempCard);
        bCounter++;
    }
    else {
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
        <span class="c-text">
        ${(c.desc.length > 120) ? c.desc.slice(0, 120) + "..." : c.desc}
        </span>
        <div class="c-button-options">
            <button class="c-preview" onclick="setupButton(${c.cID});">
                Details <span class="material-symbols-outlined">info</span>
            </button>
            <button class="c-submissions" onclick="showSubmissions('${c.cID}','${c.inProgress}')">
                <span>Submissions</span>
            </button>
        </div>
    `;
    if (c.inProgress) {
        let tempSpan = document.createElement("span");
        tempSpan.className = "c-details material-symbols-outlined";
        tempSpan.innerHTML = "more_horiz";
        tempSpan.addEventListener("mousedown", (e) => {
            openDropdown(tempSpan, () => ["Delete Progress"], (i) => {
                if (i == 0)
                    confirmProgressDeletion(c.cID);
            }, {
                getIcons() {
                    return ["delete"];
                },
                openToLeft: true,
            });
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
    constructor(cID) {
        super("Delete Progress", "delete");
        this.cID = cID;
    }
    cID;
    load(priority) {
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
    onClose() {
        cancelProgressDeletion();
    }
}
let deleteMenu;
function confirmProgressDeletion(cID) {
    if (deleteMenu)
        deleteMenu.close();
    deleteMenu = new DeleteMenu(cID).load();
}
function cancelProgressDeletion() {
    if (document.querySelector(".c-delete-div"))
        document.querySelector(".c-delete-div").remove();
    if (document.querySelector(".c-confirm-div"))
        document.querySelector(".c-confirm-div").remove();
}
async function deleteProgress(cID) {
    console.log("Deleting progress on challenge: " + cID);
    let res = await new Promise((resolve) => {
        socket.emit("deleteChallengeProgress", cID, (res) => {
            resolve(res);
        });
    });
    console.log("delete progress res: ", res);
    if (res != 0) {
        alert("Failed to delete challenge progress, error code: " + res);
    }
    else { // refresh challenges
        await getChallenges();
        clearChallenges();
        showChallenges(challengeArray);
    }
}
async function setupButton(cID) {
    await createChallengePopup(challengeArray.find((v) => v.cID == cID));
}
const selectedFilters = {};
checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
        if (outerInProgressDiv.classList.contains("collapse")) {
            toggleInProgressDiv(cToggle, true);
        }
        const checkboxValue = event.target.value;
        const isChecked = event.target.checked;
        const filterType = event.target.name;
        if (isChecked) {
            if (!selectedFilters[filterType]) {
                selectedFilters[filterType] = [];
            }
            selectedFilters[filterType].push(checkboxValue);
        }
        else {
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
    checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
    });
    filterChallenges();
});
let searchOption = "popularity";
let searchDesc = true;
async function sortChallenges(option, descending) {
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
    openDropdown(cSortDiv, () => ["Popularity", "Popularity", "Alphabetical (A-Z)", "Alphabetical (Z-A)"], (i) => {
        if (i == 0)
            sortChallenges("popularity", true);
        if (i == 1)
            sortChallenges("popularity", false);
        if (i == 2)
            sortChallenges("alphabetical", true);
        if (i == 3)
            sortChallenges("alphabetical", false);
        closeAllSubMenus(); // Close menu when a sort option is clicked
    }, {
        getIcons() {
            return [
                "keyboard_double_arrow_down",
                "keyboard_double_arrow_up",
                "keyboard_double_arrow_down",
                "keyboard_double_arrow_up"
            ];
        },
        openToLeft: true
    });
});
//# sourceMappingURL=practice.js.map