// Score update logic

let refreshInterval;

async function getDefaultWeek() {
  const baseUrl = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";
  const resp = await fetch(baseUrl);
  const data = await resp.json();

  const currentWeek = data.week.number;
  const events = data.events;
  const now = new Date();

  // Find last game in current week
  const lastGame = events
    .map(e => new Date(e.date))
    .sort((a, b) => b - a)[0];

  if (lastGame && now > lastGame) {
    return currentWeek + 1; // after MNF, before TNF
  }

  return currentWeek;
}

function populateWeekDropdown(defaultWeek) {
  const select = document.getElementById("week-select");
  select.innerHTML = "";

  for (let i = 1; i <= 18; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `Week ${i}`;
    if (i === defaultWeek) option.selected = true;
    select.appendChild(option);
  }
}

async function loadScores() {
  const weekToShow = parseInt(document.getElementById("week-select").value, 10);
  const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?week=${weekToShow}`;

  const container = document.getElementById("scores");
  container.innerHTML = "Loading...";

  try {
    const response = await fetch(url);
    const data = await response.json();

    container.innerHTML = "";

    if (!data.events || data.events.length === 0) {
      container.textContent = "No games found.";
      document.getElementById("countdown").textContent = "N/A";
      return;
    }

    // Add Home/Away header
    const header = document.createElement("div");
    header.className = "scores-card scores-header";
    header.innerHTML = `
      <div class="scores-label">Home</div>
      <div class="scores-score"></div>
      <div class="scores-label">Away</div>
      <div class="scores-status"></div>
    `;
    container.appendChild(header);

    // Show scores with card layout
    data.events.forEach(event => {
      const competition = event.competitions[0];
      const competitors = competition.competitors;

      // Find home and away teams
      const home = competitors.find(t => t.homeAway === "home");
      const away = competitors.find(t => t.homeAway === "away");

      // Determine winner
      let homeBold = false, awayBold = false;
      if (competition.status.type.completed) {
        if (parseInt(home.score, 10) > parseInt(away.score, 10)) homeBold = true;
        else if (parseInt(away.score, 10) > parseInt(home.score, 10)) awayBold = true;
        else if (parseInt(home.score, 10) === parseInt(away.score, 10)) { homeBold = awayBold = true; }
      }

      // Card row
      const card = document.createElement("div");
      card.className = "scores-card scores-row"; // Add scores-row class

      // Home team
      const homeDiv = document.createElement("div");
      homeDiv.className = "scores-team" + (homeBold ? " bold" : "");
      homeDiv.textContent = home.team.displayName;

      // Score
      const scoreDiv = document.createElement("div");
      scoreDiv.className = "scores-score";
      scoreDiv.textContent = `${home.score} - ${away.score}`;

      // Away team
      const awayDiv = document.createElement("div");
      awayDiv.className = "scores-team" + (awayBold ? " bold" : "");
      awayDiv.textContent = away.team.displayName;

      // Status
      const statusDiv = document.createElement("div");
      statusDiv.className = "scores-status";
      statusDiv.textContent = competition.status.type.description;

      card.appendChild(homeDiv);
      card.appendChild(scoreDiv);
      card.appendChild(awayDiv);
      card.appendChild(statusDiv);

      container.appendChild(card);
    });

    // Find next game
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const upcoming = data.events
      .filter(e => new Date(e.date) > now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Determine if selected week is in the future
    const defaultWeek = await getDefaultWeek();
    const isFutureWeek = weekToShow > defaultWeek;

    // Check if any game is scheduled for today
    const isGameDay = data.events.some(e => e.date.slice(0, 10) === todayStr);

    if (upcoming.length > 0) {
      const nextGame = upcoming[0];
      const nextTeams = nextGame.competitions[0].competitors
        .map(t => t.team.displayName)
        .join(" vs ");
      window.startCountdown(nextGame.date, nextTeams, isFutureWeek);

      // Enable refresh only for current week and on game days
      document.getElementById("refresh-btn").disabled = isFutureWeek || !isGameDay;
      if (!isFutureWeek && isGameDay) {
        if (!refreshInterval) {
          refreshInterval = setInterval(loadScores, 60 * 1000);
        }
      } else {
        if (refreshInterval) {
          clearInterval(refreshInterval);
          refreshInterval = null;
        }
      }
    } else {
      document.getElementById("countdown").textContent = "All games finished.";

      // Disable refresh and stop auto-refresh for completed or future week
      document.getElementById("refresh-btn").disabled = true;
      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
      }
    }

    // Timestamp
    const nowStr = new Date().toLocaleTimeString();
    document.getElementById("last-updated").textContent = `Last updated: ${nowStr}`;

  } catch (err) {
    container.innerHTML = "Error loading scores.";
    document.getElementById("countdown").textContent = "Error loading countdown.";
    console.error(err);
  }
}

// Setup
async function init() {
  const defaultWeek = await getDefaultWeek();
  populateWeekDropdown(defaultWeek);
  loadScores();

  // Auto-refresh every 60s
  refreshInterval = setInterval(loadScores, 60 * 1000);

  // Dropdown change reloads scores
  document.getElementById("week-select").addEventListener("change", loadScores);

  // Manual refresh
  document.getElementById("refresh-btn").addEventListener("click", loadScores);
}

init();