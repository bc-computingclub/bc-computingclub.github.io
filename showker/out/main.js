"use strict";
let getStartedButton = document.querySelector(".co-button");
let imageDiv = document.querySelector(".showcase-cont");
let images = document.querySelectorAll(".showcase-img");
let codeOtterTitle = document.querySelector(".co-top");
let titleCont = document.querySelector(".co-cont");
let i = 0;
let nextBtn;
let prevBtn;
let features = [
    {
        title: "Who are we?",
        body: "<span>Paul Bauer and Caleb Early, sophomore Computer Science majors with math minors.</span><span>We’re both heavily involved in the Computing Club (Paul is president of the club, and Caleb hosts the club’s bi-weekly JavaScript challenges).</span><span>We've worked together on a big project in the past, and decided to team up again here!</span>",
    },
    {
        title: "A background to our problem",
        body: "<span>In his Computer Science classes, Dr McGregor encourages students to search for ways to apply the things they learn in class - and also to go beyond that, for example by building projects on their own.</span><span>Caleb and I frequently get questions from students echoing these words, hoping we can guide them - whether they’re complete beginners, or they want to learn more about programming.</span><span>In Fall ‘23, when the club started hosting JavaScript challenges, we realized there was a lot of interest in the topic, but students’ skill levels were all over the place. </span>",
    },
    {
        title: "The problem",
        body: "<span>We needed a way to help students apply knowledge learnt in their Computer Science classes, and we saw the opportunity to drive engagement with programming at Bridgewater.</span><span>In order to do this, we wanted something which could go on indefinitely; to which other students could contribute to in the future.</span><span>This means we'd have to set up a way for people to tweak this in the future.</span>",
    },
    {
        title: "So what's our solution?",
        body: "<span>Caleb and I created a free web-app, which we named CodeOtter.</span><span>You'll get to see it on the day of our presentation! For now, you'll have to be content with the few screenshots I added to this page.</span><span>This app serves as an all-in-one platform on which users can learn how to code, practice their programming skills, and experiment as they’d like - all regardless of their pre-existing programming skills.</span><span>This took over 20,000 lines of code, and hundreds of hours of planning, discussion, and coding.</span>",
    },
    {
        title: "What does this look like?",
        body: "<span>This web-app is composed of three sections:<span><ul><li>Learn: A series of interactive tutorials teaching users how to code in HTML, CSS and JavaScript.</li><li>Practice: This page hosts challenges for all skill levels, from beginner to what we call ‘code-wizard’. These challenges are built so that users can view one another's submissions.</li><li>Experiment: Our built-in code editor allows users to make projects and create whatever they want - and then share their progress with whoever they’d like.</li></ul>",
    },
];
getStartedButton.addEventListener("animationend", (event) => {
    if (event.animationName == "fade-out-btn") {
        getStartedButton.remove();
        let temp = document.createElement("div");
        temp.classList.add("fade-in-up-slow", "feature-controls");
        temp.innerHTML = `
            <button class="feature-button previous material-symbols-outlined" onclick="goPrev();" disabled="true">arrow_left_alt</button>
            <button class="feature-button next material-symbols-outlined" onclick="goNext();">arrow_right_alt</button>
        `;
        titleCont.appendChild(temp);
        nextBtn = document.querySelector(".next");
        prevBtn = document.querySelector(".previous");
        imageDiv.addEventListener("animationend", (event) => {
            if (event.animationName == "fade-in" || event.animationName == "fade-in-up") {
                if (i <= 1) {
                    prevBtn.disabled = true;
                    nextBtn.disabled = false;
                }
                else if (i == features.length) {
                    nextBtn.disabled = true;
                    prevBtn.disabled = false;
                }
                else if (i > 1 && i < features.length) {
                    prevBtn.disabled = false;
                    nextBtn.disabled = false;
                }
            }
        });
    }
});
imageDiv.onanimationend = (event) => {
    if (event.animationName == "fade-out-up") {
        while (imageDiv.firstChild) {
            imageDiv.removeChild(imageDiv.firstChild);
        }
        imageDiv.classList.remove("removeimgdiv");
        updateFeatures();
    }
};
function updateFeatures() {
    if (!titleCont.classList.contains("altpos")) {
        titleCont.classList.add("altpos");
    }
    ;
    let temp = document.createElement("div");
    temp.classList.add("fade-in-up", "feature-cont");
    temp.innerHTML = `
        <div class="feature-header">
            <h1>${features[i].title}</h1>
        </div>
        <div class="feature-body">
            ${features[i].body}
        </div>
    `;
    i++;
    imageDiv.appendChild(temp);
}
function goNext() {
    if (i < features.length) {
        imageDiv.classList.add("removeimgdiv");
    }
}
function goPrev() {
    if (i > 1) {
        i -= 2;
        imageDiv.classList.add("removeimgdiv");
    }
}
getStartedButton.addEventListener("click", () => {
    getStartedButton.classList.add("removebtn");
    imageDiv.classList.add("removeimgdiv");
});
