
//Initializing the array to store data
var data = [];

    //Event listener that is called when the start button is pressed
    chrome.runtime.onMessage.addListener((message,sender,sendResponse) =>{
        //Clearring data array
        data = [];

        //Storing values in data including 
        // workTimeLeft, breakTimeLeft, and numOfCycles
        data.push(message.workTimeLeft);
        data.push(message.breakTimeLeft);
        data.push(message.numOfCycles);

        //Logging the data array to the console
        console.log(data);

        console.log("This data is: " + typeof(data[0]));
        //Starting the timer
        startWorkCountdown();
    })


    //Function that logs the time left for user set worktime
    function startWorkCountdown() {
        console.log( "work Time");
        
        //Temp Counter for desired work time
        var workCounter = data[0];
        
        //Call the SetIcon function to change the icon
        setIcon("work");

        //Interval that runs every second
        const interval = setInterval(() => {
                
                //Logs how much time is left + cycles left
                console.log("Work Time Left: " + workCounter + "Cycles left:" + data[2]);

                //Changes the badge text to the time left
                setBadgeText(workCounter);

                //If the counter reaches 0, clear the interval and log break time
                //And start the break countdown
                if (workCounter == 0 ) {
                    clearInterval(interval);
                    startBreakCountdown();
                }

            //decrease the temp value
            workCounter -=1;
        }, 1000);
    }

//Function that logs the time left for user set breaktime
function startBreakCountdown() {
    console.log("Break Time");

    //Temp counter for desired break time
    var breakCounter = data[1];
    
    //Call the setIcon function to change the icon
    setIcon("break");

    

    //If cycle counter is greater than 0 
    //Run the breakdown counter
    if (data[2] > 0) {

        //Interval that runs every second
        const interval = setInterval(() => {

            //Logging where the breakConter is at
            console.log("Break Time Left: " + breakCounter + "Cycles left:" + data[2]);

            //Changes the badge text to the time left
            setBadgeText(breakCounter);

            //If the breakCounter reaches 0, clear the interval and start the work counter
            if (breakCounter == 0) {
                clearInterval(interval);
                startWorkCountdown();
            }
            //decrease the temp value
            breakCounter -= 1;
        }, 1000);
        data[2] -= 1;

    //If the number of cycles is 0, log that the cycles are complete
    //Set icon back to original timer icon
    } else if (data[2] == 0) {
        console.log("Cycles are complete");
        setIcon("timer");
    }
}


  //Sets chrome extension icon
  //Based upon the ID
  function setIcon(iconId){
        if(iconId == "work"){
            chrome.action.setIcon({ path:"/images/workIcon.png" })
        } else if(iconId == "break"){
            chrome.action.setIcon({ path: "/images/breakIcon.png" })
        } else{
            chrome.action.setIcon({ path: "/images/timer.png" })
            chrome.action.setBadgeText({text: ""});
        }
  }

  //Sets the badge text
  function setBadgeText(timeLeft){

    //If the time left is greater than 60, 
    //Divide the time left by 60 and 
    //add a : to the end of the time left
    //This is to display the time in minutes and seconds instead of seconds only
    if(timeLeft > 60){
            timeLeft = Math.floor(timeLeft/60) + ":" + (timeLeft % 60);

    }

    
    
    chrome.action.setBadgeText({text: timeLeft.toString()});
  }
  

console.log("background.js is running");

