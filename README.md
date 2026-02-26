# NFL Local Updates

This project is a comprehensive web-based dashboard for viewing live NFL scores, standings, and simulating playoff brackets. It is organized into three main sections: **Scoreboard**, **Standings**, and **Playoffs**, accessible from a central homepage.

## Structure

```
NFL/
├── index.html                # Homepage with navigation links
├── scoreboard/               # Scoreboard section
│   ├── countdown.js
│   ├── index.html
│   ├── scores.js
│   └── style.css
├── standings/                # Standings section
│   ├── index.html
│   ├── style.css
│   └── teams.js
└── playoffs/                 # Playoff simulator
    ├── index.html
    ├── playoffs.js
    └── style.css
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
- Displays all 7 seeds with correct playoff seeding structure.

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

## Customization

- Update styles in `scoreboard/style.css`, `standings/style.css`, and `playoffs/style.css` as needed.
- Extend JavaScript logic in `scores.js`, `teams.js`, and `playoffs.js` for additional features.
- Modify playoff bracket styling or labels in `playoffs/index.html` and `playoffs/style.css`.

---

**Author:**  
NFL Local Updates by Vinay Misra