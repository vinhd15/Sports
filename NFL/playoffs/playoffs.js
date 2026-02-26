// play-offs bracket simulator with manual winner selection
let seeds = { AFC: [], NFC: [] };
let bracket = {};

// retrieve playoff seeds from standings endpoint
async function fetchSeeds() {
    const url = "https://cdn.espn.com/core/nfl/standings?xhr=1";
    try {
        const response = await fetch(url);
        const data = await response.json();
        const confs = data.content.standings.groups;
        confs.forEach(conf => {
            const teams = [];
            conf.groups.forEach(div => {
                if (div.standings && div.standings.entries) {
                    div.standings.entries.forEach(e => {
                        teams.push({
                            name: e.team.displayName,
                            seed: e.team.seed
                        });
                    });
                }
            });
            // sort by seed number to get seeded order
            teams.sort((a, b) => (a.seed || 999) - (b.seed || 999));
            // take top 7 seeds
            const abb = conf.name.includes('American') ? 'AFC' : 'NFC';
            seeds[abb] = teams.slice(0, 7);
        });
    } catch (err) {
        console.error('Error fetching seeds', err);
        // fallback to placeholders
        seeds = { AFC: [
            {name:'#1 Bye',seed:1},{name:'#2 Seed',seed:2},{name:'#3 Seed',seed:3},
            {name:'#4 Seed',seed:4},{name:'#5 Seed',seed:5},{name:'#6 Seed',seed:6},{name:'#7 Seed',seed:7}
        ], NFC: [
            {name:'#1 Bye',seed:1},{name:'#2 Seed',seed:2},{name:'#3 Seed',seed:3},
            {name:'#4 Seed',seed:4},{name:'#5 Seed',seed:5},{name:'#6 Seed',seed:6},{name:'#7 Seed',seed:7}
        ] };
    }
}

function initBracket() {
    bracket = {
        AFC: { wildcard: [], wildcardWinners: [], divisional: [], conference: [] },
        NFC: { wildcard: [], wildcardWinners: [], divisional: [], conference: [] },
        superbowl: [{a: null, b: null, winner: null}]
    };

    ["AFC", "NFC"].forEach(conf => {
        const s = seeds[conf] || [];
        // ensure at least 7 placeholder seeds
        while (s.length < 7) s.push({name:`#${s.length+1}`, seed:s.length+1});
        // wildcard matchups: 2-7, 3-6, 4-5
        bracket[conf].wildcard = [
            {a: s[1], b: s[6], winner: null},
            {a: s[2], b: s[5], winner: null},
            {a: s[3], b: s[4], winner: null}
        ];
        // divisional round slots: first slot reserved for #1 bye
        bracket[conf].divisional = [
            {a: s[0], b: null, winner: null},
            {a: null, b: null, winner: null}
        ];
        // conference championship slot
        bracket[conf].conference = [{a: null, b: null, winner: null}];
    });
}

// load seeds and then start rendering
fetchSeeds().then(() => {
    initBracket();
    render();
});

// remove old initialization lines at bottom


function render() {
    let html = "";
    ["AFC", "NFC"].forEach(conf => {
        html += `<div class=\"conference\"><h2>${conf}</h2>`;
        ["wildcard", "divisional", "conference"].forEach(round => {
            html += `<div class=\"round\"><h3>${round.charAt(0).toUpperCase() + round.slice(1)}</h3>`;
            bracket[conf][round].forEach((match, i) => {
                const aName = match.a ? `${match.a.seed}. ${match.a.name}` : '';
                const bName = match.b ? `${match.b.seed}. ${match.b.name}` : '';
                html += `<div class=\"match\" data-conf=\"${conf}\" data-round=\"${round}\" data-index=\"${i}\">`;
                const aClass = match.b ? 'team' : 'team bye';
                const bClass = match.a ? 'team' : 'team bye';
                html += `<span class=\"${aClass}\" data-side=\"a\">${aName}</span>`;
                html += `<span class=\"vs\">vs</span>`;
                html += `<span class=\"${bClass}\" data-side=\"b\">${bName}</span>`;
                html += `</div>`;
            });
            html += `</div>`;
        });
        html += `</div>`;
    });

    // super bowl
    html += `<div class=\"conference\"><h2>Super Bowl</h2>`;
    bracket.superbowl.forEach((match, i) => {
        const aName = match.a ? `${match.a.seed}. ${match.a.name}` : '';
        const bName = match.b ? `${match.b.seed}. ${match.b.name}` : '';
        html += `<div class=\"match\" data-conf=\"SB\" data-round=\"superbowl\" data-index=\"${i}\">`;
        html += `<span class=\"team\" data-side=\"a\">${aName}</span>`;
        html += `<span class=\"vs\">vs</span>`;
        html += `<span class=\"team\" data-side=\"b\">${bName}</span>`;
        html += `</div>`;
    });
    html += `</div>`;

    document.getElementById('bracket').innerHTML = html;
    attachHandlers();
}

function attachHandlers() {
    document.querySelectorAll('.team').forEach(el => {
        el.addEventListener('click', () => {
            const matchEl = el.closest('.match');
            const conf = matchEl.dataset.conf;
            const round = matchEl.dataset.round;
            const idx = parseInt(matchEl.dataset.index, 10);
            const side = el.dataset.side;
            const match = (conf === 'SB') ? bracket.superbowl[idx] : bracket[conf][round][idx];
            const winner = match[side];
            if (!winner) return;
            match.winner = winner;
            advance(conf, round, idx, winner);
            render();
        });
    });
}

function advance(conf, round, idx, winner) {
    if (round === 'wildcard') {
        // store winner in match object
        bracket[conf].wildcard[idx].winner = winner;
        // recompute winners list (handles changes)
        bracket[conf].wildcardWinners = bracket[conf].wildcard.map(m => m.winner).filter(Boolean);
        // once all three winners decided, arrange divisional pairings
        if (bracket[conf].wildcardWinners.length === 3) {
            const winners = bracket[conf].wildcardWinners.slice();
            // sort ascending by seed number (lower seed is better)
            winners.sort((a,b)=>a.seed - b.seed);
            // lowest remaining seed means highest number
            const lowest = winners[2];
            const others = winners.slice(0,2);
            // slot 0: #1 bye vs lowest
            bracket[conf].divisional[0].b = lowest;
            // slot 1: the other two winners
            bracket[conf].divisional[1].a = others[0];
            bracket[conf].divisional[1].b = others[1];
        } else {
            // if not all winners yet, clear divisional opponents (keep #1 by itself)
            bracket[conf].divisional[0].b = null;
            bracket[conf].divisional[1].a = null;
            bracket[conf].divisional[1].b = null;
        }
    } else if (round === 'divisional') {
        const w = winner;
        bracket[conf].divisional[idx].winner = w;
        if (idx === 0) {
            bracket[conf].conference[0].a = w;
        } else if (idx === 1) {
            bracket[conf].conference[0].b = w;
        }
    } else if (round === 'conference') {
        if (conf === 'AFC') bracket.superbowl[0].a = winner;
        else if (conf === 'NFC') bracket.superbowl[0].b = winner;
        bracket[conf].conference[idx].winner = winner;
    } else if (round === 'superbowl') {
        alert(`Champion: ${winner.name}`);
    }
}

// reset button
document.getElementById('reset-btn').addEventListener('click', () => {
    initBracket();
    render();
});
