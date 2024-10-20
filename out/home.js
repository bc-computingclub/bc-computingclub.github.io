const hBody = document.querySelector('.h-body');
const hDesc = document.querySelector('.h-description');
const hFeatureCont = document.querySelector('.h-feature-cont');
const hBackground = document.querySelector('.h-background');
let timelineBtns = document.querySelectorAll('.timeline-marker');
let currentFeature;
let activeElm;
let currentNum;
const sections = [
    {
        title: `<h1 class="h-title">Learn</h1>`,
        body: `<span class="h-text">Explore programming concepts through a series of interactive tutorials built from scratch something something</span>`,
        button: `<button class="h-redirect" href="/learn/lesson/index.html">GET STARTED<span class="material-symbols-outlined">arrow_forward_ios</span></button>`
    },
    {
        title: `<h1 class="h-title">Practice</h1>`,
        body: `<span class="h-text">Hone your programming skills by participating in challenges curated by Bridgewater College’s Computing club</span>`,
        button: `<div class="h-redirect-cont"><button class="h-redirect" href="/practice/index.html">VIEW CHALLENGES<span class="material-symbols-outlined">arrow_forward_ios</span></button><a class="h-redirect-featured" href="/practice/index.html">Featured Challenge</a></div>`
    },
    {
        title: `<h1 class="h-title">Experiment</h1>`,
        body: `<span class="h-text">Head out on your own and create whatever you’d like here - this is filler text idk what to say.</span>`,
        button: `<button class="h-redirect">GET STARTED<span class="material-symbols-outlined">arrow_forward_ios</span></button>`
    },
];
window.onload = () => {
    setupFeature();
    createFeature();
};
function setupFeature() {
    currentFeature = document.querySelector('.h-timeline');
    currentNum = currentFeature.getAttribute("section");
    activeElm = document.querySelector(".active");
    currentFeature.addEventListener('mouseover', handleMouseOver);
    currentFeature.addEventListener('mouseout', handleMouseOut);
    currentFeature.addEventListener('click', handleClick);
}
function handleMouseOver(event) {
    let hovered = event.target;
    if (hovered.classList.contains("timeline-marker")) {
        timelineBtns.forEach((btn) => { btn.classList.remove("active"); });
    }
}
function handleMouseOut(event) {
    currentFeature.setAttribute("section", currentNum);
    hBody.setAttribute("section", currentNum);
    activeElm.classList.add("active");
}
function handleClick(event) {
    let clicked = event.target;
    if (clicked.classList.contains("timeline-marker") && clicked != activeElm) {
        activeElm.classList.remove("active");
        clicked.classList.add("active");
        activeElm = clicked;
        currentNum = clicked.getAttribute("n");
        currentFeature.setAttribute("section", currentNum);
        createFeature();
    }
}
function createFeature() {
    while (hDesc.firstChild)
        hDesc.removeChild(hDesc.firstChild);
    let temp = document.createElement('div');
    temp.className = "h-feature active";
    temp.innerHTML += sections[parseInt(currentNum) - 1].title;
    temp.innerHTML += sections[parseInt(currentNum) - 1].body;
    temp.innerHTML += sections[parseInt(currentNum) - 1].button;
    hDesc.appendChild(temp);
    hBody.setAttribute("section", currentNum);
    hBackground.setAttribute("section", currentNum);
}
// subtle parallax effect, feel free to remove if you don't like it Caleb
window.addEventListener('mousemove', function (e) {
    var x = e.clientX - innerWidth / 2;
    var y = e.clientY - innerHeight / 2;
    let strength = innerWidth / 300;
    // strength /= 2;
    let scale = -2;
    hBackground.style.translate = (-scale * Math.cos((x / (innerWidth) - 0.5) * Math.PI) * strength) + 'px ' + (-scale * Math.cos((y / (innerWidth) - 0.5) * Math.PI) * strength) + 'px';
    strength /= 2;
    // strength *= 2;
    hFeatureCont.style.translate = (scale * Math.cos((x / (innerWidth) - 0.5) * Math.PI) * strength) + 'px ' + (scale * Math.cos((y / (innerWidth) - 0.5) * Math.PI) * strength) + 'px';
});
//# sourceMappingURL=home.js.map