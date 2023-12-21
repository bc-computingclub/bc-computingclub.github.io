const cardContainer = document.querySelector(".cards") as HTMLElement;
const cardControlNodeList = document.querySelectorAll<HTMLElement>(".card-btn");
const buttonArr = Array.from(cardControlNodeList);
const navLinkArr = Array.from(document.querySelectorAll<HTMLElement>(".link"));;
let cardArray = getCardArray();
let currentCard = cardArray[0];
let isAnimating = false;

function updateCurrentButton(targetButtonAttr:string) {
    let targetButton: HTMLElement;
    buttonArr.forEach((button) => { // updates buttons with color of current card
        if(button.getAttribute("card-label") == targetButtonAttr) {
            targetButton = button;
            targetButton.classList.add("active-card-btn")
        } else { button.classList.remove("active-card-btn"); }
    })

    navLinkArr.forEach((link) => { // updates nav links with color of current card
        if(link.getAttribute("card-label") == targetButtonAttr) {
            link.classList.add("active");
        } else { link.classList.remove("active"); }
    })
}

let card : HTMLElement;
cardContainer.addEventListener("click", (event) => {
    if(isAnimating) {
        return;
    }
    card = (event.target as HTMLElement).closest(".card") as  HTMLElement;
    if (currentCard == card) {
        removeCard(card);
    }
})

function removeCard(card:HTMLElement) {
    isAnimating = true;
    card.classList.add("remove-card");
    card.addEventListener("animationend", () => { isAnimating = false; });
    
    let tempCard = card.cloneNode(true) as HTMLElement;
    tempCard.classList.remove("remove-card","initial-state","current-card");
    tempCard.setAttribute("position","3");

    card.addEventListener("animationend", (event) => {
        if (event.animationName == "remove-card") {
            card.remove();
        }
        cardArray = getCardArray();
        cardArray[0].setAttribute("position","1");
        cardArray[1].classList.remove("initial-state")
        cardArray[1].setAttribute("position","2");
        cardContainer.append(tempCard);
        currentCard = cardArray[0];
        currentCard.classList.add("current-card");
        updateCurrentButton(currentCard.getAttribute("card-label"));
    });
}

function getCardArray() {
    return Array.from(document.querySelectorAll<HTMLElement>(".card"));
}