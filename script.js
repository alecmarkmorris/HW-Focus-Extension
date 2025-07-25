//Enhanced Pomodoro Timer with Modern UX
document.addEventListener("DOMContentLoaded", function() {
    // Cache DOM elements
    const body = document.body;
    const container = document.querySelector('.container');
    
    // Main sections
    const title = document.getElementById("title");
    const presets = document.getElementById("presets");
    const statusBar = document.getElementById("statusBar");
    const timerCircle = document.getElementById("timerCircle");
    const workTimeSection = document.getElementById("workTimeSection");
    const breakTimeSection = document.getElementById("breakTimeSection");
    const cyclesSection = document.getElementById("cyclesSection");
    const btnContainer = document.getElementById("btnContainer");
    const countdownDisplay = document.getElementById("countdownDisplay");
    
    // Timer elements
    const timerText = document.getElementById("timerText");
    const countdownText = document.getElementById("countdownText");
    const progressRing = document.querySelector('.progress-ring-circle');
    const sessionType = document.getElementById("sessionType");
    const cycleProgress = document.getElementById("cycleProgress");
    
    // Input elements
    const workHours = document.getElementById("workHours");
    const workMinutes = document.getElementById("workMinutes");
    const workSeconds = document.getElementById("workSeconds");
    const breakHours = document.getElementById("breakHours");
    const breakMinutes = document.getElementById("breakMinutes");
    const breakSeconds = document.getElementById("breakSeconds");
    const cycleInput = document.getElementById("numOfCycles");
    
    // Control elements
    const startBtn = document.getElementById("start");
    
    // Timer state
    let timerInterval;
    let currentSession = 'work'; // 'work' or 'break'
    let totalWorkTime = 0;
    let totalBreakTime = 0;
    let currentCycle = 1;
    let totalCycles = 4;
    let isRunning = false;
    let timeLeft = 0;
    
    // Progress ring circumference
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    progressRing.style.strokeDasharray = circumference;
    
    // Styling the Chrome Extension
    body.style.width = "320px";
    body.style.minHeight = "400px";
    
    // Check for active session on popup open
    checkActiveSession();
    
    // Initialize preset buttons
    initializePresets();
    
    // Event Listeners
    startBtn.addEventListener("click", handleStartStop);
    
    function checkActiveSession() {
        // Request current session state from background script
        chrome.runtime.sendMessage({action: 'getSessionState'}, (response) => {
            if (chrome.runtime.lastError) {
                console.log("No active session found");
                return;
            }
            
            if (response && response.isRunning) {
                console.log("Active session found:", response);
                
                // Restore session state
                isRunning = true;
                currentSession = response.currentSession;
                currentCycle = response.currentCycle;
                totalCycles = response.totalCycles;
                timeLeft = response.timeLeft;
                totalWorkTime = response.totalWorkTime;
                totalBreakTime = response.totalBreakTime;
                
                // Show active session UI
                showActiveSession();
                
                // Start local timer sync
                startLocalTimer();
            }
        });
    }
    
    function showActiveSession() {
        // Hide setup UI
        hideSetupUI();
        showTimerUI();
        
        // Update session display
        const sessionText = currentSession === 'work' ? 'Focus Session' : 'Break Time';
        const sessionColor = currentSession === 'work' ? '#ff6b6b' : '#4facfe';
        
        updateSessionUI(sessionText, sessionColor);
        updateCycleProgress();
        
        // Apply theme
        body.classList.remove('focusTheme', 'breakTheme');
        body.classList.add(currentSession === 'work' ? 'focusTheme' : 'breakTheme');
        
        // Update button text
        startBtn.textContent = "Stop Timer";
        
        // Update timer display
        updateTimerDisplay(timeLeft, currentSession === 'work' ? totalWorkTime : totalBreakTime);
        updateProgressRing(timeLeft, currentSession === 'work' ? totalWorkTime : totalBreakTime);
    }
    
    function startLocalTimer() {
        clearExistingInterval();
        
        timerInterval = setInterval(() => {
            // Request updated time from background script
            chrome.runtime.sendMessage({action: 'getSessionState'}, (response) => {
                if (response && response.isRunning) {
                    timeLeft = response.timeLeft;
                    currentSession = response.currentSession;
                    currentCycle = response.currentCycle;
                    
                    // Update display
                    const totalTime = currentSession === 'work' ? totalWorkTime : totalBreakTime;
                    updateTimerDisplay(timeLeft, totalTime);
                    updateProgressRing(timeLeft, totalTime);
                    
                    // Update session info if changed
                    const sessionText = currentSession === 'work' ? 'Focus Session' : 'Break Time';
                    const sessionColor = currentSession === 'work' ? '#ff6b6b' : '#4facfe';
                    updateSessionUI(sessionText, sessionColor);
                    updateCycleProgress();
                    
                    // Update theme if session changed
                    if (currentSession === 'work' && !body.classList.contains('focusTheme')) {
                        body.classList.remove('breakTheme');
                        body.classList.add('focusTheme');
                    } else if (currentSession === 'break' && !body.classList.contains('breakTheme')) {
                        body.classList.remove('focusTheme');
                        body.classList.add('breakTheme');
                    }
                } else {
                    // Session ended
                    isRunning = false;
                    stopTimer();
                }
            });
        }, 1000);
    }
    
    function initializePresets() {
        const presetButtons = document.querySelectorAll('.preset-btn');
        presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const work = parseInt(btn.dataset.work);
                const breakTime = parseInt(btn.dataset.break);
                const cycles = parseInt(btn.dataset.cycles);
                
                workMinutes.value = work;
                workHours.value = 0;
                workSeconds.value = 0;
                
                breakMinutes.value = breakTime;
                breakHours.value = 0;
                breakSeconds.value = 0;
                
                cycleInput.value = cycles;
                
                // Add visual feedback
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 150);
            });
        });
    }
    
    function handleStartStop() {
        if (!isRunning) {
            startTimer();
        } else {
            stopTimer();
        }
    }
    
    function startTimer() {
        // Validate inputs
        const workTime = convertTime(workHours.value, workMinutes.value, workSeconds.value);
        const breakTime = convertTime(breakHours.value, breakMinutes.value, breakSeconds.value);
        
        if (workTime === 0 && breakTime === 0) {
            showNotification("Please set a timer duration", "error");
            return;
        }
        
        // Store timer values
        totalWorkTime = workTime;
        totalBreakTime = breakTime;
        totalCycles = parseInt(cycleInput.value) || 1;
        currentCycle = 1;
        currentSession = 'work';
        isRunning = true;
        timeLeft = totalWorkTime;
        
        // Update UI
        hideSetupUI();
        showTimerUI();
        
        // Start the session
        startWorkSession();
        
        // Send message to background script
        chrome.runtime.sendMessage({
            action: 'startTimer',
            workTimeLeft: totalWorkTime,
            breakTimeLeft: totalBreakTime,
            numOfCycles: totalCycles
        });
    }
    
    function stopTimer() {
        clearExistingInterval();
        isRunning = false;
        currentCycle = 1;
        
        // Send stop message to background script
        chrome.runtime.sendMessage({action: 'stopTimer'});
        
        // Reset UI
        showSetupUI();
        hideTimerUI();
        resetTheme();
        
        startBtn.textContent = "Start Focus Session";
        showNotification("Timer stopped", "info");
    }
    
    function startWorkSession() {
        currentSession = 'work';
        timeLeft = totalWorkTime;
        
        updateSessionUI('Focus Session', '#ff6b6b');
        updateCycleProgress();
        
        body.classList.remove('breakTheme');
        body.classList.add('focusTheme');
        
        startLocalTimer();
    }
    
    function startBreakSession() {
        currentSession = 'break';
        timeLeft = totalBreakTime;
        
        updateSessionUI('Break Time', '#4facfe');
        
        body.classList.remove('focusTheme');
        body.classList.add('breakTheme');
        
        startLocalTimer();
    }
    
    function completeCurrentCycle() {
        currentCycle++;
        
        if (currentCycle > totalCycles) {
            // All cycles complete
            showNotification(`🎉 All ${totalCycles} cycles complete! Great work!`, "success");
            stopTimer();
        } else {
            // Start next cycle
            setTimeout(() => startWorkSession(), 2000);
        }
    }
    
    function updateTimerDisplay(timeLeft, totalTime) {
        const formatted = formatTime(timeLeft);
        timerText.textContent = formatted;
        countdownText.textContent = `${currentSession === 'work' ? 'Focus' : 'Break'}: ${formatted}`;
    }
    
    function updateProgressRing(timeLeft, totalTime) {
        if (totalTime > 0) {
            const progress = (totalTime - timeLeft) / totalTime;
            const offset = circumference - (progress * circumference);
            progressRing.style.strokeDashoffset = offset;
        }
    }
    
    function updateSessionUI(sessionText, color) {
        sessionType.textContent = sessionText;
        statusBar.querySelector('.status-dot').style.background = color;
    }
    
    function updateCycleProgress() {
        cycleProgress.textContent = `Cycle ${currentCycle}/${totalCycles}`;
    }
    
    function hideSetupUI() {
        presets.style.display = 'none';
        workTimeSection.style.display = 'none';
        breakTimeSection.style.display = 'none';
        cyclesSection.style.display = 'none';
        title.style.display = 'none';
        startBtn.textContent = "Stop Timer";
    }
    
    function showSetupUI() {
        presets.style.display = 'flex';
        workTimeSection.style.display = 'block';
        breakTimeSection.style.display = 'block';
        cyclesSection.style.display = 'block';
        title.style.display = 'block';
    }
    
    function showTimerUI() {
        statusBar.style.display = 'flex';
        timerCircle.style.display = 'block';
        countdownDisplay.style.display = 'block';
    }
    
    function hideTimerUI() {
        statusBar.style.display = 'none';
        timerCircle.style.display = 'none';
        countdownDisplay.style.display = 'none';
    }
    
    function resetTheme() {
        body.classList.remove('focusTheme', 'breakTheme');
    }
    
    function clearExistingInterval() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }
    
    function formatTime(totalSeconds) {
        totalSeconds = Math.max(0, totalSeconds);
        const hrs = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        
        if (hrs > 0) {
            return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    function convertTime(hours, minutes, seconds) {
        const h = parseInt(hours) || 0;
        const m = parseInt(minutes) || 0;
        const s = parseInt(seconds) || 0;
        return h * 3600 + m * 60 + s;
    }
    
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            max-width: 250px;
            word-wrap: break-word;
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
        
        // Try to show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Focus Timer', {
                body: message,
                icon: '/images/timer.png'
            });
        }
    }
    
    // Request notification permission on load
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
  });

