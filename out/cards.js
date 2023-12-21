const cardNodeList = document.querySelectorAll(".card");
let cardArray = Array.from(cardNodeList);
const cardContainer = document.querySelector(".cards");
const cardControlNodeList = document.querySelectorAll(".card-btn");
const buttonArr = Array.from(cardControlNodeList);
const learnBtn = document.querySelector(".learn-link");
const practiceBtn = document.querySelector(".practice-link");
const experimentBtn = document.querySelector(".experiment-link");
const navLinkArr = [learnBtn, practiceBtn, experimentBtn];
let currentCard = cardArray[0];
console.log(currentCard);
let isAnimating = false;
function updateCurrentButton(targetButtonAttr) {
    let targetButton;
    buttonArr.forEach((button) => {
        if (button.getAttribute("card-label") == targetButtonAttr) {
            targetButton = button;
        }
    });
    buttonArr.forEach((btn) => {
        btn.classList.remove("active-card-btn");
    });
    targetButton.classList.add("active-card-btn");
    let tempAttr = targetButton.getAttribute("card-label");
    buttonArr.forEach((button) => {
        if (button.classList.contains(tempAttr)) {
            button.classList.add("active");
        }
    });
    navLinkArr.forEach((link) => {
        if (link.getAttribute("card-label") == tempAttr) {
            link.classList.add("active");
        }
        else {
            link.classList.remove("active");
        }
    });
}
let card;
cardContainer.addEventListener("click", (event) => {
    if (isAnimating) {
        return;
    }
    card = event.target.closest(".card");
    if (card && cardArray.includes(card)) {
        if (currentCard.getAttribute("card-label") == card.getAttribute("card-label")) {
            console.log("trying to remove card");
            removeCard(card);
        }
    }
});
function removeCard(card) {
    isAnimating = true;
    card.classList.add("remove-card");
    card.addEventListener("animationend", () => {
        isAnimating = false; // this kind of helps prevent spam clicking from breaking the cards
    });
    let tempCard = card.cloneNode(true);
    tempCard.classList.remove("remove-card", "initial-state", "current-card");
    tempCard.setAttribute("position", "3");
    card.addEventListener("animationend", (event) => {
        if (event.animationName == "remove-card") {
            card.remove();
        }
        cardArray = Array.from(document.querySelectorAll(".card"));
        cardArray[0].setAttribute("position", "1");
        cardArray[1].classList.remove("initial-state");
        cardArray[1].setAttribute("position", "2");
        cardContainer.append(tempCard);
        currentCard = cardArray[0];
        addHoverState(currentCard);
        updateCurrentButton(currentCard.getAttribute("card-label"));
    });
}
function addHoverState(card) {
    card.classList.add("current-card");
}
//# sourceMappingURL=cards.js.map