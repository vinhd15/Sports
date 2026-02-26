/**
 * API Constants and Configuration
 * Centralized configuration for all API endpoints and constants used across the app
 */

export const API_ENDPOINTS = {
  SCOREBOARD: "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard",
  STANDINGS: "https://cdn.espn.com/core/nfl/standings?xhr=1"
};

export const PLAYOFF_CONFIG = {
  TOTAL_WEEKS: 18,
  PLAYOFF_SEEDS: 7,
  CONFERENCES: ["AFC", "NFC"]
};

export const SCHEDULE_CONFIG = {
  AUTO_REFRESH_INTERVAL: 60 * 1000, // 60 seconds
  FUTURE_WEEK_OFFSET: 1
};
