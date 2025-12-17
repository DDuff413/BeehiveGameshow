# Design Tokens Reference

## Overview

BeehiveGameshow uses a comprehensive design token system to ensure visual consistency, maintainability, and future theming capabilities. All tokens are defined in `src/lib/styles/tokens.css` and should be used instead of hard-coded values.

**Total Tokens: 113**

## 🎨 Colors (48 tokens)

### Brand Colors (3)

Primary brand colors used throughout the application.

| Token                   | Value   | Usage                           |
| ----------------------- | ------- | ------------------------------- |
| `--color-primary`       | #ffc107 | Main brand color (yellow/gold)  |
| `--color-primary-light` | #ffd54f | Lighter variant for backgrounds |
| `--color-primary-dark`  | #ff9800 | Darker variant for hover states |

**Example:**

```css
.button-primary {
  background: var(--color-primary);
}
.button-primary:hover {
  background: var(--color-primary-dark);
}
```

### Semantic Colors (12)

Colors that convey meaning and state.

| Token                   | Value   | Usage                           |
| ----------------------- | ------- | ------------------------------- |
| `--color-success`       | #4caf50 | Positive actions, confirmations |
| `--color-success-light` | #e8f5e9 | Success backgrounds             |
| `--color-success-dark`  | #45a049 | Success text/icons              |
| `--color-danger`        | #f44336 | Destructive actions, errors     |
| `--color-danger-light`  | #ffebee | Danger backgrounds              |
| `--color-danger-dark`   | #da190b | Danger hover states             |
| `--color-warning`       | #ff9800 | Warning states                  |
| `--color-info`          | #2196f3 | Informational messages          |
| `--color-error-bg`      | #ffebee | Error message backgrounds       |
| `--color-error-border`  | #ef5350 | Error message borders           |
| `--color-error-text`    | #c62828 | Error message text              |

**Example:**

```css
.point-button-add {
  background: var(--color-success-light);
  color: var(--color-success-dark);
}

.error-banner {
  background: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error-text);
}
```

### Neutral Grays (10)

Grayscale palette for text, borders, and backgrounds.

| Token              | Value   | Usage                      |
| ------------------ | ------- | -------------------------- |
| `--color-gray-50`  | #fafafa | Lightest gray              |
| `--color-gray-100` | #f5f5f5 | Very light backgrounds     |
| `--color-gray-200` | #eeeeee | Light backgrounds          |
| `--color-gray-300` | #e0e0e0 | Borders                    |
| `--color-gray-400` | #bdbdbd | Disabled elements          |
| `--color-gray-500` | #9e9e9e | Tertiary text              |
| `--color-gray-600` | #757575 | Secondary text             |
| `--color-gray-700` | #616161 | Primary text (alternative) |
| `--color-gray-800` | #424242 | Dark text                  |
| `--color-gray-900` | #212121 | Darkest text               |

### Text Colors (5)

Semantic text color tokens.

| Token                    | Value   | Usage                       |
| ------------------------ | ------- | --------------------------- |
| `--color-text-primary`   | #333333 | Primary body text           |
| `--color-text-secondary` | #666666 | Secondary text, labels      |
| `--color-text-tertiary`  | #999999 | Tertiary text, placeholders |
| `--color-text-disabled`  | #bdbdbd | Disabled text               |
| `--color-text-inverse`   | #ffffff | Text on dark backgrounds    |

### Background Colors (5)

Page and component backgrounds.

| Token                  | Value           | Usage                      |
| ---------------------- | --------------- | -------------------------- |
| `--color-bg-primary`   | #fff8e1         | Main page background       |
| `--color-bg-secondary` | #fff9c4         | Secondary background areas |
| `--color-bg-card`      | #ffffff         | Card/component backgrounds |
| `--color-bg-overlay`   | rgba(0,0,0,0.5) | Modal/overlay backgrounds  |
| `--color-bg-input`     | #f0f0f0         | Input field backgrounds    |

### Border Colors (3)

| Token                   | Value   | Usage                         |
| ----------------------- | ------- | ----------------------------- |
| `--color-border-light`  | #ffe082 | Light borders (brand-colored) |
| `--color-border-medium` | #cccccc | Standard borders              |
| `--color-border-dark`   | #999999 | Prominent borders             |

### Alpha Colors (4)

Colors with transparency for overlays and effects.

| Token                      | Value                  | Usage              |
| -------------------------- | ---------------------- | ------------------ |
| `--color-success-alpha-10` | rgba(76,175,80,0.1)    | Success highlights |
| `--color-danger-alpha-10`  | rgba(255,0,0,0.1)      | Danger highlights  |
| `--color-overlay-light`    | rgba(0,0,0,0.2)        | Light overlays     |
| `--color-overlay-medium`   | rgba(255,255,255,0.95) | Modal backdrops    |

### Button Colors (2)

| Token                         | Value   | Usage                       |
| ----------------------------- | ------- | --------------------------- |
| `--color-secondary-btn`       | #9c27b0 | Secondary button background |
| `--color-secondary-btn-hover` | #7b1fa2 | Secondary button hover      |

## 📏 Spacing (13 tokens)

8px-based spacing scale for consistent layouts.

| Token        | Value   | Pixels | Usage                            |
| ------------ | ------- | ------ | -------------------------------- |
| `--space-0`  | 0       | 0px    | No spacing                       |
| `--space-1`  | 0.25rem | 4px    | Tight spacing, minimal gaps      |
| `--space-2`  | 0.5rem  | 8px    | Default gaps, small padding      |
| `--space-3`  | 0.75rem | 12px   | Small padding                    |
| `--space-4`  | 1rem    | 16px   | Medium padding, standard margins |
| `--space-5`  | 1.25rem | 20px   | Card padding                     |
| `--space-6`  | 1.5rem  | 24px   | Large padding                    |
| `--space-7`  | 1.75rem | 28px   | Button height/padding            |
| `--space-8`  | 2rem    | 32px   | Section spacing                  |
| `--space-10` | 2.5rem  | 40px   | Large section spacing            |
| `--space-12` | 3rem    | 48px   | Extra large spacing              |
| `--space-16` | 4rem    | 64px   | Major section breaks             |
| `--space-20` | 5rem    | 80px   | Maximum spacing                  |

**Examples:**

```css
/* Card spacing */
.card {
  padding: var(--space-5); /* 20px */
  margin-bottom: var(--space-4); /* 16px */
  gap: var(--space-2); /* 8px */
}

/* Button spacing */
.button {
  padding: var(--space-3) var(--space-6); /* 12px 24px */
}
```

## 🔤 Typography (17 tokens)

### Font Sizes (10)

| Token              | Value    | Pixels | Usage                 |
| ------------------ | -------- | ------ | --------------------- |
| `--font-size-xs`   | 0.75rem  | 12px   | Tiny labels, metadata |
| `--font-size-sm`   | 0.875rem | 14px   | Small text, captions  |
| `--font-size-base` | 1rem     | 16px   | Body text             |
| `--font-size-lg`   | 1.125rem | 18px   | Large body text       |
| `--font-size-xl`   | 1.25rem  | 20px   | Subheadings           |
| `--font-size-2xl`  | 1.5rem   | 24px   | H3 headings           |
| `--font-size-3xl`  | 1.875rem | 30px   | H2 headings           |
| `--font-size-4xl`  | 2.25rem  | 36px   | H1 headings           |
| `--font-size-5xl`  | 3rem     | 48px   | Display headings      |
| `--font-size-6xl`  | 4rem     | 64px   | Hero text             |

### Font Weights (5)

| Token                     | Value | Usage           |
| ------------------------- | ----- | --------------- |
| `--font-weight-normal`    | 400   | Body text       |
| `--font-weight-medium`    | 500   | Emphasized text |
| `--font-weight-semibold`  | 600   | Subheadings     |
| `--font-weight-bold`      | 700   | Headings        |
| `--font-weight-extrabold` | 800   | Heavy emphasis  |

### Line Heights (2)

| Token                   | Value | Usage             |
| ----------------------- | ----- | ----------------- |
| `--line-height-tight`   | 1.25  | Headings          |
| `--line-height-normal`  | 1.5   | Body text         |
| `--line-height-relaxed` | 1.75  | Long-form content |

**Example:**

```css
h1 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

p {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
}
```

## 🔲 Border Radius (6 tokens)

| Token           | Value   | Pixels | Usage                   |
| --------------- | ------- | ------ | ----------------------- |
| `--radius-sm`   | 0.25rem | 4px    | Small elements          |
| `--radius-md`   | 0.5rem  | 8px    | Standard elements       |
| `--radius-lg`   | 0.75rem | 12px   | Cards                   |
| `--radius-xl`   | 1rem    | 16px   | Large cards             |
| `--radius-2xl`  | 1.5rem  | 24px   | Prominent elements      |
| `--radius-full` | 9999px  | Full   | Pills, circular buttons |

## 🌑 Shadows (8 tokens)

Elevation scale for depth and hierarchy.

| Token            | Value                            | Usage               |
| ---------------- | -------------------------------- | ------------------- |
| `--shadow-xs`    | 0 1px 2px rgba(0,0,0,0.05)       | Subtle hover states |
| `--shadow-sm`    | 0 1px 3px rgba(0,0,0,0.1)        | Small cards         |
| `--shadow-md`    | 0 2px 4px rgba(0,0,0,0.1)        | Standard cards      |
| `--shadow-lg`    | 0 4px 6px rgba(0,0,0,0.1)        | Prominent elements  |
| `--shadow-xl`    | 0 4px 8px rgba(0,0,0,0.15)       | Elevated cards      |
| `--shadow-2xl`   | 0 4px 12px rgba(0,0,0,0.15)      | Floating elements   |
| `--shadow-inner` | inset 0 2px 4px rgba(0,0,0,0.06) | Inset effects       |
| `--shadow-glow`  | 0 0 8px rgba(255,193,7,0.3)      | Active state glow   |

**Example:**

```css
.card {
  box-shadow: var(--shadow-md);
}

.card:hover {
  box-shadow: var(--shadow-lg);
}

.floating-button {
  box-shadow: var(--shadow-2xl);
}
```

## ⚡ Transitions (4 tokens)

| Token                  | Value             | Usage                |
| ---------------------- | ----------------- | -------------------- |
| `--transition-fast`    | 150ms ease-in-out | Quick interactions   |
| `--transition-base`    | 200ms ease-in-out | Standard transitions |
| `--transition-slow`    | 300ms ease-in-out | Smooth animations    |
| `--transition-slowest` | 600ms ease-out    | Page transitions     |

## 📚 Z-Index (8 tokens)

Layering scale to prevent z-index conflicts.

| Token                | Value | Usage           |
| -------------------- | ----- | --------------- |
| `--z-base`           | 0     | Default layer   |
| `--z-dropdown`       | 10    | Dropdown menus  |
| `--z-sticky`         | 100   | Sticky headers  |
| `--z-fixed`          | 200   | Fixed elements  |
| `--z-modal-backdrop` | 900   | Modal backdrops |
| `--z-modal`          | 1000  | Modals          |
| `--z-popover`        | 1100  | Popovers        |
| `--z-tooltip`        | 1200  | Tooltips        |

## 📱 Responsive (8 tokens)

### Breakpoint Values

**IMPORTANT:** Media queries cannot use CSS custom properties. These values are documented in tokens.css but must be used directly in `@media` queries.

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

### Container Max Widths (5)

| Token             | Value  | Usage                |
| ----------------- | ------ | -------------------- |
| `--container-sm`  | 500px  | Small content areas  |
| `--container-md`  | 800px  | Medium content areas |
| `--container-lg`  | 1000px | Large content areas  |
| `--container-xl`  | 1200px | Extra large content  |
| `--container-2xl` | 1400px | Maximum width        |

### Component Max Widths (3)

| Token               | Value | Usage             |
| ------------------- | ----- | ----------------- |
| `--max-width-qr`    | 256px | QR code container |
| `--max-width-card`  | 250px | Team cards        |
| `--max-width-input` | 400px | Input fields      |

**Example:**

```css
.content-wrapper {
  max-width: var(--container-lg);
  margin: 0 auto;
}

.qr-container {
  max-width: var(--max-width-qr);
}
```

## ✅ Best Practices

### DO ✅

```css
/* Use tokens for all styling */
.button {
  background: var(--color-primary);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  transition: var(--transition-base);
}

/* Use semantic color tokens */
.success-message {
  background: var(--color-success-light);
  color: var(--color-success-dark);
}

/* Use spacing scale */
.card {
  padding: var(--space-5);
  gap: var(--space-2);
}
```

### DON'T ❌

```css
/* Don't hard-code colors */
.button {
  background: #ffc107; /* ❌ Use var(--color-primary) */
}

/* Don't use arbitrary spacing */
.card {
  padding: 18px; /* ❌ Use var(--space-4) or var(--space-5) */
}

/* Don't create custom shadows */
.element {
  box-shadow: 0 3px 7px rgba(0, 0, 0, 0.12); /* ❌ Use var(--shadow-md) */
}

/* Don't use arbitrary font sizes */
.heading {
  font-size: 1.3rem; /* ❌ Use var(--font-size-xl) or var(--font-size-2xl) */
}
```

## 🔍 Finding the Right Token

### "I need a color for..."

- **Success/positive action** → `--color-success` or `--color-success-light`
- **Error/danger** → `--color-danger` or `--color-error-bg`
- **Primary action** → `--color-primary`
- **Text** → `--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`
- **Background** → `--color-bg-card`, `--color-bg-primary`
- **Border** → `--color-border-medium`, `--color-border-light`

### "I need spacing for..."

- **Tiny gap** → `--space-1` (4px)
- **Default gap** → `--space-2` (8px)
- **Button padding** → `--space-3` `--space-6` (12px 24px)
- **Card padding** → `--space-5` (20px)
- **Section spacing** → `--space-8` or `--space-10`

### "I need a shadow for..."

- **Hover effect** → `--shadow-xs` or `--shadow-sm`
- **Standard card** → `--shadow-md`
- **Elevated element** → `--shadow-lg` or `--shadow-xl`
- **Floating button** → `--shadow-2xl`
- **Active/selected** → `--shadow-glow`

## 🎨 Future Theming

This token system is designed to support future theming capabilities:

- **Dark Mode:** Override color tokens with dark variants
- **Team Colors:** Dynamically update brand tokens
- **Custom Themes:** Replace token values without touching components
- **High Contrast:** Accessibility-focused color overrides

## 📖 Additional Resources

- **Component Patterns:** See [component-patterns.md](./component-patterns.md)
- **Token File:** `src/lib/styles/tokens.css`
- **Copilot Instructions:** `.github/copilot-instructions.md`
