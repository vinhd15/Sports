# NFL Local Updates

This project is a simple web-based dashboard for viewing live NFL scores and standings. It is organized into two main sections: **Scoreboard** and **Standings**, accessible from a central homepage.

## Structure

```
NFL/
├── index.html                # Homepage with navigation links
├── scoreboard/               # Scoreboard section
│   ├── countdown.js
│   ├── index.html
│   ├── scores.js
│   └── style.css
└── standings/                # Standings section
    ├── index.html
    ├── style.css
    └── teams.js
```

## Features

### Homepage (`index.html`)
- Simple landing page with links to the Scoreboard and Standings.
- Clean, responsive design with hover effects for navigation.
- Uses a `<base>` tag for correct relative linking.

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

## Usage

1. Open `NFL/index.html` in your browser.
2. Click "Scoreboard" or "Standings" to view live updates.
3. For best results, run a local server (e.g. `python3 -m http.server`) to avoid CORS issues with API requests.

## Technologies

- HTML, CSS, JavaScript
- ESPN public API for scores and standings
- Responsive and accessible design
- Dark mode support for standings

## Customization

- Update styles in `scoreboard/style.css` and `standings/style.css` as needed.
- Extend JavaScript logic in `scores.js` and `teams.js` for more features.

---

**Author:**  
NFL Local Updates by Vinay Misra