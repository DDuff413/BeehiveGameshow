const socket = io();

let players = [];
let teams = [];
let manualAssignments = {};

// Load QR code on page load
async function loadQRCode() {
    try {
        const response = await fetch('/api/qrcode');
        const data = await response.json();
        document.getElementById('qrCode').src = data.qrCode;
        document.getElementById('joinUrl').textContent = data.joinUrl;
    } catch (error) {
        console.error('Failed to load QR code:', error);
    }
}

// Update players list
function updatePlayersList() {
    const playersList = document.getElementById('playersList');
    const playerCount = document.getElementById('playerCount');
    
    playerCount.textContent = `(${players.length})`;
    
    if (players.length === 0) {
        playersList.innerHTML = '<p class="empty-state">No players yet. Scan the QR code to join!</p>';
        document.getElementById('shuffleBtn').disabled = true;
        document.getElementById('manualAssignBtn').disabled = true;
        return;
    }
    
    document.getElementById('shuffleBtn').disabled = false;
    document.getElementById('manualAssignBtn').disabled = false;
    
    playersList.innerHTML = players.map(player => `
        <div class="player-card ${player.team ? 'assigned' : ''}">
            <span class="player-name">${escapeHtml(player.name)}</span>
            ${player.team ? `<span class="team-badge">Team ${player.team}</span>` : ''}
        </div>
    `).join('');
}

// Update teams display
function updateTeamsDisplay() {
    const teamsSection = document.getElementById('teamsSection');
    const teamsList = document.getElementById('teamsList');
    
    if (teams.length === 0) {
        teamsSection.style.display = 'none';
        return;
    }
    
    teamsSection.style.display = 'block';
    
    teamsList.innerHTML = teams.map(team => `
        <div class="team-card">
            <h3>Team ${team.teamNumber}</h3>
            <div class="team-members">
                ${team.players.map(p => `
                    <div class="team-member">${escapeHtml(p.name)}</div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Show manual assignment interface
function showManualAssignment() {
    const container = document.getElementById('manualAssignContainer');
    const playersList = document.getElementById('manualAssignPlayers');
    
    manualAssignments = {};
    players.forEach(player => {
        manualAssignments[player.id] = player.team || 0;
    });
    
    playersList.innerHTML = players.map(player => `
        <div class="assign-player-row">
            <span class="player-name">${escapeHtml(player.name)}</span>
            <div class="team-selector">
                <label>Team:</label>
                <input type="number" 
                       min="0" 
                       value="${player.team || 0}" 
                       data-player-id="${player.id}"
                       class="team-input"
                       placeholder="0 = unassigned">
            </div>
        </div>
    `).join('');
    
    container.style.display = 'block';
    
    // Add event listeners to inputs
    document.querySelectorAll('.team-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const playerId = e.target.dataset.playerId;
            const teamNum = parseInt(e.target.value) || 0;
            manualAssignments[playerId] = teamNum === 0 ? null : teamNum;
        });
    });
}

function hideManualAssignment() {
    document.getElementById('manualAssignContainer').style.display = 'none';
}

// Event Listeners
document.getElementById('shuffleBtn').addEventListener('click', async () => {
    const teamSize = parseInt(document.getElementById('teamSize').value) || 2;
    
    if (teamSize < 1) {
        alert('Team size must be at least 1');
        return;
    }
    
    try {
        const response = await fetch('/api/teams/shuffle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamSize })
        });
        
        if (!response.ok) {
            throw new Error('Failed to shuffle teams');
        }
    } catch (error) {
        console.error('Error shuffling teams:', error);
        alert('Failed to shuffle teams');
    }
});

document.getElementById('manualAssignBtn').addEventListener('click', () => {
    showManualAssignment();
});

document.getElementById('saveManualBtn').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/teams/manual', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assignments: manualAssignments })
        });
        
        if (!response.ok) {
            throw new Error('Failed to save teams');
        }
        
        hideManualAssignment();
    } catch (error) {
        console.error('Error saving teams:', error);
        alert('Failed to save teams');
    }
});

document.getElementById('cancelManualBtn').addEventListener('click', () => {
    hideManualAssignment();
});

document.getElementById('resetBtn').addEventListener('click', async () => {
    if (!confirm('Are you sure you want to reset all players and teams?')) {
        return;
    }
    
    try {
        const response = await fetch('/api/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error('Failed to reset');
        }
        
        hideManualAssignment();
    } catch (error) {
        console.error('Error resetting:', error);
        alert('Failed to reset');
    }
});

// Socket.IO listeners
socket.on('playersUpdated', (data) => {
    players = data.players;
    teams = data.teams;
    updatePlayersList();
    updateTeamsDisplay();
});

socket.on('teamsUpdated', (data) => {
    players = data.players;
    teams = data.teams;
    updatePlayersList();
    updateTeamsDisplay();
});

socket.on('playerJoined', (player) => {
    // Visual feedback
    console.log('Player joined:', player.name);
});

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize
loadQRCode();
