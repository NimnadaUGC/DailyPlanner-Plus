document.addEventListener('DOMContentLoaded', function() {
    const digitalClock = document.getElementById('digital-clock');
    const analogClock = document.getElementById('analog-clock');
    const toggleClockButton = document.getElementById('toggle-clock');

    let isDigital = true;

    function updateDigitalClock() {
        digitalClock.textContent = moment().format('hh:mm:ss A');
    }

    function updateAnalogClock() {
        const now = moment();
        const seconds = now.seconds();
        const minutes = now.minutes();
        const hours = now.hours();

        const secondsDegree = (seconds / 60) * 360;
        const minutesDegree = (minutes / 60) * 360;
        const hoursDegree = (hours / 12) * 360;

        document.querySelector('#analog-clock .second-hand').style.transform = `rotate(${secondsDegree}deg)`;
        document.querySelector('#analog-clock .minute-hand').style.transform = `rotate(${minutesDegree}deg)`;
        document.querySelector('#analog-clock .hour-hand').style.transform = `rotate(${hoursDegree}deg)`;
    }

    function toggleClock() {
        isDigital = !isDigital;
        digitalClock.classList.toggle('hidden', !isDigital);
        analogClock.classList.toggle('hidden', isDigital);
        toggleClockButton.textContent = isDigital ? 'Switch to Analog Clock' : 'Switch to Digital Clock';
    }

    toggleClockButton.addEventListener('click', toggleClock);

    setInterval(() => {
        if (isDigital) {
            updateDigitalClock();
        } else {
            updateAnalogClock();
        }
    }, 1000);

    // Initialize the clock display
    updateDigitalClock();
    updateAnalogClock();
});
