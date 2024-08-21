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
    // I could add an index field, so that user can come back to where they left off? not sure whether that's worthwhile for now, so I'm leaving it as is. -paul
    flashcards: [
        {
            question: "What is the purpose of the &lt;link&gt; tag?",
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

let testFlashcards: FlashcardSet = { // gpt generated, not real flashcards 
    title: "Lesson Two: Coding",
    completed: false,
    flashcards: [
        {
            question: "What is the purpose of the &lt;div&gt; tag?",
            answer: "The &lt;div&gt; tag is a container that is used to group other HTML elements together and apply styles to them.",
            languagetag: ["HTML", "CSS"],
            completed: false,
            starred: false,
        },
        {
            question: "What is the purpose of the &lt;span&gt tag?",
            answer: "The &lt;span&gt tag is an inline element that is used to apply styles to a specific section of text or a small part of a document.",
            languagetag: ["HTML", "CSS"],
            completed: false,
            starred: false,
        },
        {
            question: "What is the purpose of the class attribute in HTML?",
            answer: "The class attribute is used to specify one or more class names for an HTML element, which can be used to apply styles or select elements with JavaScript or CSS.",
            languagetag: ["HTML", "CSS"],
            completed: false,
            starred: false,
        },
        {
            question: "What is the purpose of the id attribute in HTML?",
            answer: "The id attribute is used to specify a unique identifier for an HTML element, which can be used to select and manipulate the element with JavaScript or apply styles to it with CSS.",
            languagetag: ["HTML", "CSS"],
            completed: false,
            starred: false,
        },
    ],
};

class FlashcardMenu extends Menu {
    constructor(fSetArr: FlashcardSet[],fSet?: FlashcardSet) {
        super("Flashcards"); // only relevant for use of menu-flashcards class. does not affect menu appearance.
        this.fSetArr = fSetArr;
        this.fSet = fSet || fSetArr.find((e) => !e.completed); // default to displaying the first incomplete set of flashcards if none are provided.
    }

    fSetArr: FlashcardSet[];
    fSet: FlashcardSet;
    fIndex: number = 0; // only for the current (opened) set of flashcards.

    /* paul's notes to self

        replace: f-title with displayed set's title
        replace: f-card-front with displayed card's question, language, and whether or not it's starred
        flashcard nav buttons should be disabled if index is at the beginning or end of the array.
        flashcard nav buttons do not a) shuffle the array, b) change the order of the array, or c) change the "completed" status of the flashcard set. only change index of the displayed flashcard, and update the display accordingly.
    
        simple card flip: fade out text on card, remvoe text, play flip animation, add in back of card text, fade in text on card.
    */

    load() {
        super.load();
        
        this.menu.innerHTML = `
            <div class="f-outer flx-v gp2 pd2">
                <div class="f-outer-top flx-sb c">
                    <div class="f-outer-header">Flashcards</div><button class="f-close material-symbols-outlined">close</button>
                </div>
                <div class="f-outer-bottom gp2">
                    <div class="f-sets-cont flx-v gp05 pd1 al-s">
                        <i class="col-secondary">Your Sets:</i>
                        <!-- Names of flashcard sets go here -->
                    </div>
                    <div class="f-inner flx-v-sb gp1">
                        <div class="f-inner-top flx-v gp1">
                            <span class="f-title">${this.fSet.title}</span>
                            <div class="flx-sb">
                                <button class="f-reset-cards flx-c gp05">Reset Cards <span class="material-symbols-outlined">restart_alt</span></button>
                                <div class="f-cur-index">1/${this.fSet.flashcards.length}</div>
                            </div>
                        </div>
                        <div class="f-inner-middle">
                            <div class="f-card pd1">
                                <div class="f-card-top flx-sb">
                                    <span class="f-language-tag">${this.fSet.flashcards[this.fIndex].languagetag}</span><button class="f-star-toggle material-symbols-outlined">${this.fSet.flashcards[this.fIndex].starred ? "star" : ""}</button>
                                </div>
                                <div class="f-card-bottom al-st">
                                    <div class="f-card-prompt">${this.fSet.flashcards[this.fIndex].question}</div>
                                </div>
                            </div>
                        </div>
                        <div class="f-inner-bottom flx-sb">
                            <div class="f-commands flx">
                                <button class="f-show-answer">Show Answer</button>
                            </div>
                            <div class="f-nav flx-c gp05">
                                <button class="f-prev f-arrow material-symbols-outlined">arrow_back</button>
                                <button class="f-next f-arrow material-symbols-outlined">arrow_forward</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        let setsCont = this.menu.querySelector(".f-sets-cont") as HTMLElement;
        for(let set of this.fSetArr) {
            let temp = document.createElement("button");
            temp.className = "f-set flx-sb c gp1";
            if(set === this.fSet) temp.classList.add("f-set-active");
            
            // I think we should make it so that the user can't toggle the "completed" status of a set of flashcards - if they've completed the set, it's marked as complete. 
            // Otherwise, they have to go through and click "got it" for all flashcards, after which the status is updated.
            temp.innerHTML = `
                <div class="f-set-name">${set.title}</div>
                <div class="f-set-status material-symbols-outlined">${set.completed ? "check_box" : "arrow_right_alt"}</div>
            `; 
            setsCont.appendChild(temp);
        }

        let fClose = this.menu.querySelector(".f-close") as HTMLElement;
        fClose.addEventListener("click",() => this.close());

        let arrowRight = this.menu.querySelector(".f-next") as HTMLButtonElement;
        if(this.fSet.flashcards.length === 1) arrowRight.disabled = true;
        let arrowLeft = this.menu.querySelector(".f-prev") as HTMLButtonElement;
        arrowLeft.disabled = true;

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