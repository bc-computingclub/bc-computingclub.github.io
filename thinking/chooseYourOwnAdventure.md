# 1/8/24
- we should set up a structure with a class called [Scene] and another one called [Action]
- you may be thinking, woah man, what's a class? Don't worry, we'll get there, but let's ponder for a while first.
- think about a player in a game, the player has an x position, a y position, a username, and maybe their health value right?
- where do those things get stored?
- because in order for us to draw a player on the screen we first need to know where to draw them, and when moving where to move from
- we store data like this in an [object]. An object is one piece of data like [Player1] is just one player, but it holds multiple other pieces of data.
<!-- - now if you remember we mentioned we should create something called a [class]. What is a class and how does that relate to objects? -->
- So let's say we have one player, let's make him a variable called [player1] which is an object that holds 2 properties: x and y position on the screen.
- What is a variable? A variable is something that has a label ("player1" in this case) and it has a value with it (or no value if it's empty/null)
- We have 3 variables here, "player1" which is an object, and "x" and "y" which are numbers representing the x and y coordinates on the screen, they could be 0, 1, 2, 5.3, -500, but we know they're going to be a number. This is called a "type".
- We would say the "type" of x and y are both numbers, and we only want them to be numbers. What if the x position of our player1 suddenly changed to "true"? or "bob"? Doesn't even make sense right? Variable types aren't just for making sure variables are correct, but they help make your code easier for other people to read. If you said x and y could be anything, someone may interpret "x" and "y" as being items that player1 owned possibly.
- So what about player1 then? if it's type is "object"? That doesn't seem very descriptive or useful to anyone reading your code. We know that player1 only has 2 properties which are x and y. So how can we represent that?
- With [classes]! A class is like a blueprint or a "type" for an object. We can make a class called [Player] which has 2 properties: x and y which are both numbers. If we change "player1" so that it's type is now "Player" that means that whatever data is stored in "player1" it has to be 2 numbers, an x and a y, whatever numbers they may be.