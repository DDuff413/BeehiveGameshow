# 🐝 BeehiveGameshow

A real-time web application built with **Svelte** and **TypeScript** for hosting interactive gameshow-style events with QR code player joining and flexible team assignment.

## Features

- **QR Code Player Join**: Display a QR code that players can scan to join the game from their mobile devices
- **Real-time Updates**: Player list updates instantly via WebSocket (Socket.IO)
- **Flexible Team Assignment**:
  - **Random Shuffle**: Automatically distribute players into teams of a specified size
  - **Manual Assignment**: Manually assign players to specific teams with an intuitive interface
- **Responsive Design**: Mobile-friendly interface for both hosts and players
- **Live Team Display**: Real-time visualization of formed teams

## Technology Stack

### Frontend
- **Svelte 5**: Modern reactive framework with runes
- **TypeScript**: Type-safe development
- **Vite**: Fast development server and build tool
- **Socket.IO Client**: Real-time bidirectional communication

### Backend
- **Node.js** with **TypeScript**
- **Express**: Web server framework
- **Socket.IO**: Real-time WebSocket server
- **QRCode**: QR code generation
- **UUID**: Unique ID generation

## Installation

1. Clone the repository:
```bash
git clone https://github.com/DDuff413/BeehiveGameshow.git
cd BeehiveGameshow
```

2. Install dependencies:
```bash
npm install
```

## Development

Run both frontend and backend in development mode with hot reload:

```bash
npm run dev
```

This will start:
- Frontend (Svelte + Vite): `http://localhost:5173`
- Backend API: `http://localhost:3000`

The frontend proxies API requests to the backend automatically.

## Production Build

1. Build the frontend:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

The server will serve the built frontend and API on `http://localhost:3000`.

## Usage

### Development Mode

1. Run `npm run dev`
2. Open your browser to `http://localhost:5173` for the host dashboard
3. Players can join at `http://localhost:5173/join`

### Production Mode

1. Run `npm run build` to build the frontend
2. Run `npm start` to start the production server
3. Open `http://localhost:3000` for the host dashboard
4. Players join at `http://localhost:3000/join`

## How to Use

1. **Host** opens the dashboard and displays the QR code
2. **Players** scan the QR code or visit the join URL to enter their names
3. Players appear in real-time on the host dashboard
4. **Host** assigns teams:
   - **Random Shuffle**: Enter team size and click "Random Shuffle"
   - **Manual Assign**: Click "Manual Assign" to manually set team numbers
5. Teams are displayed for everyone to see

## Project Structure

```
BeehiveGameshow/
├── src/                    # Frontend source (Svelte + TypeScript)
│   ├── routes/            # Page components
│   │   ├── Host.svelte   # Host dashboard
│   │   └── Join.svelte   # Player join page
│   ├── lib/              # Shared utilities
│   │   ├── types.ts      # TypeScript interfaces
│   │   └── socket.ts     # Socket.IO client store
│   ├── App.svelte        # Main app with routing
│   ├── app.css           # Global styles
│   └── main.ts           # Entry point
├── server.ts              # Backend server (TypeScript)
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # Frontend TypeScript config
├── tsconfig.server.json   # Backend TypeScript config
└── package.json           # Dependencies and scripts
```

## API Endpoints

- `GET /api/qrcode` - Generate QR code for join URL
- `GET /api/players` - Get all players and teams
- `POST /api/players` - Add a new player
- `POST /api/teams/manual` - Manually assign teams
- `POST /api/teams/shuffle` - Randomly shuffle teams
- `POST /api/reset` - Reset all players and teams

## Socket.IO Events

- `playerJoined` - Emitted when a player joins
- `playersUpdated` - Emitted when player list changes
- `teamsUpdated` - Emitted when teams are assigned

## License

ISC
