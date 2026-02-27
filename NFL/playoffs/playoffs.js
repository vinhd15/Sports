/**
 * Playoff Bracket Simulator Module
 * Interactive bracket with manual winner selection and automatic advancement
 * Uses utilities for API and data management
 */

import { fetchStandings } from '../utils/api.js';
import { extractPlayoffSeeds } from '../utils/data.js';
import { PLAYOFF_CONFIG } from '../utils/constants.js';

let seeds = { AFC: [], NFC: [] };
let bracket = {};

/**
 * Fetch playoff seeds from standings
 */
async function fetchSeeds() {
  try {
    const data = await fetchStandings();
    seeds = extractPlayoffSeeds(data);
  } catch (err) {
    console.error('Error fetching seeds', err);
    // Fallback to placeholder seeds
    const placeholders = Array.from({ length: PLAYOFF_CONFIG.PLAYOFF_SEEDS }, (_, i) => ({
      name: `#${i + 1} Seed`,
      seed: i + 1
    }));
    seeds = { AFC: placeholders, NFC: placeholders };
  }
}

/**
 * Initialize bracket structure with seeds and matchups
 */
function initBracket() {
  bracket = {
    AFC: { wildcard: [], wildcardWinners: [], divisional: [], conference: [] },
    NFC: { wildcard: [], wildcardWinners: [], divisional: [], conference: [] },
    superbowl: [{ a: null, b: null, winner: null }]
  };

  PLAYOFF_CONFIG.CONFERENCES.forEach(conf => {
    const s = seeds[conf] || [];
    
    // Ensure at least 7 placeholder seeds
    while (s.length < PLAYOFF_CONFIG.PLAYOFF_SEEDS) {
      s.push({ name: `#${s.length + 1}`, seed: s.length + 1 });
    }

    // Wildcard matchups: 2-7, 3-6, 4-5
    bracket[conf].wildcard = [
      { a: s[1], b: s[6], winner: null },
      { a: s[2], b: s[5], winner: null },
      { a: s[3], b: s[4], winner: null }
    ];

    // Divisional round: #1 bye + two wildcard winners
    bracket[conf].divisional = [
      { a: s[0], b: null, winner: null },
      { a: null, b: null, winner: null }
    ];

    // Conference championship
    bracket[conf].conference = [{ a: null, b: null, winner: null }];
  });
}

/**
 * Generate HTML for a matchup
 */
function renderMatch(match, conf, round, index) {
  const aName = match.a ? `${match.a.seed}. ${match.a.name}` : '';
  const bName = match.b ? `${match.b.seed}. ${match.b.name}` : '';
  const aClass = match.b ? 'team' : 'team bye';
  const bClass = match.a ? 'team' : 'team bye';
  const aSelected = match.winner && match.winner === match.a ? 'selected' : '';
  const bSelected = match.winner && match.winner === match.b ? 'selected' : '';

  return `
    <div class="match" data-conf="${conf}" data-round="${round}" data-index="${index}">
      <span class="${aClass} ${aSelected}" data-side="a">${aName}</span>
      <span class="${bClass} ${bSelected}" data-side="b">${bName}</span>
    </div>
  `;
}

/**
 * Render entire bracket
 */
function render() {
  let html = `<div class="bracket-wrapper">`;

  // Render AFC (left side)
  html += `<div class="conf-bracket afc">`;
  html += `<h2>AFC</h2>`;
  html += `<div class="bracket-rounds">`;
  
  ['wildcard', 'divisional', 'conference'].forEach(round => {
    html += `<div class="round">`;
    html += `<h3>${round.charAt(0).toUpperCase() + round.slice(1)}</h3>`;
    html += `<div class="matches">`;
    bracket['AFC'][round].forEach((match, i) => {
      html += renderMatch(match, 'AFC', round, i);
    });
    html += `</div></div>`;
  });
  
  html += `</div></div>`;

  // Render Super Bowl (middle)
  html += `<div class="superbowl-container">`;
  html += `<div class="superbowl-content">`;
  html += `<h2>Super Bowl</h2>`;
  html += `<div class="matches">`;
  bracket.superbowl.forEach((match, i) => {
    html += renderMatch(match, 'SB', 'superbowl', i);
  });
  html += `</div>`;
  html += `<button id="reset-btn">Reset Bracket</button>`;
  html += `</div></div>`;

  // Render NFC (right side)
  html += `<div class="conf-bracket nfc">`;
  html += `<h2>NFC</h2>`;
  html += `<div class="bracket-rounds">`;
  
  ['wildcard', 'divisional', 'conference'].forEach(round => {
    html += `<div class="round">`;
    html += `<h3>${round.charAt(0).toUpperCase() + round.slice(1)}</h3>`;
    html += `<div class="matches">`;
    bracket['NFC'][round].forEach((match, i) => {
      html += renderMatch(match, 'NFC', round, i);
    });
    html += `</div></div>`;
  });
  
  html += `</div></div></div>`;

  document.getElementById('bracket').innerHTML = html;
  attachHandlers();

  // make sure reset button works after every render
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      initBracket();
      render();
    });
  }
}

/**
 * Attach click handlers to team selections
 */
function attachHandlers() {
  document.querySelectorAll('.team').forEach(el => {
    el.addEventListener('click', () => {
      const matchEl = el.closest('.match');
      const conf = matchEl.dataset.conf;
      const round = matchEl.dataset.round;
      const idx = parseInt(matchEl.dataset.index, 10);
      const side = el.dataset.side;

      const match = conf === 'SB' ? bracket.superbowl[idx] : bracket[conf][round][idx];
      const winner = match[side];

      if (!winner) return;
      match.winner = winner;
      advance(conf, round, idx, winner);
      render();
    });
  });
}

/**
 * Advance winner to next round and set up future matchups
 */
function advance(conf, round, idx, winner) {
  if (round === 'wildcard') {
    bracket[conf].wildcard[idx].winner = winner;
    bracket[conf].wildcardWinners = bracket[conf].wildcard
      .map(m => m.winner)
      .filter(Boolean);

    // When all three wildcard winners decided, arrange divisional pairings
    if (bracket[conf].wildcardWinners.length === 3) {
      const winners = bracket[conf].wildcardWinners.slice();
      winners.sort((a, b) => a.seed - b.seed);

      const lowest = winners[2];
      const others = winners.slice(0, 2);

      bracket[conf].divisional[0].b = lowest;
      bracket[conf].divisional[1].a = others[0];
      bracket[conf].divisional[1].b = others[1];
    } else {
      bracket[conf].divisional[0].b = null;
      bracket[conf].divisional[1].a = null;
      bracket[conf].divisional[1].b = null;
    }
  } else if (round === 'divisional') {
    bracket[conf].divisional[idx].winner = winner;
    if (idx === 0) {
      bracket[conf].conference[0].a = winner;
    } else if (idx === 1) {
      bracket[conf].conference[0].b = winner;
    }
  } else if (round === 'conference') {
    bracket[conf].conference[idx].winner = winner;
    if (conf === 'AFC') bracket.superbowl[0].a = winner;
    else if (conf === 'NFC') bracket.superbowl[0].b = winner;
  } else if (round === 'superbowl') {
    alert(`Champion: ${winner.name}`);
  }
}

/**
 * Initialize bracket and render
 */
async function init() {
  await fetchSeeds();
  initBracket();
  render();

  // Reset button
  document.getElementById('reset-btn').addEventListener('click', () => {
    initBracket();
    render();
  });
}

init();
