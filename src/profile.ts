let challengeStatContainer = document.querySelector(".p-challenge-stats") as HTMLElement;
let lessonStatContainer = document.querySelector(".p-lesson-stats") as HTMLElement;
let dateJoined = document.querySelector(".p-join-date") as HTMLElement;
let username = document.querySelector(".p-username") as HTMLElement;
let viewSubmissionsButton = document.querySelector(".p-view-submissions") as HTMLButtonElement;
let projectStatContainer = document.querySelector(".p-project-stats") as HTMLElement;

type Stat = {
    title:string,
    number:string|number,
    icon:string
}

let challengeStats: Stat[] = [
    {title:"Completed ",number:"0",icon:"select_check_box"},
    {title:"Submitted: ",number:"0",icon:""},
    {title:"Challenges In Progress: ",number:"0",icon:""},
];
let lessonStats: Stat[] = [
    {title:"Completed ",number:"0",icon:"select_check_box"},
    {title:"Total Time Spent: ",number:"0 minutes",icon:""},
    {title:"Average Time Spent: ",number:"0 minutes",icon:""},
];
let projectStats: Stat[] = [
    {title:"Total Projects: ",number:"0",icon:""},
    {title:"Time Spent: ",number:"0 minutes",icon:""},
    {title:"Average Time: ",number:"0 minutes",icon:""},
];

// Below are all of the stats that will be displayed on the profile page. Randomly filled in for now

let challengesCompleted:number = 2;
let challengesSubmitted:number = 3;
let challengesInProgress:number = 1;

let lessonsCompleted:number = 3;
let totalLessonTime:number = 12;
let averageLessonTime:number = 4;

let totalProjects:number = 4;
let totalProjectTime:number = 23;
let averageProjectTime:number = 4;

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

    await getUserStats(); // Fetches and sets user stats.
    
    let removeArr = document.querySelectorAll(".remove-on-load") as NodeListOf<HTMLElement>;
    removeArr.forEach((element) => {
        element.remove();
    })
    if(viewSubmissionsButton) viewSubmissionsButton.disabled = false;

    let showOnLoginArr = document.querySelectorAll(".nologin") as NodeListOf<HTMLElement>;
    showOnLoginArr.forEach((element) => {
        element.classList.remove("nologin");
    })

    // Adding in join date, username, pfp.
    let date = new Date(g_user.data._joinDate);
    let options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short' };
    dateJoined.innerHTML = date.toLocaleDateString('en-US', options);

    username.textContent = g_user.data.name.length < 24 ? g_user.data.name : g_user.data.name.substring(0,24) + "...";
    let pfp = document.querySelector(".p-pfp") as HTMLImageElement;
    if(g_user.data.picture) {
        pfp.src = `${g_user.data.picture}`;
        pfp.style.padding = "0px";
    }

    await showLoadingAnim([challengeStatContainer,lessonStatContainer,projectStatContainer],400); 

    // Setting the individual stats.
    
    lessonStatContainer.className = "p-lesson-stats";
    lessonStatContainer.innerHTML = `
        <div class="p-stat circle-stat">        
            <div class="p-stat-name">
                <span class="material-symbols-outlined">
                    <span class="material-symbols-outlined">${lessonStats[0].icon}</span>
                </span>
                <span class="">${lessonStats[0].title}</span>
            </div>
            <span class="p-stat-contents circle">${lessonsCompleted}/${totalLessons}</span>
        </div>
        <div class="p-stat-cont-nested">
            <div class="p-stat split-stat">
                <div class="flx-sb">
                    <div class="p-stat-name">
                        <span class="material-symbols-outlined">${lessonStats[1].icon}</span>
                        <span class="">${lessonStats[1].title}</span>
                    </div>
                    <span class="p-stat-contents">${totalLessonTime} hours</span>
                </div>
            </div>
            <div class="p-stat split-stat">
                <div class="flx-sb">
                    <div class="p-stat-name">
                        <span class="material-symbols-outlined">${lessonStats[2].icon}</span>
                        <span class="">${lessonStats[2].title}</span>
                    </div>
                    <span class="p-stat-contents">${averageLessonTime} hours</span>
                </div>
            </div>
        </div>
    `;

    challengeStatContainer.className = "p-challenge-stats";
    challengeStatContainer.innerHTML = `
        <div class="p-stat circle-stat">        
            <div class="p-stat-name">
                <span class="material-symbols-outlined">
                    <span class="material-symbols-outlined">${challengeStats[0].icon}</span>
                </span>
                <span class="">${challengeStats[0].title}</span>
            </div>
            <span class="p-stat-contents circle">${challengesCompleted}/${totalChallenges}</span>
        </div>
        <div class="p-stat-cont-nested">
            <div class="p-stat split-stat">
                <div class="flx-sb">
                    <div class="p-stat-name">
                        <span class="material-symbols-outlined">${challengeStats[1].icon}</span>
                        <span class="">${challengeStats[1].title}</span>
                    </div>
                    <span class="p-stat-contents">${challengesSubmitted}</span>
                </div>
                <div class="flx-e">
                    <button class="p-view-submissions">View</button>
                </div>
            </div>
            <div class="p-stat split-stat">
                <div class="flx-sb">
                    <div class="p-stat-name">
                        <span class="material-symbols-outlined">${challengeStats[2].icon}</span>
                        <span class="">${challengeStats[2].title}</span>
                    </div>
                    <span class="p-stat-contents">${challengesInProgress}</span>
                </div>
                <div class="flx-e">
                    <button class="p-view-inprogress">View</button>
                </div>
            </div>
        </div>
    `;

    projectStatContainer.className = "p-project-stats";
    projectStatContainer.innerHTML = `
        <div class="flx p-proj-stat">
            <div>
                <span class="material-symbols-outlined">
                    <span class="material-symbols-outlined">${projectStats[0].icon}</span>
                </span>
                <span class="">${projectStats[0].title}</span>
            </div>
            <span class="flx-e">${totalProjects}</span>
        </div>
        <div class="flx p-proj-stat">
            <div>
                <span class="material-symbols-outlined">
                    <span class="material-symbols-outlined">${projectStats[1].icon}</span>
                </span>
                <span class="">${projectStats[1].title}</span>
            </div>
            <span class="flx-e">${totalProjectTime} hours</span>
        </div>
        <div class="flx p-proj-stat">
            <div>
                <span class="material-symbols-outlined">
                    <span class="material-symbols-outlined">${projectStats[2].icon}</span>
                </span>
                <span class="">${projectStats[2].title}</span>
            </div>
            <span class="flx-e">${averageProjectTime} hours</span>
        </div>
    `;

    let completedLessonPercent = (lessonsCompleted / totalLessons) * 100;
    let lessonStatCircle = lessonStatContainer.querySelector(".circle") as HTMLElement;

    if (lessonStatCircle) {
        lessonStatCircle.style.background = `conic-gradient(var(--learn-col) 0% ${completedLessonPercent}%, transparent ${completedLessonPercent}% 100%)`;
    }

    let completedChallPercent = (challengesCompleted / totalChallenges) * 100;
    let challengeStatCircle = challengeStatContainer.querySelector(".circle") as HTMLElement;

    if (challengeStatCircle) {
        challengeStatCircle.style.background = `conic-gradient(var(--practice-col) 0% ${completedChallPercent}%, transparent ${completedChallPercent}% 100%)`;
    }
}

viewSubmissionsButton?.addEventListener("click", (e) => {
    location.href = '/practice/?filteroptions=completed';
})

async function getUserStats() {
    let tempStats = await g_user.getStats();

    challengesCompleted = tempStats.challengesCompleted;
    challengesSubmitted = tempStats.challengesSubmitted;
    challengesInProgress = tempStats.challengesInProgress;
    lessonsCompleted = tempStats.lessonsCompleted;
    totalLessonTime = tempStats.totalLessonTime;
    averageLessonTime = tempStats.averageLessonTime;
    totalProjects = tempStats.totalProjects;
    totalProjectTime = tempStats.totalProjectTime;
    averageProjectTime = tempStats.averageProjectTime;
}