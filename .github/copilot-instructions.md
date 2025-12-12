# Copilot Coding Agent Instructions - BeehiveGameshow

## AI Agent Workflow

**CRITICAL: Always provide a plan before taking action.**

When asked to make changes, implement features, or fix issues:

1. **Analyze First**: Read relevant files and understand the current implementation
2. **Present Plan**: Clearly outline what you'll do, which files you'll modify, and why
3. **Wait for Approval**: Get user confirmation before making changes
4. **Execute**: Only proceed with changes after approval
5. **Report Results**: Summarize what was changed and any potential impacts

**Example Response Format:**

```
I'll need to make the following changes:
1. Update `src/routes/Host.svelte` - Add new team assignment UI
2. Modify `src/lib/db/store.ts` - Add new reactive store for team state
3. Update `src/lib/types.ts` - Add TeamAssignment interface

This will affect:
- Team assignment workflow
- Real-time updates to all connected clients

Shall I proceed with these changes?
```

## Repository Overview

**BeehiveGameshow** is a real-time web application for hosting interactive gameshow-style events. It uses a serverless architecture with Supabase for data persistence and real-time updates.

### Technology Stack

- **Frontend**: Svelte 5 with TypeScript, Vite build tool
- **Data & Realtime**: Supabase (PostgreSQL + Realtime Subscriptions)
- **Architecture**: Static Single-Page Application (SPA)

## Critical Build & Runtime Information

### Environment Setup

**ALWAYS run `npm install` after cloning or when dependencies change.**

**Required Environment Variables (`.env`):**

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Build Commands

#### Development Mode (Recommended)

```bash
npm run dev
```

- **Runs**: Vite dev server (usually http://localhost:5173)
- **Status**: Backend logic is handled directly by Supabase client in the browser.

#### Production Build

```bash
npm run build
```

- **Output**: `dist/` directory containing static files.
- **Deploy**: can be deployed to Vercel, Netlify, or any static host.

### Type Checking

```bash
npm run check
```

- **Purpose**: Validates TypeScript and Svelte component types.

### Testing

**No automated tests exist.** Validation is manual.

## Project Structure

```
src/
├── main.ts               # Entry point
├── App.svelte            # Router
├── lib/
│   ├── db/              # Database interactions
│   │   ├── supabase.ts       # Supabase client initialization
│   │   ├── store.ts          # State management (Supabase Realtime)
│   │   ├── teamOperations.ts # Team CRUD operations
│   │   └── playerOperations.ts # Player CRUD operations
│   ├── components/      # Svelte components
│   │   ├── ConnectionBanner.svelte # Connection status UI
│   │   └── TeamCard.svelte         # Team display/edit component
│   └── types.ts         # Shared TypeScript interfaces
└── routes/
    ├── Host.svelte       # Host dashboard
    └── Join.svelte       # Player join page
```

**REMOVED**: `server.ts` and Node.js backend logic have been removed.

## Key Behavioral Notes

1.  **Supabase Realtime**: The app relies on `src/lib/db/store.ts` to subscribe to database changes. Do not implement manual polling.
2.  **Row Level Security (RLS)**: The database currently uses "Public" policies (`using (true)`) for simplicity.
3.  **Client-Side Logic**: Team shuffling and assignments happen in the browser (`Host.svelte`) and are saved to the DB via `upsert`.
4.  **Database Operations**: Team and player CRUD operations are centralized in `src/lib/db/teamOperations.ts` and `src/lib/db/playerOperations.ts`.
5.  **Component Organization**: UI components live in `src/lib/components/`, database logic in `src/lib/db/`, shared types at `src/lib/types.ts`.

## Context7 Documentation Validation

When implementing features or solving problems involving external libraries/frameworks (Svelte, Supabase, TypeScript, etc.):

**Always use Context7 for:**

- New feature implementations using library APIs
- Debugging library-specific issues
- Best practices for framework patterns
- Version-specific API changes
- Unfamiliar API usage or syntax

**Context7 is optional for:**

- Simple TypeScript fixes
- CSS/styling changes
- File organization/refactoring
- Custom business logic

**Workflow:**

1. Call `resolve-library-id` first to get the Context7-compatible library ID
2. Then call `get-library-docs` with relevant topic before implementing
3. Use `mode='code'` for API references and examples (default)
4. Use `mode='info'` for conceptual guides and architecture
5. **Component Organization**: UI components live in `src/lib/components/`, database logic in `src/lib/db/`, shared types at `src/lib/types.ts`.

## Common Workflows

1.  **Run Dev**: `npm run dev`
2.  **Verify**: Open `http://localhost:5173`.
3.  **Deploy**: Push to GitHub (connected to Vercel).
