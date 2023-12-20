const cardNodeList = document.querySelectorAll(".card");
const cardArray = Array.from(cardNodeList);
const cardControlNodeList = document.querySelectorAll(".card-btn");
const buttonArr = Array.from(cardControlNodeList);
const learnBtn = document.querySelector(".learn-link");
const practiceBtn = document.querySelector(".practice-link");
const experimentBtn = document.querySelector(".experiment-link");
const navLinkArr = [learnBtn, practiceBtn, experimentBtn];
let currentCard = cardArray[0];
console.log(currentCard);
buttonArr.forEach((button) => {
    button.addEventListener("click", () => {
        if (button.getAttribute("card-label") != currentCard.getAttribute("card-label")) { // only triggers event if changing to a new card
            updateCurrentButton(button);
        }
    });
});
function updateCurrentButton(button) {
    buttonArr.forEach((btn) => {
        btn.classList.remove("active-card-btn");
    });
    button.classList.add("active-card-btn");
    navLinkArr.forEach((link) => {
        link.classList.remove("active");
    });
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
//# sourceMappingURL=cards.js.map