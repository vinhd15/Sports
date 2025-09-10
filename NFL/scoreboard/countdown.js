// Countdown clock logic

let countdownInterval;

function startCountdown(nextGameTime, nextTeams, isFutureWeek = false) {
    if (countdownInterval) clearInterval(countdownInterval);

    const countdownEl = document.getElementById("countdown");
    const label = isFutureWeek ? "Next Game This Week" : "Next Game";

    function updateCountdown() {
        const now = new Date().getTime();
        const gameTime = new Date(nextGameTime).getTime();
        const diff = gameTime - now;

        if (diff <= 0) {
            countdownEl.textContent = "Game is starting!";
            clearInterval(countdownInterval);
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        countdownEl.textContent = `${label}: ${nextTeams} - ${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

// Export for use in scores.js
window.startCountdown = startCountdown;