
document.addEventListener('DOMContentLoaded', function() {
    function updateClock() {
        const now = new Date();
        const readableTime = now.toLocaleTimeString();
        const readableDate = now.toLocaleDateString();
        document.getElementById('clock').textContent = readableTime + ' ' + readableDate;
    }
    setInterval(updateClock, 1000);
});
    