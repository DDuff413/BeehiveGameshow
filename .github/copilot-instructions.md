# Copilot Coding Agent Instructions - BeehiveGameshow

## Repository Overview

**BeehiveGameshow** is a real-time web application for hosting interactive gameshow-style events with QR code player joining and flexible team assignment. The repository is a small-scale project (~100KB source, 365 lines of code) built with modern TypeScript-based stack.

### Technology Stack
- **Frontend**: Svelte 5 with TypeScript, Vite build tool, Socket.IO client
- **Backend**: Node.js with Express 5.x, TypeScript, Socket.IO server, QRCode generation
- **Runtime**: Node.js v20.19.6, npm 10.8.2
- **Architecture**: Single-page application with real-time WebSocket communication

## Critical Build & Runtime Information

### Environment Setup
**ALWAYS run `npm install` after cloning or when dependencies change.** Installation takes ~4 seconds and requires no special configuration.

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
# Step 1: Build frontend (ALWAYS run this first)
npm run build
```
- **What it does**: Vite builds the Svelte frontend to `dist/` directory
- **Time**: ~1 second (891ms typical)
- **Output**: dist/index.html and bundled assets
- **Warnings**: Produces two Svelte accessibility warnings (safe to ignore):
  - `a11y_label_has_associated_control` in Host.svelte:206
  - `a11y_autofocus` in Join.svelte:64

```bash
# Step 2: Start production server
npm start
```
- **What it does**: Runs `NODE_ENV=production tsx server.ts`
- **Serves**: Built frontend from dist/ on http://localhost:3000
- **CRITICAL ISSUE**: This command fails with `PathError: Missing parameter name at index 1: *` due to Express 5.x breaking change
  - **Root cause**: Line 136 in server.ts uses `app.get('*', ...)` which is no longer supported in Express 5.x
  - **Workaround**: Change `app.get('*', ...)` to `app.get('/*', ...)` when modifying production routes
  - **Only affects**: Production mode; development mode works perfectly

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

## Project Structure & Key Files

### Root Directory Files
```
├── server.ts              # Backend server (TypeScript source) - 184 lines
├── server.js              # Legacy JavaScript version (not used)
├── package.json           # Dependencies and npm scripts
├── vite.config.ts         # Vite config with dev server proxy
├── tsconfig.json          # Frontend TypeScript config (extends @tsconfig/svelte)
├── tsconfig.server.json   # Backend TypeScript config
├── tsconfig.node.json     # Node config reference
├── svelte.config.js       # Svelte preprocessor config
├── index.html             # HTML entry point (references /src/main.ts)
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
│   └── socket.ts         # Socket.IO client singleton and connection store
└── routes/
    ├── Host.svelte       # Host dashboard (206 lines) - QR code, player list, team assignment
    └── Join.svelte       # Player join page (64 lines) - name input form
```

### Public Directory (Legacy)
The `public/` folder contains older HTML/JS files (host.html, join.html, host.js, join.js, styles.css) totaling 786 lines. These appear to be legacy code and are **not used** by the current Svelte-based application. The Svelte version is the active codebase.

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

## Configuration Files Deep Dive

### vite.config.ts
- **Server**: Port 5173
- **Critical Proxy Configuration**: 
  - `/api` → `http://localhost:3000` (REST API)
  - `/socket.io` → `http://localhost:3000` with WebSocket support (`ws: true`)
- **Build**: Outputs to `dist/`, empties directory on each build

### TypeScript Configurations
- **tsconfig.json** (Frontend): Extends `@tsconfig/svelte`, targets ESNext, includes `src/**/*.ts` and `src/**/*.svelte`
- **tsconfig.server.json** (Backend): Targets ES2022, outputs to `build/`, includes only `server.ts`, excludes `dist` and `src`

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

**Error: "PathError: Missing parameter name at index 1: \*"**
- **Cause**: Express 5.x breaking change with wildcard routes
- **Location**: server.ts:136
- **Fix**: Change `app.get('*', ...)` to `app.get('/*', ...)`
- **Impact**: Only affects production mode (`npm start`)

**Error: "Cannot find module" after git pull**
- **Cause**: Dependencies not installed or outdated
- **Fix**: Run `npm install`

**Warning: "A form label must be associated with a control"**
- **Location**: Host.svelte:206
- **Impact**: Accessibility warning only, does not affect functionality
- **Action**: Can be ignored or fixed by adding `for` attribute to label

**Warning: "Avoid using autofocus"**
- **Location**: Join.svelte:64
- **Impact**: Accessibility recommendation, not a breaking issue
- **Action**: Can be ignored or removed if accessibility is a priority

### Validation Workflow
Since there are no GitHub workflows, CI builds, or automated tests, validation is manual:
1. Run `npm run dev` and verify both frontend and backend start without errors
2. Open http://localhost:5173 and verify the host dashboard loads
3. Open http://localhost:5173/join and verify the join page works
4. Test your specific changes in the browser
5. If making production changes, run `npm run build` to ensure it compiles
6. Optionally run `npx svelte-check` to check types (expect 1 error, 2 warnings)

## Important Notes for Coding Agents

1. **No Testing Infrastructure**: Do not attempt to create or run tests unless explicitly requested
2. **Legacy Public Folder**: The `public/` directory contains old code - focus on `src/` for Svelte components
3. **In-Memory Storage**: All data is volatile - server restart clears everything
4. **Express 5.x Issue**: Be aware of the wildcard route issue if modifying production server code
5. **Development First**: Always validate changes in development mode before attempting production builds
6. **Type Checking**: svelte-check will show errors, but the application works - prioritize functional testing
7. **Trust These Instructions**: This information has been validated by running all commands. Only perform additional searches if you encounter behavior that contradicts these instructions or need information not covered here.

## Quick Reference Commands

```bash
# Most common workflow
npm install              # Install deps (always first, ~4s)
npm run dev             # Start development (use this 95% of the time)

# Build validation
npm run build           # Build frontend (~1s, expect 2 warnings)
npm start               # Production server (currently broken - see notes)

# Optional checks
npx svelte-check        # Type checking (expect 1 error, 2 warnings)
npm run build:backend   # Compile server.ts (optional)
```
