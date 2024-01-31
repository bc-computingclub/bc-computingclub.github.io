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