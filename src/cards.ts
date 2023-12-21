const cardNodeList = document.querySelectorAll<HTMLElement>(".card");
let cardArray = Array.from(cardNodeList);

const cardContainer = document.querySelector(".cards") as HTMLElement;
const cardControlNodeList = document.querySelectorAll<HTMLElement>(".card-btn");
const buttonArr = Array.from(cardControlNodeList);

const learnBtn = document.querySelector(".learn-link") as HTMLElement;
const practiceBtn = document.querySelector(".practice-link") as HTMLElement;
const experimentBtn = document.querySelector(".experiment-link") as HTMLElement;
const navLinkArr = [learnBtn,practiceBtn,experimentBtn];

let currentCard = cardArray[0];
console.log(currentCard);
let isAnimating = false;

function updateCurrentButton(targetButtonAttr:string) {
    let targetButton: HTMLElement;
    buttonArr.forEach((button) => {
        if(button.getAttribute("card-label") == targetButtonAttr) {
            targetButton = button;
        }
    })

    buttonArr.forEach((btn) => {
        btn.classList.remove("active-card-btn");
    })
    targetButton.classList.add("active-card-btn");
    
    let tempAttr = targetButton.getAttribute("card-label");
    buttonArr.forEach((button) => {
        if(button.classList.contains(tempAttr)) {
            button.classList.add("active");
        }
    })
    
    navLinkArr.forEach((link) => {
        if(link.getAttribute("card-label") == tempAttr) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    })
}

let card : HTMLElement;
cardContainer.addEventListener("click", (event) => {
    if(isAnimating) {
        return;
    }
    card = (event.target as HTMLElement).closest(".card") as  HTMLElement;
    if (card && cardArray.includes(card)) {
        if (currentCard.getAttribute("card-label") == card.getAttribute("card-label")) {
            console.log("trying to remove card")
            removeCard(card);
        }
    }
})

function removeCard(card:HTMLElement) {
    isAnimating = true;
    card.classList.add("remove-card");
    card.addEventListener("animationend", () => {
        isAnimating = false; // this kind of helps prevent spam clicking from breaking the cards
    });
    let tempCard = card.cloneNode(true) as HTMLElement;
    tempCard.classList.remove("remove-card","initial-state","current-card");
    tempCard.setAttribute("position","3");

    card.addEventListener("animationend", (event) => {
        if (event.animationName == "remove-card") {
            card.remove();
        }
        cardArray = Array.from(document.querySelectorAll<HTMLElement>(".card"));
        cardArray[0].setAttribute("position","1");
        cardArray[1].classList.remove("initial-state")
        cardArray[1].setAttribute("position","2");
        cardContainer.append(tempCard);
        currentCard = cardArray[0];
        addHoverState(currentCard);
        updateCurrentButton(currentCard.getAttribute("card-label"));
    });
}

function addHoverState(card:HTMLElement) {
    card.classList.add("current-card")
}