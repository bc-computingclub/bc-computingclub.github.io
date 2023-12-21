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
    navLinkArr.forEach((link) => {
        if (link.getAttribute("card-label") == targetButtonAttr) {
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
        updateCurrentButton(currentCard.getAttribute("card-label"));
    });
}
function getCardArray() {
    return Array.from(document.querySelectorAll(".card"));
}
//# sourceMappingURL=cards.js.map