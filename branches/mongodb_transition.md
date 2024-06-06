### 6/2/24
- working for users, creating new accounts and logging in
- working for experiment page you can create new projects, save and load them all fine
- (I'm going to rewrite a lot of this again anyways for then new socket.id sessions system)

### 6/3/24
- fixed all major pages to have the title: Code Otter | {title}
- drew new warp logo
- switch old circle logo on home, learn, practice, submissions, etc. to new warp logo
- changed animation for hovering over logo
- added pre_init.ts thing so it forces the new warp logo to be used as page icon
- fixed styling of search box on challenges page in dark theme
- added working functionality to search box on challenges page
- fixed some minor typos in the first lesson

- !!! (MongoDB transition pretty much finished) - it's gone through my basic testing and every main area should work fine but it needs more thorough testing
- (should be good except there are some weird bugs with viewing submissions but I'll get to those later)
- (unlink challenge also not done)
- everything seems to work fine but I just need to make a command for the DO server to upload everything and make a separate dev database
- fixed some small bugs with statistics data on lessons and projects
- fixed CloneIntoNewProject at the end of lesson wouldn't transfer the files
- added support for nested files in folders on lessons (there's no way to make folders during a lesson at the moment but there's backend support for it now)
- still need to do better token auth stuff for login on the backend at some point
- added upload challenges helper that will take all the challenges stored locally and put them in the database

- added experimental "Practice" label with the purple practice-col to instruct bubbles in lessons
- added styling with purple background/accent to Guided Projects in the learn page
- added custom styling for Guided Projects with a label and different size so the user knows it's a little different
- changed light theme so that paths are gray instead of blue so the Guided Project's purple accent didn't look weird (looks better now too)
- added icon to represent what kind of lesson or thing it is in the bottom left corner (knowledge/school icon for standard lessons and outlined cube icon for guided projects)
- added experimental Warp Zone object (visual only) to the learn page with animaion
- removed some debugging logs on front end
- renamed "Open" to "View" for challenge cards on challenges page
- changed pressing back from submissions page will take you back to the challenges page without opening the popup again (reason in submissions.ts)

### 6/4/24
- fixed viewing public projects so it actually works and is pretty efficient using the ProjectCache with experation time / dirty system
- got rid of meta.save() methods so only the Inst.save() methods can be used and when a ProjectInst.save() method is called it calls makeDirty() on the project cache so it needs to be retrieved again
- fixed unsubmit project so that it gets readded to the inprogress challenges array
- rewrote unlinkFromChallenge so that it works with mongo
- removed some extra debug logs from the back end
- fixed getSubmission so it returns the right data (including the files) so it doesn't break on the front end anymore
- fixed iconRef set in pre_init.ts so it doesn't break previews in the submissions page
- fixed profile picture so it isn't draggable

### 6/5/24
- added processArgs for command line args passed to the server
- added -mode arg to specify whether the server is running in dev or public mode
- added ServerMode which corresponds to which database will be used code-otter-main or code-otter-public for now
- renamed LessonProgs to Lesson_Progs (mongo collection)
- fixed lesson type icons and alt type lessons (guided projects) so they aren't broken when not unlocked
- in the last update lessons were changed from 130x130px to 140x140px and in this update the locked ones are now changed back to 130x130px