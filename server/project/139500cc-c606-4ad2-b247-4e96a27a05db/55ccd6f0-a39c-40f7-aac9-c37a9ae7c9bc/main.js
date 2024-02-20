let values = document.querySelectorAll(".lock-value");
let padlock = document.querySelector(".padlock");
let spoiler = document.querySelector(".spoiler");

let unlockCombination = [4,6,8];
let currentCombination = [0,0,0];
spoiler.textContent = unlockCombination;

function increaseValue(index) {
    currentCombination[index] = currentCombination[index] < 9 ? currentCombination[index] + 1 : 0;
    refreshValues();
}

window.onload = () => {
    for(let i = 0; i < 3; i++) {
        values[i].addEventListener("click", () => {
            increaseValue(i);
        });
    };
};

function refreshValues() {
    for(let i = 0; i < 3; i++) {
        values[i].textContent = currentCombination[i];
    };
    checkStatus();
}

function checkStatus() {
    let areEqual = true;
    for(let i = 0; i < 3; i++) {
        if(unlockCombination[i] != currentCombination[i]) areEqual = false;
    }
    toggleSecret(areEqual);
}

function toggleSecret(showSecret) {
    if(showSecret) padlock.classList.add("open");
    else if(padlock.classList.contains("open")) { padlock.classList.remove("open") }
}