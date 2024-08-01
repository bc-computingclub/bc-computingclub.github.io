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
    {title:"Challenges Submitted: ",number:"0",icon:""},
    {title:"Challenges In Progress: ",number:"0",icon:""},
];
let lessonStats: Stat[] = [
    {title:"Lessons Completed ",number:"0",icon:""},
    {title:"Time Spent on Lessons: ",number:"0 minutes",icon:""},
    {title:"Average Lesson Time: ",number:"0 minutes",icon:""},
];
let projectStats: Stat[] = [
    {title:"Projects Completed ",number:"0",icon:""},
    {title:"Time Spent on Projects: ",number:"0 minutes",icon:""},
    {title:"Average Project Time: ",number:"0 minutes",icon:""},
];

// Below are all of the stats that will be displayed on the profile page.

let challengesCompleted:number = 0;
let challengesSubmitted:number = 0;
let challengesInProgress:number = 0;

let lessonsCompleted:number = 0;
let totalLessonTime:number = 0;
let averageLessonTime:number = 0;

let totalProjects:number = 0;
let totalProjectTime:number = 0;
let averageProjectTime:number = 0;

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
                <div class="flx">
                    <div class="p-stat-name">
                        <span class="material-symbols-outlined">${challengeStats[1].icon}</span>
                        <span class="">${challengeStats[1].title}</span>
                    </div>
                    <span class="p-stat-contents">${challengesSubmitted}</span>
                </div>
                <div class="flx end">
                    <button class="p-view-submissions">View All</button>
                </div>
            </div>
            <div class="p-stat split-stat">
                <div class="flx">
                    <div class="p-stat-name">
                        <span class="material-symbols-outlined">${challengeStats[2].icon}</span>
                        <span class="">${challengeStats[2].title}</span>
                    </div>
                    <span class="p-stat-contents">${challengesInProgress}</span>
                </div>
                <div class="flx end">
                    <button class="p-view-inprogress">View All</button>
                </div>
            </div>
        </div>
    `;

    lessonStatContainer.className = "p-lesson-stats";
    challengeStatContainer.innerHTML = `
        <div class="p-stat circle-stat">        
            <div class="p-stat-name">
                <span class="material-symbols-outlined">
                    <span class="material-symbols-outlined">${lessonStats[0].icon}</span>
                </span>
                <span class="">${lessonStats[0].title}</span>
            </div>
            <span class="p-stat-contents circle">${challengesCompleted}/${totalChallenges}</span>
        </div>
        <div class="p-stat-cont-nested">
            <div class="p-stat split-stat">
                <div class="flx">
                    <div class="p-stat-name">
                        <span class="material-symbols-outlined">${lessonStats[1].icon}</span>
                        <span class="">${lessonStats[1].title}</span>
                    </div>
                    <span class="p-stat-contents">${challengesSubmitted}</span>
                </div>
                <div class="flx end">
                    <button class="p-view-submissions">View All</button>
                </div>
            </div>
            <div class="p-stat split-stat">
                <div class="flx">
                    <div class="p-stat-name">
                        <span class="material-symbols-outlined">${lessonStats[2].icon}</span>
                        <span class="">${lessonStats[2].title}</span>
                    </div>
                    <span class="p-stat-contents">${lessonsCompleted}</span>
                </div>
                <div class="flx end">
                    <button class="p-view-inprogress">View All</button>
                </div>
            </div>
        </div>
    `;
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