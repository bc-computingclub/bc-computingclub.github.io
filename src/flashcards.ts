type Flashcard = {
    question: string,
    answer: string,
    languagetag: string[],
    completed: boolean,
    bookmarked: boolean,
}

type FlashcardSet = {
    title: string,
    flashcards: Flashcard[],
    completed: boolean, // toggles to true when all flashcards are completed and set is loaded in FlashcardMenu. 
    icon?:string; // doesn't need to be added - if empty, is automatically the chevron thingy from google fonts. Really just a placeholder right now, may keep - idk yet.
}

// Example flashcard set for brainstorming/testing purposes. 

let lessonOneFlashcards: FlashcardSet = {
    title: "The Basics",
    completed: false,
    flashcards: [
        {
            question: "What is the purpose of the &lt;link&gt; tag?",
            answer: "The <link> tag is used to link to external style sheets.",
            languagetag: ["HTML", " CSS"],
            completed: false,
            bookmarked: false,
        },
        {
            question: "Which property is used to change the background color?",
            answer: "background-color",
            languagetag: ["CSS"],
            completed: false,
            bookmarked: false,
        },
        {
            question: "What is the purpose of the &lt;canvas&gt; tag?",
            answer: "The &lt;canvas&gt; tag is used to draw graphics, on the fly, via JavaScript.",
            languagetag: ["HTML", " JavaScript"],
            completed: false,
            bookmarked: false,
        },
    ],
};

let testFlashcards: FlashcardSet = { // gpt generated, not real flashcards 
    title: "Manipulating CSS",
    completed: false,
    flashcards: [
        {
            question: "What is the purpose of the &lt;div&gt; tag?",
            answer: "The &lt;div&gt; tag is a container that is used to group other HTML elements together and apply styles to them.",
            languagetag: ["HTML", " CSS"],
            completed: false,
            bookmarked: false,
        },
        {
            question: "What is the purpose of the &lt;span&gt tag?",
            answer: "The &lt;span&gt tag is an inline element that is used to apply styles to a specific section of text or a small part of a document.",
            languagetag: ["HTML", " CSS"],
            completed: false,
            bookmarked: false,
        },
        {
            question: "What is the purpose of the class attribute in HTML?",
            answer: "The class attribute is used to specify one or more class names for an HTML element, which can be used to apply styles or select elements with JavaScript or CSS.",
            languagetag: ["HTML", " CSS"],
            completed: false,
            bookmarked: false,
        },
        {
            question: "What is the purpose of the id attribute in HTML?",
            answer: "The &lt;id&gt; attribute is used to specify a unique identifier for an HTML element, which can be used to select and manipulate the element with JavaScript or apply styles to it with CSS.",
            languagetag: ["HTML", " CSS"],
            completed: false,
            bookmarked: false,
        },
    ],
};

class FlashcardMenu extends Menu {
    constructor(fSetArr: FlashcardSet[], loadedSetTitle?: string) {
        super("Flashcards"); // just creates menu-flashcards class for menu. does not affect menu appearance.
        this.fSetArr = fSetArr;
        this.bookmarkedFlashcards = {
            title: "Bookmarked Flashcards",
            flashcards: [],
            completed: false,
            icon:"bookmark",
        }
        this.updateBookmarkedFlashcards();
        if(loadedSetTitle) {
            this.loadedSet = this.fSetArr.find((e) => e.title === loadedSetTitle);
            this.loadedSetTitle = loadedSetTitle;
        } else {
            this.loadedSet = this.bookmarkedFlashcards;
            this.loadedSetTitle = this.bookmarkedFlashcards.title;
        }
        this.bookmarkedFlashcards.completed = this.getSetCompletion(this.bookmarkedFlashcards);
    }

    fSetArr: FlashcardSet[];
    loadedSetTitle: string;
    loadedSet: FlashcardSet;
    fIndex: number = 0; // only for the current (opened) set of flashcards.
    bookmarkedFlashcards: FlashcardSet;

    load() {
        super.load();
        let incompleteCards:Flashcard[] = this.getNonCompletedCards();

        this.menu.innerHTML = `
            <div class="f-outer flx-v gp2 pd2">
                <div class="f-outer-top flx-sb c">
                    <div class="f-outer-header">Flashcards</div><button class="f-close material-symbols-outlined">close</button>
                </div>
                <div class="f-outer-bottom gp2">
                    <div class="f-sets-cont flx-v gp05 pd1 al-s">
                        <!--Sets loaded here-->
                    </div>
                    <div class="f-inner flx-v-sb gp1">
                        <div class="f-inner-top flx-v gp1">
                            <span class="f-title flx c gp05">${this.loadedSet.title}</span>
                            <div class="flx-sb">
                                <button class="f-reset-cards flx-c gp05 c">Reset Cards <span class="material-symbols-outlined">restart_alt</span></button>
                                <div class="f-cur-index flx c"><span class="f-index-front">1</span class="f-index-middle">/<span class="f-index-back">${this.loadedSet.flashcards.length}</span></div>
                            </div>
                        </div>
                        <div class="f-inner-middle">
                            <div class="f-card pd2">
                                <div class="f-card-top flx-sb">
                                    <i class="f-language-tag flx-c">${this.loadedSet.flashcards[this.fIndex].languagetag}</i><button class="f-bookmark-toggle material-symbols-outlined">${this.loadedSet.flashcards[this.fIndex].bookmarked ? "bookmark_added" : "bookmark_add"}</button>
                                </div>
                                <div class="f-card-bottom al-st">
                                    <div class="f-card-prompt">${this.loadedSet.flashcards[this.fIndex].question}</div>
                                </div>
                            </div>
                        </div>
                        <div class="f-inner-bottom flx-sb">
                            <div class="f-commands flx c sb gp1 pd1 icon-btn accent">
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

        setsCont.innerHTML = `
            <i class="col-secondary f-your-sets">Your Sets:</i>
            <button class="f-set flx-sb c gp1 bm">
                <i class="f-set-name flx c gp05" title="Bookmarked Flashcards"><span class="material-symbols-outlined">${this.bookmarkedFlashcards.icon || "bookmark"}</span> Bookmarked Flashcards</i>
                <div class="f-set-status material-symbols-outlined"></div>
            </button>
        `;

        setsCont.querySelector(".f-set-status").innerHTML = this.bookmarkedFlashcards.completed ? "check_box" : "";
        if(this.loadedSet.title === this.bookmarkedFlashcards.title) setsCont.querySelector(".bm").classList.add("f-set-active");
        setsCont.querySelector(".bm").addEventListener('click', () => {
            this.updateBookmarkedFlashcards();
            this.swapFlashcardSet(this.bookmarkedFlashcards);
        });

        for(let set of this.fSetArr) {
            let temp = document.createElement("button");
            temp.className = "f-set flx-sb c gp1";
            if(set === this.loadedSet) temp.classList.add("f-set-active");
            
            // User can't toggle the "completed" status of a set of flashcards - if they've clicked "got it" on the whole set, it's marked as complete. Until then, it's incomplete.
            temp.innerHTML = `
                <div class="f-set-name flx c gp05"><span class="material-symbols-outlined">${set.icon || "chevron_forward"}</span>${set.title}</div>
                <div class="f-set-status material-symbols-outlined" title="${set.title}">${set.completed ? "check_box" : ""}</div>
            `;

            temp.addEventListener('click', () => {
                this.swapFlashcardSet(set);
            });

            setsCont.appendChild(temp);
        }

        let fClose = this.menu.querySelector(".f-close") as HTMLElement;
        fClose.addEventListener("click",() => this.close());

        this.loadFlashcardSet(this.loadedSet);

        return this;
    }

    getNonCompletedCards() {
        return this.loadedSet.flashcards.filter((fCard) => { !fCard.completed })
    }

    updateBookmarkedFlashcards() {
        let temp = this.fSetArr.filter((flashcardSet) => {
            return flashcardSet.flashcards.some((flashcard) => flashcard.bookmarked);
        });
        let returnThis: Flashcard[] = [];
        temp.forEach((fset) => {
            fset.flashcards.forEach((flashcard:Flashcard) => { if(flashcard.bookmarked) returnThis.push(flashcard) })
        });
        this.bookmarkedFlashcards.flashcards = returnThis;
    }

    swapFlashcardSet(fSet:FlashcardSet) {
        let setsCont = this.menu.querySelector(".f-sets-cont") as HTMLElement;
        let temp = setsCont.querySelector(".f-set-active") as HTMLElement;
        if(temp === null) console.log("Warning: No active flashcard set");
        if(temp.innerHTML.includes(fSet.title) || temp === null) return;

        temp.classList.remove("f-set-active");
        let newActiveSet = setsCont.querySelector(`[title*="${fSet.title}"]`)?.parentElement as HTMLElement;
        if (newActiveSet) newActiveSet.classList.add("f-set-active");
        if(fSet.title === "Bookmarked Flashcards" && fSet.flashcards.length === 0) this.loadEmptyBookmarkSet();
        else this.loadFlashcardSet(fSet);
    }

    loadEmptyBookmarkSet() {
        console.log("Loading Bookmarked Flashcards.");

        this.loadedSet = this.bookmarkedFlashcards;
        this.menu.querySelector(".f-inner").innerHTML = `
            <div class="f-inner-top flx-v gp1">
                <span class="f-title flx c gp05"><span class="material-symbols-outlined">${this.loadedSet.icon || "chevron_forward"}</span>${this.loadedSet.title}</span>
                <div class="flx-sb">
                    <button class="f-reset-cards flx-c gp05 c" disabled>Reset Cards <span class="material-symbols-outlined">restart_alt</span></button>
                    <div class="f-cur-index flx c">0</div>
                </div>
            </div>
            <div class="f-inner-middle">
                <div class="f-card pd2">
                    <div class="f-card-top flx-sb">
                        <i class="f-language-tag flx-c">&lt;...&gt;</i>
                    </div>
                    <div class="f-card-bottom al-st">
                        <i class="f-card-prompt">Click the '<span class="material-symbols-outlined">bookmark</span>' icon on the top right of flashcards to bookmark them!</i>
                    </div>
                </div>
            </div>
            <div class="f-inner-bottom flx-sb">
                <div class="f-commands flx">
                    <button class="f-show-answer" disabled>Show Answer</button>
                </div>
                <div class="f-nav flx-c gp05">
                    <button class="f-prev f-arrow material-symbols-outlined" disabled>arrow_back</button>
                    <button class="f-next f-arrow material-symbols-outlined" disabled>arrow_forward</button>
                </div>
            </div>
        `;
    }

    /**
     * Pass in a set of flashcards to load, and this method will display them on the flashcard menu.
     */
    loadFlashcardSet(loadingSet:FlashcardSet) {
        console.log("Loading Flashcard set: " + loadingSet.title);
        let tempSet = this.loadedSet;
        this.loadedSet = loadingSet;
        let tempCompletion = this.loadedSet.completed;
        this.loadedSet.completed = this.getSetCompletion(this.loadedSet);
        if(!tempCompletion === this.loadedSet.completed) { toggleSetCompletion(this.loadedSet,tempCompletion); } // if status of set completion has changed, call function to update backend correspondingly.
        this.fIndex = 0;

        this.refreshFlashcardHTML();

        let fIndexBack = this.menu.querySelector(".f-index-back") as HTMLElement;
        fIndexBack.innerHTML = this.loadedSet.flashcards.length.toString();

        this.menu.querySelector(".f-title").innerHTML = `<span class="material-symbols-outlined">${this.loadedSet.icon || "chevron_forward"}</span>` + this.loadedSet.title;

        let fCard = this.menu.querySelector(".f-card");
        if (this.loadedSet && this.loadedSet.flashcards && this.loadedSet.flashcards[this.fIndex]) {
            let flashcard = this.loadedSet.flashcards[this.fIndex];
            fCard.innerHTML = `
                <div class="f-card-top flx-sb">
                    <i class="f-language-tag flx-c">${flashcard.languagetag ?? 'Unknown'}</i>
                    <button class="f-bookmark-toggle material-symbols-outlined">
                        ${flashcard.bookmarked ? "bookmark_added" : "bookmark_add"}
                    </button>
                </div>
                <div class="f-card-bottom al-st">
                    <div class="f-card-prompt">${flashcard.question ?? 'No question available'}</div>
                </div>
            `;
        } else {
            console.warn('Error: Flashcard data invalid, weewoo');
        }
        let displayIndex = document.querySelector(".f-index-front") as HTMLElement;
        displayIndex.innerHTML = (this.fIndex + 1).toString();

        this.setupBookmarkToggle();
        this.setupNext();
        this.setupPrev();
        this.setupShowAnswer();
    }

    setupNext() {
        let fNext = this.menu.querySelector(".f-next") as HTMLElement;
        fNext.addEventListener("click",() => { this.goToNextFlashcard(); });
    }

    setupPrev() {
        let fPrev = this.menu.querySelector(".f-prev") as HTMLElement;
        fPrev.addEventListener("click",() => { this.goToPrevFlashcard(); });
    }

    refreshFlashcardHTML() {
        this.menu.querySelector(".f-inner").innerHTML = `
        <div class="f-inner-top flx-v gp1">
            <span class="f-title flx c gp05"></span>
            <div class="flx-sb">
                <button class="f-reset-cards flx-c gp05 c">Reset Cards <span class="material-symbols-outlined">restart_alt</span></button>
                <div class="f-cur-index flx c"><span class="f-index-front">1</span class="f-index-middle">/<span class="f-index-back"></span></div>
            </div>
        </div>
        <div class="f-inner-middle">
            <div class="f-card pd2">
                <div class="f-card-top flx-sb">
                    <i class="f-language-tag flx-c"></i><button class="f-bookmark-toggle material-symbols-outlined">${this.loadedSet.flashcards[this.fIndex].bookmarked ? "bookmark_added" : "bookmark_add"}</button>
                </div>
                <div class="f-card-bottom al-st">
                    <div class="f-card-prompt"></div>
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
    `;
    }

    goToNextFlashcard() {
        let oldIndex = this.fIndex;
        this.fIndex = (oldIndex >= this.loadedSet.flashcards.length - 1) ? 0 : (oldIndex + 1);
        let fCard = this.menu.querySelector(".f-card");
        fCard.innerHTML = `
            <div class="f-card-top flx-sb">
                <i class="f-language-tag flx-c">${this.loadedSet.flashcards[this.fIndex].languagetag}</i><button class="f-bookmark-toggle material-symbols-outlined">${this.loadedSet.flashcards[this.fIndex].bookmarked ? "bookmark_added" : "bookmark_add"}</button>
            </div>
            <div class="f-card-bottom al-st">
                <div class="f-card-prompt">${this.loadedSet.flashcards[this.fIndex].question}</div>
            </div>
        `;
        this.setupFlashcardCommands();
        let displayIndex = document.querySelector(".f-index-front") as HTMLElement;
        displayIndex.innerHTML = (this.fIndex + 1).toString();

        this.setupShowAnswer();
    }

    goToPrevFlashcard() {
        let oldIndex = this.fIndex;
        this.fIndex = (oldIndex > 0) ? (oldIndex - 1) : (this.loadedSet.flashcards.length - 1);
        let fCard = this.menu.querySelector(".f-card");
        fCard.innerHTML = `
            <div class="f-card-top flx-sb">
                <i class="f-language-tag flx-c">${this.loadedSet.flashcards[this.fIndex].languagetag}</i><button class="f-bookmark-toggle material-symbols-outlined">${this.loadedSet.flashcards[this.fIndex].bookmarked ? "bookmark_added" : "bookmark_add"}</button>
            </div>
            <div class="f-card-bottom al-st">
                <div class="f-card-prompt">${this.loadedSet.flashcards[this.fIndex].question}</div>
            </div>
        `;
        this.setupShowAnswer();
        let displayIndex = document.querySelector(".f-index-front");
        displayIndex.innerHTML = (this.fIndex + 1).toString();

        this.setupBookmarkToggle();
    }

    setupShowAnswer() {
        this.setupFlashcardCommands();

        let fCommands = this.menu.querySelector(".f-commands") as HTMLElement;
        let showAnswerButton = this.menu.querySelector(".f-show-answer") as HTMLElement;
        let fCard = this.menu.querySelector(".f-card") as HTMLElement;

        showAnswerButton.addEventListener('click', () => {
            fCard.addEventListener('animationend', (anim) => {
                if(anim.animationName === "fade-out") fCard.innerHTML = "";
                fCard.classList.add("flip");
            })
            fCard.addEventListener('animationend', (anim) => {
                if(anim.animationName === "flip") fCard.innerHTML = "";
                fCard.addEventListener('animationend', (anim) => { 
                    if(anim.animationName === "flip") {
                        fCard.classList.remove("flip");
                        fCard.classList.remove("fade-out");
                        fCard.innerHTML = `
                            <div class="f-card-top flx-sb"></div>
                            <div class="f-card-bottom al-st">
                                <div class="f-card-prompt">${this.loadedSet.flashcards[this.fIndex].answer}</div>
                            </div>
                        `;
                    }
                });
            });
            fCard.classList.add("fade-out");
            fCommands.classList.add("padding");
            fCommands.innerHTML = `
                <span class="f-rank">RANK </span>
                <div class="flx gp05">
                    <button class="flx c gp1 f-shuffle icon-btn">SHUFFLE<span class="material-symbols-outlined">shuffle</span></button>
                    <button class="flx c gp1 f-got-it icon-btn">GOT IT<span class="material-symbols-outlined">check</span></button>
                </div>
            `;
            this.setupGotIt();
            this.setupShuffle();
        });
    }

    setupFlashcardCommands() {
        let fInnerBottom = this.menu.querySelector(".f-inner-bottom") as HTMLElement;
        fInnerBottom.innerHTML = `
            <div class="f-commands flx c sb">
                <button class="f-show-answer">Show Answer</button>
            </div>
            <div class="f-nav flx-c gp05">
                <button class="f-prev f-arrow material-symbols-outlined">arrow_back</button>
                <button class="f-next f-arrow material-symbols-outlined">arrow_forward</button>
            </div>
        `;

        this.setupNext();
        this.setupPrev();
    }

    setupShuffle() {

    }

    setupGotIt() {
        let fGotIt = this.menu.querySelector(".f-got-it") as HTMLElement;
        fGotIt.addEventListener('click', () => {
            this.loadedSet.flashcards[this.fIndex].completed = true;
            this.loadedSet.completed = this.getSetCompletion(this.loadedSet);
            toggleSetCompletion(this.loadedSet,this.loadedSet.completed);
            if(this.loadedSet.completed) console.log("Set completed: " + this.loadedSet.title);
            else console.log("Flashcard completed");
            this.goToNextFlashcard();
        });
    }

    setupBookmarkToggle() {
        let fBookmarkToggle = this.menu.querySelector(".f-bookmark-toggle") as HTMLElement;
        fBookmarkToggle.addEventListener("click",() => {
            let bookmarkStatus = this.loadedSet.flashcards[this.fIndex].bookmarked;
            this.loadedSet.flashcards[this.fIndex].bookmarked = !bookmarkStatus;
            fBookmarkToggle.innerHTML = bookmarkStatus ? "bookmark_add" : "bookmark_added";
            if(!this.loadedSet.flashcards[this.fIndex].bookmarked) { // if it's now no longer bookmarked, go through bookmarked cards and only return flashcards that aren't the same as this flashcard.
                this.bookmarkedFlashcards.flashcards.filter((e) => {e.question != this.loadedSet.flashcards[this.fIndex].question});
            } else this.bookmarkedFlashcards.flashcards.push(this.loadedSet.flashcards[this.fIndex]);

            console.log("Toggled bookmark status: " + this.loadedSet.flashcards[this.fIndex].bookmarked);
            toggleFlashcardBookmark(this.loadedSet,this.fIndex,this.loadedSet.flashcards[this.fIndex].bookmarked); // backend call that does nothing right now
            if(this.loadedSet.title === "Bookmarked Flashcards") {
                this.updateBookmarkedFlashcards();
                if (this.loadedSet.flashcards.length === 0) this.loadEmptyBookmarkSet();
                else this.loadFlashcardSet(this.loadedSet);
            }
        });

    }

    getSetCompletion(set: FlashcardSet): boolean {
        if (set.flashcards.length === 0) return false;
        return !set.flashcards.some((flashcard) => !flashcard.completed); //returns false if at least one of the flashcards is not completed (meaning that the whole set can't be complete)
    }
}

let curFlashcardMenu: FlashcardMenu;

/**
    Takes an array of all flashcard sets available to the user, and a flashcard set with the user's starred flashcards. Optionally takes a flashcard set to display.
    Note: Decided not to track flashcard indices to resume from, if you think it's necessary, let me know. -paul
 */
function createFlashcardPopup(fSetArr: FlashcardSet[],loadedSetTitle?:string) {
    if (curFlashcardMenu) curFlashcardMenu.close();
    curFlashcardMenu = new FlashcardMenu(fSetArr,loadedSetTitle);
    curFlashcardMenu.load();
}

/**
 * Calls backend to fetch all flashcard sets available to the user. (AKA the ones linked to lessons the user has completed?)
 * As of 8/22/24, not yet implemented
 */
async function getFlashcardSets() { 
    return [lessonOneFlashcards,testFlashcards]; // delete & replace whenever we have actual backend for this set up
}

async function toggleSetCompletion(fSet: FlashcardSet, completed: boolean) {
    // update database here
}

async function toggleFlashcardBookmark(fSet: FlashcardSet, fIndex: number, shouldNowBeBookmarked: boolean) {
    // update database here
}