
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

    //Logging the data from message
    console.log(data);
    startWorkCountdown();  
}

//Function that logs the time left for user set worktime
function startWorkCountdown() {
    var workCounter = data[0];
    const interval = setInterval(() => {
        console.log("Work Time Left: " + workCounter + "Cycles left:" + data[2]);
        if (workCounter < 0 ) {
            clearInterval(interval);
            console.log("Break Time");
            startBreakCountdown();
        }
    workCounter -=1;
    }, 1000);
    decreaseNumOfCycles();
    return 0;
}

//Function that logs the time left for user set breaktime
function startBreakCountdown() {
    var breakCounter = data[1];
    const interval = setInterval(() => {
        console.log("Break Time Left: " + breakCounter + "Cycles left:" + data[2]);
        if (breakCounter < 0 ) {
            clearInterval(interval);
            console.log( "work Time");
            startWorkCountdown();
         }
    breakCounter -= 1;
    }, 1000);
    data[2] -= 1;
  }


  //Checking the number of cycles left 
  //If the number of cycles left is 0, a message is send to script.js
  function decreaseNumOfCycles() {
    if (data[2] == 0){
    //  chrome.tabs.query({active: true, currentWindow: true}, 
     //   function(tabs) {
     //       var activeTab = tabs[0];
     //       console.log(activeTab);
      //      chrome.tabs.sendMessage(activeTab.id, {msg: "Cycles left: 0"}, function(response) {
      //      console.log(response);
      //       });
        
     //   });
     chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {message: "open_dialog_box"});  
        });
        
    }
}