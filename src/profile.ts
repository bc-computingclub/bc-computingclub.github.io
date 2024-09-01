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
    {title:"In Progress: ",number:"0",icon:""},
];
let lessonStats: Stat[] = [
    {title:"Completed ",number:"0",icon:"select_check_box"},
    {title:"Total Time Spent: ",number:"0 minutes",icon:""},
    {title:"Average Time Spent: ",number:"0 minutes",icon:""},
];
let projectStats: Stat[] = [
    {title:"Projects: ",number:"0",icon:""},
    {title:"Time Spent: ",number:"0 minutes",icon:""},
    {title:"Average Time: ",number:"0 minutes",icon:""},
];

// Below are all of the stats that will be displayed on the profile page. Randomly filled in for now
// Claeb: sorry I took them away haha and moved it all to a stats object for better organization and ease of future proofing

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

    let stats = await getUserStats(); // Fetches and sets user stats.
    
    let removeArr = document.querySelectorAll(".remove-on-load") as NodeListOf<HTMLElement>;
    removeArr.forEach((element) => {
        element.remove();
    })

    let showOnLoginArr = document.querySelectorAll(".vishidden") as NodeListOf<HTMLElement>;
    showOnLoginArr.forEach((element) => {
        element.classList.remove("vishidden");
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
            <span class="p-stat-contents circle">${stats.lessonsCompleted}/${stats.totalLessons}</span>
        </div>
        <div class="p-stat-cont-nested">
            <div class="p-stat split-stat">
                <div class="flx-sb">
                    <div class="p-stat-name">
                        <span class="material-symbols-outlined">${lessonStats[1].icon}</span>
                        <span class="">${lessonStats[1].title}</span>
                    </div>
                    <span class="p-stat-contents">${timeConversion(stats.totalLessonTime)}</span>
                </div>
            </div>
            <div class="p-stat split-stat">
                <div class="flx-sb">
                    <div class="p-stat-name">
                        <span class="material-symbols-outlined">${lessonStats[2].icon}</span>
                        <span class="">${lessonStats[2].title}</span>
                    </div>
                    <span class="p-stat-contents">${timeConversion(stats.averageLessonTime)}</span>
                </div>
            </div>
        </div>
    `;
    setupStatVisibilityCheckbox("lesson",stats);

    challengeStatContainer.className = "p-challenge-stats";
    challengeStatContainer.innerHTML = `
        <div class="p-stat circle-stat">        
            <div class="p-stat-name">
                <span class="material-symbols-outlined">
                    <span class="material-symbols-outlined">${challengeStats[0].icon}</span>
                </span>
                <span class="">${challengeStats[0].title}</span>
            </div>
            <span class="p-stat-contents circle">${stats.challengesCompleted}/${stats.totalChallenges}</span>
        </div>
        <div class="p-stat-cont-nested">
            <div class="p-stat split-stat">
                <div class="flx-sb">
                    <div class="p-stat-name">
                        <span class="material-symbols-outlined">${challengeStats[1].icon}</span>
                        <span class="">${challengeStats[1].title}</span>
                    </div>
                    <span class="p-stat-contents">${stats.challengesSubmitted}</span>
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
                    <span class="p-stat-contents">${stats.challengesInProgress}</span>
                </div>
            </div>
        </div>
    `;
    setupStatVisibilityCheckbox("challenge",stats);

    projectStatContainer.className = "p-project-stats";
    projectStatContainer.innerHTML = `
        <div class="flx p-proj-stat">
            <div>
                <span class="material-symbols-outlined">
                    <span class="material-symbols-outlined">${projectStats[0].icon}</span>
                </span>
                <span class="">${projectStats[0].title}</span>
            </div>
            <span class="flx-e">${stats.totalProjects}</span>
        </div>
        <div class="flx p-proj-stat">
            <div>
                <span class="material-symbols-outlined">
                    <span class="material-symbols-outlined">${projectStats[1].icon}</span>
                </span>
                <span class="">${projectStats[1].title}</span>
            </div>
            <span class="flx-e">${timeConversion(stats.totalProjectTime)}</span>
        </div>
        <div class="flx p-proj-stat">
            <div>
                <span class="material-symbols-outlined">
                    <span class="material-symbols-outlined">${projectStats[2].icon}</span>
                </span>
                <span class="">${projectStats[2].title}</span>
            </div>
            <span class="flx-e">${timeConversion(stats.averageProjectTime)}</span>
        </div>
    `;
    setupStatVisibilityCheckbox("project",stats);

    let completedLessonPercent = (stats.lessonsCompleted / stats.totalLessons) * 100;
    let lessonStatCircle = lessonStatContainer.querySelector(".circle") as HTMLElement;

    if (lessonStatCircle) {
        lessonStatCircle.style.background = `conic-gradient(var(--learn-col) 0% ${completedLessonPercent}%, transparent ${completedLessonPercent}% 100%)`;
    }

    let viewSubmissionsButton = document.querySelector(".p-view-submissions") as HTMLButtonElement;
    let viewInProgressButton = document.querySelector(".p-view-inprogress") as HTMLButtonElement;

    viewSubmissionsButton?.addEventListener("click", (e) => {
        window.location.href = '/practice/?filteroptions=completed';
    });

    let completedChallPercent = (stats.challengesCompleted / stats.totalChallenges) * 100;
    let challengeStatCircle = challengeStatContainer.querySelector(".circle") as HTMLElement;

    if (challengeStatCircle) {
        challengeStatCircle.style.background = `conic-gradient(var(--practice-col) 0% ${completedChallPercent}%, transparent ${completedChallPercent}% 100%)`;
    }
}

function setupStatVisibilityCheckbox(id:"lesson"|"challenge"|"project",stats:UserStats){
    let cb_vis = document.querySelector<HTMLInputElement>(`#cb-${id}-visibility`);
    let b_vis = document.querySelector<HTMLButtonElement>(`.${id}-public-toggle`);
    if(!cb_vis || !b_vis){
        console.warn("Failed to find checkboxes/buttons for visibility");
        return;
    }
    
    cb_vis.checked = stats.settings[id+"StatsPublic"] ?? false;
        
    // 
    let _hadResponse = true;
    b_vis.addEventListener("click",async e=>{
        if(!_hadResponse) return;
        _hadResponse = false;

        let initial = cb_vis.checked;
        cb_vis.checked = !cb_vis.checked;
        
        let res = await httpReq<{value:boolean}>("PATCH","/user/stat_visibility",{
            id,value:cb_vis.checked
        },{isJSON:true});
        if(!res){
            // failed, set it back to initial
            cb_vis.checked = initial;
            return;
        }
    
        cb_vis.checked = res.value;

        _hadResponse = true;
    });
}

viewSubmissionsButton?.addEventListener("click", (e) => {
    location.href = '/practice/?filteroptions=completed';
})

async function getUserStats() {
    let tempStats = await g_user.getStats();
    console.log("STATS:",tempStats);

    return tempStats;
}

function timeConversion(time:number) {
    if(time/1000/60/60 < 1) return (time/1000/60).toFixed(1) + " minutes";
    return (time/1000/60/60).toFixed(1) + " hours";
}