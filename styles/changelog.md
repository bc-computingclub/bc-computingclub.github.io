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

