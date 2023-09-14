
var data = [];

chrome.runtime.onMessage.addListener((message,sender,sendResponse) =>{
    storeData(message.workTimeLeft,message.breakTimeLeft,message.numOfCycles); 
    return true;  
})

function storeData(workTimeLeft, breakTimeLeft, numOfCycles){
    //Storing all data from message in the data array
    data.push(workTimeLeft);
    data.push(breakTimeLeft);
    data.push(numOfCycles);
    console.log(data);
    startWorkCountdown();  
}

//Function that logs the time left for user set worktime
function startWorkCountdown() {

    chrome.action.setIcon({ path: "/work.png" });
    var workCounter = data[0];
    const interval = setInterval(() => {
        console.log("Work Time Left: " + workCounter + "Cycles left:" + data[2]);
        if (workCounter == 0 ) {
            clearInterval(interval);
            console.log("Break Time");
            startBreakCountdown();
        }
    workCounter -=1;
    }, 1000);
    return 0;
}

//Function that logs the time left for user set breaktime
function startBreakCountdown() {
    chrome.action.setIcon({ path: "/break.png" });
    var breakCounter = data[1];
    if(data[2] >0 ){
        const interval = setInterval(() => {
        console.log("Break Time Left: " + breakCounter + "Cycles left:" + data[2]);
        if (breakCounter == 0 ) {
            clearInterval(interval);
            console.log( "work Time");
            startWorkCountdown();
         }
    breakCounter -= 1;
    }, 1000);
    data[2] -= 1;
    }else
        console.log("Cycles are complete");

  }

