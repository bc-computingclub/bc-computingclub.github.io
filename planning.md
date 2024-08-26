### Just made this to gather my thoughts and figure out how I'm creating the flashcards, and to plan potential lessons I create 

 ### FLASHCARDS
 - ANIMATIONS
    Don't want to have too many animations, but I still want a few - they make the experience more premium, as long as they're used without too much intrusion on responsiveness. Notably, at least some form of visual confirmation that you're switching between flashcards beyond just replacing the text on the cards. (An animation for stuff sliding in/off screen feels potentially tacky, depends on how I implement it idk for now I don't have a clean concept in mind)
 - BOOKMARKING
    I'm changing the 'starred' section to the 'bookmarked' section out of pure convenience, since there's a bunch of stuff in google fonts with different states for the bookmark that I can play around with. 
 - USING MY FLASHCARD MENU
    I decided not to track progress through indices of flashcards, since I don't think that's ever going to be masively relevant. If anything, I can add a way to skip to a specific index one day if users ask for the feature.
    For now, when you want a flashcard menu, you pass in an array of the sets available to the user, and an array of the user's bookmarked flashcards. Like mentioned above, I plan on changing this, so eventually user's bookmarked flashcards will instead be an array of key value pairs that track the name of the set and the index (or indices) of bookmarked flashcards.
    You can also pass in a flashcard set to load - but this is not necessary, and by default the user's bookmarked flashcards are loaded. 
     - Now that I think about this, since the flashcard set to load will be included in the user's available flashcard sets, I should just be passing in its name...
 - GOT IT/SHUFFLE FUNCTIONALITY
   Got it button sets card's completed status to true and calls this.showNextCard();
   Need to track which cards are completed or not...
   Might need to add a visual indicator to tell the user that there are some cards that are completed, and therefore not visible in the set unless you click 'reset cards;
    - Add something next to the "reset cards" prompt?
   Make the cards
   Shuffle card button calls goToNextCard() and repositions itself in the array.

    >> TODO: (minor stuff, not worth adding to notion but still worth writing down so I don't forget)
        - Change the way I'm passing in bookmarked flashcards to name of set and array of indices of bookmarked flashcards // pushed off 'til later - for now, just pulling bookmarked flashcards from user's sets.
        - Don't pass in the actual set I'm going to load, I can just pass in the name of the set. // done
        - Minor animations to indicate switching between cards

   /* paul's notes to self

        replace: f-title with displayed set's title
        replace: f-card-front with displayed card's question, language, and whether or not it's starred
        flashcard arrow buttons should be disabled if index is at the beginning or end of the array.
        flashcard arrow buttons do not a) shuffle the array, b) change the order of the array, or c) change the "completed" status of a flashcard or flashcard set. they only change index of the displayed flashcard, and update the display accordingly.
    
        simple card flip: fade out text on card, remvoe text, play flip animation, add in back of card text, fade in text on card.

        remember to add event listeners in load function, since it changes and/or overwrites a lot of html
    */

### LESSONS
 - Mini Project 
     - Creating a basic menu with some styling.
     - You know what, there's actually a bunch of features that are being added to HTML natively which I think are intuitive and make coding popup menus quite a lot simpler, I might actually use those, as long as Caleb agrees they're not unintuitive or something. Compatibility is okay, although I'm not sure how older PCs which don't have updated browsers would deal with this.
 - JavaScript Lesson
     - In-depth lesson on query-selector, and how you can use it. 
        - Selecting using classnames, IDs, selecting children of elements, selecting using an element's attributes, etc etc etc. I think there's potential for a nice 5-10 minute lesson here alone. Maybe as a lesson marked "optional" after an introduction to JavaScript? Or is that too soon, and would it confuse users?
        - I'd love to do this typescript-style (and talk about as HMTLElement or NodeListOfHTMLElement), but that's probably not a good idea until we considered a typescript set of lessons.