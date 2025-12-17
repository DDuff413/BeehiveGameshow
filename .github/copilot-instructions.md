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

## Design Tokens System

**CRITICAL: Always use design tokens, never hard-code values**

BeehiveGameshow uses a comprehensive design token system with **113 tokens** defined in `src/lib/styles/tokens.css`. All styling must use these tokens to maintain consistency and enable future theming.

### Token Categories

- **Colors (48):** Brand, semantic, grays, text, backgrounds, borders, alpha
- **Spacing (13):** 8px-based scale from 4px to 80px
- **Typography (17):** Font sizes, weights, line heights, letter spacing
- **Shadows (8):** Elevation levels from subtle to prominent
- **Borders (6):** Border radius values
- **Transitions (4):** Animation timing
- **Z-Index (8):** Layering scale
- **Responsive (8):** Container and component max-widths

### Color Usage Rules

```css
/* ✅ GOOD - Use semantic tokens */
.button-primary {
  background: var(--color-primary);
  color: var(--color-text-primary);
}

.success-message {
  background: var(--color-success-light);
  color: var(--color-success-dark);
}

/* ❌ BAD - Never hard-code colors */
.button-primary {
  background: #ffc107;
  color: #333;
}
```

**Common Color Tokens:**

- Primary actions: `--color-primary`, `--color-primary-dark`
- Success states: `--color-success`, `--color-success-light`, `--color-success-dark`
- Errors/danger: `--color-danger`, `--color-error-bg`, `--color-error-text`, `--color-error-border`
- Text: `--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`
- Backgrounds: `--color-bg-card`, `--color-bg-primary`, `--color-bg-secondary`
- Borders: `--color-border-light`, `--color-border-medium`, `--color-border-dark`

### Spacing Usage Rules

```css
/* ✅ GOOD - Use spacing scale */
.card {
  padding: var(--space-5); /* 20px */
  margin-bottom: var(--space-4); /* 16px */
  gap: var(--space-2); /* 8px */
}

.button {
  padding: var(--space-3) var(--space-6); /* 12px 24px */
}

/* ❌ BAD - Never use arbitrary spacing */
.card {
  padding: 18px;
  margin-bottom: 15px;
  gap: 10px;
}
```

**Spacing Scale:**

- `--space-1`: 4px (tight spacing)
- `--space-2`: 8px (default gap)
- `--space-3`: 12px (small padding)
- `--space-4`: 16px (medium padding)
- `--space-5`: 20px (card padding)
- `--space-6`: 24px (large padding)
- `--space-7`: 28px (button height)
- `--space-8`: 32px (section spacing)
- `--space-10`: 40px (large sections)
- `--space-12`: 48px (extra large)

### Shadow Usage Rules

```css
/* ✅ GOOD - Use elevation scale */
.card {
  box-shadow: var(--shadow-md);
}

.card:hover {
  box-shadow: var(--shadow-lg);
}

.floating-button {
  box-shadow: var(--shadow-2xl);
}

/* ❌ BAD - Never create custom shadows */
.card {
  box-shadow: 0 3px 7px rgba(0, 0, 0, 0.12);
}
```

**Shadow Scale:**

- `--shadow-xs`: Subtle hover states
- `--shadow-sm`: Small cards
- `--shadow-md`: Standard cards
- `--shadow-lg`: Prominent elements
- `--shadow-xl`: Elevated cards
- `--shadow-2xl`: Floating elements
- `--shadow-inner`: Inset effects
- `--shadow-glow`: Active state glow

### Typography Usage Rules

```css
/* ✅ GOOD - Use typography tokens */
h1 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

p {
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
}

/* ❌ BAD - Never use arbitrary sizes */
h1 {
  font-size: 2.3rem;
  font-weight: 750;
}
```

### Responsive Breakpoints

**IMPORTANT:** Media queries cannot use CSS custom properties. Use these exact pixel values:

```css
/* Mobile */
@media (max-width: 600px) {
}

/* Tablet */
@media (max-width: 768px) {
}

/* Desktop */
@media (max-width: 1024px) {
}
```

**Container max-widths (CAN use tokens):**

```css
.content-wrapper {
  max-width: var(--container-lg); /* 1000px */
}

.qr-container {
  max-width: var(--max-width-qr); /* 256px */
}
```

### Creating New Components

When creating new components, follow these patterns:

```svelte
<style>
  .my-component {
    /* Layout & Spacing */
    padding: var(--space-4);
    margin-bottom: var(--space-6);
    gap: var(--space-2);

    /* Colors */
    background: var(--color-bg-card);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border-medium);

    /* Typography */
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);

    /* Effects */
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    transition: var(--transition-base);
  }

  .my-component:hover {
    box-shadow: var(--shadow-lg);
  }
</style>
```

### Common Patterns

**Point Control Buttons (used in PlayerDisplay & TeamCard):**

```css
.btn-point.plus {
  background: var(--color-success-light);
  color: var(--color-success-dark);
  border-radius: var(--radius-full);
  width: 28px;
  height: 28px;
}

.btn-point.minus {
  background: var(--color-danger-light);
  color: var(--color-error-text);
  border-radius: var(--radius-full);
  width: 28px;
  height: 28px;
}
```

**Error Messages:**

```css
.error-banner {
  background: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error-text);
  padding: var(--space-4);
  border-radius: var(--radius-md);
}
```

### Validation Commands

Before committing styling changes, verify no hard-coded values remain:

```bash
# Check for hex colors (should only be in tokens.css)
grep -r "#[0-9a-fA-F]\{3,6\}" src/ --include="*.svelte" --include="*.css" | grep -v "tokens.css"

# Check for rgba values (should only be in tokens.css)
grep -r "rgba\?(" src/ --include="*.svelte" --include="*.css" | grep -v "tokens.css"

# Type check
npm run check
```

### Documentation

- **Token Reference:** `docs/design-tokens.md` - Complete list of all tokens
- **Component Patterns:** `docs/component-patterns.md` - Common styling patterns and examples
- **Token File:** `src/lib/styles/tokens.css` - Token definitions

### Benefits of Token System

- **Consistency:** All components use same colors, spacing, shadows
- **Maintainability:** Change once in tokens.css, updates everywhere
- **Theming:** Future dark mode/custom themes just override tokens
- **Accessibility:** Centralized color management ensures contrast compliance
- **Developer Experience:** Semantic names self-document styling intent

## Common Workflows

1.  **Run Dev**: `npm run dev`
2.  **Verify**: Open `http://localhost:5173`.
3.  **Deploy**: Push to GitHub (connected to Vercel).
