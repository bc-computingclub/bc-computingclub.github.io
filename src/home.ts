const hBody = document.querySelector('.h-body') as HTMLElement;
const hDesc = document.querySelector('.h-description') as HTMLElement;
const hFeatureCont = document.querySelector('.h-feature-cont') as HTMLElement;
const hBackground = document.querySelector('.h-background') as HTMLElement;

let timelineBtns = document.querySelectorAll('.timeline-marker') as NodeListOf<HTMLElement>;
let currentFeature: HTMLElement;
let activeElm: HTMLElement;
let currentNum: string;

const sections = [ // Any changes to the text displayed on the homepage will tweak this object.
    {
        title: `<h1 class="h-title" t="l">Learn</h1>`,
        body:`<span class="h-text">Explore programming concepts through a series of interactive tutorials designed from scratch.</span>`,
        button: `<button class="h-redirect" onclick="location.href='/learn/index.html'">GET STARTED<span class="material-symbols-outlined">arrow_forward_ios</span></button>`
    },
    {
        title: `<h1 class="h-title"" t="p">Practice</h1>`,
        body:`<span class="h-text">Hone your programming skills by completing challenges curated by Bridgewater College’s Computing club.</span>`,
        button: `<div class="h-redirect-cont"><button class="h-redirect" onclick="location.href='/practice/index.html'">VIEW CHALLENGES<span class="material-symbols-outlined">arrow_forward_ios</span></button><a class="h-redirect-featured" href="/practice/?filteroptions=ongoing">Featured Challenge</a></div>`
    },
    {
        title: `<h1 class="h-title" t="e">Experiment</h1>`,
        body:`<span class="h-text">Create whatever you want. Use our built-in editor, or import your own files.</span>`,
        button: `<button class="h-redirect" onclick="location.href='/editor/index.html'">GET STARTED<span class="material-symbols-outlined">arrow_forward_ios</span></button>`
    },
];

window.onload = () => {
    setupFeature();
    createFeature();
}

/**
 * Find which feature is "active". Give "active" eventlisteners to this feature. (Only called on page load)
 */
function setupFeature() {
    currentFeature = document.querySelector('.h-timeline');
    currentNum = currentFeature.getAttribute("section") as string;
    activeElm = document.querySelector(".active") as HTMLElement;

    currentFeature.addEventListener('mouseover', handleMouseOver);
    currentFeature.addEventListener('mouseout', handleMouseOut);
    currentFeature.addEventListener('click', handleClick);
}

function handleMouseOver(event: Event) {
    let hovered = event.target as HTMLElement;
    if (hovered.classList.contains("timeline-marker")) {
        timelineBtns.forEach((btn) => { btn.classList.remove("active") });
    }
}

function handleMouseOut(event: Event) {
    currentFeature.setAttribute("section", currentNum);
    hBody.setAttribute("section", currentNum);
    activeElm.classList.add("active");
}

function handleClick(event: Event) {
    let clicked = event.target as HTMLElement;
    if (clicked.classList.contains("timeline-marker") && clicked != activeElm) {
        activeElm.classList.remove("active");
        clicked.classList.add("active");
        activeElm = clicked;
        currentNum = clicked.getAttribute("n") as string;
        currentFeature.setAttribute("section", currentNum);

        createFeature();
    }
}

/**
 * Clear feature container, then append the "current" feature to the container.
 */
function createFeature() {
    while(hDesc.firstChild) hDesc.removeChild(hDesc.firstChild);
    let temp = document.createElement('div');
    temp.className = "h-feature active";
    temp.innerHTML += sections[parseInt(currentNum) - 1].title;
    temp.innerHTML += sections[parseInt(currentNum) - 1].body;
    temp.innerHTML += sections[parseInt(currentNum) - 1].button;
    hDesc.appendChild(temp);
    hBody.setAttribute("section", currentNum);
    hBackground.setAttribute("section", currentNum);
}

// Subtle parallax effect, feel free to remove if you don't like it Caleb
window.addEventListener('mousemove', function(e) {
    var x = e.clientX-innerWidth/2;
    var y = e.clientY-innerHeight/2;
    
    let strength = innerWidth/300;
    // strength /= 2;
    let scale = -2;
    hBackground.style.translate = (-scale*Math.cos((x/(innerWidth)-0.5)*Math.PI)*strength) + 'px ' + (-scale*Math.cos((y/(innerWidth)-0.5)*Math.PI)*strength) + 'px';

    strength /= 2;
    // strength *= 2;
    hFeatureCont.style.translate = (scale*Math.cos((x/(innerWidth)-0.5)*Math.PI)*strength) + 'px ' + (scale*Math.cos((y/(innerWidth)-0.5)*Math.PI)*strength) + 'px';
});