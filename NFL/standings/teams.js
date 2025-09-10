// NFL Teams Standings Display
// This script fetches and displays the current NFL team standings in a structured table format.
async function fetchStandings() {
    const url = "https://cdn.espn.com/core/nfl/standings?xhr=1";
    try {
        const response = await fetch(url);
        const data = await response.json();

        const conferences = data.content.standings.groups;
        const tbody = document.getElementById('teams-tbody');
        tbody.innerHTML = '';

        conferences.forEach(conf => {
            // Conference header
            const confRow = document.createElement('tr');
            const confCell = document.createElement('td');
            confCell.colSpan = 4;
            confCell.className = 'conference-header';
            confCell.textContent = conf.name;
            confRow.appendChild(confCell);
            tbody.appendChild(confRow);

            conf.groups.forEach(div => {
                // Division header
                const divRow = document.createElement('tr');
                const divCell = document.createElement('td');
                divCell.colSpan = 4;
                divCell.className = 'division-header';
                divCell.textContent = div.name;
                divRow.appendChild(divCell);
                tbody.appendChild(divRow);

                if (!div.standings || !div.standings.entries) return;
                div.standings.entries.forEach(teamObj => {
                    const team = teamObj.team;
                    const stats = teamObj.stats.reduce((acc, stat) => {
                        acc[stat.name] = stat.value;
                        return acc;
                    }, {});
                    const teamRow = document.createElement('tr');
                    teamRow.innerHTML = `
                        <td>${team.displayName}</td>
                        <td>${parseInt(stats.wins, 10) || 0}</td>
                        <td>${parseInt(stats.losses, 10) || 0}</td>
                        <td>${parseInt(stats.ties, 10) || 0}</td>
                    `;
                    tbody.appendChild(teamRow);
                });
            });
        });
    } catch (err) {
        document.getElementById('teams-tbody').innerHTML = `<tr><td colspan="4">Error loading standings.</td></tr>`;
        console.error("Failed to fetch standings:", err);
    }
}

fetchStandings();