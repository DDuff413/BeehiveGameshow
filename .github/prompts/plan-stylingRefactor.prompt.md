# Styling Refactor with Design Tokens System

## Executive Summary

**Status:** Component extraction complete (~250 lines eliminated), but significant styling inconsistencies remain

**Key Findings:**

- **76 instances** of hard-coded color values across components
- **Inconsistent color palette:** Same colors defined multiple ways (#4caf50 vs var(--success-color))
- **Shadow inconsistency:** 12+ different shadow definitions
- **Spacing chaos:** Mix of px, rem, and arbitrary values
- **Typography gaps:** Font sizes range from 0.8rem to 4rem with no system

**Impact:** Difficult to maintain, impossible to theme, accessibility concerns

## Current State Analysis

### CSS Variables (app.css)

**Defined tokens:**

- Colors: `--primary-color`, `--secondary-color`, `--accent-color`, `--text-color`, `--bg-color`, `--card-bg`, `--border-color`, `--success-color`, `--danger-color`, `--warning-color`, `--info-color`
- Shadow: `--shadow` (single value only)

**Missing tokens:**

- No spacing scale
- No typography scale
- No shadow levels (only one shadow defined)
- No border-radius scale
- No transition timing values
- No neutral gray palette
- No disabled/muted color states

### Hard-Coded Color Audit (76 instances found)

**PlayerDisplay.svelte (14 instances):**

- `#e8f5e9`, `#2e7d32` (light green, dark green - duplicated in TeamCard)
- `#ffebee`, `#c62828` (light red, dark red - duplicated in TeamCard)
- `#eee`, `#999`, `#666` (grays - used inconsistently throughout)
- `rgba(0,0,0,0.05)`, `rgba(0,0,0,0.1)`, `rgba(0,0,0,0.15)` (shadows)
- `rgba(76,175,80,0.1)` (success color with alpha)
- `rgba(255,0,0,0.1)` (danger color with alpha)

**TeamCard.svelte (28 instances):**

- `#333`, `#555`, `#666`, `#999` (text grays - 4 different shades)
- `#f0f0f0`, `#eee`, `#ccc` (background grays - 3 different shades)
- `#4caf50`, `#45a049` (success green + hover - duplicates var(--success-color))
- `#757575`, `#616161` (gray buttons)
- `#ffebee`, `#c62828`, `#ef5350` (error reds - 3 shades!)
- `#e8f5e9`, `#2e7d32` (success greens - duplicated from PlayerDisplay)

**Leaderboard.svelte (6 instances):**

- `#666`, `#999` (text grays - duplicated)
- `rgba(255,193,7,0.3)` (primary color shadow)
- `rgba(0,0,0,0.2)`, `rgba(255,255,255,0.95)` (overlays)
- `rgba(0,0,0,0.15)` (shadow)

**Player.svelte (4 instances):**

- `rgba(0,0,0,0.1)`, `rgba(0,0,0,0.2)` (shadows/backgrounds)
- `rgba(0,0,0,0.15)` (shadow)

**ErrorBanner.svelte (5 instances):**

- `#fee`, `#fcc`, `#c33` (error colors - completely different from danger-color!)

**ConnectionBanner.svelte (4 instances):**

- `#dc3545` (error - different from var(--danger-color)!)
- `#ffc107`, `#000` (warning colors)

**PageHeader.svelte, QRCodeSection.svelte (2 instances each):**

- `#666` (text gray - duplicated everywhere)

**app.css (14 instances):**

- `#e8f5e9` (assigned player background - hardcoded!)
- `#999` (empty state text)
- Various rgba shadows
- `#9c27b0`, `#7b1fa2` (btn-secondary purple - not in tokens!)
- `#45a049`, `#da190b` (hover states)
- `#e0e0e0`, `#bdbdbd` (btn-small grays)

### Shadow Audit (12+ different definitions)

**Current shadows found:**

- `0 2px 8px rgba(0,0,0,0.1)` (var(--shadow) in app.css)
- `0 1px 3px rgba(0,0,0,0.05)` (leaderboard-row)
- `0 2px 4px rgba(0,0,0,0.15)` (rank-badge)
- `0 4px 6px rgba(0,0,0,0.1)` (Player.svelte)
- `0 4px 8px rgba(0,0,0,0.15)` (btn hover)
- `0 4px 12px rgba(0,0,0,0.15)` (nav-link hover)
- `0 2px 8px rgba(255,193,7,0.3)` (mode-chip active)
- `inset 0 2px 4px rgba(255,255,255,0.3)` (progress-bar)
- `0 2px 4px rgba(0,0,0,0.1)` (btn default)
- Plus more in app.css

### Spacing Audit

**Found values (no system):**

- Padding: `2px`, `3px`, `4px`, `6px`, `8px`, `10px`, `12px`, `15px`, `16px`, `20px`, `24px`, `30px`, `40px`, `60px`, `80px`
- Margin: `5px`, `8px`, `10px`, `15px`, `20px`, `30px`, `0.5rem`, `1rem`, `1.5rem`, `2rem`
- Gap: `4px`, `6px`, `8px`, `10px`, `12px`, `15px`, `20px`, `30px`, `0.5rem`

**Issues:**

- Mix of px and rem units
- No consistent scale
- Arbitrary values

### Typography Audit

**Font sizes found:**

- `0.8rem`, `0.85rem`, `0.9rem`, `0.95rem`, `1rem`, `1.1rem`, `1.2rem`, `1.3rem`, `1.4rem`, `1.5rem`, `2rem`, `2.5rem`, `4rem`

**Font weights:**

- `400`, `500`, `600`, `700`, `800`, `bold`

**Issues:**

- No scale/system
- Inconsistent weight usage
- No line-height tokens

## Objective

Create a comprehensive design tokens system and refactor all components to use standardized styling patterns for consistency, maintainability, and future theming capabilities

## Phase 1: Create Design Tokens System

### 1.1 Create `src/lib/styles/tokens.css`

```css
/* ============================================
   DESIGN TOKENS - BeehiveGameshow
   ============================================ */

/* Color Palette */
:root {
  /* Brand Colors */
  --color-primary: #ffc107;
  --color-primary-light: #ffd54f;
  --color-primary-dark: #ff9800;

  /* Semantic Colors */
  --color-success: #4caf50;
  --color-success-light: #e8f5e9;
  --color-success-dark: #45a049;

  --color-danger: #f44336;
  --color-danger-light: #ffebee;
  --color-danger-dark: #da190b;

  --color-warning: #ff9800;
  --color-info: #2196f3;

  /* Neutral Colors (Grays) */
  --color-gray-50: #fafafa;
  --color-gray-100: #f5f5f5;
  --color-gray-200: #eeeeee;
  --color-gray-300: #e0e0e0;
  --color-gray-400: #bdbdbd;
  --color-gray-500: #9e9e9e;
  --color-gray-600: #757575;
  --color-gray-700: #616161;
  --color-gray-800: #424242;
  --color-gray-900: #212121;

  /* Text Colors */
  --color-text-primary: #333333;
  --color-text-secondary: #666666;
  --color-text-tertiary: #999999;
  --color-text-disabled: #bdbdbd;
  --color-text-inverse: #ffffff;

  /* Background Colors */
  --color-bg-primary: #fff8e1;
  --color-bg-secondary: #fff9c4;
  --color-bg-card: #ffffff;
  --color-bg-overlay: rgba(0, 0, 0, 0.5);
  --color-bg-input: #f0f0f0;

  /* Border Colors */
  --color-border-light: #ffe082;
  --color-border-medium: #cccccc;
  --color-border-dark: #999999;

  /* State Colors with Alpha */
  --color-success-alpha-10: rgba(76, 175, 80, 0.1);
  --color-danger-alpha-10: rgba(255, 0, 0, 0.1);
  --color-overlay-dark: rgba(255, 255, 255, 0.9);
  --color-overlay-light: rgba(255, 255, 255, 0.95);

  /* Component-Specific Colors */
  --color-error-bg: #ffebee;
  --color-error-border: #ef5350;
  --color-error-text: #c62828;

  /* Spacing Scale (8px base) */
  --space-0: 0;
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */
  --space-20: 5rem; /* 80px */

  /* Typography Scale */
  --font-size-xs: 0.75rem; /* 12px */
  --font-size-sm: 0.875rem; /* 14px */
  --font-size-base: 1rem; /* 16px */
  --font-size-lg: 1.125rem; /* 18px */
  --font-size-xl: 1.25rem; /* 20px */
  --font-size-2xl: 1.5rem; /* 24px */
  --font-size-3xl: 1.875rem; /* 30px */
  --font-size-4xl: 2.25rem; /* 36px */
  --font-size-5xl: 3rem; /* 48px */
  --font-size-6xl: 4rem; /* 64px */

  /* Font Weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;

  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* Letter Spacing */
  --letter-spacing-tight: -0.025em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.025em;
  --letter-spacing-wider: 0.05em;
  --letter-spacing-widest: 0.1em;

  /* Border Radius */
  --radius-sm: 0.25rem; /* 4px */
  --radius-md: 0.5rem; /* 8px */
  --radius-lg: 0.75rem; /* 12px */
  --radius-xl: 1rem; /* 16px */
  --radius-2xl: 1.5rem; /* 24px */
  --radius-full: 9999px; /* Fully rounded */

  /* Shadows (Elevation) */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  --shadow-md: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 4px 6px 0 rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 4px 8px 0 rgba(0, 0, 0, 0.15);
  --shadow-2xl: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
  --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
  --shadow-glow: 0 0 8px rgba(255, 193, 7, 0.3);

  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 200ms ease-in-out;
  --transition-slow: 300ms ease-in-out;
  --transition-slowest: 600ms ease-out;

  /* Z-Index Scale */
  --z-base: 0;
  --z-dropdown: 10;
  --z-sticky: 100;
  --z-fixed: 200;
  --z-modal-backdrop: 900;
  --z-modal: 1000;
  --z-popover: 1100;
  --z-tooltip: 1200;
}
```

### 1.2 Update `src/app.css`

```css
/* Import design tokens */
@import "./lib/styles/tokens.css";

/* Map legacy CSS variables to tokens for backward compatibility */
:root {
  /* Legacy color mappings */
  --primary-color: var(--color-primary);
  --secondary-color: var(--color-primary-dark);
  --accent-color: var(--color-primary-light);
  --text-color: var(--color-text-primary);
  --bg-color: var(--color-bg-primary);
  --card-bg: var(--color-bg-card);
  --border-color: var(--color-border-light);
  --success-color: var(--color-success);
  --danger-color: var(--color-danger);
  --warning-color: var(--color-warning);
  --info-color: var(--color-info);
  --shadow: var(--shadow-md);
}
```

**Action Items:**

1. Create `src/lib/styles/` directory
2. Create `tokens.css` with complete token set above
3. Update `app.css` to import tokens
4. Add legacy variable mappings for gradual migration
5. Test that existing styles still work

## Phase 2: Component-by-Component Refactor

### Priority Order

1. **PlayerDisplay.svelte** (most duplicated colors, affects 4 use cases)
2. **TeamCard.svelte** (28 hard-coded values, complex component)
3. **app.css global styles** (14 instances, affects all pages)
4. **ErrorBanner.svelte** (completely different error colors)
5. **ConnectionBanner.svelte** (inconsistent danger color)
6. **Route components** (Leaderboard, Player, Host)
7. **Remaining components** (PageHeader, QRCodeSection, etc.)

### 2.1 PlayerDisplay.svelte (14 hard-coded values)

**Current Issues:**

- Point control buttons: `#e8f5e9`/`#2e7d32` (green), `#ffebee`/`#c62828` (red)
- Disabled state: `#eee`, `#999`
- Text colors: `#666`
- Team assigned background: `rgba(76,175,80,0.1)`
- Delete button hover: `rgba(255,0,0,0.1)`
- Shadows: `rgba(0,0,0,0.05)`, `rgba(0,0,0,0.1)`, `rgba(0,0,0,0.15)`
- Progress bar inset shadow: `rgba(255,255,255,0.3)`

**Token Replacements:**

```css
/* BEFORE */
background: #e8f5e9;
color: #2e7d32;

/* AFTER */
background: var(--color-success-light);
color: var(--color-success-dark);

/* BEFORE */
background: #ffebee;
color: #c62828;

/* AFTER */
background: var(--color-danger-light);
color: var(--color-error-text);

/* BEFORE */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

/* AFTER */
box-shadow: var(--shadow-xs);

/* BEFORE */
background: rgba(76, 175, 80, 0.1);

/* AFTER */
background: var(--color-success-alpha-10);

/* BEFORE */
color: #666;

/* AFTER */
color: var(--color-text-secondary);

/* BEFORE */
padding: 10px 12px;
gap: 8px;
margin-bottom: 8px;

/* AFTER */
padding: var(--space-2) var(--space-3);
gap: var(--space-2);
margin-bottom: var(--space-2);
```

**Files to update:**

- All 4 variant styles (leaderboard, team, grid, simple)
- Responsive media query spacing
- Button sizing and spacing
- Shadow values

### 2.2 TeamCard.svelte (28 hard-coded values)

**Current Issues:**

- Border: `2px solid #333`
- Text grays: `#333`, `#555`, `#666`, `#999` (4 different!)
- Background grays: `#f0f0f0`, `#eee`, `#ccc`
- Success buttons: `#4caf50`, `#45a049` (duplicates CSS variable!)
- Gray buttons: `#757575`, `#616161`
- Error colors: `#ffebee`, `#c62828`, `#ef5350` (3 shades!)
- Point buttons duplicated from PlayerDisplay

**Token Replacements:**

```css
/* BEFORE */
border: 2px solid #333;
color: #333;

/* AFTER */
border: 2px solid var(--color-text-primary);
color: var(--color-text-primary);

/* BEFORE */
color: #555;

/* AFTER */
color: var(--color-gray-600);

/* BEFORE */
background: #f0f0f0;

/* AFTER */
background: var(--color-bg-input);

/* BEFORE */
border: 1px solid #ccc;

/* AFTER */
border: 1px solid var(--color-border-medium);

/* BEFORE */
background: #4caf50;

/* AFTER */
background: var(--color-success);

/* BEFORE - Error message */
background: #ffebee;
color: #c62828;
border: 1px solid #ef5350;

/* AFTER */
background: var(--color-error-bg);
color: var(--color-error-text);
border: 1px solid var(--color-error-border);
```

**Critical:** Point control buttons should use same tokens as PlayerDisplay for consistency!

### 2.3 app.css Global Styles (14 hard-coded values)

**Issues:**

- `.player-card.assigned` uses `#e8f5e9` directly
- Empty state uses `#999`
- Purple buttons use `#9c27b0`, `#7b1fa2` (not in tokens!)
- Button hovers: `#45a049`, `#da190b`
- Gray buttons: `#e0e0e0`, `#bdbdbd`
- Various rgba shadows

**Token Replacements:**

```css
/* BEFORE */
.player-card.assigned {
  background: #e8f5e9;
}

/* AFTER */
.player-card.assigned {
  background: var(--color-success-light);
}

/* BEFORE */
.empty-state {
  color: #999;
}

/* AFTER */
.empty-state {
  color: var(--color-text-tertiary);
}

/* BEFORE */
.btn-secondary {
  background: #9c27b0;
}
.btn-secondary:hover {
  background: #7b1fa2;
}

/* AFTER - Add to tokens.css first */
--color-purple: #9c27b0;
--color-purple-dark: #7b1fa2;

.btn-secondary {
  background: var(--color-purple);
}
.btn-secondary:hover {
  background: var(--color-purple-dark);
}
```

**Add to tokens.css:**

```css
/* Additional brand color for secondary buttons */
--color-secondary-btn: #9c27b0;
--color-secondary-btn-hover: #7b1fa2;
```

### 2.4 ErrorBanner.svelte (5 hard-coded values)

**Critical Issue:** Uses completely different error colors than the rest of the app!

- `#fee`, `#fcc`, `#c33` vs. `--danger-color` (#f44336)

**Token Replacements:**

```css
/* BEFORE */
background-color: #fee;
border: 1px solid #fcc;
color: #c33;

/* AFTER */
background-color: var(--color-error-bg);
border: 1px solid var(--color-error-border);
color: var(--color-error-text);
```

### 2.5 ConnectionBanner.svelte (4 hard-coded values)

**Issue:** Error color `#dc3545` is different from `--danger-color` (#f44336)!

**Token Replacements:**

```css
/* BEFORE */
background: #dc3545;

/* AFTER */
background: var(--color-danger);

/* BEFORE */
background: #ffc107;
color: #000;

/* AFTER */
background: var(--color-warning);
color: var(--color-text-primary);
```

### 2.6 Leaderboard.svelte (6 hard-coded values)

**Token Replacements:**

```css
/* BEFORE */
color: #666;

/* AFTER */
color: var(--color-text-secondary);

/* BEFORE */
color: #999;

/* AFTER */
color: var(--color-text-tertiary);

/* BEFORE */
box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);

/* AFTER */
box-shadow: var(--shadow-glow);

/* BEFORE */
background: rgba(255, 255, 255, 0.95);

/* AFTER */
background: var(--color-overlay-light);
```

### 2.7 Player.svelte (4 hard-coded values)

**Token Replacements:**

```css
/* BEFORE */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

/* AFTER */
box-shadow: var(--shadow-lg);

/* BEFORE */
background: rgba(0, 0, 0, 0.2);

/* AFTER */
background: var(--color-overlay-dark);
```

### 2.8 Remaining Components

**PageHeader.svelte:**

- Replace `#666` → `var(--color-text-secondary)`
- Apply spacing tokens to margins

**QRCodeSection.svelte:**

- Replace `#666` → `var(--color-text-secondary)`
- Use spacing tokens for padding/margin
- Use `var(--color-bg-card)` for QR container background

**TeamControls.svelte:**

- Audit for any hard-coded values
- Apply spacing tokens

## Phase 3: Validation & Testing

### 3.1 Automated Checks

**Pre-refactor baseline:**

```bash
npm run check  # Must pass with 0 errors
```

**Post-refactor validation:**

```bash
npm run check  # Must still pass
```

**Search for remaining hard-coded values:**

```bash
# Search for hex colors
grep -r "#[0-9a-fA-F]\{3,6\}" src/ --include="*.svelte" --include="*.css"

# Search for rgba/rgb
grep -r "rgba\?(" src/ --include="*.svelte" --include="*.css"

# Expected: Only values in tokens.css should remain
```

### 3.2 Visual Regression Testing

**Manual verification checklist:**

**Host Page (src/routes/Host.svelte):**

- [ ] QR code section displays correctly
- [ ] Players list shows team badges with correct colors
- [ ] Team cards render with proper styling
- [ ] Point control buttons match design
- [ ] Leaderboard button styling correct
- [ ] Loading state appears correctly

**Join Page (src/routes/Join.svelte):**

- [ ] Form styling intact
- [ ] Error messages display with correct colors
- [ ] Success state shows properly
- [ ] Loading spinner renders correctly

**Player Page (src/routes/Player.svelte):**

- [ ] Player dashboard displays correctly
- [ ] Points display styling correct
- [ ] Team section renders properly
- [ ] Navigation links work and style correctly

**Leaderboard Page (src/routes/Leaderboard.svelte):**

- [ ] Mode toggle buttons work and style correctly
- [ ] Players view displays teams properly
- [ ] QR code section renders correctly
- [ ] Leaderboard view shows ranking correctly
- [ ] Progress bars animate smoothly
- [ ] Rank badges display correctly
- [ ] Empty states show with correct styling

**PlayerDisplay Component (all 4 variants):**

- [ ] **Leaderboard variant:** Rank badge, points badge, progress bar all styled correctly
- [ ] **Team variant:** Point controls (+/-) render correctly, colors match TeamCard
- [ ] **Grid variant:** Team assignment shows green highlight, delete button works
- [ ] **Simple variant:** Basic display correct

**TeamCard Component:**

- [ ] Border and header styling correct
- [ ] Team members display with correct background
- [ ] Point controls match PlayerDisplay styling
- [ ] Edit mode displays correctly
- [ ] Error messages show with proper colors
- [ ] Empty state styling correct

**Responsive Testing:**

- [ ] Mobile view (≤600px) - leaderboard adjusts layout
- [ ] Tablet view (≤768px) - grid layouts stack properly
- [ ] Desktop view (>968px) - all layouts optimal

### 3.3 Cross-Component Consistency Check

**Color consistency:**

- [ ] All success states use same green (`#4caf50`)
- [ ] All error states use same red (`#f44336`)
- [ ] All point controls use same colors (green/red light/dark)
- [ ] All text grays consistent (`#333`, `#666`, `#999`)
- [ ] All shadows consistent (no more than 7 unique shadows)

**Spacing consistency:**

- [ ] Card padding consistent (20px/var(--space-5))
- [ ] Button padding consistent
- [ ] Gap between elements uses tokens
- [ ] Margins follow spacing scale

**Typography consistency:**

- [ ] Heading sizes follow scale
- [ ] Body text uses base size
- [ ] Small text consistent
- [ ] Font weights consistent

### 3.4 Performance Check

**Before/after comparison:**

- [ ] Page load time unchanged or improved
- [ ] CSS file size comparison
- [ ] No layout shifts during load
- [ ] Animations remain smooth

### 3.5 Accessibility Validation

**Color contrast:**

- [ ] Text on backgrounds meets WCAG AA (4.5:1)
- [ ] Interactive elements have sufficient contrast
- [ ] Error messages readable
- [ ] Success states accessible

**Focus states:**

- [ ] All interactive elements have visible focus
- [ ] Focus indicators use theme colors
- [ ] Keyboard navigation works

## Phase 4: Documentation & Guidelines

### 4.1 Token Reference Documentation

Create `docs/design-tokens.md`:

````markdown
# Design Tokens Reference

## Colors

### Brand Colors

- `--color-primary`: #ffc107 (Yellow/Gold - main brand)
- `--color-primary-light`: #ffd54f (Lighter yellow)
- `--color-primary-dark`: #ff9800 (Orange)

### Semantic Colors

- `--color-success`: #4caf50 (Green - positive actions)
- `--color-danger`: #f44336 (Red - destructive actions)
- `--color-warning`: #ff9800 (Orange - caution)

### Usage Examples

```css
/* Good */
.button-primary {
  background: var(--color-primary);
  color: var(--color-text-primary);
}

/* Bad - Don't hardcode */
.button-primary {
  background: #ffc107;
  color: #333;
}
```
````

## Spacing

Use the 8px spacing scale:

- `--space-1`: 4px (rare, tight spacing)
- `--space-2`: 8px (default gap)
- `--space-3`: 12px (small padding)
- `--space-4`: 16px (medium padding)
- `--space-5`: 20px (card padding)

## Shadows

Use elevation levels:

- `--shadow-xs`: Subtle hover states
- `--shadow-sm`: Small cards
- `--shadow-md`: Standard cards
- `--shadow-lg`: Prominent elements

````

### 4.2 Update .github/copilot-instructions.md

Add section on design tokens:

```markdown
## Design Tokens System

**CRITICAL: Always use design tokens, never hard-code values**

### Color Usage
- Use `var(--color-primary)` not `#ffc107`
- Use semantic colors: `--color-success`, `--color-danger`, etc.
- Use text colors: `--color-text-primary`, `--color-text-secondary`
- Use grays from scale: `--color-gray-100` through `--color-gray-900`

### Spacing Usage
- Use spacing scale: `var(--space-2)` through `var(--space-20)`
- Never use arbitrary pixel values
- Prefer larger tokens for consistency

### Shadow Usage
- Use elevation levels: `var(--shadow-xs)` through `var(--shadow-2xl)`
- Don't create custom shadows

### Example - Creating a New Component
```svelte
<style>
  .my-component {
    /* Good - uses tokens */
    padding: var(--space-4);
    background: var(--color-bg-card);
    color: var(--color-text-primary);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
  }

  /* Bad - hard-coded values */
  .my-component-bad {
    padding: 16px;
    background: white;
    color: #333;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
</style>
````

### Token Files

- All tokens defined in: `src/lib/styles/tokens.css`
- Legacy variables mapped in: `src/app.css`
- Never modify token values in components

````

### 4.3 Component Pattern Guide

Create `docs/component-patterns.md`:

```markdown
# Component Styling Patterns

## Buttons

### Primary Button
```css
.btn-primary {
  background: var(--color-primary);
  color: var(--color-text-primary);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-semibold);
  transition: var(--transition-base);
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  box-shadow: var(--shadow-lg);
}
````

### Danger Button

```css
.btn-danger {
  background: var(--color-danger);
  color: var(--color-text-inverse);
}
```

## Cards

### Standard Card

```css
.card {
  background: var(--color-bg-card);
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
```

### Highlighted Card

```css
.card-highlighted {
  border-left: 4px solid var(--color-primary);
}
```

## Point Controls

### Standard Pattern (used in PlayerDisplay and TeamCard)

```css
.btn-point-plus {
  background: var(--color-success-light);
  color: var(--color-success-dark);
  border-radius: var(--radius-full);
  width: 28px;
  height: 28px;
}

.btn-point-minus {
  background: var(--color-danger-light);
  color: var(--color-error-text);
}
```

````

## Phase 5: Migration Strategy

### 5.1 Incremental Approach

**Week 1:**
- [ ] Day 1: Create tokens.css and update app.css
- [ ] Day 2: Refactor PlayerDisplay.svelte
- [ ] Day 3: Refactor TeamCard.svelte
- [ ] Day 4: Refactor ErrorBanner and ConnectionBanner
- [ ] Day 5: Testing and fixes

**Week 2:**
- [ ] Day 1: Refactor app.css global styles
- [ ] Day 2: Refactor Leaderboard.svelte
- [ ] Day 3: Refactor Player.svelte and Host.svelte
- [ ] Day 4: Refactor remaining components
- [ ] Day 5: Final testing and documentation

### 5.2 Git Strategy

**Commit Structure:**
- Commit 1: "Add design tokens system"
- Commit 2: "Refactor PlayerDisplay to use tokens"
- Commit 3: "Refactor TeamCard to use tokens"
- Commit 4: "Fix error color inconsistency in ErrorBanner"
- Commit 5: "Refactor global styles to use tokens"
- Commit 6: "Refactor route components to use tokens"
- Commit 7: "Refactor remaining components and cleanup"
- Commit 8: "Add design tokens documentation"

### 5.3 Rollback Plan

**If issues arise:**
- Each commit is atomic and can be reverted independently
- Legacy CSS variables remain mapped for backward compatibility
- Visual regression can be caught per-commit

### 5.4 Success Metrics

**Before starting, record:**
- Number of hard-coded colors: 76
- Number of unique shadow values: 12+
- Number of unique spacing values: 20+

**Target after completion:**
- Hard-coded colors in components: 0
- Hard-coded colors total: ~20 (only in tokens.css)
- Unique shadow values: 7 (defined in tokens)
- Spacing values: All from scale

**Quality metrics:**
- Type check passes: ✅
- Visual regression: 0 unintended changes
- Accessibility: Meets WCAG AA
- Performance: No degradation

## Success Criteria
- ✅ Zero hard-coded color values in components (76 → 0)
- ✅ Zero hard-coded shadows in components (12+ → 7 defined)
- ✅ Consistent spacing throughout application (20+ values → scale of 10)
- ✅ All colors use token values from design system
- ✅ All shadows use elevation scale
- ✅ Typography consistently applied with scale
- ✅ All components type-check successfully (0 errors)
- ✅ Visual appearance unchanged (or intentionally improved)
- ✅ Easier to maintain and update styling
- ✅ Foundation for future theming capabilities
- ✅ WCAG AA color contrast compliance
- ✅ Comprehensive documentation created

## Known Risks & Mitigation

### Risk 1: Visual Regressions
**Likelihood:** Medium
**Impact:** High
**Mitigation:**
- Manual visual testing after each component
- Screenshot comparison before/after
- Incremental commits allow easy rollback
- Test on multiple screen sizes

### Risk 2: Color Contrast Issues
**Likelihood:** Low
**Impact:** High
**Mitigation:**
- Tokens already based on current working colors
- WCAG checker in validation phase
- Test with accessibility tools

### Risk 3: Breaking Changes
**Likelihood:** Low
**Impact:** Critical
**Mitigation:**
- Legacy variable mappings maintain backward compatibility
- Type checking after each change
- Atomic commits for easy revert

### Risk 4: Missed Hard-Coded Values
**Likelihood:** Medium
**Impact:** Low
**Mitigation:**
- Automated grep searches for hex/rgba
- Manual audit of all files
- Final cleanup pass

## Future Enhancements

### Phase 2 Improvements (Post-Initial Refactor)

**Theme Switching:**
- Add dark mode tokens
- Create theme toggle component
- Persist theme preference
- Smooth theme transitions

**Custom Themes:**
- Per-team color customization
- Allow host to set brand colors
- Dynamic token generation
- Preview theme before applying

**Advanced Accessibility:**
- High contrast mode
- Reduced motion preferences
- Focus visible enhancements
- ARIA landmark improvements

**Performance Optimizations:**
- CSS custom properties optimization
- Reduce unused styles
- Critical CSS extraction
- Progressive enhancement

**Developer Experience:**
- VS Code snippets for tokens
- Storybook for component showcase
- Token usage linting rules
- Automated token generation from Figma

## Appendix

### A. Complete Token Inventory

**Colors (46 tokens):**
- Brand: 3
- Semantic: 6 base + 6 variations
- Grays: 10 shades
- Text: 5 variants
- Background: 7 types
- Border: 3
- Alpha/Overlay: 6

**Spacing (12 tokens):**
- From 4px to 80px in consistent scale

**Typography (17 tokens):**
- Font sizes: 10
- Font weights: 5
- Line heights: 2

**Shadows (8 tokens):**
- From subtle (xs) to prominent (2xl)
- Plus inner and glow variants

**Borders (6 tokens):**
- Radius from 4px to full round

**Transitions (4 tokens):**
- Fast to slowest

**Total:** ~100 design tokens

### B. File Modification Checklist

**Core Files:**
- [ ] Create `src/lib/styles/tokens.css`
- [ ] Update `src/app.css`

**Components (8 files):**
- [ ] `src/lib/components/PlayerDisplay.svelte`
- [ ] `src/lib/components/TeamCard.svelte`
- [ ] `src/lib/components/ErrorBanner.svelte`
- [ ] `src/lib/components/ConnectionBanner.svelte`
- [ ] `src/lib/components/PageHeader.svelte`
- [ ] `src/lib/components/QRCodeSection.svelte`
- [ ] `src/lib/components/PlayersList.svelte`
- [ ] `src/lib/components/TeamControls.svelte`

**Routes (4 files):**
- [ ] `src/routes/Host.svelte`
- [ ] `src/routes/Join.svelte`
- [ ] `src/routes/Player.svelte`
- [ ] `src/routes/Leaderboard.svelte`

**Documentation:**
- [ ] Create `docs/design-tokens.md`
- [ ] Create `docs/component-patterns.md`
- [ ] Update `.github/copilot-instructions.md`

**Total files to modify:** 18

### C. Search Patterns for Validation

```bash
# Find remaining hex colors
grep -r "#[0-9a-fA-F]\{3,6\}" src/ --include="*.svelte" --include="*.css" | grep -v "tokens.css"

# Find remaining rgba/rgb
grep -r "rgba\?(" src/ --include="*.svelte" --include="*.css" | grep -v "tokens.css"

# Find hard-coded pixel spacing (look for suspicious patterns)
grep -r "[0-9]\+px" src/ --include="*.svelte" --include="*.css" | grep -v "tokens.css" | grep -v "var("

# Find hard-coded font sizes
grep -r "font-size.*rem" src/ --include="*.svelte" | grep -v "var("
````

### D. Before/After Comparison Example

**Before (PlayerDisplay.svelte):**

```css
.btn-point.small.plus {
  background: #e8f5e9;
  color: #2e7d32;
}

.team-member-display {
  padding: 10px 12px;
  margin-bottom: 8px;
  gap: 10px;
}

.leaderboard-row {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
```

**After (PlayerDisplay.svelte):**

```css
.btn-point.small.plus {
  background: var(--color-success-light);
  color: var(--color-success-dark);
}

.team-member-display {
  padding: var(--space-2) var(--space-3);
  margin-bottom: var(--space-2);
  gap: var(--space-2);
}

.leaderboard-row {
  box-shadow: var(--shadow-xs);
}
```

**Benefits:**

- ✅ Maintainable: Change color once in tokens.css
- ✅ Consistent: All success greens match
- ✅ Themeable: Easy to switch to dark mode
- ✅ Readable: Semantic names self-document

## Conclusion

This refactor will transform the BeehiveGameshow codebase from an inconsistent, hard-to-maintain styling system into a robust, token-based design system that:

1. **Eliminates 76 hard-coded color values**
2. **Standardizes shadows from 12+ variations to 7 defined levels**
3. **Creates consistent spacing with a proper scale**
4. **Enables future theming and customization**
5. **Improves maintainability dramatically**
6. **Sets foundation for accessibility improvements**

The incremental approach with atomic commits ensures low risk, while comprehensive testing validates each step. Documentation ensures the system is maintainable by the entire team going forward.

**Estimated Effort:** 8-10 days
**Risk Level:** Low-Medium  
**Value:** High
**Priority:** High (blocking future theming work)
