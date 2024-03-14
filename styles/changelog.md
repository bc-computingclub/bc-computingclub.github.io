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