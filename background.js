//Enhanced Background Script for Focus Timer
let timerData = {
    workTimeLeft: 0,
    breakTimeLeft: 0,
    numOfCycles: 0,
    currentSession: 'work',
    isRunning: false,
    currentCycle: 1,
    totalCycles: 4,
    totalWorkTime: 0,
    totalBreakTime: 0,
    timeLeft: 0
};

let timerInterval = null;

// Event listener for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received message:", message);
    
    if (message.action === 'stopTimer') {
        stopTimer();
        sendResponse({success: true});
        return;
    }
    
    if (message.action === 'getSessionState') {
        sendResponse({
            isRunning: timerData.isRunning,
            currentSession: timerData.currentSession,
            currentCycle: timerData.currentCycle,
            totalCycles: timerData.totalCycles,
            timeLeft: timerData.timeLeft,
            totalWorkTime: timerData.totalWorkTime,
            totalBreakTime: timerData.totalBreakTime
        });
        return;
    }
    
    if (message.action === 'startTimer') {
        // Store timer configuration
        timerData.workTimeLeft = message.workTimeLeft;
        timerData.breakTimeLeft = message.breakTimeLeft;
        timerData.numOfCycles = message.numOfCycles;
        timerData.totalCycles = message.numOfCycles;
        timerData.totalWorkTime = message.workTimeLeft;
        timerData.totalBreakTime = message.breakTimeLeft;
        timerData.currentSession = 'work';
        timerData.currentCycle = 1;
        timerData.isRunning = true;
        timerData.timeLeft = message.workTimeLeft;
        
        console.log("Timer data stored:", timerData);
        
        // Start the background timer
        startBackgroundTimer();
        sendResponse({success: true});
        return;
    }
    
    // Legacy support for old message format
    if (!message.action) {
        timerData.workTimeLeft = message.workTimeLeft;
        timerData.breakTimeLeft = message.breakTimeLeft;
        timerData.numOfCycles = message.numOfCycles;
        timerData.totalCycles = message.numOfCycles;
        timerData.totalWorkTime = message.workTimeLeft;
        timerData.totalBreakTime = message.breakTimeLeft;
        timerData.currentSession = 'work';
        timerData.currentCycle = 1;
        timerData.isRunning = true;
        timerData.timeLeft = message.workTimeLeft;
        
        startBackgroundTimer();
    }
});

function applySessionVisuals(sessionType) {
    console.log(`Applying ${sessionType} visuals to all tabs`);
    
    // Store session state for content scripts
    chrome.storage.local.set({
        focusTimerSession: {
            type: sessionType,
            isActive: true,
            timestamp: Date.now()
        }
    });
    
    // Send message to all tabs to apply visual changes
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
                action: 'applySessionTheme',
                sessionType: sessionType
            }).catch(() => {
                // Ignore errors for tabs that can't receive messages
            });
        });
    });
}

function removeSessionVisuals() {
    console.log("Removing session visuals from all tabs");
    
    // Clear session state
    chrome.storage.local.remove('focusTimerSession');
    
    // Send message to all tabs to remove visual changes
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
                action: 'removeSessionTheme'
            }).catch(() => {
                // Ignore errors for tabs that can't receive messages
            });
        });
    });
}

function startBackgroundTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    let workCounter = timerData.workTimeLeft;
    let breakCounter = timerData.breakTimeLeft;
    let cyclesLeft = timerData.numOfCycles;
    let isWorkSession = true;
    
    // Set initial icon, badge, and visuals
    setIcon("work");
    setBadgeText(workCounter);
    timerData.currentSession = 'work';
    applySessionVisuals('focus'); // Apply focus visuals
    
    timerInterval = setInterval(() => {
        if (isWorkSession) {
            console.log("Work Time Left:", workCounter, "Cycles left:", cyclesLeft);
            setBadgeText(workCounter);
            timerData.timeLeft = workCounter;
            timerData.currentSession = 'work';
            
            if (workCounter <= 0) {
                // Work session complete
                showNotification("Focus session complete! Time for a break.", "work_complete");
                
                if (timerData.breakTimeLeft > 0) {
                    // Switch to break
                    isWorkSession = false;
                    breakCounter = timerData.breakTimeLeft;
                    setIcon("break");
                    timerData.currentSession = 'break';
                    applySessionVisuals('break'); // Apply break visuals
                } else {
                    // No break, go to next cycle
                    cyclesLeft--;
                    timerData.currentCycle++;
                    if (cyclesLeft > 0) {
                        workCounter = timerData.workTimeLeft;
                        setIcon("work");
                        timerData.currentSession = 'work';
                        applySessionVisuals('focus'); // Keep focus visuals
                    } else {
                        completeAllCycles();
                        return;
                    }
                }
            } else {
                workCounter--;
            }
        } else {
            // Break session
            console.log("Break Time Left:", breakCounter, "Cycles left:", cyclesLeft);
            setBadgeText(breakCounter);
            timerData.timeLeft = breakCounter;
            timerData.currentSession = 'break';
            
            if (breakCounter <= 0) {
                // Break complete
                showNotification("Break complete! Ready to focus again?", "break_complete");
                
                cyclesLeft--;
                timerData.currentCycle++;
                if (cyclesLeft > 0) {
                    // Start next work session
                    isWorkSession = true;
                    workCounter = timerData.workTimeLeft;
                    setIcon("work");
                    timerData.currentSession = 'work';
                    applySessionVisuals('focus'); // Apply focus visuals
                } else {
                    completeAllCycles();
                    return;
                }
            } else {
                breakCounter--;
            }
        }
    }, 1000);
}

function completeAllCycles() {
    console.log("All cycles complete!");
    showNotification(`🎉 All ${timerData.totalCycles} cycles complete! Great work!`, "all_complete");
    stopTimer();
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Reset timer data
    timerData.isRunning = false;
    timerData.currentCycle = 1;
    timerData.timeLeft = 0;
    timerData.currentSession = 'work';
    
    // Remove session visuals
    removeSessionVisuals();
    
    setIcon("timer");
    chrome.action.setBadgeText({text: ""});
    console.log("Timer stopped and visuals removed");
}

// Enhanced icon management
function setIcon(iconId) {
    const iconPaths = {
        work: "/Images/workIcon.png",
        break: "/Images/breakIcon.png", 
        timer: "/Images/timer.png"
    };
    
    const iconPath = iconPaths[iconId] || iconPaths.timer;
    
    chrome.action.setIcon({ path: iconPath }, () => {
        if (chrome.runtime.lastError) {
            console.error("Error setting icon:", chrome.runtime.lastError);
        }
    });
    
    // Clear badge if returning to timer icon
    if (iconId === "timer") {
        chrome.action.setBadgeText({text: ""});
    }
}

// Enhanced badge text with better formatting
function setBadgeText(timeLeft) {
    let displayTime;
    
    if (timeLeft <= 0) {
        displayTime = "0";
    } else if (timeLeft >= 3600) {
        // Show hours for long timers
        const hours = Math.floor(timeLeft / 3600);
        displayTime = `${hours}h`;
    } else if (timeLeft >= 60) {
        // Show minutes:seconds for medium timers
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        displayTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
        // Show just seconds for short timers
        displayTime = timeLeft.toString();
    }
    
    chrome.action.setBadgeText({text: displayTime});
    
    // Set badge color based on session type
    const badgeColor = timerData.currentSession === 'work' ? '#ff6b6b' : '#4facfe';
    chrome.action.setBadgeBackgroundColor({color: badgeColor});
}

// Enhanced notification system
function showNotification(message, type) {
    const notificationOptions = {
        type: 'basic',
        iconUrl: '/Images/timer.png',
        title: 'Focus Timer',
        message: message
    };
    
    // Customize based on notification type
    switch(type) {
        case 'work_complete':
            notificationOptions.iconUrl = '/Images/breakIcon.png';
            break;
        case 'break_complete':
            notificationOptions.iconUrl = '/Images/workIcon.png';
            break;
        case 'all_complete':
            notificationOptions.title = '🎉 Focus Timer - Session Complete!';
            break;
    }
    
    chrome.notifications.create('focusTimer_' + Date.now(), notificationOptions, (notificationId) => {
        if (chrome.runtime.lastError) {
            console.error("Error creating notification:", chrome.runtime.lastError);
        } else {
            console.log("Notification created:", notificationId);
            
            // Auto-clear notification after 5 seconds
            setTimeout(() => {
                chrome.notifications.clear(notificationId);
            }, 5000);
        }
    });
}

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
    // Open the extension popup when notification is clicked
    chrome.action.openPopup();
    chrome.notifications.clear(notificationId);
});

// Initialize on extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log("Focus Timer extension started");
    setIcon("timer");
});

// Initialize on extension install
chrome.runtime.onInstalled.addListener(() => {
    console.log("Focus Timer extension installed/updated");
    setIcon("timer");
});

console.log("Enhanced background.js is running");

