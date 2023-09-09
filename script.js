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

    //Adding event listener to the start button
    //Then calling the start Function
    document.getElementById("start").addEventListener("click", function() {
        start();
    });



    //Function removes all titles and text boxes 
    //Then allowing the timer to start
    function start() {
      title.remove();
      workTime.remove();
      breakTitle.remove();
      breakTime.remove();
      cyclesContainer.remove();
    }
  });
  