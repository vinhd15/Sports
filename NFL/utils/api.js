/**
 * API Utilities Module
 * Provides common API fetching methods with error handling
 */

import { API_ENDPOINTS } from './constants.js';

/**
 * Generic fetch wrapper with error handling
 * @param {string} url - The URL to fetch
 * @param {string} errorMessage - Custom error message
 * @returns {Promise<Object>} Parsed JSON response
 */
export async function fetchJSON(url, errorMessage = "Error fetching data") {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error(`${errorMessage}:`, err);
    throw err;
  }
}

/**
 * Fetch scoreboard data for a specific week
 * @param {number} week - Week number (1-18)
 * @returns {Promise<Object>} Scoreboard data
 */
export async function fetchScoreboard(week = null) {
  const url = week 
    ? `${API_ENDPOINTS.SCOREBOARD}?week=${week}`
    : API_ENDPOINTS.SCOREBOARD;
  return fetchJSON(url, "Failed to fetch scoreboard");
}

/**
 * Fetch current NFL standings
 * @returns {Promise<Object>} Standings data
 */
export async function fetchStandings() {
  return fetchJSON(API_ENDPOINTS.STANDINGS, "Failed to fetch standings");
}
