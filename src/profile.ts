let profileContainer = document.querySelector(".p-top") as HTMLElement;
let profileHeader = document.querySelector(".p-header-top") as HTMLElement;
let profileHeaderBot = document.querySelector(".p-header-bottom") as HTMLElement;
let challengeStatContainer = document.querySelector(".p-challenge-stats") as HTMLElement;
let lessonStatContainer = document.querySelector(".p-lesson-stats") as HTMLElement;
let dateJoined = document.querySelector(".p-date-joined") as HTMLElement;
let username = document.querySelector(".p-username") as HTMLElement;
let viewSubmissionsButton = document.querySelector(".p-view-submissions") as HTMLButtonElement;

let challengeStats:[];
let lessonStats:[];
let lessonsCompleted:number;
let challengesCompleted:number;
let avgHours:string;
let totalHours:string;
let avgChars:number;

window.addEventListener("load", async () => {
    await genProfile();
    await hideLoadingAnim();
})

async function genProfile() {
    await loginProm; // Ensures user is logged in before challenges are fetched.
    if(!g_user){
      alertNotLoggedIn();
      return;
    }

    // Adding in join date, username, pfp.
    let date = new Date(g_user.data._joinDate);
    let formattedDate = date.toLocaleDateString();
    dateJoined.innerHTML = "<i>Joined " + formattedDate; + "</i>";
    username.textContent = g_user.data.name.length < 24 ? g_user.data.name : g_user.data.name.substring(0,24) + "...";
    let pfp = document.querySelector(".p-pfp") as HTMLImageElement;
    pfp.src = `${g_user.data.picture}`;
    // profileHeader.insertBefore(profilePicture, username);

    await showLoadingAnim([challengeStatContainer,lessonStatContainer],400);

    await setStats();

    // All objects in this array will be loaded as stats. I've commented out the ones which are currently just placeholders.
    let challengeStats = [
        {title:"Challenges Completed: ",number:`${challengesCompleted}`,icon:""},
        // {title:"Average time spent: ",number:`${avgHours}`,icon:""},
        // {title:"Total time spent: ",number:`${totalHours}`,icon:""},
        // {title:"Average Number of characters: ",number:`${avgChars}`,icon:""}
    ];
    let lessonStats = [
        // {title:"Lessons Completed",number:`${lessonsCompleted}`,icon:""},
        {title:"More coming soon! ",number:"",icon:""}   // hehehehehe this could just be here indefinitely
    ];

    for(let stat of challengeStats) {
        let temp = document.createElement("div");
        temp.classList.add("p-stat");
        temp.innerHTML = `
            <div class="p-stat-name">
                <span class="material-symbols-outlined">${stat.icon}</span>
                <span class="">${stat.title}</span>
            </div>
            <span class="p-stat-contents">${stat.number}</span>
        `;
        challengeStatContainer.appendChild(temp);
    }
    for(let stat of lessonStats) {
        let temp = document.createElement("div");
        temp.classList.add("p-stat");
        temp.innerHTML = `
            <div class="p-stat-name">
                <span class="material-symbols-outlined">${stat.icon}</span>
                <span class="">${stat.title}</span>
            </div>
            <span class="p-stat-contents">${stat.number}</span>
        `;
        lessonStatContainer.appendChild(temp);
    }
}

async function setStats() {
    challengesCompleted = (await getServerChallenges()).filter((challenge) => challenge.submitted).length;
    lessonsCompleted = 1;
    avgHours = "1.4h";
    totalHours = "4.2h";
    avgChars = 1342;
}

viewSubmissionsButton.addEventListener("click", (e) => {
    location.href = '/practice/?filteroptions=completed';
})