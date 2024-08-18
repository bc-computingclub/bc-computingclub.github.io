### 1/4/24 - Claeb
- added support for creating multiple editors in one page
- changed code bubbles-overlay to be per file instead of per editor
- fixed bubbles scrolling with editor on independent editors
- added true readonly support to tutor editor with custom cursor that always shows up
- start of figuring out how to set up the sequence tutorial system

### 1/5/24 - Claeb
- added light theme support for forced custom cursor
- added blinking to custom curor
- added "add file" button to d-files list in lesson page
- added more to LEvent (Task system)
- added Task (Subtask system)
- added Hook system for listening when tasks are successfully completed
- added some real tasks and messages
- added animations for bubbles being added and removed
- can click okay on global bubbles and hook get's fired and proceeds when adding the correct file

### 1/6/24 - Claeb
- added theme support to home page
- changed "Okay" to "Next"
- many things probably I might not get all of them
- added proper hooks for add_file task - finished
- added addGenericCode task - pretty much finished, may need tweaking but it works
- added current tasks panel
- added Mark Done for when your finished with a code addition
- added "replay" of any code addition in a Task
    - works even going back in time but doesn't work currently if all have been "Marked Done"
    - this system skyrocketed the already insane complexity I have no idea how this even works still

### 1/7/24 - Claeb
- fixed tutor code left margin to be consistent
- added OnRefreshTask

### 1/8/24 - Claeb
- removed pesky finalDelays (need to find a new solution for this)
- changed the color of the tutor side to make it more unique
- added labels for the tutor and you sides with menu's that I'll implement later
- added support for uploading files to the server which can be viewed at a url without access from anyone who doesn't have your socket.id (current auth token)
- refreshing now uses the new full preview mode
- added more to the tutorial a little bit for testing (not constructive adding, only for testing)
- added restore lesson files which gets the current files from the server and loads them just before the tutorial starts
- creating new files with the same name as existing ones just switches to those
- added animation to newly added sub tasks
- probably some other things but I forgot

### 1/9/24 - Claeb
- added global server URL var
- can open/close current tasks panel
- new I'm Done panel in the header (with I'm Done, replay, and replay from last buttons)
- added clickable bubbles
- added click bubble when creating new files
- changed text when you need to create file but you already have it it will switch to it
- change tutor so when replaying and creating a file again it instead says let's go back and clicks on the file to change to instead of new file
- added when replaying and the previous is in a different file, the tutor will first click on the old file to go to it then continue
- added quick inline waitForHook
- fixed refresh to remove bubble when click
- added click bubble when adding code
- fixed when replays go back to files it didn't remove the old changes
- fixed prompts for new files if it's a replay going back and you already have it it won't tell you to switch back to it
- added the ability to pause, move cursor left or right when adding code (in the middle of typing using \x05, \x01, \x02 respectively)
- fixed when reopening files, the subtask doesn't forget which file it created
- fixed the tutor switching to different files that curFile properly gets updated (starts typing in a file that isn't open)
- probably more but I can't remember

### 1/11/24 - Claeb
- started adding Ponder Board core classes

### 1/12/24 - Claeb
- added DO_Paint but not working at the moment

### 1/13/24 - Claeb
- need to add stuff here from commit, I don't remember it all

### 1/14/24 - Claeb
- major work done on Ponder Board, most of the essential core functionality is complete and some feature classes have been added but more to come later like underlining and object target bubbles
- fixed editor page (still need to unify the rest of editor setup including refreshing, editor still only uses the simple frame system without the server)

### 1/15/24
- fixed Experiment editor's preview to use server hosted method
    - need to make save indicator and keep track of when changes are made, that way refresh simply refreshes the iframe and doesn't have to reupload every time
- fixed editor page so init waits until logged in
- LOTS more added need to check commit, bug fixes, start of multi project and create project support on server side, changed header for editor, save button for editor, started adding rename menu to cur project editor, saving and refreshing somewhat indep now, refreshing causes a save when needed, editing files makes a star on them so when refresh with this it will save, added manual save button, probably more cant remember

### 1/16/24
- fixed editor so if there's no PID, "tmp_project" is used -> this ultimately fixed the preview so it works on no PID (temporary) projects
- added working contrast switch button to preview in editor
- started adding dashboard and new header buttons to lesson
- fixed ctrl r and ctrl s to work in lesson
- fixed saving so that the actual saving doesn't wait on the animation, the anim will play even after it's done saving to help prevent spam
- fixed open in new tab button to work before refresh has happened and on both pages
- fixed in editor manually trying to open a new project with custom PID won't crash the server if it doesn't exist, it just makes a new boiler plate project
- contrast switch saves state in localStorage and reloads with page reload in both Editor and Lesson
- [BACK-END]
- start of project caching system
- project meta data stored on user
- proper storing and retreiving of project data on server with corresponding meta data
- getting the project again after the server has loaded it and then saving will save in ram and reread from ram instead of having to read from hard drive every time

### 1/18/24 - Paul
- Started setup for "challenges" page
- Created "in-progress" section to store challenges which the user is working on
- "In-progress" section can be toggled open and closed.
- Created "browse" section for user to browse through available challenges, and click "open preview" to learn more. (&see others' implementations?)

### 1/26/24 - Claeb
- some backend stuff for Challenges

### 1/27/24 - Claeb
- changed colors to be darker on Practice page
- fixed menus_cont to be position:fixed instead of absolute
- fixed ChallengeMenu to use menu styling with black background
- fixed ChallengeMenu to show corresponding Challenge info that was clicked
- fixed aspect-ratio of mockup image shown in Challenge preview
- added html2canvas lib for future stuff
- [BACK-END]
- more backend stuff for Challenges
- added support for start and end data (ongoing) calculation for challenges
- added submission highlights support for challenges
- changed filter algorithm to be server-side and more optimized (only supports difficulty & ongoing right now)
- *changed server tsconfig to strict mode to be safer and avoid crashes

### 1/28/24 - Claeb
- couple more back end things for challenges, start of setup for starting a challenge
- sorting through server side
- some other back end setup

### 1/29/24 - Claeb
- bug fixes
- fixed new account creation causing crash
- majorly overhauled project system
- took away boilerplate for now
- no project found in editor opens the dashboard
- you can now go to projects from the dashboard
- challenge projects are supported in the dashboard and change the editors color and shift it to "Practice" instead of "Experiment" on the nav bar
- fixed bug with saving wouldn't save if there was more files created since last server start
- added starting new challenge which creates a new challenge project
- added resuming challenge projects
- added inProgress flag to challenges that are currently in progress
- fixed project meta so in the editor the project settings dropdown displays the correct name for the project
- probably some other things but forgot

### 1/30/24 - Claeb
- added indicator in project dashboard to which section you have selected
- [big-feature] added folder support to projects
- redid the files panel to work with all the files and folders in the project
- you can create folders and files anywhere and they save and work across sessions
- if the open files list overflows then it's scrollable
- fixed some bugs with internal stuff and things related to not saving and reloading correctly

### 1/31/24 - Claeb
- editor now doesn't open all files into currently opened files
- added ability to close files that are open and they prompt when aren't saved
- added temp open file support like how vscode does it
- changed saved to be shown as a white dot in the close button like vscode does
- fixed lesson to work with these new changes and prevented closing open files in there
- fixed the detection for when files have been changed (before if you typed in a comment it wouldn't detect you wrote anything)

### 2/1/24 - Claeb
- rearrange open files
- files,folders in the FILES panel are sorted based on folders first and then by name alphabetically
- fixed issue where if you move lines using shift+alt up/down it wouldn't detect a change to the file to mark it unsaved
- ** rearrange files, folders and next them with server and saving support
- fixed adding files and folders so they follow the sorting
- started adding submenu and dropdown support

### 2/2/24 - Claeb
- more stuff with right click menu for files/folders

### 2/3/24 - Claeb
- added styling for hl2 file-items and folder-items
- ctrl mulit select for files panel
- rename files
- added delete files/folders
- fixed rename files to work in root dir
- added rename folders
- added multi select (ctrl and shift - shift still needs custom impl)
- multi move folder(s), file(s) and folders with files
- cut, copy, paste in right click menu implemented for single and multiple files
- - cut works for folders, copy only copies the folder (without files inside) (for right now)
- probably very buggy

### 2/5/24 - Claeb
- selecting file or folder while multi selecting will deselect all
- added callouts
- prevented right click menu from opening on right click menu or in files panel
- fixed multi selection of files to make it more intuitive
- fixed sub menu right click menu in files panel to go up instead of down when used in the lower half of the page
- added scrollbar to files panel in editor
- made folders be closed by default on project load
- fixed no index.html alert message to appear if the html file is hidden in a sub folder instead of displaying HTTP error
- fixed moving files so that when they are moved into a closed folder it opens the folder
- added icons and redid styling on the right click menu for the files pane
- added bottom ops panel for right click options to the files pane

### 2/6/24 - Claeb
- added ability to rename projects
- made index.html open by default
- custom meta edit panel in project dashboard (can rename projects there too now)
- fixed "close" warning when using right click menu ops
- fixed "project not defined" on practice page when pressing a key
- split up setupDropdown to add openDropdown for manual dropdown creation with DropdownOptions for static typing and some other abstracty things
- replaced "Delete Progress" dropdown with the dropdown API stuff
- added animation to dropdown menu and shadows on it and on callouts
- fixed issue with pasting even though it doesn't have any in the clipboard
- added "challenges" section in project dashboard
- changed some styling in Project Dashboard
- changed backend structure of the Project class to use meta for meta storage instead of individual properties on Project
    - may cause issues but I haven't found any yet
- added ability to Delete Projects
- added ability to Unlink Challenge Projects into regular projects
- when starting a challenge, you go into the submissions now (not final but for now is alright)

### 2/14/24
- added publish/unpublish button
- probably other stuff and from earlier days that I never logged

### 2/17/24
- need to fill this in later
- added lid support to load custom lessons

### 2/18/24
- need to fill this in later
- fixed dropdowns to make them more intuitive with mousedown to open and mousedown to close (instead of click to close -> open)
- changed users to uid system

### 2/19/24
- various fixes
- alt parallax thing
- publish/submit challenge project hidden on non challenge projects

### --- some stuff needs to be filled in here at some point

### 2/29/24
- fixed random bubbles popuping up sometimes when restoring lesson progress
- redid most of the whole core linking of lesson system to use use the overarching nested promises and instead use linked function calls
- resume progress with new system
- go to any point in lesson with new system
- replay current step with new system
- loading screen
- fixed welcome banner so that it comes up when you haven't started the lesson before instead of everytime and being skipped
- finally fixed ponder board to be replayable without reloading the page
- fixed soooo many bugs with the system
- added ability to close opened files in the lesson page (it deletes them for the time being without a prompt so need to fix that later)
- added status bar at the bottom of lesson page
- added lesson progress in the status bar
- made basic "Lesson Complete" with 3 buttons that don't do anything yet
+ [IDEAS]
- lesson 1
    - tutor shows how to create one button and then another one
    - prompt the user to refresh to see how it looks after the first and second ones
    - then show Review Board and prompt to create a third one
- learn page
    - this could be a sort of infinite canvas of different things like a web to everywhere you want to go
    - skill tree sort of look still
    - pannable (and zoomable...)
    - light grid background like it's a blueprint or sketched piece of paper for ideas that are just flowing
- review board
    - should this show an example in HTML? if anything it probably shouldn't be a screenshot for consistancy and time sake
    - or should it just be text describing what to do? I guess it could be either depending on how you set it up in the events/tasks

### 3/1/24
- added a much faster version of "goToPointInLesson" that uses task states instead of the resume system
- fixed restoreLessonState so that when restoring to a state that needs files that aren't then, the tutor createst those files before going on
- added support so that if you prefix a challenge json file with _ then the server will skip it when loading
- fixed error at the end of a lesson
- fixed position of cursor with addGenericCodeTask
- converted LessonComplete to be a Menu instead of bubble, with descriptions of the different buttons
- maybe some other stuff I don't remember

### 3/2/24
- up till 3:45am solving zoom formulas for learn page...... but we did it

### 3/3/24
- added zoom option to submission preview (default 0.75x)
- started adding user data for learn page (client side only right now) and locked visuals & percentage visuals
- fixed submissions so that it loads the public url instead of the private one so you can view submission previews that aren't yours
- fixed submissions so that "open in new tab" button works now
- worked some more with learn page

### 3/4/24
- moved progress circle to start/continue button on learn page and make it dynamic
- fixed creating folders within folders that weren't open wouldn't cause them to open
- more work done on learn page
- flags, progress percentages, action menu, resume working with action menu and play
- better theme stuff on learn page

### 3/6/24
- fixed sorting by popularity

### 3/7/24
- added restartLessonProgress and button in learn page works with it
- added deleteLessonProgress and button in learn page works with it
- added prog property for progress percentage to be stored on the server side
- fixed joinDate and lastLoggedIn (finally since the first day starting this project xD)
- clicking the learn button in the header now goes to the learn instead of lesson page
- fixed (probably) the issue where projects could not be deleted if they weren't first loaded from the editor / server restart
- added label for right click when to let you know how many files will be deleted for consistency
- fixed resize bars so they are along the center of the groove
- fixed resizing so they work a lot better (but no oversizing protection yet I couldn't get the formulas right)
- adjusted proportions of panes in lesson to make them a little better

### 3/8/24
- something maybe?

### 3/9/24
- * decided on for now just reading individual files for lesson meta data
- made a logo for now
- removed a bunch of annoying log statements from the server
- learn actually reads your own lesson meta data now (this was crazy complicated for some reason and took me like 4 hours)
- some stuff here I can't remember
- made projectTree read from the server
- made finishing lessons unlock the next ones with a WIP unlock animation and stay unlocked with a support for the "new" flag

[IDEAS]
+ when clicking on a lesson that hasn't started yet it will give you two options: Lesson Mode & Review/Practice Mode (or hmm maybe this popup should only come up if you've already completed the lesson once?)
+ should probably use mongodb in the future but that is for a future update
+ need to change Tasks so that they take a reviewString/practiceString that will be displayed when the user is in the Review Mode
    + the Review Mode will give the user instructions at each step but not show them the answer until after they've done it (like a reverse order of the Lesson Mode - so it prompts you what to do, you do it, then click Finish and then the tutor will complete the step and you can check whether or not you were right)
    + I don't think it's good or easy to make a way where the user can freely switch between the modes so the choice will have to be selected before the lesson is started and in order to switch mode the user will have to reset their progress
+ project dashboard needs folder support with sorting (especially if someone likes to save all of their lesson files and then their projects become really cluttered)
    + saved lessons should probably go into a "Lessons" folder by default

### 3/10/24
- client side now remembers your last pan and zoom values in learn
- fixed up login menu to work good now
- fixed login menu on index page
- changed user account button to be a dropdown with switch account button or log in based on what you are
- added theme toggle
- added log out
- if you go to learn or experiment while not being logged in then it will bring up the login menu automatically
- it will now refresh once you've logged in or switch accounts or if you log out
- fixed home button on lesson page so it says view lessons and is a home icon
- changed editor page so it shows a list icon instead of home for the dashboard
- some bug fixes in various util stuff
- BUG: when preventing page leave during lesson, it loses connection to the server and doesn't recover

### 3/11/24
- fixed leaving lesson when unsaved will alert and on hitting cancel you will reconnect properly back to the server
- added recent projects support
- added star projects support
- added whenCreated (wc) and time (time spent) properties for future use
- fixed deleteingLessonProgress didn't actually remember on save
- added confirm menus to Reset and Delete lesson progress
- added View Options hamburger menu button to learn view and gave it one option for now: Reset View
- fixed weird glitch where learn item actions were clickable when the menu wasn't even open
- removed some more error log messages from server
- fixed renaming/deleting files in editor so that the right click menu is closed right after an option is clicked
- fixed bug with renaming files after just being created (without saving) makes the rename fail -> now the project is saved when files are created just like folders
- fixed bug with trying to delete progress from the challenge page, the dropdown stays appearing and is on top of the confirmation menu
- also slowed down the save speed to prevent lag when panning in the learn page

### 3/12/24
- fixed bug where renaming a project from the dashboard would make the star disappear
- changed color of star on light theme to have better contrast
- added support for menu layers
- redid Project Settings/Info to make it a menu
- added dashed border for focused buttons for accessibility possibly
- fixed creating new challenge project so that the default description reflects the challenge instead of being for experiments
- added delete project and unlink project to project settings menu
- (probably more things I did here but can't remember)
- fixed up submit button to actually say submit or submitted
- added note to confirm submit to say that your project will become public after submitting
- tweaked minor things with confirm menus
- fixed dedicated file/folder ops not working with folders
- fixed file/folder ops to not be usable when you don't have edit permissions
- kept publish button when you don't have edit permissions but you do have ownership
- added protections on server to prevent deleting or unlinking project if you can't edit it (this may change in the future as you are allowed to delete a project that is currently submitted)
- disabled buttons in project settings menu if you don't have edit access
- (many fixes and things I need to add here)
- fixed zoom so that you can pinch but it's slow
- BUG: when deleting projects it doesn't delete from starred or recents

### 3/13/24
- added overflow handling to list of projects in Project Dashboard
- changed challenges to be saved formatted on server for betting merging
- fixed overflow again with project dashboard menu
- fixed deleting projects so if they were starred or in recents they would be deleted from that too
- added ws (when submitted) property to projectMeta
- made project dashboard sort by when created
- added wls (when last save) property to ProjectMeta and LessonMeta
- changed project dashboard to sort by when last save
- changed layout of extra icons on projects in project dashboard to be more clear
- added overflow support for very long project names
- fixed changing project name remove star and icons
- added overflow support to project name in editor
- clicking on progress indicator takes you to the corresponding challenge info page
- clicking on visibility indicator takes you to the public url of the project (which is sharable)
- changed submitted icon in project dashboard so it wasn't as similar to public
- changed viewing public projects to load from the hard drive for now so the project doesn't have to be loaded first
- added Project Viewer and changed the open in external to use that
- disabled the menu icon from editors
- fixed lesson page as it was broken with newer updates
- fixed some data that gets sent back and forth
- changed user data pMeta to be stored as an object instead of string array
- added Char Count, Langs, Date Submitted to view submission
- added fullscreen mode for editor in view submission
- added Editor with files in submission window
- moved char count and langs to the server side
- moved a lot of the submission meta data into the submission itself
- changed client side submission class to coincide with back end
- added submission properties to the table list of submissions (time, char count, lang)
- brought editor light theme properties to the submissions page
- fixed escape to close menu so that it works anywhere now that has util.ts
- some small bug fixes with server side
- fixed lesson bug when ending lesson it wouldn't let you go back because it said you have unsaved progress
- added "are you sure you want to leave" box to editor page with proper server rejoining
- don't remember when but added scroll support to project dashboard
[BUGS]
- on submissions page when you close view submission and open it again the editor won't load any of the files
- start challenge doesn't work from the submissions page
- error code 1 when clicking start on a challenge that you've already submitted to, not sure what the intended behavior should be here

*Total Line Count as of this point: 18,289*

### 3/14/24
- added line count to submission
- fixed editor submission menu so that it's flush and is still flush after going in and out of fullscreen
- added syntax highlighting support for .md, .ts, and .rs files in editor
- wrote a new "The First Lesson" that is pretty much complete
- made a new learn tree but only the first lesson is complete
- added BubbleTask, InstructTask, InfiniteTask, MoveCursorTo
- added control characters for move line up/down, delete left, move home/end
- fixed formatting bubble text a bit
- added optionally to not have the bubble show up with addGenericCode
- added customText on addGenericCode
- brought addTutorSideText with the control characters of addGenericCode
- added "reconnect to server" to the user dropdown
- made ProjectDashboard open quicker on editor page
- fixed view options wasn't position absolute
- flipped the position of add file and add folder in editor to be like vscode
- flipped the position of line count to be above char count
- added redirection to submissions after submitting
[BUGS]
- when opening the first file in the submission editor it places it on the wrong side of the add button

### 3/15/24
- finally got it published at codeotter.dev and working with SSL cert
- started migrating structure so that the server can be more easily updated
- added more debug commands to the server

### 3/16/24
- fixed serverURL to be based on location.origin so it doesn't have to keep being switched everytime we push
- fixed print online users so that it actually works on the server
- fixed View Project page so that it will use the title of the page as it's title unless it doesn't have one and then it will use "Project Viewer"
- fixed serverURL so that it uses either codeotter.dev if that's what it is and otherwise localhost:3000 so you can still use live server if you'd like
- fixed getExternalURL so that if your project is public then it'll use the public url instead

[IDEAS]
- Learn: The First Lesson -> Basic HTML Structure -> Simple Styling
- Basic HTML structure will go over nesting html elements and the ! layout (in order to eventually add css and js files)

### 3/17/24
[IDEAS]
% [The-First-Lesson]
\\ ! change ending
- @ Next time we'll take a look at structuring HTML elements within your page

% [Basic-HTML-Structure]
- you can go search for other public projects and this will be in the experiment tab but experiment which change to "Discover" or "Inspire" because now what you are doing is looking at other projects for discovery or for inspiration

- [Basic HTML Structure]
<!-- - so what else can we do with elements? -->
<!-- - a nice and really important thing we can do is put elements inside of other elements, making them like containers or wrappers around others -->
<!-- - let's start by constructing  -->

- let's take a look at various text elements
- (create h1, p, u, b) ~ with each one describe again what they are/mean
- What if we wanted to underline the <h1> element? how could we do it?
- well, a nice and imporatnt thing about HTML is that you can put elements inside of other elements, like a container or wrapper around them
- let's wrap the <u> element around our <h1>
- this applies the underline style to our header because everything within the <u> element will become underlined
- you can also put multiple elements within elements
- make another <u> but open it on a new line and put an <h3> and <p> element in there
- div elements are often used as generic containers around elements
- show <div> with another <h3> and <p>
- -> try to use a div element to make a container of two buttons
- <div> with 2 buttons (First, Second)

- Nice!, so sure, we can nest elements within each other, but what's the point?
<!-- could show ul and ol elements here -->
- ultimately it's for better organization of our page which will become extremely important for tutorials and projects down the road
- let's build the basic html structure that every page should have
- -> create page2.html
- (start with html tag) ~ this element will hold everything in our whole html page
- (next make head) ~ this will hold elements that hold information like the title of our site, it's icon, and external css files which let us style our page
- (next make body) ~ the body is where all of your elements that actually make up the physical page go, as well as javascript files that we'll use to control these elements in the body of our page
- if this seems like a lot of information don't worry, it is, but it's also critical to every html page and we'll be using it in every web tutorial from now on
- -> create page3.html
- test yourself to see how much you can remember of the basic structure of an html page, and if you remember it all, try to add a Header 1 and a button to the page as well. (feel free to look back at page2.html but I encourage you to challenge yourself)
- <html>, <head>, <body>, <h1>Welcome, <button>Start
- Nice Job! Remember, if you're finding it hard to remember the structure, in time you'll know it by heart since we'll use it in every web tutorial from now on

- @ in the next tutorial we will look at adding an external css file to stylize our html page

<!-- - let's add some more anchor elements
    - (tip if you hold "Shift+Alt+Down Arrow" on Windows or "Shift+Option+Down Arrow" on MacOS, it'll duplicate the current line you're at)
    -  -->
<!-- - (refresh to see how they look) -->

<!-- - these all show various text we may want to display in our program but hmm, what if we wanted to put them in a list, how could we do it? -->
- 

% [Simple-Styling]
- this is where the introduction to divs are and I'll show using them as a container and them applying the style to the container and it's children, instead of having to specify a class on each one

### 3/18/24
- added relative url bar to change where the preview goes to

### 3/19/24
- added quick html dropdown support to the preview url bar
- fixed deleting file that was open would not be deleted from openFiles
- added new lesson Task for clicking and selecting different html preview files
- added transitions for moving bubbles around
- fixed bubble with arrow on the right side
- fixed leaving lesson had double confirmation
- fixed start lesson banner so that it doesn't display the "what we'll be making menu" when there isn't a final instance loaded
- wrote second lesson (Basic HTML Structure) but it's really buggy, need to fix some lesson system stuff

### 3/20/24
- rewrote some lesson stuff to be less buggy
- added "AddCode" task with many CodePart subtasks like moveCursor, addLineBelow, addHTML, addText
- fixed speeding through instances of typing a newline character for something that would open up would skip weirdly and cause issues when resuming or replaying
- unified cursor positioning
- more unified delays a bit
- added method for making a specific task be skippable (not replayable) instead of hardcoded instance check
- added "addIgnoreCode" as the AddCode version of AddSideTutorText
- fixed sometimes the tutors cursor would be in crazy places when showing the cursor again after tutor line/column movement
- changed "changePreviewURL" task so that it only accepts if you click the specified file
- ** second tutorial should pretty much be fully working and bug free at least in my testing

### 3/21/24
- added bypass login stuff for when offline (DEBUG)
- changed it so bubbles are on the bottom then menus and sub menus on top for now
- changed Learn Lesson Ops so there's only resume and clear now
- fixed up the second lesson a bit
- added default text of "Let's add some code here." for the new addCode Task
- fixed ChangePreviewURLTask so that if it is replayed and you'll already on the right url, it'll be skipped, but if it isn't on the right url then it won't get stuck on the hook like before
- fixed AddIgnoreCode so that it doesn't add a pre text bubble
- fixed major bug when pressing ctrl R in the preview would reload the whole page and not the preview
- (update2)
- added protections to make sure lessons with lid's starting with _dummy will not run through the unlock animation
- 

% [Simple-Styling] ~ Introducing CSS and HTML Attributes
- Let's start by creating index.html and our basic HTML structure.
    + create index.html
    + create the structure
    - Now let's add 3 paragraph elements to our page.
        + This is some text, This is more text, This is even more text
- So what if we wanted to change the background color, the color of our text, or the text font size?
- Well, we can use CSS (Cascading Style Sheets) which let us stylize the looks of our page and in the future, add animations to it.
- -> Let's start by adding and linking a css file to our page.
    + add file style.css
    - Let's try to change the background of our page
    + write body { background-color: darkcyan } // but make mention that they should choose to experiment with whatever color they choose
    - Let's take a closer look at this structure (Ponder Board about CSS style-set structure)
    - Now, if you try to refresh the preview you'll see nothing changes.
    + refresh the preview
- Since the preview only displays our HTML page, we need to tell our HTML page where it is so it knows how to load it.
    + go back to index.html
    - We can link our CSS file to our page by adding a line in the h[Head] of our page.
    + go into head and add <link rel="stylesheet" href="style.css">
    + Refresh the preview to see our new background color applied

    - So what does this even mean?
    + Let's take a closer look. (Ponder Board about HTML attributes)
    
    - Alright, let's go back and see what else we can do with CSS.
    - How about making the text twice as large? The default size of text is 16px or pixels so we can set it to 32px.
    + add: p { font-size:32px }
    - This says that we want all elements on our page that are paragraph elements to have a font size of 32px.
    - We can also change the text color.
    + add: color: darkorchid;
    - We can change the background-color of the paragraph element itself
    + add: background-color:yellow;
    <!--  -->


### 3/22/24
- abstractified some mouse stuff so the color square works when going through the tutorial like normal but when skipping it gets offset a bit (but it's only a visual problem if skipping - but resuming seems to work fine)
- there still may be some glitches by they are all visual (the real issue is that they cover up the code they are pointing to)
- changed bubble arrows so they're under the bubble

<!-- 19,302 lines as of this point -->

### 3/23/24
- added basic error message when not being able to load a submission correctly (if it can't find it) on submissions page
- fixed new bug where files didn't load in submissions page
- fixed adding new files during lesson auto save so they show up in the preview correctly right after creating
- fix type in first lesson xD "is is" after highlight

### 3/24/24
- some more work on lesson #3

### 3/28/24
- fixed a lot of issues with screwing up the tutor while they were typing
- got rid of lessonData print flooding console on lesson load

### 3/29/24
- added "Play Again" support when lesson is finished
- added "Clone Files Into New Project" support when lesson is finished
- fixed/cleaned up input menu beforeText to handle the error if inp box wasn't found correctly
- fixed new projects so they go at the top of the list in the dashboard instead of the bottom when created because the time field was empty until first save
- fixed weird bug when deleting projects they would delete too many visually and the page would lose connection to the server until refresh (at least in firefox)

### 3/30/24
- moved changelog out of styles, not sure why it was there
- added ability to press Enter instead of clicking bubbles but if you're focused in a textarea or input then it'll type there but in those cases if you press Shift+Enter then it'll go to the next thing
- tweaked 3rd lesson a bit
- added SwitchToFile CodePart
- added MoveMouseTo CodePart
- fixed resizing lesson panes not resizing editors
- fixed some core mouse movement functions to actually update the editor's cursor position along with it (but disabled for now)
- experimented with possibly a Go to symbol CodePart
- fixed dir-top2 callout arrow being too close to bubble
- wrote second ponder board in simple styling lesson
- fixed some bugs with ponder board
- fixed tutor editor filtering so color change only happens on certain tokens so CSS color stuff and brackets stays normal color
- fixed resuming to CP_CSS wasn't correct
- made editor lose focus when opening ponder board

### 4/1/24
- added Replay Step and Go Back Step callouts to those buttons in lesson
- added icon to lesson page
- fixed rare bug when clearing progress in learn page and then clicking away would cause the play icon to not have the symbols class on it
- added BE_UnderlineObj for boards
- some tweaks to Simple Styling lesson
- added darkened and blurred background when Ponder Board opens so you are more focused on the board and you can't interact with what's behind it while it's going on
- FINISHED LESSON 3!!!!
- added continueFrom for lessons to copy your files from order lessons into a new one
- fixed up initialFiles so they are for the tutor, not you

### 4/2/24
- fixed lesson so it'll select the first file (usually index.html) to load to prevent issues with pre loading multiple files
- fixed lesson page so "invert contrast" and "open in new tab" both have callouts like the editor page
- fixed lesson page so the save button callout says "Save Lesson" instead of "Save Project"
- worked some on lesson 4

### 4/3/24
- fixed sign in prompt so that it appears on all applicable pages and refreshes correctly
- thought I fixed the editor page so that it doesn't resize slow if page load is slow but that makes autocomplete invisible for some reason
- changed arrow on non clickable bubbles again to be flush in light theme
- added dev field for disabling "View Profile" until it's complete
- published lesson 3
- END of update1
- removed the fast resizing to bring back autocomplete visibility
- END of hotfix 1

- % [IDs-&-Classes]
- I've copied the files
    + reload the preview so we have a sense of what we're working with
    - alright let's see what else cwe can do with CSS (switch file to style.css)
    + add font-size: 32px (we can make the text twice as large)
    + add color: tomato (we can also change the text color)
    + add background-color: yellow (we can change the background-color of an element like a highlight)
    
### 4/4/24
- worked on 4th lesson a bit
- started adding support for the tutor to be able to comment out lines

### 4/5/24
- fixed submission highlights not being set correctly
- END of update1

### 4/10/24 - ideas from Brt
- calculator challenge (medium?) - done (paul)
- menu with things you can click (login menu) 
    - this is a good one for styling and html structure (easy) - done (paul)

### 4/12/24
- feedback menu

### 4/13/24
- fixed feedback menu color issues
- added no-color class for pages to default to translucent gray color that aren't in the main 3 categories
- update1

### 4/14/24
- added timeTaken to projects and lessons
- changed confirm bubbles in lessons to say "Ok" on a new line to be more user friendly
- fixed renaming a project from the project dashboard menu wouldn't show a change after going back out
- fixed displaying time taken not to show WIP anymore and be formated as "minutes" instead of "m", to stop at hours instead of days, and to show toFixed(1)
- fixed displaying languages in submission popup so they're uppercase all
- removed add_file button from submission window editor
- fixed calc line count formula to find the correct line count
- fixed time would be recorded initialy when creating a new project
- added getSubmissions with sorting and filtering
- [update1-END]
- added ability to submit multiple times to a challenge and resume correctly to the "most recent one that is unsubmitted"

### 4/15/24
- added mode toggle to getChallenge which fixed opening challenge details on submissions page

### 4/17/24
- fixed filter on gettingSubmissions server side (My Submissions)
- fixed opening submission on submissions page wouldn't load file in the editor after the first time it was opened
- fixed some typos in second lesson
- fixed opening 10th challenge

### 4/22/24
- added popup about case sensitivity when that's an issue upon creating files prompted by the tutor
- fixed propagation stuff when hitting enter in the inputMenu
- added when creating new files the editor for the newly created file gets focused and you can immidiately start typing
- fixed timing delay of saving projects or lessons to not go super quick when you have a slower connection to the server
- added some periods to the ends of sentences from the tutor in the second lesson
- fixed bug where you could edit the tutor's code position after resuming

### 5/4/24
- [BUG] - if the tutor switches to a file and then you switch the tutor's active file to view the other one and then confirm, then the tutor will start typing like normal but in the wrong file
    - I think I need to make a field on Lesson that is tutActiveFile:FFile and so when the tutor starts a Task then it will check if lesson.tut.curFile == lesson.tutActiveFile and if it's not then the tutor will go back to the other file first
    - with this I also need to make it so the user cannot switch the active file being shown of the tutor while the tutor is typing (not sure how I'm going to detect that)
    
- added EnsureIndent CodePart so that the tutor will indent to the specified amount if needed (whether they overshot it or undershot)
- fixed 3rd lesson to use EnsureIndent for adding the link element
- fixed tutor won't select the most recent file by added one frame delay during lesson load
- [BUG] - sometimes hard to reproduce (seems to only happen on Firefox) - when resuming a lesson if you try to type in any of your files it'll type in the first file and be kinda glitchy with requiring a double click to focus on the first file
- added Comment CodePart for toggling comments at the current line of the tutor
- continued work on Lesson 4

### 5/14/24
- fixed issue where leaving a project and then coming back and then saving would automatically add 15 minutes to the time spent because it included the time you were away
    - seems like this was already implemented for lessons
- did more work on the 4th lesson
- added CP_Bubble, CP_ShowHover, ShowHoverTask, CP_Delete (animated), CP_Select (animated but not perfect yet), and CP_Wait (Code Parts for the AddCode task)
- added showDebugHover, and simulateMouseEnterAndLeave for opening and closing the ctrl+k, ctrl+i menu
- ! - fixed moveCursorTo Task and the moveTutMouseTo and moveTutMouseToXY helper functions so that it uses global for to current line and column number instead of calculating the x,y location to go to on the screen which became inconsistent at times with other mouse move actions for various tasks
- !!! - added syncMousePos() which gets called when trying to make the mouse cursor go somewhere, when the cursor location of monaco changes, when the content size of monaco changes, or when monaco is scrolled
    - this new function also calls a new forceShowCursor() which resets the timer on the fake tutor caret to be shown so the caret stays there while the tutor is typing instead of blinking while typing
    - this unifies the positioning of the cursor of the tutor so it doesn't move up and down slightly while doing different actions
    - the tutors mouse will always come from the correct spot now (where the caret last was)
    - now accounts for things like in CSS files where the color previews would shift the content around after it was done typing
    - better accounts for scrolling now

### 5/27/24
- redid how the lesson progress data is stored on the server side to be more modular
    - location data and links are stored in lesson meta data instead of in s_lesson.ts
        - will allow prereq and other more advanced things
    - lesson folders now have to be registered (will add better support for allowing the user to go to other folders)
    - easier to maintain and is less cumbersome to add new lessons
    - lesson meta and evt files are now stored in the folders of whatever folder they're in server side to be more organized
- added LessonType enum
- added createGuidedProject helper function
- fixed some minor bugs

### 6/1/24
- added package.json with mongodb for future converting stuff
- fixed unlocking lessons so they use req instead of next and now support for having multiple requirements to unlock a lesson
- added lessonCache for easier access to PTree information
- fixed learn page with new system so the arrows go the right way
- experiementing with how to display a "Guided Project" type of lesson on the learn page

<!-- MongoDB transition finished -->

### 6/9/24
- changed the project dashboard menu to be a little larger
- fixed order of project dashboard list to be column instead of column-reverse and flipped the wrong sort values on the server
- added an "Add Folder" button to the project dashboard
- added loadFolderItem to ProjectDashboard for loading folders (doesn't do anything right now)
- added Folder system with FolderSchema to server and added folder property to the ProjectSchema
- removed projects array from UserSchema as it'll now be based on the folder property of the projects
- added projectCount property to UserSchema
- added support for folders to createProject (untested but should work)
- added support for folders to deleteProject (untested but should work)
- added getFolder and createFolder methods to UserInst
- added addUniquePred helper function
- added endpoint user-getFilesList that get's all the files and folders in a particular folder
- added support for folders to user-getProjectList (untested but should work)
- in Project Dashboard moved persional tab to "projects" tab and then made personal be the one that loads folders and files
- [idea]
    - make folder have a list of items that follow the type: { id:oid, kind:number }[]
    - then when querying in user-getFilesList it can make a list of all the required collections it needs to query based on the kinds that it found in the list and then it can query by _id: $in: ids,
    - I think I've decided not to use the FileSchema middle man bc it would require extra queries every time
    - technically on this type for items I can have starred in there too bc it's essentially the FileSchema without the extra query

### 6/14/24
<!-- Project/Editor -->
- slightly abstractified menu styling in project dashboard regardding buttons and containers
- added a fade-in animation for items in the project dashboard to be smoother when reloading
- added button to edit settings for folders and fixed the width of the clickable area to be max-content instead of 100% so the button is more easily clickable without conflicting with opening the folder
- added styling for folder-item/going up level, current-path-item
- added FolderMeta and ProjectMeta2 class to front end to be able to add a more organized way for methods for meta related things (just moveToFolder() right now)
- added moveToFolder() for folders and projects
- added path array for storing where you are
- added i_searchQuery for project dashboard to filter results by search (and it doesn't research if the current query is the same as what was last searched)
- fixed createNewPProject() and createNewFolder() so that they use the current folder shown in the dashboard as the folder to create them in
- adjusted text on create project and create folder menu to be more user friendly
- added _isLoadingSection to project dashboard which stores whether or not the list is currently loading and if the user tries to reload the list while it is already reloading then it just ignores it
    - this fixed a bug where clicking too fast would cause two responses to come in and duplicate the results
    - also it just slightly reduces the load on the server
- added pathItem to show a bread crumbs like path for what folder you are currently viewing in the project dashboard
- added folderItem to project dashboard that apppears at the top and is clickable to open that folder with what's inside
- added goUpLevelItem that let's you go to the parent folder if there is one

- added drag support to project dashboard projects and folders so you can drag them on top of folders or goUpLevel to move them there
    - once moved it'll then open the target folder and scroll to and highlight the one that you just moved
    - this feature includes setupHoverDestination() system for ease of use with the drag api
- added scrollToItem to project dashboard

- added FolderSettingsMenu that let's you change the name of the folder and delete it

<!-- Learn -->
- fixed pinch to zoom so it isn't so slow and should be as fast as regular zooming at least on Windows laptops

<!-- Network/Util/Resize -->
- added handleEndPointError() helper function

- moved DeleteMenu into util.ts so when pressing Enter on some pages wouldn't cause class not found error
- added rootFolder:string to g_user
- fixed bug for ConfirmMenu & DeleteMenu where if they were closed too early when a keybind was used to close them it would create a null pointer exception
- added endDragItemHover and startDragItemHover functions for the drag api to have extra functionality when hovering over items while dragging
- tweaked and fixed some bugs with the drag api
- changed styling on drag-cont to be more contrasty
- added highlight element styling (currently only used with ProjectDashboard.scrollToItem())

- fixed while dragging using the drag api would still select text underneath

<!-- Backend -->
- added indexes for name to folder schema and project schema
- fixed folder serialization so it included its fid
- added moveToFolder() and deleteThis() on FolderInst
    - delete folder will recursively go through and delete everything inside the folder including all sub folders and projects
- added rootFolder to UserSchema
    - all created projects and folders that are in the root are now within the root folder instead of having folder:null for ease and consistency of development
- added fid option to createProject for what folder to create it in
- added generic getFolderInst helper function when you don't have a UserInst

- in the login endpoint, it now checks to see if rootFolder is defined, if not then it does:
    - creates a new folder for the root and sets that on the user
    - searchs for all your folders and projects that have folder:null and then set's their folder's to be the new root folder
    - properly sets the itemCount property on the root folder for how many things are now inside it

- fixed project search queries so that if folder is null then they get everything but this is kinda depricated now since the root folder is defined now
- added fid to createProject

- fixed all project item endpoints (moveFiles, deleteFiles, renameFiles...)
    - these weren't updated to use mongo apparently
    - they've now been updated to work with the new system and methods/functions

- added moveFolderToFolder and moveProjectToProject endpoints
- added updateFolderMeta and deleteFolder endpoints

- fixed old parseFolderStr() function so that it works with the new system of not storing ULItem[] on the server and only getting when needed
- depricated index.ts createProject() function, you should only use UserInst.createProject() (it's actually called UserSessionItem.createProject() but I need to change the class name at some point to be more consistent)

### 6/15/24
- moved socket.io.min file to a ts file with no checking
- added depricated label or commented out some functions on server side that aren't used anymore

- Project.createFile() is now async for future proofing but doesn't has to be right now, might change it back not sure
- fixed renaming files in editor so it puts in the name as a placeholder and value in the input box
- added alert when renaming files preventing you from changing the extension for non-text files (b/c if you change change a .png to text then open it as text it would then corrupt the png format when saving again)
- added isReadOnly() method to FFile to get if the file is readonly or not
- added ability for non-text files to have custom HTML displayed instead of a monaco editor when that file has been opened
    - I've only added pngs for now but they open a preview of the png while when hovered shows the boundaries of the image and it also has text above labeling the dimensions of the image and the size of the file in bytes
- changed InputMenu class so onConfirm and onCancel can return "any" and when it is a "1" that means cancel and don't close the menu after, this way you can have the user fix whatever they did wrong on input instead of closing the menu afterward b/c it was unsuccessful
- added inp:HTMLInputElement field to InputMenu for more control

- !!! added save support for other file types for editor
    - changed ULFile structure so it only takes name,buf and does not need val,path,enc anymore
    - added text encoder/decoder to Project on client side
    - changed saving and opening files server side so they don't use utf8 anymore and everything uses the buffer default, even the text files
    - adjusted anything that used File.val to now decode the buffer when needed
    - added isTextFile() and getExt() helper functions

    - lessons aren't broken but custom files probably don't work but not sure, still uploads all files at once

- !!! fixed front end and backend so when uploading files for a project, it only uploads the ones that weren't saved and everything is done as a buffer so no extra work for images or non-text files

- ! added "calc lines" command to server which gives some stats about line counts in the entire project, server, and client

### 6/16/24
- fixed new folder button in light theme on hover coloring in project dashboard
- added button on lesson page for "built in files" that toggles a small files pane that let's you create files and folders (but the other things don't work yet like renaming and deleting bc those only work for projects)
- added setupFilesPane() function and converted the editor, lesson, and submissions page to use it properly
- added "Top Secret" button to user dropdown but it doesn't do anything yet
- fixed upload lesson files and restore lesson files so it works with custom files and folders
- fixed editor dashboard sizing of project items from last update so it doesn't mess up the banner icons like submitted and in-progress

### 6/17/24
- fixed files panel in editor so that it's resizable again
- added display for opening unsupported file formats with a button to open them as text anyways (readonly and it doesn't encrypt so it never corrupts) and a button to download the file
- fixed PonderBoard while resuming had missing await in the chain and resume wouldn't wait for it to finish
- fixed lesson so it properly opens the index.html file first if it exists for the tutor and you
- fixed files menu with delete, rename, move, etc. to work for lessons
- fixed folder support for lessons
- fixed folders so they don't expand even though the files get opened in lessons
- fixed closing files in lesson doesn't delete them anymore and it's treated like the editor
- fixed temp file stuff in lessons
- added flx-c helper class
- fixed files and folders with spaces in their names in the files pane and open files list from wrapping
- adjusted hit area on files pane to more easily target the root folder at the top of the list
- added file-item icon with support for HTML, CSS, JS, and JSON right now
- added hr support to dropdowns

- added getLID_ifLesson() helper function
- fixed fileList reference to be stored on the project instead of queried every time it was needed
- changed isTextFile logic to be based on whitelist of allowed files instead of blacklist
- fixed renaming files so the input box sets the placeholder to be the old name, put the name into the value of the box, and then auto select it all besides the extension so you can rename stuff intuitively and quickly
- added noConfirm param to deleteFItem to force it
- fixed deleting FItems so they get deleted from the global p.files list if they were a FFile
- added duplicateItems option to FItem dropdown with name detection
- added skipSave system on project for more efficient saving with nested/chained events (duplicate running pasteItems which runs createFile)
- added getNewName() param to pasteFItems so you can modify the names of the newly pasted items if needed
- fixed various FItem dropdown actions so they use the item you clicked as the target instead of the currently selected file or folder
- fixed pasteFItems and moveItems so that if nothing was moved it won't auto save the project after
- fixed pasteFItems so that if it was a folder then it also recursively pastes all of its child folders and files along with it
- added support for merging folder's content if you try to move or paste a folder into a location where there is already one with the same name
- added better override support for files when they have the same name
- moved these merging functions into doOverrideFile() and doOverrideFolder() helper functions
- fixed saveProject() so that if it's a lesson it'll run saveLesson() instead
- added "more options" button to files pane
- added upload files (multiple files or singular) button to the more options dropdown which works and uploads them to the current folder selected
- added downloadAsZip() button but it's not implemented yet
- fixed clicking on folders wouldn't deselect like they do with files
- fixed clicking elsewhere on the files pane deselects
- added dropdown when right clicking in free space in files pane which gives you the options: Create file, Create folder, and paste
- added Create file and Create folder options to regular FItem dropdown
- added reopen() method to FFile so when a file's contents change by being overriden but the file is currently open, it'll update in the preview
- added FItem dropdown menu when you right click on items in the open files list
- added support for "jpg","jpeg","bmp","gif","jfif" files alongside png in the non-text file preview
- added scrollIntoView to happen in the open files list at the top when a file is opened
- moved New File and New Folder to their own classes for ease of use and consistency

- added extensive name validators for creating new files and folders (front-end only for now)
- added NotYetMenu stuff with some dialog :D

- extended max upload size to 10mb in socket.io
- added getProjectOrLesson() method on backend to ease use of actions that happen for both projects and lessons

<!-- 27,223 lines as of this point (25,007 non-blank lines) -->

### 6/18/24
<!-- backend -->
- added support for sub folders and choosing the folder to go to on the front end for lessons (url search param only right now)
- added particleSims folder with one lesson that's in progress
- fixed ability to have two tabs open with different things like one being a lesson and one an editor and they work fine independently of each other
    - this required changing the users type to an object and storing sock.ids differently and changing how auth is handled a little bit when getting files from the server
- removed usersOnline because it's not used anymore
- added "regLessons" command to print out all the current registered lessons
- added lstat function to detect if path is a folder or file
- fixed when creating new lessons the meta data is formatted instead of being in one line

<!-- frontend -->
- fixed error appearing in console if openInNew button is clicked when there isn't a project open
- added start/end NoDelay helper functions so you can specify parts of automated events during Lesson Tasks or CodeParts that you want to be instantaneous without the need to add noDelay parameters to everything
- removed the "Sorry, you can't change the file extension of non-text files." for now since it's buggy and hopefully shouldn't be a problem now
- added updateLang() method to FFile
    - this fixed issue where if you create a file called main.s and then type code it doesn't know how to syntax highlight so it's white and then if you rename the file to main.js it now correctly applies the new syntax highlighting without having to reload the page
    - moved lang to be getter instead of set in the constructor
- fixed and cleaned up some spots in lesson where small null pointer errors could occur
- removed/depricated startMouseMove(), it now doesn't do anything because it shouldn't be needed
- fixed moveEditorCursorBy so that if it's noShow then it moves instantly without any delay
- fixed CP_LineBelow so there's a noticable delay in between making new lines if there's multiple
- fixed ending delay on a lot of CodeParts to be 350ms and removed random delays inside if they were supposed to be instantaneous
- fixed moving cursor to spot so if it tries to move into a spot that it's already been then it skips and doesn't wait at all or wait to show the cursor
    - this fixes a lot of extra waiting and weird show,hide,show stuff the mouse used to do
- added CP_LineAbove class
- fixed CP_Home to be instant
- fixed a lot of CodeParts to be instant and just move the caret instead of having to show the cursor and move it (looks more realistic and is faster)
- added CP_HTML_Options to CP_HTML
    - you can specify multiple attributes to have typed out
    - you can specify no closing tag
- changed CP_HTML so if there's text in the middle then it pauses a bit so the user knows it's typing something in the middle
- changed CP_HTML's endAtCenter so that it quickly moves the caret back instead of showing a mouse and clicking (much much better!)
- added CP_StyleRule which lets you add a single style rule (this is for future proofing if we want to add an option to do extra spaces or no extra spaces)
- added defaults to LE_AddGBubble so you don't have to type the loc if you don't want to

<!-- 27,402 lines, 25,173 non-blank -->

### 6/19/24
- more work on particleSim lesson
- fixed editors so that hover menus and autocomplete (especially on the first line) aren't cut off and can appear outside the editor
    - edges aren't perfectly round anymore at the moment
- added overflow-ellipses stuff and no wrapping to file items in the files pane but the ellipses stuff doesn't work at the moment
- mostly fixed the issue where you can only type in the first file open on firefox
    - it works almost all the top but there are random cases where it still types in the wrong editor
    
<!-- lesson -->
- added hideTutMouse() to replay() so the tutors mouse doesn't get stuck open after replaying
- changed SwitchFileTask delay from 300ms to 150ms
- changed StartEdit() and endEdit() so they have an optional editor param for more control
- added lessonSettings object which has just "extraSpaces:boolean" as the only option right now
- added standard 350ms delay after CP_Comment
- added CP_JS_Class with JS_Class_Options { extends?:boolean }
- added CP_GoToFree (no implementation yet but the editorAction should be done)
- added getExtraSpace() helper function
- added delay utility within EditorActions
- added delays to various looping methods of EditorActions
- added _start() and _end() helper methods in EditorActions
- added openSymbols, clearLine, home, end, makeLineAbove, makeLineBelow, deleteText, moveByX, moveByY, goToNextFree, and deleteLines to EditorActions (most of these are untested but some are and work fine)
- fixed CP_StyleRule, CP_CSS, and CP_JS_Class to use extra space setting and new EditorActions
- fixed AddCode task having bubble in the incorrect position sometimes
- fixed SwitchFileTask didn't move the mouse cursor to the right position after update with show files button
- removed tutor auto selecting index.html
- fixed hideTutMouse() and showTutMouse() so they don't delay/wait if it's already in that particular mode

<!-- 27,714 lines, 25,442 non-blank -->

### 6/20/24
- tweaked and added some to particleSim lesson
- tweaked some of the other lessons

<!-- backend -->
- fixed "initial files" feature for the tutor when starting lessons didn't work after the transitions to buffer based files
- added desc:string[] and takeaways:string[] to the lesson meta.json format

<!-- frontend -->
- moved preview HTML creation to a new function: setupPreview() and converted the editor, lesson, submissions, and learn page to be compatible
- added lessonTypeData helper for ease of getting icons and colors for different lesson types in the learn page
- added getIcon(), getAccent(), and getTypeData() helper methods to the TreeLesson class
- added stopPropagations to some buttons on the learn page
- moved startLesson, restartLesson, and clearLessonProgress code to their own functions
- added LessonMenu which can be opened by clicking on the name of a lesson item in the learn page
    - shows name, desc, takeaways, type of lesson, lesson part, correct icon, correct accent
    - under name it has progress percentage, start, continue, restart button with more options button to clear progress
    - right now just shows a sample editor to the right, not sure if I want to make that an iframe sample instead or the key takeaways or what
- fixed touch screen not able to pinch to zoom when menus are open
- fixed PonderBoard wouldn't open after update to fix it when resuming (it would actually hang in the await and be stuck and you can't do anything in the lesson task chain)
- added CP_DeleteLines (Ctrl+Shift+K)
- added CP_EditorActions (not sure if I should keep this but it's more of a debug thing for now)
- added CP_Suggestions (but it's kinda buggy like if the user hovers over the tutor's editor while it's working)
- added standard 350ms wait to CP_Home
- fixed openSymbols so if there is a blank spot before then it doesn't add a space
- added _trigger helper function to EditorActions
- added to EditorActions:
    - showSuggestions, hideSuggestions, nextSug., prevSug., acceptSug., toggleSugDetails.
- added addBubbleAtCursor() helper function for more accurate positioning of bubbles that are located in the code editor
- fixed AddCode and PonderBoardTask to use the new addBubbleAtCursor()
- adjusted basicHTMLStructure snip to be more natural
- fixed tutor's files not all opening in some cases in lessons
- added canUseFS() helper function
- added FSSyncSystem to sync with the harddrive for use with your own IDE
    - it's not super easy friendly yet, you click the button then select the folder, then wait and after a few seconds an alert pops up saying completed, now if you open that folder in vscode and save then it will sync and open the file in vscode, other than that it works pretty good actually and should be really efficient with only checking time stamps
- fixed syncMousePos() so it only runs when on the lesson page (fixed occational null pointer errors in the console)
- fixed some very small things
- fixed built in file pane so if you click on the editor it'll close it
- fixed creating ov_bubbles so it only happens on the lesson page which fixed a lot of issues and headaches with fsSync
- fixed fileList search to be a little smarter and have another check to try to find it
- added isMouseDown option to setupDropdown
- fixed clearLessonProgress menu so the delete button is accented with the warn class
- fixed z-index of menu button in the top left of the learn page
- fixed the files list pane so when right clicking on files within a folder the dashed border isn't cut off sometimes
- fixed clicking twice on a file link in the open files list on an image would cause the page to overflow and scroll down

<!-- 28,470 lines, 26,128 non-blank -->

### 6/21/24
- started adding folder_meta.json for future use
- started adding preview data to meta.json format for lessons
- moved ULItem, file, and folder on server from connection.ts to s_util.ts
- added getFolderItem() helper function in server side
- fixed front end wouldn't load if there were locked lessons
- fixed editor with files so if project isn't defined or project is readonly then the options to upload files or connect to your own IDE are grayed out

### 6/22/24
- Bug: some rare bug when deleting files in lesson page and then trying to add a new one doesn't work (doesn't add to files or saves but does add to open files list)
- tweaked and fixed some things in various lessons
- reworked a lot of the 4th lesson and worked some more on it
- added front end being able to parse preview data and if it has previewData then it will load that into the "sample editor" (should have sub folder support but I never tested it)
- changed preview label to sample
- added activeFile, goToActiveFile and activeFileUnlocked system to lesson
- fixed lesson so if the tutor is ever editing, then it will auto switch back to the file that it should be to make sure the edits always happen correctly
- fixed SwitchFileTask so it better handles when already being on the file and moved the majority of the code out to a new method on lesson called switchFile
- added start/end editing on lesson helpers
- added CP_MoveByX and CP_MoveByY for use with the respective EditActions
- added CP_CancelSelection and T_CancelSelection for the same reasons
- added cancelSelection() EditAction
- added onopen() utility for Projects so you can listen and validate whether or not you want certain files to be opened at a particular time
- added t[] option to parsing bubble text for an easy way to added escaped markup (single tag only like `<div>`)
- fixed CreateFileMenu would cause error on learn page because there's no ref to project
- adjusted lesson menu's details-block to be wider from 500px to 700px

### 6/23/24
- 4th lesson should finally be pretty much done, besides some tweaking and Paul needing to look over
- added desc,preview,takeaways defaults to getStandardLessonMeta
- added actions parameter to run method on CodeParts for ease of use
- fixed default values for many CPs that have amounts to default to 1
- fixed CP_DeleteLines to use delay
- fixee CP_Home and CP_End to have select option
- added waitS() for standard 350ms wait at the end of CodeParts and updated some to use it
- depricated CP_MoveBy because CP_MoveByX and CP_MoveByY give more features
- added CP_Delete2 which has right? and word? support
- added CP_Copy, CP_Paste, CP_Cut, CP_CopyLinesDown, CP_CopyLinesUp
- added getCurLine() in EditorActions
- added copy, paste, cut, copyLinesDown, copyLinesUp, deleteLinesInstant to EditorActions
- added getStandardDelay() and _clipboardText to Lesson for their respective features
- oh started writing a cool new song :D -> "Be My Reality"

### 6/24/24
- added Rush Lesson type
- created meta files for the first Rush Lesson
- added backend commands for creating Rush Lessons
- added useLabel:boolean option to lessonTypeData for ones like the standard lesson that shouldn't use a label
- changed Guided Projects to have an accent of the experiment color instead of the practice color
- fixed loading lesson items so their icon, accent color, and label get created based on their typeData rather than being defined again in CSS
    - this means I only have to define the data once in lessonTypeData instead of that and in the CSS
- also made it auto add the class based on the label name
- added icons to delete and restart in the LessonMenu
- added testSign() for testing signs that will be eventually added as objects to the lesson scenes/folders that will display helpful info outside of lessons
- fixed up how colors are changed and used with item-cont's and their .circle elements when switching between light and dark mode
- added bright colors options to theme.css but they're kinda funny so it's just if you want to uncomment them to see what they look like

### 6/25/24
- wrote the "Rush! HTML Structure" lesson
- changed how project type works kinda on the server side, well just cleaned it up to make it work correctly again
- fixed issues with LessonType not being defined in util and causing null pointer issues
- added async rushCheck() method to CodeParts
- fixed up CP_HTML to use rushCheck and make tokenMarks but the marks are broken currently
- added editor change listener support with diposing to EditActions
- added compareTo(), compareTo_details(), and waitUntilMatching() methods to EditActions
- fixed getLine() method on EditActions so it won't throw an error if the line number is out of bounds
- added AddRushCode Task that will wait for rushCheck methods
- added postSetup() method to lesson so that I could make a back_tut project but not sure if I'm going to use that, maybe
- added TokenMark system but it's really glitchy and I need to find a different solution to the problem
- added actions field to all files
- Rush lessons work at this point now but the obfuscation part doesn't work really

### 6/26/24
- fixed Rush HTML Structure lesson
- added more strings to lesson loading tips
- fixed typeText() function so it only does global changes if it's the main editor (enabled background editing but it still doesn't really work that well)
- fixed moveEditorCursorBy so that it uses EditActions' moveByX and moveByY

- added noRush, isRush(), and rushable() properties to CodeParts
- fixed CP_LineBelow and CP_LineAbove to use EditActions
- added type() method to EditActions that works independently of typeText()
- fixed CP_HTML to use EditActions.type()
- fixed CP_HTML so if in Rush mode and you're trying to open a tag that is invalid it doesn't open properly and it fixes it (could be buggy but seems to work alright now)
- added _back file to FFile's that are owned by the tutor in Rush Lessons
    - rush checks now happen on the _back file
    - every time a Code Part starts that is rushable(), then it instantly opens the back file, types it correctly on the back, then closes it and goes back to the regular file and starts typing the regular Code Part run
    - added settings option for this if you don't want the _back to go instantly you can watch it switch as a preview of what's to come with no obfuscation
- finished and fixed obfuscation support for Rush Lessons and working now on all tag names on CP_HTML with yellow overlay
    - made the unicode-overlay just a little smaller than default
- added speed support to EditActions (this is different than delay, delay is the number of ms between actions, speed is a multiplier to the delay anywhere, even with custom delay used in EditActions)
- added minSpeed, maxSpeed, and speedVelFunc for animating the speed after setting it
- fixed AddRushCode so it only writes to the _back if the Code Part is rushable, otherwise do what usual Code Parts do
- changed AddIgnoreCode to create the bubble at cursor location instead of cached curRow, curCol

- added allWaits which store all the current wait promises that are still pending
- added cancelWaits() function which will instantly resolve all pending wait promises

- fixed deleting multiple files wouldn't always delete all of them from the open files list
- added isTMPFile() system for files starting with "__tmp" like the _back files
    - these files exist in the project but are ignored in the files pane and in the open files list
- fixed dropdowns on open files item and files pane items and files pane back to not show up if the project is readonly
- fixed tutor's open file item color to be purple again in lessons

<!-- 29,736 lines, 27,287 non-blank -->

### 6/27/24
- moved guided project lesson
- added sample preview to lesson #4
- added description, sample, and takaways to rush lesson #1
- fixed calc lines so it calcs the correct amount
- changed it so when lessons hit 100% there is only a restart button, no resume
- readded completed flag when a lesson has been finished once but now it displays as a check instead of the word completed
    - this is good because I think it looks good to have a bunch of these checks on the screen which encourages people to have a sense of a lot of acomplishment they've built up
- added new flag to always show if the current progress is 0 and there is no when started set, meaning it was never started
- added isRestart flag to clearLessonProgress so it labels the menu correctly
- fixed sample previews so all files are opened instead of just the first one
- fixed some null pointer errors
- added extra delay to tutor in rush mode so it doesn't lag the site when the user types faster than the tutor
- fixed cases where p.readonly was used when file.isReadOnly() should have been used
- fixed files not being added at the correct locations in the open files list in some cases
- fixed locked lessons were broken visual from a previous update
- fixed super old issue I saw in notion about how clicking and dragging on the menubar in the learn page would cause panning xD

### 6/28/24
- added Margin & Padding, Text Styling, Button Styling, and Timer Widget lessons to the learn page
- disconnected Menubar lesson from the rest of the lessons on the learn page (bc I might depricate it or remove it in the future bc it was more complex than I thought)
- added two sign objects to the "theBeginnings" folder_meta

- added support for folder_meta (where you define custom data like objects for a particular Folder/Folder Scene) on the backend
- added LearnObjs types and some documentation on the backend
- added author and dateCreated to be default fields included when creating a new lesson

- removed some debug log messages from the front end
- fixed up parseProgTree in learn.ts to have proper types on the data parameter
- added folder_meta support to the front end
- fixed when finishing a lesson two "new" flags would be applied
- added project field to LessonMenu so when closing it properly diposes of the editors that were opened
- fixed loading the lessons in the progress tree so they don't depend on a setTimeout to be loaded properly, everything loads in order
    - even the recursive relative positioning setup loads correctly without delay
    - added delay to added lesson items into the scene so they just pop in over time (less load on the computer during load time and looks cool)
    - added sorting with bitwise functions to make interesting order of appearing
    - fixed path (arrow path between lessons) isn't valid/defined errors
- removed testWarpZone() and testSign() from load

- ! added Learn Obj Registry system
    - enum for types and staticly typed structure for unparsed data
    - added Learn Obj which can have type, id (label like a css id), x,y location/offset, and a relation property
        - the relation property can be either o or l with either an LO's id or lid (haven't implemented o yet) but this makes it so the x,y coords are relative to a particular lesson item or object instead of having to be absolutely defined in the scene
        - because of the other fixes to loading the progress tree, these can be loaded immidiately without extra delay even though they rely on all the lesson item's new locations already being finalized
    - added LO_Sign which simply adds the test sign at a particular location
    - added SignMenu which displays text and desc for the sign from it's meta
        - custom ops like writing "$br" for a line in the desc will make all the following lines be in a new block
        - added popup animation to the first thing that is inside the sign list
        - added cursor:pointer to sign cont

- added ShowItemCont and ShowPathCont animations in learn.css
    - they give it a cool effect when you load the page, I'm not sure if it's too much/too flashy but it does look cool

<!-- 30,114 lines!!!!, 27,636 non-blank -->

### 6/29/24
- tweaked and updated various lessons' evts files
- added desc, previews, and takeaways to the rest of the finished lessons
- added debug_eraseLessonMeta to the backend
- fixed LessonMenu to use formatBubbleText in the desciption and key takeaways so you can use those features in the meta.json files
- added Debug continue and Debug erase meta to dropdown in LessonMenu
- changed CP_HTML's extra check where if it doesn't open properly then it does it manually
    - it used to be glitchy but I guess with the other fixes it seems to be pretty stable now
    - this also fixes random glitches when resuming the tab wouldn't be the right amount
- fixed contrast of highlight that is used in menu-block elements

### 7/1/24
- added "Review I" lesson
- added review type for lessons
- moved default lesson evts string to function getStandardLessonEvts()
- added vertical beam detail to review lessons in the learn page
- added hf class to item-cont divs that have been finished for styling in the future if we want
- added instantFinish:boolean property to Task so when finishing it auto sets canBeFinished and calls _resFinish
- added AccentType enum
- added T_UserAccent task to switch the accent while a lesson is playing
- fixed basicHTMLStructure snip to use MoveByY instead of MoveBy
- fixed LE_AddGBubble so if no text was specified then the bubble won't open
- added LE_Bubble and LE_Tasks which are more specific versions of LE_AddGBubble
- fixed formatBubbleText if the string wasn't defined then an empty string is used
- added item-cont gradient details for being finished but it's not enabled because it seemed like too much
- fixed importance of cta-btn-col styling with pages so they can be overriden more easily

### 7/3/24
- I'll fill this out some other time, mostly just more work on the Review Lessons system and some bug fixes

### 7/24/24 - Paul shows signs of life
 - Improvements to profile page
    - Add case for no profile picture found, and for no challenges/lessons completed.
    - Add "projects" statistics section
    - Implement stats (from @Claeb's functions) across the Challenge, Lesson, and Projects sections
 - Start Figma mockup to redesign stats on profile page
    - I want to have some of the stats (eg challenges completed) be progress bars/progress circles as well as a number, so user can see they've completed 3 / 15 of the challenges, for example. 
    - Made a cool little UI in figma where I could add space for 2-3 badges next to username (either achievements, or user-selected icons... not sure exactly what yet).

 ### 7/26/24 - Paul
 - Continued tweaks to profile page styling, to make it more visually appealing. 
 - Lots of progress on Figma on the redesign for stats. Eg: a 'public' toggle on each statistic panel (lessons, challenges, projects) so that users can choose whether or not these stats are public. User could make challenge stats public, but not lesson stats, for example.

 ### 7/29/24 - Paul
 - Work on updating the profile based on Figma mockups
 - Add banner, pfp styling, add 'badge' icons (future achievement showcase? for now, just join date)
 - Little bit of organization for stats in profile.ts, my first take on that was a disaster - paul

 ### 7/30/24 - Paul
 - Continue working on profile. Added everything in challenge except for the visual status of the progress circle depending on user data, and set up styling for a user that's not logged in yet.
 - With Caleb's help, I'm finally able to test stuff with a local server again

### 7/30/24 - Claeb
- fixed the "go back a step" button during lessons
- updated lesson 1 to use modern events/tasks/code parts
- updated various places that add bubbles to the lesson to use the new 3rd iteration position calc which should work very well
- these changes (at least in the first lesson) make all the bubbles line up correctly and accurately, even when holding skip through the entire lesson
- fixed the review lesson vertical beam decoration so it doesn't have that weird translucent white box around it

### 7/31/24 - Claeb
- I'll fill this in later
- (this update is possibly in a broken state I haven't tested, rewritting how some of the lesson loading works to support 1 depth lessons in lessons for reviews)

### 8/1/24 - Claeb
- existing lessons should be stable
- review lesson core very close to complete enough
    - resumability
    - going to next scene/sub lesson
    - deloading and reloading sub lessons
    - crude progress label (to the precision of the current scene you're on)
    - reviews are finishable
    - they're pretty stable just need stuff like verification content/features, UI, and the rest of the 3 buttons for replay and replay later
- (still need to fill this out at some point)

 ### 8/5/24 - Paul
 - Created a Figma mockup for flashcard system, based on idea Caleb had while we talked about review system. No change to code.

 ### 8/6/24 - Paul
 - Improved Figma mockup, streamlined colors and made UI more consistent to match rest of our webapp.
  - NOTE: Far from final/complete. Criticism is very much welcome.
 - Added progress circles to profile/stats page, for lessons completed out of total lessons, and challenges completed out of total challenges.
 - Finished basic setup of stats. Normally, other than the "public" toggle making one of the three sets of statistics public/private, stats are now operational and look almost exactly like they do in the Figma document.
  - Fix bug where color & grid-template-column weren't being applied as intended when user wasn't logged in

### 8/8/24 - Claeb
- cleaned up some profile.ts stuff (just bc I had a need for it to be more organized sorry)
- changed some class/id names in profile.html to work more automated with the .ts
- added settings with lesson, challenge, and project public/private stat visibility options to the user stats object on the server
- made these buttons work in profile.html
- added httpReq function to front end for future use with http req instead of sockets
- added PATCH /user/stat_visibility endpoint to server for setting visibility of these stats
- added totalLessons and totalChallenges to the user stats object
    - totalChallenges is calculated a little lazy right now, may need to be optimized in the future but it's cached so speed after server restart isn't an issue

### 8/17/24 - Claeb
- mostly just support for loading custom user files in review lessons (probably works in regular lessons too but it's untested)

### 8/18/24 - Claeb
- started working on first question
- added ValidationPart class system
- added VP for CSS selectors to test if it exists and with certain text (or not)
- doesn't move onto the next task under the validation check is complete
- added custom text for the lesson confirm menu for validation checks