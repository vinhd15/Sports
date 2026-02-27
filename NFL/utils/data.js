/**
 * Data Transformation Utilities
 * Provides functions to parse and transform API data into usable formats
 */

import { PLAYOFF_CONFIG } from './constants.js';

/**
 * Parse standings data and extract team information
 * @param {Object} standingsData - Raw standings data from API
 * @returns {Object} Parsed standings by conference
 */
export function parseStandings(standingsData) {
  const conferences = standingsData.content.standings.groups;
  const result = {};

  conferences.forEach(conf => {
    const confName = conf.name.includes('American') ? 'AFC' : 'NFC';
    result[confName] = [];

    conf.groups.forEach(division => {
      if (!division.standings || !division.standings.entries) return;

      division.standings.entries.forEach(teamObj => {
        const team = teamObj.team;
        const stats = teamObj.stats.reduce((acc, stat) => {
          acc[stat.name] = stat.value;
          return acc;
        }, {});

        result[confName].push({
          name: team.displayName,
          seed: team.seed,
          wins: parseInt(stats.wins, 10) || 0,
          losses: parseInt(stats.losses, 10) || 0,
          ties: parseInt(stats.ties, 10) || 0,
          winPct: parseFloat(stats.pct) || 0,
          division: division.name,
          conference: confName
        });
      });
    });
  });

  return result;
}

/**
 * Extract playoff seeds (top 7 teams) from standings
 * @param {Object} standingsData - Raw standings data from API
 * @returns {Object} Seeds organized by conference
 */
export function extractPlayoffSeeds(standingsData) {
  const parsed = parseStandings(standingsData);
  const seeds = { AFC: [], NFC: [] };

  Object.entries(parsed).forEach(([conf, teams]) => {
    // Filter teams that have a playoff seed assigned
    const seededTeams = teams.filter(team => team.seed && team.seed > 0);
    
    // Sort by seed number (ascending)
    seededTeams.sort((a, b) => a.seed - b.seed);

    seeds[conf] = seededTeams.map(team => ({
      name: team.name,
      seed: team.seed
    }));
  });

  return seeds;
}

/**
 * Extract standings for display with division/conference structure
 * @param {Object} standingsData - Raw standings data from API
 * @returns {Array} Array of divisions with teams
 */
export function formatStandingsForDisplay(standingsData) {
  const conferences = standingsData.content.standings.groups;
  const result = [];

  conferences.forEach(conf => {
    const confName = conf.name;
    conf.groups.forEach(division => {
      if (!division.standings || !division.standings.entries) return;

      const divisionData = {
        conference: confName,
        division: division.name,
        teams: []
      };

      division.standings.entries.forEach(teamObj => {
        const team = teamObj.team;
        const stats = teamObj.stats.reduce((acc, stat) => {
          acc[stat.name] = stat.value;
          return acc;
        }, {});

        divisionData.teams.push({
          name: team.displayName,
          wins: parseInt(stats.wins, 10) || 0,
          losses: parseInt(stats.losses, 10) || 0,
          ties: parseInt(stats.ties, 10) || 0
        });
      });

      result.push(divisionData);
    });
  });

  return result;
}

/**
 * Parse scoreboard/schedule data for a week
 * @param {Object} scoreboardData - Raw scoreboard data from API
 * @returns {Object} Parsed games with relevant info
 */
export function parseScoreboard(scoreboardData) {
  if (!scoreboardData.events) return { games: [], currentWeek: 0, nextGame: null };

  const games = scoreboardData.events.map(event => {
    const competition = event.competitions[0];
    const competitors = competition.competitors;
    const home = competitors.find(t => t.homeAway === "home");
    const away = competitors.find(t => t.homeAway === "away");

    return {
      date: event.date,
      homeTeam: home.team.displayName,
      awayTeam: away.team.displayName,
      homeScore: parseInt(home.score, 10),
      awayScore: parseInt(away.score, 10),
      status: competition.status.type.description,
      isCompleted: competition.status.type.completed
    };
  });

  const now = new Date();
  const upcoming = games.filter(g => new Date(g.date) > now).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  return {
    games,
    currentWeek: scoreboardData.week.number,
    nextGame: upcoming.length > 0 ? upcoming[0] : null
  };
}

/**
 * Determine which team won a game
 * @param {Object} game - Game object with scores
 * @returns {string|null} "home", "away", "tie", or null if not completed
 */
export function getGameWinner(game) {
  if (!game.isCompleted) return null;
  if (game.homeScore > game.awayScore) return "home";
  if (game.awayScore > game.homeScore) return "away";
  return "tie";
}
