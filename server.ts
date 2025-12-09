import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import qrcode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Player {
  id: string;
  name: string;
  team: number;
  joinedAt: string;
}

interface Team {
  teamNumber: number;
  players: Player[];
}

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server);

// Middleware
app.use(express.json());

// Serve built frontend in production, or proxy to Vite in development
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
} else {
  // Development: Vite will handle the frontend
  console.log('Development mode: Frontend served by Vite on port 5173');
}

// In-memory storage
let players: Player[] = [];
let teams: Team[] = [];

// API Routes
app.get('/api/qrcode', async (req: Request, res: Response) => {
  try {
    const joinUrl = `${req.protocol}://${req.get('host')}/join`;
    const qrCodeDataUrl = await qrcode.toDataURL(joinUrl);
    res.json({ qrCode: qrCodeDataUrl, joinUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

app.get('/api/players', (req: Request, res: Response) => {
  res.json({ players, teams });
});

app.post('/api/players', (req: Request, res: Response) => {
  const { name } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required' });
  }

  // Check if player already exists
  if (players.find(p => p.name.toLowerCase() === name.trim().toLowerCase())) {
    return res.status(400).json({ error: 'Player name already exists' });
  }

  const player: Player = {
    id: uuidv4(),
    name: name.trim(),
    team: 0,
    joinedAt: new Date().toISOString()
  };

  players.push(player);
  
  // Broadcast to all connected clients
  io.emit('playerJoined', player);
  io.emit('playersUpdated', { players, teams });

  res.json({ success: true, player });
});

app.post('/api/teams/manual', (req: Request, res: Response) => {
  const { assignments } = req.body as { assignments: Record<string, number> };
  
  players.forEach(player => {
    if (assignments[player.id] !== undefined) {
      player.team = assignments[player.id];
    }
  });

  teams = createTeamsFromPlayers();
  
  io.emit('teamsUpdated', { players, teams });
  res.json({ success: true, teams });
});

app.post('/api/teams/shuffle', (req: Request, res: Response) => {
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

app.post('/api/reset', (req: Request, res: Response) => {
  players = [];
  teams = [];
  
  io.emit('playersUpdated', { players, teams });
  res.json({ success: true });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Helper function to create teams array
function createTeamsFromPlayers(): Team[] {
  const teamsMap: Record<number, Player[]> = {};
  
  players.forEach(player => {
    if (player.team !== 0) {
      if (!teamsMap[player.team]) {
        teamsMap[player.team] = [];
      }
      teamsMap[player.team].push(player);
    }
  });

  return Object.keys(teamsMap)
    .sort((a, b) => Number(a) - Number(b))
    .map(teamNum => ({
      teamNumber: parseInt(teamNum),
      players: teamsMap[Number(teamNum)]
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
  if (process.env.NODE_ENV === 'production') {
    console.log(`App: http://localhost:${PORT}`);
  } else {
    console.log(`Frontend: http://localhost:5173`);
    console.log(`Backend API: http://localhost:${PORT}`);
  }
});

