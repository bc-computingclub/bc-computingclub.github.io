### Just made this to gather my thoughts and figure out how I'm creating the flashcards, and to plan potential lessons I create 

 ### FLASHCARDS
 - ANIMATIONS
    Don't want to have too many animations, but I still want a few - they make the experience more premium, as long as they're used well. Notably, at least some form of visual confirmation that you're switching between flashcards beyond just text switching. (An animation for stuff sliding in/off screen feels potentially tacky, depends on how I implement it idk for now I don't have a clean concept in mind)
 - BOOKMARKING
    I'm making the 'starred' section be the bookmarked section out of pure convenience, since there's a bunch of stuff in google fonts with different states for the bookmark that I can play around with. 
    The way I am doing bookmarks is adding/removing flashcards from the bookmarks is by adding/removing the actual flashcards to an array called bookmarkedFlaschards.
    This is absolutely inefficient as hell, I know I should be storing the set/index of bookmarked flashcards in an array of key value pairs. I promise I will do this eventually, most likely sooner than later. Will save some backend space, & save some bandwidth (since I'm assuming that I'll be callling the backend every time the 'bookmark' status of a flashcard changes, as long as it's not being spammed).
 - USING MY FLASHCARD MENU
    I decided not to track progress through indices of flashcards, since I don't think that's ever going to be masively relevant. If anything, I can add a way to skip to a specific index one day if users ask for the feature.
    For now, when you want a flashcard menu, you pass in an array of the sets available to the user, and an array of the user's bookmarked flashcards. Like mentioned above, I plan on changing this, so eventually user's bookmarked flashcards will instead be an array of key value pairs that track the name of the set and the index (or indices) of bookmarked flashcards.
    You can also pass in a flashcard set to load - but this is not necessary, and by default the user's bookmarked flashcards are loaded. 
     - Now that I think about this, since the flashcard set to load will be included in the user's available flashcard sets, I should just be passing in its name...

    >> TODO: (minor stuff, not worth adding to notion but still worth writing down so I don't forget)
        - Change the way I'm passing in bookmarked flashcards to name of set and array of indices of bookmarked flashcards
        - Don't pass in the actual set I'm going to load, I can just pass in the name of the set.

### LESSONS
 - Mini Project 
     - Creating a basic menu with some styling.
     - You know what, there's actually a bunch of features that are being added to HTML natively which I think are intuitive and make coding popup menus quite a lot simpler, I might actually use those, as long as Caleb agrees they're not unintuitive or something. Compatibility is okay, although I'm not sure how older PCs which don't have updated browsers would deal with this.
 - JavaScript Lesson
     - In-depth lesson on query-selector, and how you can use it. 
        - Selecting using classnames, IDs, selecting children of elements, selecting using an element's attributes, etc etc etc. I think there's potential for a nice 5-10 minute lesson here alone. Maybe as a lesson marked "optional" after an introduction to JavaScript? Or is that too soon, and would it confuse users?
        - I'd love to do this typescript-style (and talk about as HMTLElement or NodeListOf<HTMLElement>), but that's probably not a good idea until we considered a typescript set of lessons.

For changelog.md: Created planning.md so I can keep track of brainstorming/planning for my flashcards, and also have a place to plan my lessons and projects once I actually get to writing them (challenge: impossible).