# 🐝 BeehiveGameshow

A real-time web application built with **Svelte** and **Supabase** for hosting interactive gameshow-style events. Players can join via QR code, and hosts can manage teams with shuffled or manual assignments.

## Features

- **QR Code Player Join**: Display a QR code that players can scan to join the game from their mobile devices
- **Real-time Updates**: Player list updates instantly via **Supabase Realtime**
- **Flexible Team Management**:
  - **Create/Edit/Delete Teams**: Manage teams with custom names through an intuitive UI
  - **Random Shuffle**: Automatically distribute players into existing teams
  - **Manual Assignment**: Manually assign players to specific teams
  - **Team Card Interface**: Edit team names, add/remove players with drag-free controls
- **Points System**:
  - **Individual Points**: Award or deduct points for individual players
  - **Team Points**: Award or deduct points for entire teams at once
  - **Real-time Updates**: Points update instantly on player dashboards
  - **Non-negative Constraint**: Points cannot drop below 0
  - **Atomic Operations**: Database-level RPC functions ensure data consistency
- **Player Dashboard**: Players can view their current points and team assignment in real-time
- **Persistent Data**: Players, teams, and points are saved to a PostgreSQL database (Supabase)
- **Responsive Design**: Mobile-friendly interface for both hosts and players

## Technology Stack

### Frontend

- **Svelte 5**: Modern reactive framework with runes
- **TypeScript**: Type-safe development
- **Vite**: Fast development server and build tool

### Backend / Data

- **Supabase**:
  - **PostgreSQL**: Persistent database
  - **Realtime**: WebSocket subscriptions for live updates
- **QRCode**: Client-side QR code generation

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

3. Configure Environment Variables:
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Development

Run the frontend in development mode with hot reload:

```bash
npm run dev
```

- Open `http://localhost:5173` for the host dashboard.
- Open `http://localhost:5173/join` to simulate a player.

## Production Build

1. Build the application:

```bash
npm run build
```

2. Preview the build locally (optional):

```bash
npm run preview
```

### Deployment

This application is a **Static Site** (SPA). You can deploy the `dist/` folder to any static hosting provider.

- **Vercel** (Recommended): Connect your GitHub repo, add your `.env` variables in Vercel settings, and deploy.
- **Netlify / Cloudflare Pages**: Same process.

## How to Use

1. **Host** opens the dashboard (`/`) and displays the QR code.
2. **Players** scan the QR code or visit the join URL (`/join`) to enter their names.
3. Players appear in real-time on the host dashboard.
4. **Host** creates teams:
   - Click "➕ Create Team" to add new teams (auto-named "Team 1", "Team 2", etc.)
   - Edit team names and manage players using the team cards (✏️ icon)
5. **Host** assigns players to teams:
   - **Random Shuffle**: Enter team size and click "🎲 Random Shuffle" to distribute players
   - **Manual Assign**: Click "✋ Manual Assign" to manually select teams for each player
   - **Team Card**: Add/remove players directly in each team's edit mode
6. **Host** manages points:
   - **Individual Points**: Use `+`/`-` buttons next to each player in team cards
   - **Team Points**: Use `+`/`-` buttons in the team card footer to award/deduct points for all team members
   - Points update in real-time on player dashboards
7. **Players** view their dashboard:
   - Navigate to `/player` to see current points and team assignment
   - Points update automatically as the host makes changes
8. **Reset**: Use the "🔄 Reset All" button to clear all players and teams from the database.

## Project Structure

```
BeehiveGameshow/
├── src/                    # Frontend source (Svelte + TypeScript)
│   ├── routes/            # Page components
│   │   ├── Host.svelte    # Host dashboard
│   │   ├── Join.svelte    # Player join page
│   │   └── Player.svelte  # Player dashboard (points & team view)
│   ├── lib/              # Shared utilities
│   │   ├── db/           # Database interactions
│   │   │   ├── supabase.ts         # Supabase client initialization
│   │   │   ├── store.ts            # State management (Supabase Realtime)
│   │   │   ├── teamOperations.ts   # Team CRUD operations
│   │   │   ├── playerOperations.ts # Player CRUD operations
│   │   │   └── pointsOperations.ts # Points update operations (RPC calls)
│   │   ├── components/   # Svelte components
│   │   │   ├── ConnectionBanner.svelte # Connection status UI
│   │   │   ├── PlayersList.svelte      # All players list
│   │   │   └── TeamCard.svelte         # Team display/edit with points controls
│   │   └── types.ts      # TypeScript interfaces
│   ├── App.svelte        # Main app with routing
│   ├── app.css           # Global styles
│   └── main.ts           # Entry point
├── supabase_schema.sql    # Database schema definition
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript config
└── package.json           # Dependencies and scripts
```
