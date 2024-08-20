type Flashcard = {
    question: string,
    answer: string,
    languagetag: string[],
    completed: boolean,
    starred: boolean,
}

type FlashcardSet = {
    title: string,
    flashcards: Flashcard[],
    completed: boolean, // toggle to true when all flashcards are completed 
}

// Example flashcard set for brainstorming/testing purposes. 

let lessonOneFlashcards: FlashcardSet = {
    title: "Lesson One: The Basics",
    completed: false,
    flashcards: [
        {
            question: "What is the purpose of a <link> tag?",
            answer: "The <link> tag is used to link to external style sheets.",
            languagetag: ["HTML", "CSS"],
            completed: false,
            starred: false,
        },
        {
            question: "Which property is used to change the background color?",
            answer: "background-color",
            languagetag: ["CSS"],
            completed: false,
            starred: false,
        },
        {
            question: "What is the purpose of the <canvas> tag?",
            answer: "The <canvas> tag is used to draw graphics, on the fly, via JavaScript.",
            languagetag: ["HTML", "JavaScript"],
            completed: false,
            starred: false,
        },
    ],
};

class FlashcardMenu extends Menu {
    constructor(fSetArr: FlashcardSet[],fSet?: FlashcardSet) {
        super("Flashcards");
        this.fSetArr = fSetArr;
        this.fSet = fSet || fSetArr[0]; // default to displaying the first set of flashcards if none are provided.
    }

    fSetArr: FlashcardSet[];
    fSet: FlashcardSet;

    /*  notes for paul

        replace: f-title with displayed set's title
        replace: f-card-front with displayed card's question, language, and whether or not it's starred
        flashcard nav buttons should be disabled if index is at the beginning or end of the array.
        flashcard nav buttons do not a) shuffle the array, b) change the order of the array, or c) change the "completed" status of the flashcard set. only change index of the displayed flashcard, and update the display accordingly.
    */

    load() {
        super.load();
        let sets = getFlashcardSets();
        
        this.menu.innerHTML = `
            <div class="f-outer">
                <div class="f-outer-top">
                </div>
                <div class="f-outer-bottom">
                    <div class="f-sets-cont">
                        <!-- Names of flashcard sets go here -->
                    </div>
                    <div class="f-inner">
                        <div class="f-inner-top">
                            <h2 class="f-title">${this.fSet.title}</h2>
                            <button class="f-close">Close</button>
                        </div>
                        <div class="f-inner-middle">
                            <div class="f-card">
                                <div class="f-card-inner">
                                    <div class="f-card-front">
                                        <!-- Flashcard question goes here -->
                                    </div>
                                    <div class="f-card-back">
                                        <!-- Flashcard answer goes here -->
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="f-inner-bottom flx-b">
                            <div class="f-commands flx">
                                <button class="f-show-answer">Show Answer</button>
                            </div>
                            <div class="f-nav flx-c gp">
                                <button class="f-prev material-symbols-outlined">arrow_forward</button>
                                <button class="f-next material-symbols-outlined">arrow_back</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        let setsCont = this.menu.querySelector(".f-sets-cont") as HTMLElement;
        for(let set of this.fSetArr) {
            let temp = document.createElement("div");
            temp.className = "f-set";
            
            // I think we should make it so that the user can't toggle the "completed" status of a set of flashcards - if they've completed the set, it's marked as complete. 
            // Otherwise, they have to go through and click "got it" for all flashcards, after which the status is updated.
            temp.innerHTML = `
                <div class="f-set-name">${set.title}</div>
                <div class="f-set-status material-symbols-outlined">${set.completed ? "check_box_outline_blank" : "check_box"}</div>
            `; 
            setsCont.appendChild(temp);
        }

        return this;
    }
}

let curFlashcardMenu: FlashcardMenu;

/**
    Takes an array of all flashcard sets available to the user, and an optional flashcard set to display by default.
 */
function createFlashcardPopup(fSetArr: FlashcardSet[],fSet?: FlashcardSet) {
    if (curFlashcardMenu) curFlashcardMenu.close();
    curFlashcardMenu = new FlashcardMenu(fSetArr,fSet);
    curFlashcardMenu.load();
}

// implement backend logic here; this is where I would fetch the flashcard sets from the database.
async function getFlashcardSets() { 
    return [lessonOneFlashcards,lessonOneFlashcards];
}