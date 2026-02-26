/**
 * Standings Module - Display NFL team standings by conference and division
 * Uses utilities for API, data, and DOM manipulation
 */

import { fetchStandings } from '../utils/api.js';
import { formatStandingsForDisplay } from '../utils/data.js';
import { clearElement, updateHTML } from '../utils/dom.js';

/**
 * Fetch and display current standings
 */
async function fetchAndDisplayStandings() {
  const tbody = document.getElementById('teams-tbody');
  
  try {
    const data = await fetchStandings();
    const standingsData = formatStandingsForDisplay(data);

    clearElement(tbody);

    standingsData.forEach(divisionData => {
      // Conference header
      const confRow = document.createElement('tr');
      const confCell = document.createElement('td');
      confCell.colSpan = 4;
      confCell.className = 'conference-header';
      confCell.textContent = divisionData.conference;
      confRow.appendChild(confCell);
      tbody.appendChild(confRow);

      // Division header
      const divRow = document.createElement('tr');
      const divCell = document.createElement('td');
      divCell.colSpan = 4;
      divCell.className = 'division-header';
      divCell.textContent = divisionData.division;
      divRow.appendChild(divCell);
      tbody.appendChild(divRow);

      // Team rows
      divisionData.teams.forEach(team => {
        const teamRow = document.createElement('tr');
        teamRow.innerHTML = `
          <td>${team.name}</td>
          <td>${team.wins}</td>
          <td>${team.losses}</td>
          <td>${team.ties}</td>
        `;
        tbody.appendChild(teamRow);
      });
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4">Error loading standings.</td></tr>`;
  }
}

// Initialize
fetchAndDisplayStandings();