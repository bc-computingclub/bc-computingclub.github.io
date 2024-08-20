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
    completed: boolean, // note to self: mark set as completed when all flashcards have been completed. 
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
    constructor() {
        super("Flashcards");
    }

    load() {
        super.load();

        this.menu.innerHTML = `testing testing 123`;

        return this;
    }
}

// new FlashcardMenu().load();