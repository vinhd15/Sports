/**
 * Scoreboard Module - Display NFL scores with countdown
 * Uses utilities for API, data, and DOM manipulation
 */

import { fetchScoreboard } from '../utils/api.js';
import { parseScoreboard, getGameWinner } from '../utils/data.js';
import { clearElement, updateText, addEventListener } from '../utils/dom.js';
import { SCHEDULE_CONFIG, PLAYOFF_CONFIG } from '../utils/constants.js';

let refreshInterval;

/**
 * Determine the current week (adjusts after playoffs start)
 */
async function getDefaultWeek() {
  try {
    const data = await fetchScoreboard();
    const currentWeek = data.week.number;
    const now = new Date();

    // Find last game in current week
    const lastGame = data.events
      .map(e => new Date(e.date))
      .sort((a, b) => b - a)[0];

    return lastGame && now > lastGame 
      ? currentWeek + SCHEDULE_CONFIG.FUTURE_WEEK_OFFSET
      : currentWeek;
  } catch (err) {
    console.error("Could not determine default week:", err);
    return 1;
  }
}

/**
 * Populate the week dropdown with weeks 1-18
 */
function populateWeekDropdown(defaultWeek) {
  const select = document.getElementById("week-select");
  clearElement(select);

  for (let i = 1; i <= PLAYOFF_CONFIG.TOTAL_WEEKS; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `Week ${i}`;
    if (i === defaultWeek) option.selected = true;
    select.appendChild(option);
  }
}

/**
 * Create and append a score card to the container
 */
function createScoreCard(game) {
  const card = document.createElement("div");
  card.className = "scores-card scores-row";

  const winner = getGameWinner(game);
  const homeWon = winner === "home";
  const awayWon = winner === "away";

  // Home team
  const homeDiv = document.createElement("div");
  homeDiv.className = "scores-team" + (homeWon || winner === "tie" ? " bold" : "");
  homeDiv.textContent = game.homeTeam;

  // Score
  const scoreDiv = document.createElement("div");
  scoreDiv.className = "scores-score";
  scoreDiv.textContent = `${game.homeScore} - ${game.awayScore}`;

  // Away team
  const awayDiv = document.createElement("div");
  awayDiv.className = "scores-team" + (awayWon || winner === "tie" ? " bold" : "");
  awayDiv.textContent = game.awayTeam;

  // Status
  const statusDiv = document.createElement("div");
  statusDiv.className = "scores-status";
  statusDiv.textContent = game.status;

  card.appendChild(homeDiv);
  card.appendChild(scoreDiv);
  card.appendChild(awayDiv);
  card.appendChild(statusDiv);

  return card;
}

/**
 * Manage auto-refresh based on game status
 */
function manageRefreshInterval(isFutureWeek, isGameDay) {
  const refreshBtn = document.getElementById("refresh-btn");
  refreshBtn.disabled = isFutureWeek || !isGameDay;

  if (!isFutureWeek && isGameDay) {
    if (!refreshInterval) {
      refreshInterval = setInterval(loadScores, SCHEDULE_CONFIG.AUTO_REFRESH_INTERVAL);
    }
  } else {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  }
}

/**
 * Load and display scores for the selected week
 */
async function loadScores() {
  const weekToShow = parseInt(document.getElementById("week-select").value, 10);
  const container = document.getElementById("scores");
  updateText(container.id, "Loading...");

  try {
    const data = await fetchScoreboard(weekToShow);
    const parsed = parseScoreboard(data);

    clearElement(container);

    if (parsed.games.length === 0) {
      updateText(container.id, "No games found.");
      updateText("countdown", "N/A");
      return;
    }

    // Add header
    const header = document.createElement("div");
    header.className = "scores-card scores-header";
    header.innerHTML = `
      <div class="scores-label">Home</div>
      <div class="scores-score"></div>
      <div class="scores-label">Away</div>
      <div class="scores-status"></div>
    `;
    container.appendChild(header);

    // Add score cards
    parsed.games.forEach(game => {
      container.appendChild(createScoreCard(game));
    });

    // Handle countdown and refresh
    if (parsed.nextGame) {
      const nextTeams = `${parsed.nextGame.awayTeam} vs ${parsed.nextGame.homeTeam}`;
      const defaultWeek = await getDefaultWeek();
      const isFutureWeek = weekToShow > defaultWeek;

      window.startCountdown(parsed.nextGame.date, nextTeams, isFutureWeek);

      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const isGameDay = parsed.games.some(g => g.date.slice(0, 10) === todayStr);

      manageRefreshInterval(isFutureWeek, isGameDay);
    } else {
      updateText("countdown", "All games finished.");
      document.getElementById("refresh-btn").disabled = true;
      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
      }
    }

    // Timestamp
    const nowStr = new Date().toLocaleTimeString();
    updateText("last-updated", `Last updated: ${nowStr}`);

  } catch (err) {
    updateText(container.id, "Error loading scores.");
    updateText("countdown", "Error loading countdown.");
  }
}

/**
 * Initialize the scoreboard
 */
async function init() {
  const defaultWeek = await getDefaultWeek();
  populateWeekDropdown(defaultWeek);
  await loadScores();

  // Auto-refresh every 60s
  refreshInterval = setInterval(loadScores, SCHEDULE_CONFIG.AUTO_REFRESH_INTERVAL);

  // Event listeners
  addEventListener("week-select", "change", loadScores);
  addEventListener("refresh-btn", "click", loadScores);
}

init();