//Loads the JavaScript file after the HTML
document.addEventListener("DOMContentLoaded", function() {
    //Styling the Chrome Extension
    document.body.style.width = "250px";
    document.body.style.height = "200px";
  
    //Initializing variables
    var title = document.getElementById("title");
    var workTime = document.getElementById("workTime");
    var breakTitle = document.getElementById("breakTitle");
    var breakTime = document.getElementById("breakTime");
    var cyclesContainer = document.getElementById("cyclesContainer");
    var btnContainer = document.getElementById("btnContainer");

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

      btnContainer.appendChild(stopBtn);
    }


    function stop() {
        stopBtn.remove();
        btnContainer.remove();
        document.body.append(title);
        document.body.append(workTime);
        document.body.append(breakTitle);
        document.body.append(breakTime);
        document.body.append(cyclesContainer);
        document.body.append(btnContainer);
        btnContainer.appendChild(startBtn);
    }
  });
  