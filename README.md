# 🐝 BeehiveGameshow

A real-time web application for hosting interactive gameshow-style events with QR code player joining and flexible team assignment.

## Features

- **QR Code Player Join**: Display a QR code that players can scan to join the game from their mobile devices
- **Real-time Updates**: Player list updates instantly via WebSocket (Socket.IO)
- **Flexible Team Assignment**:
  - **Random Shuffle**: Automatically distribute players into teams of a specified size
  - **Manual Assignment**: Manually assign players to specific teams with an intuitive interface
- **Responsive Design**: Mobile-friendly interface for both hosts and players
- **Live Team Display**: Real-time visualization of formed teams

## Screenshots

### Host Dashboard
![Host Dashboard](https://github.com/user-attachments/assets/5e937331-008e-4c78-b3cb-0ab81a629de8)

### Player Join Page
![Player Join](https://github.com/user-attachments/assets/b6ea26c9-3608-4963-9d48-4c50f5b19f7c)

### Teams Display
![Teams](https://github.com/user-attachments/assets/f3996254-1666-47b8-a58f-3afbed390fd8)

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

## Usage

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
   - **Host Dashboard**: `http://localhost:3000`
   - **Player Join**: `http://localhost:3000/join`

3. As the host, display the QR code from the dashboard

4. Players scan the QR code or visit the join URL to enter their names

5. Once players have joined, use the team assignment options:
   - **Random Shuffle**: Enter team size and click "Random Shuffle"
   - **Manual Assign**: Click "Manual Assign" to manually set team numbers for each player

## Technology Stack

- **Backend**: Node.js, Express
- **Real-time Communication**: Socket.IO
- **QR Code Generation**: qrcode library
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **ID Generation**: UUID

## API Endpoints

- `GET /` - Host dashboard
- `GET /join` - Player join page
- `GET /api/qrcode` - Generate QR code
- `GET /api/players` - Get all players and teams
- `POST /api/players` - Add a new player
- `POST /api/teams/manual` - Manually assign teams
- `POST /api/teams/shuffle` - Randomly shuffle teams
- `POST /api/reset` - Reset all players and teams

## License

ISC
