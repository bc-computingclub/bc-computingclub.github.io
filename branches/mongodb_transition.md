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

### 6/6/24
- added dev mode to the list of server modes
- added isNotInMainCache stuff for User but it's not really working at the moment
- added upload all -confirm command to the server but it's really buggy
- fixed cSearch wasn't working anymore and caused errors on profile page

### 6/7/24
<!-- Mostly Back End Stuff -->
- fixed a lot of locations of stuff on backend to be moved to s_util to prevent circular dependency issues
- ! - fixed major bug where deleting one of your projects would cause the list stored on your user data of submittedChallenges and unsubmittedChallenges to get wiped
    - this had to do with me not knowing that splice(-1,1) actually deletes from the end instead of being ignored
    -> all instances of this are now fixed
- added lessonsCompleted and challengesCompleted fields to UserSchema
- fixed submitChallenge so that it doesn't let you submit if there are no files in the project
- fixed up dirty User data but haven't tested it at all
- added index.html automatically being added when creating new projects or starting challenges
- added getLessonStats and getProjectStats to UserInst (UserSessionItem) which return averages and totals for now
- fixed canEdit() method so that right now if you aren't the owner of a project then you can't edit it
- fixed project serialization so the edit and view permissions are based on the user trying to access the data instead of the user who owns it
- changed findUser() to no longer use the user cache, this system still isn't ideal but seems to be good enough for now
- ! - upload all -confirm should now be working good, at least did good enough in my testing
- added ability to use quotes for items with spaces in server commands, like writing this is now possible: create guided_project "Simple Dropdown Menu"
- disabled a bunch of code server side so nothing important should hopefully interact or rely on the old local files
- ! - fixed when searching for projects for the ProjectDashboard on the server it would list everyones projects (not just yours)
- ! - added socket.io endpoint "getUserStats" which returns 10 different stat items at the moment
- removed unessesary logging server side for a lot of places and loading
- added "reload lessons" or "rl" command to very quickly reload the lesson data without reloading the server
    - this includes reloading evts.js files on lessons to test changes quickly or changes to meta.json files for renaming or moving lessons around
    - (this is pretty much a full reload of lesson data so mostly everything should work)
- fixed loading lesson data from meta.json files so they load in a more abstract way
- added "parent" field to lesson's meta.json for guided_project lessons that are addition parts but they point to the starting lesson
- fixed genLID() to support the new system and properly will retry if it generates a new lid that has already been used
- fixed up default standard lesson meta to be used when creating new lessons (from: create lesson ...) so that it includes x,y,req:[] and the description is more obvious that you need to change it as well as being more abstract now so the default is written once for creating both types of lessons (lesson & guided_project)
- changed lesson meta.json so that x,y are now relative to it's req[0]'s position
    - this makes it much easier to position new lessons added and fix them later on
<!-- Mostly Front End -->
- fixed front end if issues happen while loading projects the ProjectDashboard will come back up properly and not close
- fixed front end trying to open public projects that you have in recents but you don't own load properly
- changed g_user so that it's a class now called GlobalUser which has a data field that contains the data that g_user used to be
    - this now allows methods to be used for g_user related things in an organized way
- added getStats() method to GlobalUser
- fixed TreeLesson constructor to load all data arbitrarily to speed up the addition of new fields added on the server side
- added prevPathCont field to LessonItem so that it can be colored based on if you have completed a lesson or not, but I disabled the feature because I couldn't get the colors to look right
- added the ability for lessons to be positioned relatively from each other with the change in lesson meta.json. It's slow to compute with a lot of recursion but it isn't too bad and it's only during page load
- added guided_project children support that are smaller and the note at the top shows Part 2, Part 3, for the respective ones
- fixed weird bug on the challenges page that when opening specifically 0010 the Login Menu challenge would show up correctly in the search list but when clicked on would act like it was the Side Scroller challenge

<!-- Should hopefully be the end of the mongo transition now -->