let isPomodoroRunning = false;
let pomodoroTimer;
let workTime = 25 / 60 * 60; // 25 minutes
let shortBreakTime = 5 / 60 * 60; // 5 minutes
let longBreakTime = 15 / 60 * 60; // 15 minutes
let currentTime = workTime;
let isBreak = false;
let workSessionsCompleted = 0;
let firstStart = true;

document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        if (isPomodoroRunning) {
            stopPomodoro();
        } else {
            startPomodoro();
        }
    }
});

function startPomodoro() {
    if (!isPomodoroRunning) {
        isPomodoroRunning = true;
        if (firstStart) {
            firstStart = false;
            showCountdown(5, runPomodoroTimer); // Show countdown for the first start
        } else {
            runPomodoroTimer();
        }
    }
}

function runPomodoroTimer() {
    displayTime();
    updateProgressBar();
    
    pomodoroTimeout = setTimeout(() => {
        currentTime--;

        if (currentTime < 0) {
            if (isBreak) {
                if (workSessionsCompleted % 4 === 0) {
                    playSound('alert-sound'); // Play alert sound
                    showCustomAlertWithOption('Let\'s Continue Another 4 Sessions?', () => {
                        isBreak = false;
                        currentTime = workTime;
                        showCountdown(5, runPomodoroTimer); // Show countdown after long break
                    }, () => {
                        stopPomodoro();
                    });
                } else {
                    playSound('alert-sound'); // Play break sound
                    showCustomAlert('Break is over! Time to get back to work.', () => {
                        isBreak = false;
                        currentTime = workTime;
                        runPomodoroTimer();
                    });
                }
            } else {
                workSessionsCompleted++;
                document.getElementById('work-sessions').textContent = workSessionsCompleted;

                if (workSessionsCompleted % 4 === 0) {
                    playSound('alert-sound'); // Play long break sound
                    showCustomAlert('Time for a long break!', () => {
                        isBreak = true;
                        currentTime = longBreakTime;
                        runPomodoroTimer();
                    });
                } else {
                    playSound('alert-sound'); // Play short break sound
                    showCustomAlert('Time for a short break!', () => {
                        isBreak = true;
                        currentTime = shortBreakTime;
                        runPomodoroTimer();
                    });
                }
            }
        } else {
            runPomodoroTimer();
        }
    }, 1000);
}

function stopPomodoro() {
    clearTimeout(pomodoroTimeout);
    isPomodoroRunning = false;
}

function resetPomodoro() {
    stopPomodoro();
    currentTime = workTime;
    isBreak = false;
    updateProgressBar();
    displayTime();
}

function resetAll() {
    resetPomodoro();
    workSessionsCompleted = 0;
    document.getElementById('work-sessions').textContent = workSessionsCompleted;
}

function displayTime() {
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;
    document.getElementById('pomodoro-time').textContent = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

function updateProgressBar() {
    const total = isBreak ? (workSessionsCompleted % 4 === 0 ? longBreakTime : shortBreakTime) : workTime;
    const percentage = ((total - currentTime) / total) * 100;
    document.getElementById('progress-bar').style.width = percentage + '%';
}

function showCountdown(seconds, callback) {
    const countdownOverlay = document.getElementById('countdown-overlay');
    const countdownElement = document.getElementById('countdown');
    //document.getElementById('main-content').classList.add('blur');
    countdownOverlay.classList.remove('overlay-hidden');
    countdownElement.textContent = seconds;
    countdownTimer = setInterval(() => {
        seconds--;
        if (seconds <= 0) {
            clearInterval(countdownTimer);
            countdownOverlay.classList.add('overlay-hidden');
            //document.getElementById('main-content').classList.remove('blur');
            callback();
        } else {
            countdownElement.textContent = seconds;
        }
    }, 1000);
}

function showCustomAlert(message, callback) {
    playSound('alert-sound'); // Play alert sound
    const customAlert = document.getElementById('custom-alert');
    const customAlertMessage = document.getElementById('custom-alert-message');
    customAlertMessage.textContent = message;
    customAlert.classList.remove('overlay-hidden');

    const alertButtonOk = document.getElementById('alert-button-ok');
    const alertButtonLater = document.getElementById('alert-button-later');

    alertButtonLater.classList.add('button-hidden'); // Hide the "Later" button by default

    alertButtonOk.onclick = () => {
        customAlert.classList.add('overlay-hidden');
        callback();
    };
}

function showCustomAlertWithOption(message, okCallback, maybeLaterCallback) {
    playSound('alert-sound'); // Play alert sound
    const customAlert = document.getElementById('custom-alert');
    const customAlertMessage = document.getElementById('custom-alert-message');
    customAlertMessage.textContent = message;
    customAlert.classList.remove('overlay-hidden');

    const alertButtonOk = document.getElementById('alert-button-ok');
    const alertButtonLater = document.getElementById('alert-button-later');

    alertButtonLater.classList.remove('button-hidden'); // Show the "Later" button

    alertButtonOk.onclick = () => {
        customAlert.classList.add('overlay-hidden');
        alertButtonLater.classList.add('button-hidden'); // Hide the "Later" button after use
        okCallback();
    };

    alertButtonLater.onclick = () => {
        customAlert.classList.add('overlay-hidden');
        alertButtonLater.classList.add('button-hidden'); // Hide the "Later" button after use
        maybeLaterCallback();
    };
}

// Function to play a sound
function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.play();
    }
}

displayTime();
updateProgressBar();
