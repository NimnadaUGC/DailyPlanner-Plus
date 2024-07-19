
let isPomodoroRunning = false;
let pomodoroTimer;
let workTime = 25 * 60;  // 25 minutes
let breakTime = 5 * 60;  // 5 minutes
let currentTime = workTime;

function startPomodoro() {
    if (!isPomodoroRunning) {
        isPomodoroRunning = true;
        pomodoroTimer = setInterval(() => {
            currentTime--;
            if (currentTime <= 0) {
                currentTime = workTime;
                alert('Time for a break!');
            }
            displayTime();
        }, 1000);
    }
}

function stopPomodoro() {
    clearInterval(pomodoroTimer);
    isPomodoroRunning = false;
}

function resetPomodoro() {
    stopPomodoro();
    currentTime = workTime;
    displayTime();
}

function displayTime() {
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;
    document.getElementById('pomodoro-time').textContent = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

displayTime();
    