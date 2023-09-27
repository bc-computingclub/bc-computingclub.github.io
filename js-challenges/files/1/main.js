// 1. Set how much time we have left in seconds
let time = 60;

// 2. Get the HTML element to display how much time we have left
let timeElement = document.getElementById("time-left");

// 3. Create a function to count down by a second
function countDown(){
    // 4. If the time is 0 (meaning it's finished) then we don't have to count down anymore, so we return
    if(time == 0){
        return;
    }

    // 5. Decrease our time variable by 1 second each time
    time--;
    
    // 6. Update our HTML element to display that new value
    timeElement.textContent = time;    

    // 7. Check if there's no time left, and if so, alert "Done!" to the user
    if(time == 0){
        alert("Done!");
    }
}

// 8. Create a loop that will run our "countDown" function once every 1000 milliseconds (1 second)
setInterval(countDown,1000);