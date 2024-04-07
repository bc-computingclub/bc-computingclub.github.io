"use strict";
let getStartedButton = document.querySelector(".co-button");
let imageDiv = document.querySelector(".showcase-cont");
let images = document.querySelectorAll(".showcase-img");
let codeOtterTitle = document.querySelector(".co-top");
let i = 0;
let features = [
    {
        title: "Who are we?",
        body: "<span>Paul Bauer and Caleb Early, sophomore Computer Science majors with math minors.</span><span>We’re both heavily involved in the Computing Club (Paul is president of the club, and Caleb hosts the club’s bi-weekly JavaScript challenges).</span>",
    },
    {
        title: "What 'problem' are we solving?",
        body: "<span>In his classes, Dr McGregor encourages students to find ways to apply the things they learn in class - but also to go beyond that, and to build projects on their own.</span><span>Caleb and I frequently get questions from students echoing these words, hoping we can guide them - whether they’re complete beginners, or they want to learn more about programming.</span><span>In Fall ‘23, when the club started hosting JavaScript challenges, we realized there was a lot of interest in the topic, but students’ skill levels were all over the place. </span><span>We needed a way to help students apply knowledge learnt in their Computer Science classes, and we saw the opportunity to drive engagement with programming at Bridgewater.</span>",
    },
    {
        title: "So what's our solution?",
        body: "<span>Caleb and I created a free web-app, which we named CodeOtter, currently hosted at CodeOtter.dev</span><span>This app serves as an all-in-one platform on which users can learn how to code, practice their programming skills, and experiment as they’d like - regardless of their pre-existing programming skills.</span><span>This took over 20,000 lines of code, and hundreds of hours of planning, discussion, and coding.</span>",
    },
    {
        title: "What does this look like?",
        body: "<span>This web-app is composed of three sections:<span><ul><li>Learn: A series of interactive tutorials teaching users how to code in HTML, CSS and JavaScript.</li><li>Practice: This page hosts challenges for all skill levels, from beginner to what we call ‘code-wizard’. These challenges are built so that users can view one another's submissions.</li><li>Experiment: Our built-in code editor allows users to make projects and create whatever they want - and then share their progress with whoever they’d like.</li></ul>",
    },
];
getStartedButton.addEventListener("animationend", (event) => {
    if (event.animationName == "removebtn") {
        getStartedButton.remove();
    }
});
imageDiv.onanimationend = (event) => {
    if (event.animationName == "fade-out-up") {
        console.log("got here");
        while (imageDiv.firstChild) {
            imageDiv.removeChild(imageDiv.firstChild);
        }
        imageDiv.classList.remove("removeimgdiv");
        updateFeatures();
    }
};
function updateFeatures() {
    if (!codeOtterTitle.classList.contains("altpos")) {
        codeOtterTitle.classList.add("altpos");
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
        <div class="feature-controls">
            <button class="feature-button previous" onclick="goPrev();">${i > 0 ? "Previous" : "(Start)"}</button>
            <button class="feature-button next" onclick="goNext();">${i < (features.length - 1) ? "Next" : "(End)"}</button>
        </div>
    `;
    i++;
    imageDiv.appendChild(temp);
}
function goNext() {
    if (i < features.length) {
        imageDiv.classList.add("removeimgdiv");
    }
    else
        alert("You have reached the end of the presentation.");
}
function goPrev() {
    if (i > 1) {
        i -= 2;
        imageDiv.classList.add("removeimgdiv");
    }
    else
        alert("You are at the beginning of the presentation.");
}
getStartedButton.addEventListener("click", () => {
    getStartedButton.classList.add("removebtn");
    imageDiv.classList.add("removeimgdiv");
});
