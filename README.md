# NFL Local Updates

This project is a comprehensive web-based dashboard for viewing live NFL scores, standings, and simulating playoff brackets. It is organized into three main sections: **Scoreboard**, **Standings**, and **Playoffs**, accessible from a central homepage.

## Structure

```
NFL/
├── index.html                # Homepage with navigation links
├── utils/                    # Shared utility modules
│   ├── api.js               # API fetching utilities
│   ├── data.js              # Data parsing and transformation
│   ├── dom.js               # DOM manipulation helpers
│   └── constants.js         # Configuration and constants
├── scoreboard/              # Scoreboard section
│   ├── countdown.js         # Countdown timer
│   ├── index.html           # Scoreboard page
│   ├── scores.js            # Score fetching and display
│   └── style.css            # Scoreboard styles
├── standings/               # Standings section
│   ├── index.html           # Standings page
│   ├── style.css            # Standings styles
│   └── teams.js             # Team standings display
└── playoffs/                # Playoff simulator
    ├── index.html           # Playoffs page
    ├── playoffs.js          # Bracket logic
    └── style.css            # Bracket styles
```

## Features

### Homepage (`index.html`)
- Simple landing page with links to the Scoreboard, Standings, and Playoffs sections.
- Clean, responsive design with hover effects for navigation.

### Scoreboard (`scoreboard/`)
- Displays live NFL scores for the selected week.
- Includes a countdown to the next game.
- Allows manual and automatic refreshing of scores (only on game days and for the current week).
- Styled for clarity and readability.

### Standings (`standings/`)
- Shows current NFL team standings by conference and division.
- Data is fetched live from ESPN's public API.
- Standings are grouped by conference and division.
- Table is styled with zebra striping, hover effects, and dark mode support.

### Playoffs (`playoffs/`)
- Interactive playoff bracket simulator.
- Automatically seeds the bracket from live standings data using ESPN's playoff seeding algorithm.
- **Dynamic Seeding:** Seeds 1–7 are automatically populated from the standings endpoint.
- **Interactive Selection:** Click on a team name to select them as the winner of that matchup.
- **Automatic Advancement:** Winners advance through Wild-card → Divisional → Conference → Super Bowl rounds.
- **Smart Pairing:** The #1 seed (bye) faces the lowest remaining seed after wildcards; other winners face each other.
- **Reset Bracket:** Clear all selections and start over with a reset button.

## How It Works

### Shared Utility Modules (`utils/`)

The project uses a utilities directory that provides core functionality to all three sections:

**`api.js`** - Handles all ESPN API communication
- Fetches scoreboard data for any week
- Fetches current standings data
- Provides error handling for failed requests

**`data.js`** - Transforms raw API responses into usable data structures
- Parses standings into team records organized by conference and division
- Extracts playoff seeds (top 7 teams) from standings data
- Converts scoreboard data into game records with scores and status
- Determines winners from game scores

**`dom.js`** - Provides DOM manipulation utilities
- Creates elements with classes and content
- Updates element text and HTML safely
- Clears element contents
- Attaches event listeners

**`constants.js`** - Centralized configuration
- API endpoint URLs
- Playoff configuration (7 seeds, 2 conferences, 18 weeks)
- Auto-refresh intervals

### How the Sections Work

**Scoreboard** (`scores.js` + `countdown.js`)
- Fetches games for the selected week via `api.js`
- Parses game data via `data.js` 
- Renders scores using `dom.js` helpers
- Auto-refreshes every 60 seconds on game days

**Standings** (`teams.js`)
- Fetches current standings via `api.js`
- Transforms standings to conference/division structure via `data.js`
- Renders table using `dom.js` utilities

**Playoffs** (`playoffs.js`)
- Fetches standings via `api.js`
- Extracts top 7 seeds via `data.js`
- Simulates bracket with manual winner selection

Each module follows the pattern: **Fetch → Parse → Render**


## Usage

1. Open `NFL/index.html` in your browser.
2. Click on **Scoreboard**, **Standings**, or **Playoffs** to view live updates and interact with features.
3. For the Playoffs simulator, the bracket is automatically seeded from current standings; click team names to select winners.
4. For best results, run a local server (e.g. `python3 -m http.server`) to avoid CORS issues with API requests.

## Technologies

- HTML, CSS, JavaScript
- ESPN public API for scores, standings, and playoff seeding
- Dynamic data binding and interactive UI
- Responsive and accessible design

## Data Sources

- **Scores & Schedules:** ESPN's scoreboard API
- **Standings:** ESPN's standings endpoint with live seed assignments
- **Playoff Seeding:** Extracted directly from ESPN's standings `seed` field (seeds 1–7 per conference)

---

**Author:**  
NFL Local Updates by Vinay Misra