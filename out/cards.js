const cardContainer = document.querySelector(".cards");
const cardControlNodeList = document.querySelectorAll(".card-btn");
const buttonArr = Array.from(cardControlNodeList);
const navLinkArr = Array.from(document.querySelectorAll(".link"));
;
let cardArray = getCardArray();
let currentCard = cardArray[0];
let isAnimating = false;
function updateCurrentButton(targetButtonAttr) {
    let targetButton;
    buttonArr.forEach((button) => {
        if (button.getAttribute("card-label") == targetButtonAttr) {
            targetButton = button;
            targetButton.classList.add("active-card-btn");
        }
        else {
            button.classList.remove("active-card-btn");
        }
    });
    let i = 0;
    navLinkArr.forEach((link) => {
        if (link.getAttribute("card-label") == targetButtonAttr) {
            link.classList.add("active");
            document.body.classList.remove("learn-page", "practice-page", "experiment-page");
            document.body.classList.add(["learn-page", "practice-page", "experiment-page"][i]);
        }
        else {
            link.classList.remove("active");
        }
        i++;
    });
}
let card;
cardContainer.addEventListener("click", (event) => {
    if (isAnimating) {
        return;
    }
    card = event.target.closest(".card");
    if (currentCard == card) {
        removeCard(card);
    }
});
function removeCard(card) {
    isAnimating = true;
    card.classList.add("remove-card");
    card.addEventListener("animationend", () => { isAnimating = false; });
    let tempCard = card.cloneNode(true);
    tempCard.classList.remove("remove-card", "initial-state", "current-card");
    tempCard.setAttribute("position", "3");
    card.addEventListener("animationend", (event) => {
        if (event.animationName == "remove-card") {
            card.remove();
        }
        cardArray = getCardArray();
        cardArray[0].setAttribute("position", "1");
        cardArray[1].classList.remove("initial-state");
        cardArray[1].setAttribute("position", "2");
        cardContainer.append(tempCard);
        currentCard = cardArray[0];
        currentCard.classList.add("current-card");
        updateEventListeners();
        updateCurrentButton(currentCard.getAttribute("card-label"));
    });
}
let cycleTimeout;
function updateEventListeners() {
    currentCard.addEventListener("mouseenter", () => {
        clearTimeout(cycleTimeout);
    });
    currentCard.addEventListener("mouseleave", () => {
        clearTimeout(cycleTimeout);
        cycleTimeout = setTimeout(cycleCards, 2000);
    });
}
function getCardArray() {
    return Array.from(document.querySelectorAll(".card"));
}
window.addEventListener("load", () => {
    updateEventListeners();
    cycleTimeout = setTimeout(cycleCards, 2000);
});
function cycleCards() {
    removeCard(currentCard);
    cycleTimeout = setTimeout(cycleCards, 3000);
}
//# sourceMappingURL=cards.js.map