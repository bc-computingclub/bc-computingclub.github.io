const cardNodeList = document.querySelectorAll<HTMLElement>(".card");
const cardArray = Array.from(cardNodeList);

const cardControlNodeList = document.querySelectorAll<HTMLElement>(".card-btn");
const buttonArr = Array.from(cardControlNodeList);

const learnBtn = document.querySelector(".learn-link") as HTMLElement;
const practiceBtn = document.querySelector(".practice-link") as HTMLElement;
const experimentBtn = document.querySelector(".experiment-link") as HTMLElement;
const navLinkArr = [learnBtn,practiceBtn,experimentBtn];

let currentCard = cardArray[0];
console.log(currentCard);

buttonArr.forEach((button) => {
    button.addEventListener("click", () => {
        if(button.getAttribute("card-label") != currentCard.getAttribute("card-label")) { // only triggers event if changing to a new card
            updateCurrentButton(button);
        }
    })
})

function updateCurrentButton(button:HTMLElement) {
    buttonArr.forEach((btn) => {
        btn.classList.remove("active-card-btn");
    })
    button.classList.add("active-card-btn");

    navLinkArr.forEach((link) => {
        link.classList.remove("active")
    })

    switch (button.getAttribute("card-label")) {
        case "learn":
            currentCard = cardArray[0];
            learnBtn.classList.add("active");
            break;
        case "practice":
            currentCard = cardArray[1];
            practiceBtn.classList.add("active");
            break;
        case "experiment":
            currentCard = cardArray[2];
            experimentBtn.classList.add("active");
            break;
        default:
            console.log("Error changing currentCard value.");
    }
}