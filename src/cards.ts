const cardContainer = document.querySelector(".cards") as HTMLElement;
const cardControlNodeList = document.querySelectorAll<HTMLElement>(".card-btn");
const buttonArr = Array.from(cardControlNodeList);
const navLinkArr = Array.from(document.querySelectorAll<HTMLElement>(".link"));;
let cardArray = getCardArray();
let currentCard = cardArray[0];
let isAnimating = false;
let canCycle:boolean = true;
let cardCycleDelay = 2000;

function updateCurrentButton(targetButtonAttr:string) {
    let targetButton: HTMLElement;
    buttonArr.forEach((button) => { // updates buttons with color of current card
        if(button.getAttribute("card-label") == targetButtonAttr) {
            targetButton = button;
            targetButton.classList.add("active-card-btn")
        } else { button.classList.remove("active-card-btn"); }
    })

    let i = 0;
    navLinkArr.forEach((link) => { // updates nav links with color of current card
        if(link.getAttribute("card-label") == targetButtonAttr) {
            link.classList.add("active");
            document.body.classList.remove("learn-page","practice-page","experiment-page");
            document.body.classList.add(["learn-page","practice-page","experiment-page"][i]); // <- caleb: I added this just so other things like the menus will have the corresponding accents on them
        } else { link.classList.remove("active"); }
        i++;
    })
}

let card : HTMLElement;
cardContainer.addEventListener("click", (event) => {
    canCycle = false;
    if(isAnimating) {
        return;
    }
    card = (event.target as HTMLElement).closest(".card") as  HTMLElement;
    if (currentCard == card) {
        removeCard(card);
    }
    setTimeout(() => { 
        canCycle = true;
        cycleCards; 
    }, 10000)
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
        toggleSwitching();
        updateCurrentButton(currentCard.getAttribute("card-label"));
    });
}

let cycleTimeout; 

function toggleSwitching() {
    currentCard.addEventListener("mouseenter", () => {
        canCycle = false;
        clearTimeout(cycleTimeout); 
        console.log("trying to stop the damn animation");
    });

    currentCard.addEventListener("mouseleave", () => {
        canCycle = true;
        cycleTimeout = setTimeout(cycleCards, 500); 
        console.log("trying to start the damn animation");
    });
}

function getCardArray() {
    return Array.from(document.querySelectorAll<HTMLElement>(".card"));
}

window.addEventListener("load", () => {
    toggleSwitching();
    cycleTimeout = setTimeout(cycleCards, 2000); 
});

function cycleCards() {
    if (canCycle) {
        removeCard(currentCard);
        cardCycleDelay = 5000;
        cycleTimeout = setTimeout(cycleCards, cardCycleDelay);
    }
}

