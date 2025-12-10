# Copilot Coding Agent Instructions - BeehiveGameshow

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
│   ├── store.ts          # State management (Supabase Realtime)
│   ├── supabase.ts       # Supabase client initialization
│   └── types.ts          # Shared types
└── routes/
    ├── Host.svelte       # Host dashboard
    └── Join.svelte       # Player join page
```

**REMOVED**: `server.ts` and Node.js backend logic have been removed.

## Key Behavioral Notes

1.  **Supabase Realtime**: The app relies on `store.ts` to subscribe to database changes. Do not implement manual polling.
2.  **Row Level Security (RLS)**: The database currently uses "Public" policies (`using (true)`) for simplicity.
3.  **Client-Side Logic**: Team shuffling and assignments happen in the browser (`Host.svelte`) and are saved to the DB via `upsert`.

## Common Workflows

1.  **Run Dev**: `npm run dev`
2.  **Verify**: Open `http://localhost:5173`.
3.  **Deploy**: Push to GitHub (connected to Vercel).
