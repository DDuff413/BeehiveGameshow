# Copilot Coding Agent Instructions - BeehiveGameshow

## Repository Overview

**BeehiveGameshow** is a real-time web application for hosting interactive gameshow-style events with QR code player joining and flexible team assignment. Built with modern TypeScript stack and enhanced Socket.IO error handling.

### Technology Stack

- **Frontend**: Svelte 5 with TypeScript, Vite build tool, Socket.IO client with reconnection logic
- **Backend**: Node.js with Express 5.x, TypeScript, Socket.IO server, QRCode generation
- **Runtime**: Node.js v20.19+ or v22.12+ (currently v20.19.6 ✅)
- **Architecture**: Single-page application with real-time WebSocket communication and error resilience

## Critical Build & Runtime Information

### Environment Setup

**ALWAYS run `npm install` after cloning or when dependencies change.** Installation takes ~4 seconds.

### Build Commands (In Order)

#### Development Mode (Recommended for Testing Changes)

```bash
npm run dev
```

- **What it does**: Runs frontend (Vite on port 5173) and backend (tsx watch on port 3000) concurrently with hot reload
- **When to use**: Always use this for development and testing code changes
- **Access points**:
  - Frontend/Host dashboard: http://localhost:5173
  - Player join page: http://localhost:5173/join
  - Backend API: http://localhost:3000
- **Time**: Starts in ~2-3 seconds
- **Note**: Frontend proxies API requests to backend automatically (see vite.config.ts)

Individual development commands (if needed):

```bash
npm run dev:backend  # Backend only - runs 'tsx watch server.ts'
npm run dev:frontend # Frontend only - runs 'vite'
```

#### Production Build

```bash
# Step 1: Build frontend
npm run build
```

- **Output**: dist/index.html and bundled assets
- **Warnings**: Two accessibility warnings (non-blocking)

```bash
# Step 2: Start production server
npm start
```

- **What it does**: Runs `NODE_ENV=production tsx server.ts`
- **Serves**: Built frontend from dist/ on http://localhost:3000

#### Backend TypeScript Compilation (Optional)

```bash
npm run build:backend
```

- **What it does**: Compiles server.ts to build/server.js using `tsc -p tsconfig.server.json`
- **When to use**: Only if you need to check TypeScript compilation without running
- **Note**: Production uses `tsx` directly, so this step is not required for normal builds

### Type Checking

```bash
npx svelte-check --threshold warning
```

- **Purpose**: Validates TypeScript and Svelte component types
- **Known issues**:
  - Error in Host.svelte:16 - onMount async return type (can be ignored, code works)
  - Two accessibility warnings (same as build warnings)
- **Status**: Returns exit code 1 but application functions correctly

### Testing

**No test infrastructure exists.** The command `npm test` will exit with error. Do not attempt to run tests.

### Socket.IO Error Handling

**Enhanced reconnection logic** - see `test-socket-error-handling.md` for implementation details:

- Automatic reconnection (5 attempts, exponential backoff)
- Visual connection status banners (error/reconnecting states)
- API call protection when disconnected
- New stores: `socketError`, `socketReconnecting` in `src/lib/socket.ts`

## Project Structure & Key Files

### Root Directory Files

```
├── server.ts              # Backend server (TypeScript source)
├── package.json           # Dependencies and npm scripts
├── vite.config.ts         # Vite config with dev server proxy
├── tsconfig.json          # Frontend TypeScript config (extends @tsconfig/svelte)
├── tsconfig.server.json   # Backend TypeScript config
├── tsconfig.node.json     # Node config reference
├── svelte.config.js       # Svelte preprocessor config
├── index.html             # HTML entry point (references /src/main.ts)
├── test-socket-error-handling.md  # Socket.IO enhancement documentation
├── .gitignore            # Excludes: node_modules, dist, build, .vite, logs
└── README.md             # Comprehensive usage documentation
```

### Source Code Organization

```
src/
├── main.ts               # Entry point - mounts App.svelte
├── App.svelte            # Router (simple path-based: /join or default)
├── app.css               # Global styles
├── lib/
│   ├── types.ts          # TypeScript interfaces (Player, Team, PlayersUpdateData)
│   └── socket.ts         # Socket.IO client singleton with error handling and reconnection
└── routes/
    ├── Host.svelte       # Host dashboard - QR code, player list, team assignment
    └── Join.svelte       # Player join page - name input form
```

**REMOVED**: Legacy `public/` folder and `server.js` have been cleaned up - focus only on TypeScript/Svelte implementation.

### Backend Architecture

- **Data Storage**: In-memory (arrays) - no database
  - `players: Player[]` - all registered players
  - `teams: Team[]` - computed teams from player assignments
- **API Endpoints** (all under `/api`):
  - `GET /api/qrcode` - Generate QR code for join URL
  - `GET /api/players` - Get all players and teams
  - `POST /api/players` - Add new player
  - `POST /api/teams/manual` - Manually assign teams
  - `POST /api/teams/shuffle` - Random shuffle with Fisher-Yates algorithm
  - `POST /api/reset` - Clear all data
- **Socket.IO Events**:
  - `playerJoined` - Emitted when player joins
  - `playersUpdated` - Emitted when player list changes
  - `teamsUpdated` - Emitted when teams are assigned

## Common Workflows & Pitfalls

### Making Code Changes

1. **Always** start with `npm run dev` to test changes in real-time
2. Frontend changes: Edit files in `src/` - Vite hot reload applies instantly
3. Backend changes: Edit `server.ts` - tsx watch restarts server automatically
4. Verify changes work in development before building for production

### Adding Dependencies

- Run `npm install <package>` - this automatically updates package.json and package-lock.json
- Development dependencies: Use `npm install -D <package>`
- After adding deps, test with `npm run dev` to ensure compatibility

### Common Errors & Solutions

**Error: "Cannot find module" after git pull**

- **Cause**: Dependencies not installed or outdated
- **Fix**: Run `npm install`

**Warning: "A form label must be associated with a control"**

- **Location**: Host.svelte:206
- **Impact**: Affects screen reader users; does not break functionality but reduces accessibility
- **Recommended fix**: Add `for` attribute to label or wrap input with label
- **Action**: Should be fixed when working on accessibility improvements

**Warning: "Avoid using autofocus"**

- **Location**: Join.svelte:64
- **Impact**: Can be disorienting for keyboard users; does not break functionality
- **Recommended fix**: Remove autofocus attribute or implement more accessible focus management
- **Action**: Should be fixed when working on accessibility improvements

### Validation Workflow

Since there are no automated tests, validation is manual:

1. Run `npm run dev` and test functionality
2. For production changes, verify `npm run build && npm start` works
3. Optionally run `npx svelte-check` (expect 1 error, 2 warnings)

## Important Notes for Coding Agents

1. **No Testing Infrastructure**: Do not attempt to create or run tests unless explicitly requested
2. **Legacy Public Folder**: The `public/` directory has been removed - focus on `src/` for Svelte components
3. **In-Memory Storage**: All data is volatile - server restart clears everything
4. **Development First**: Always validate changes in development mode before attempting production builds
5. **Type Checking**: svelte-check will show errors, but the application works - prioritize functional testing
6. **Trust These Instructions**: This information has been validated by running all commands. Only perform additional searches if you encounter behavior that contradicts these instructions or need information not covered here.

## Quick Reference Commands

```bash
# Most common workflow
npm install              # Install deps (always first, ~4s)
npm run dev             # Start development (use this 95% of the time)

# Build validation
npm run build           # Build frontend (~1s, expect 2 warnings)
npm start               # Production server

# Optional checks
npx svelte-check        # Type checking (expect 1 error, 2 warnings)
npm run build:backend   # Compile server.ts (optional)
```

## GitHub PR Summary Guidelines

When generating pull request summaries in the GitHub web interface, always structure them as follows:

### 1. Changes Summary

Start with a bulleted list of all modified files and the reason for each change:

- `src/routes/Host.svelte` - Enhanced team assignment UI with drag-and-drop functionality
- `server.ts` - Added new API endpoint for real-time team updates
- `package.json` - Updated dependency versions for security patches

### 2. Significant Changes Detail

Provide detailed explanations for the most important changes:

**Enhanced Team Assignment UI**

- Implemented drag-and-drop interface using Svelte actions
- Added visual feedback for valid drop zones
- Maintains existing keyboard accessibility

**Real-time Team Updates**

- New WebSocket event `teamMemberMoved` for instant UI updates
- Backwards compatible with existing team assignment methods

### 3. Testing Performed

Outline manual testing completed (since no automated tests exist):

- ✅ Verified drag-and-drop works on desktop browsers (Chrome, Firefox, Safari)
- ✅ Confirmed keyboard navigation still functions for accessibility
- ✅ Tested with multiple concurrent users via `npm run dev`
- ✅ Validated production build with `npm run build && npm start`
- ✅ Checked Socket.IO reconnection scenarios

### 4. Potential Issues

List possible problems that could arise from these changes:

- **Mobile Compatibility**: Drag-and-drop may not work on all mobile devices
- **Performance**: Large player lists (>50) may experience lag during drag operations
- **Socket.IO**: Network issues during drag could leave UI in inconsistent state
- **Browser Support**: Older browsers may not support modern drag-and-drop APIs
- **Race Conditions**: Simultaneous team assignments by multiple hosts could conflict
