const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const qrcode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(express.static('public'));

// In-memory storage
let players = [];
let teams = [];


// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'host.html'));
});

app.get('/join', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'join.html'));
});

app.get('/api/qrcode', async (req, res) => {
    try {
        const joinUrl = `${req.protocol}://${req.get('host')}/join`;
        const qrCodeDataUrl = await qrcode.toDataURL(joinUrl);
        res.json({ qrCode: qrCodeDataUrl, joinUrl });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});

app.get('/api/players', (req, res) => {
    res.json({ players, teams });
});

app.post('/api/players', (req, res) => {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Name is required' });
    }

    // Check if player already exists
    if (players.find(p => p.name.toLowerCase() === name.trim().toLowerCase())) {
        return res.status(400).json({ error: 'Player name already exists' });
    }

    const player = {
        id: uuidv4(),
        name: name.trim(),
        team: null,
        joinedAt: new Date().toISOString()
    };

    players.push(player);
    
    // Broadcast to all connected clients
    io.emit('playerJoined', player);
    io.emit('playersUpdated', { players, teams });

    res.json({ success: true, player });
});

app.post('/api/teams/manual', (req, res) => {
    const { assignments } = req.body;
    // assignments: { playerId: teamNumber }
    
    players.forEach(player => {
        if (assignments[player.id] !== undefined) {
            player.team = assignments[player.id];
        }
    });

    teams = createTeamsFromPlayers();
    
    io.emit('teamsUpdated', { players, teams });
    res.json({ success: true, teams });
});

app.post('/api/teams/shuffle', (req, res) => {
    const { teamSize } = req.body;
    
    if (!teamSize || teamSize < 1) {
        return res.status(400).json({ error: 'Valid team size is required' });
    }

    // Fisher-Yates shuffle algorithm for unbiased randomization
    const shuffledPlayers = [...players];
    for (let i = shuffledPlayers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPlayers[i], shuffledPlayers[j]] = [shuffledPlayers[j], shuffledPlayers[i]];
    }
    
    // Assign teams
    shuffledPlayers.forEach((player, index) => {
        player.team = Math.floor(index / teamSize) + 1;
    });

    teams = createTeamsFromPlayers();
    
    io.emit('teamsUpdated', { players, teams });
    res.json({ success: true, teams });
});

app.post('/api/reset', (req, res) => {
    players = [];
    teams = [];
    
    io.emit('playersUpdated', { players, teams });
    res.json({ success: true });
});

// Helper function to create teams array
function createTeamsFromPlayers() {
    const teamsMap = {};
    
    players.forEach(player => {
        if (player.team !== null) {
            if (!teamsMap[player.team]) {
                teamsMap[player.team] = [];
            }
            teamsMap[player.team].push(player);
        }
    });

    return Object.keys(teamsMap).sort((a, b) => a - b).map(teamNum => ({
        teamNumber: parseInt(teamNum),
        players: teamsMap[teamNum]
    }));
}

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('Client connected');
    
    // Send current state to newly connected client
    socket.emit('playersUpdated', { players, teams });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Host page: http://localhost:${PORT}`);
    console.log(`Join page: http://localhost:${PORT}/join`);
});
