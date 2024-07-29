let profileContainer = document.querySelector(".p-top") as HTMLElement;
let profileHeader = document.querySelector(".p-header-top") as HTMLElement;
let profileHeaderBot = document.querySelector(".p-header-bottom") as HTMLElement;
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
    {title:"Challenges Completed: ",number:"0",icon:""},
    {title:"Challenges Submitted: ",number:"0",icon:""},
    {title:"Challenges In Progress: ",number:"0",icon:""},
];
let lessonStats: Stat[] = [
    {title:"Lessons Completed: ",number:"0",icon:""},
    {title:"Time Spent on Lessons: ",number:"0 minutes",icon:""},
    {title:"Average Lesson Time: ",number:"0 minutes",icon:""},
];
let projectStats: Stat[] = [
    {title:"Projects Completed: ",number:"0",icon:""},
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
    viewSubmissionsButton.disabled = false;

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

    await showLoadingAnim([challengeStatContainer,lessonStatContainer],400);

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
    for(let stat of projectStats) {
        let temp = document.createElement("div");
        temp.classList.add("p-stat");
        temp.innerHTML = `
            <div class="p-stat-name">
                <span class="material-symbols-outlined">${stat.icon}</span>
                <span class="">${stat.title}</span>
            </div>
            <span class="p-stat-contents">${stat.number}</span>
        `;
        projectStatContainer.appendChild(temp);
    }
}

viewSubmissionsButton.addEventListener("click", (e) => {
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