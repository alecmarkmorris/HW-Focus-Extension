//Loads the JavaScript file after the HTML
document.addEventListener("DOMContentLoaded", function() {
    
    //Styling the Chrome Extension
    document.body.style.width = "250px";
    document.body.style.height = "220px";
  
    //Initializing HTML variables
    var title = document.getElementById("title");
    var workTime = document.getElementById("workTime");
    var breakTitle = document.getElementById("breakTitle");
    var breakTime = document.getElementById("breakTime");
    var cyclesContainer = document.getElementById("cyclesContainer");
    var btnContainer = document.getElementById("btnContainer");
    var countDown = document.createElement("p");
    
    //Number of cycles
    var cycleInput = document.getElementById("numOfCycles");
    var numOfCycles = 0;

    //Initializing user input variables
    //Desired work time
    var workHours = document.getElementById("workHours");
    var workMinutes = document.getElementById("workMinutes");
    var workSeconds = document.getElementById("workSeconds");
    var workTimeInput = [];
    var workTimeLeft;

    //Desired break time
    var breakHours = document.getElementById("breakHours");
    var breakMinutes = document.getElementById("breakMinutes");
    var breakSeconds = document.getElementById("breakSeconds");
    var breakTimeInput = [];
    var breakTimeLeft;

    //Buttons
    //Start button
    var startBtn = document.getElementById("start");

    //Stop 
    var stopBtn = document.createElement("button");
    stopBtn.innerHTML = "Stop";
    stopBtn.id = "stopBtn";

    //Adding event listener to the start button
    //Then calling the start Function
    startBtn.addEventListener("click", function() {
        start();
    });

    //Adding event listener to the stop button
    //Then calling the stop Function
    stopBtn.addEventListener("click", function() {
        stop();
    });


    //Function removes all titles and text boxes 
    //Then allowing the timer to start
    function start() {
      title.remove();
      workTime.remove();
      breakTitle.remove();
      breakTime.remove();
      cyclesContainer.remove();
      startBtn.remove();
      document.body.appendChild(countDown);
      btnContainer.appendChild(stopBtn);
      storeValues();
    }

    //Funtion that is called when the stop button is pressed
    //Responsible for displaying the app setting 
    function stop() {
        stopBtn.remove();
        btnContainer.remove();
        countDown.remove();
        document.body.append(title);
        document.body.append(workTime);
        document.body.append(breakTitle);
        document.body.append(breakTime);
        document.body.append(cyclesContainer);
        document.body.append(btnContainer);
        btnContainer.appendChild(startBtn);
        clearInput();
    }

    //Function that stores all values from user input
    //Such as Worktime, Breaktime, and Number of Cycles
    function storeValues() {
        //Work input
        workTimeInput = [];
        workTimeInput.push(workHours.value);
        workTimeInput.push(workMinutes.value);
        workTimeInput.push(workSeconds.value);

        //Break input
        breakTimeInput = [];
        breakTimeInput.push(breakHours.value);
        breakTimeInput.push(breakMinutes.value);
        breakTimeInput.push(breakSeconds.value);

        //Number of cycles
        numOfCycles = cycleInput.value;

        //Store times as seconds
        workTimeLeft = convertTime(workTimeInput[0], workTimeInput[1], workTimeInput[2]);
        breakTimeLeft = convertTime(breakTimeInput[0], breakTimeInput[1], breakTimeInput[2]);
        startWorkCountdown();
    }

    //Function that displays the time left for user set worktime
    function startWorkCountdown() {
        var workCounter = workTimeLeft;
        const interval = setInterval(() => {
            countDown.innerHTML = "Work Time Left: " + workCounter + "Cycles left:" + numOfCycles;
            if (workCounter < 0 ) {
                clearInterval(interval);
                countDown.innerHTML = "Break Time";
                startBreakCountdown();
            }
        workCounter -=1;
        }, 1000);
        decreaseNumOfCycles();
      }

      //function that displays the countdown 
      function startBreakCountdown() {
        var breakCounter = breakTimeLeft;
        const interval = setInterval(() => {
            countDown.innerHTML = "Break Time Left: " + breakCounter + "Cycles left:" + numOfCycles;
            if (breakCounter < 0 ) {
                clearInterval(interval);
                countDown.innerHTML = "work Time";
                startWorkCountdown();
             }
        breakCounter -= 1;
        }, 1000);
        numOfCycles--;
      }

    //Function that clears all input boxes
    function clearInput(){
        workHours.value= "";
        workMinutes.value= "";
        workSeconds.value= "";
        breakHours.value= "";
        breakMinutes.value= "";
        breakSeconds.value= "";
        cycleInput.value= "";
    }

    //Function that decreases the numOfCycles variable
    function decreaseNumOfCycles() {
        if (numOfCycles == 0){
            stop();
        }
    }

    //Function that takes in hours, minutes, and seconds
    //and converts them to seconds
    function convertTime(hours, minutes, seconds) {
        var timeInSeconds = (hours * 60 * 60) + (minutes * 60) + seconds;
        return timeInSeconds;
    }
  });


