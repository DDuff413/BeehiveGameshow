# Component Styling Patterns

## Overview

This guide documents common styling patterns used throughout BeehiveGameshow. All patterns use design tokens from `src/lib/styles/tokens.css`.

## 🔘 Buttons

### Primary Button

Used for main actions (Join Game, Create Team, etc.).

```css
.btn-primary {
  background: var(--color-primary);
  color: var(--color-text-primary);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  border: none;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: var(--transition-base);
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  box-shadow: var(--shadow-lg);
}
```

**Usage:**

```svelte
<button class="btn-primary">Join Game</button>
```

### Secondary Button

Used for alternative actions (Cancel, Go Back, etc.).

```css
.btn-secondary {
  background: var(--color-secondary-btn);
  color: var(--color-text-inverse);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  border: none;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: var(--transition-base);
}

.btn-secondary:hover {
  background: var(--color-secondary-btn-hover);
}
```

### Danger Button

Used for destructive actions (Delete, Remove, etc.).

```css
.btn-danger {
  background: var(--color-danger);
  color: var(--color-text-inverse);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  border: none;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: var(--transition-base);
}

.btn-danger:hover {
  background: var(--color-danger-dark);
}
```

### Small Button

Used for compact actions in tight spaces.

```css
.btn-small {
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-sm);
  border-radius: var(--radius-sm);
}
```

### Circular Point Control Buttons

Used in PlayerDisplay and TeamCard for +/- point controls.

```css
/* Add Points Button */
.btn-point.plus {
  background: var(--color-success-light);
  color: var(--color-success-dark);
  border-radius: var(--radius-full);
  width: 28px;
  height: 28px;
  border: none;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-point.plus:hover {
  background: var(--color-success);
  color: var(--color-text-inverse);
}

/* Subtract Points Button */
.btn-point.minus {
  background: var(--color-danger-light);
  color: var(--color-error-text);
  border-radius: var(--radius-full);
  width: 28px;
  height: 28px;
  border: none;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-point.minus:hover {
  background: var(--color-danger);
  color: var(--color-text-inverse);
}
```

**Usage:**

```svelte
<button class="btn-point plus" on:click={addPoint}>+</button>
<button class="btn-point minus" on:click={removePoint}>−</button>
```

## 🃏 Cards

### Standard Card

Basic card container used throughout the app.

```css
.card {
  background: var(--color-bg-card);
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-lg);
}
```

### Highlighted Card

Card with brand-colored border for emphasis.

```css
.card-highlighted {
  background: var(--color-bg-card);
  padding: var(--space-5);
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--color-primary);
  box-shadow: var(--shadow-md);
}
```

### Team Card

Specialized card for team display with header.

```css
.team-card {
  background: var(--color-bg-card);
  border: 2px solid var(--color-text-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-0);
  box-shadow: var(--shadow-md);
}

.team-card-header {
  background: var(--color-text-primary);
  color: var(--color-text-inverse);
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.team-card-content {
  padding: var(--space-4);
}
```

**Usage:**

```svelte
<div class="team-card">
  <div class="team-card-header">Team Honeycomb</div>
  <div class="team-card-content">
    <!-- Team members -->
  </div>
</div>
```

## 📋 Player Display Variants

The PlayerDisplay component has 4 variants with specific styling patterns:

### 1. Leaderboard Variant

Used in leaderboard view with rank badge and progress bar.

```css
.leaderboard-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
}

.rank-badge {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-bold);
  display: flex;
  align-items: center;
  justify-content: center;
}

.points-badge {
  background: var(--color-primary-light);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-semibold);
}
```

### 2. Team Variant

Used in team management with point controls.

```css
.team-member-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-2);
}

.point-controls {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}
```

### 3. Grid Variant

Used in host view grid layout with team assignment highlighting.

```css
.player-card {
  padding: var(--space-4);
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-base);
}

.player-card.assigned {
  background: var(--color-success-light);
}

.player-card:hover {
  box-shadow: var(--shadow-md);
}
```

### 4. Simple Variant

Minimal display for lists.

```css
.player-simple {
  padding: var(--space-2);
  border-radius: var(--radius-sm);
}
```

## 🚨 Banners

### Error Banner

```css
.error-banner {
  background: var(--color-error-bg);
  border: 1px solid var(--color-error-border);
  color: var(--color-error-text);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
}
```

**Usage:**

```svelte
{#if error}
  <div class="error-banner">{error}</div>
{/if}
```

### Connection Banner

Shows connection status with color-coded states.

```css
.connection-banner {
  padding: var(--space-2);
  text-align: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.connection-banner.connected {
  background: var(--color-success);
  color: var(--color-text-inverse);
}

.connection-banner.disconnected {
  background: var(--color-danger);
  color: var(--color-text-inverse);
}

.connection-banner.connecting {
  background: var(--color-warning);
  color: var(--color-text-primary);
}
```

## 📝 Form Elements

### Input Field

```css
.input-field {
  width: 100%;
  padding: var(--space-3);
  border: 2px solid var(--color-border-medium);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  background: var(--color-bg-input);
  transition: var(--transition-fast);
}

.input-field:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-glow);
}

.input-field.error {
  border-color: var(--color-error-border);
}
```

### Input Wrapper

```css
.input-wrapper {
  margin-bottom: var(--space-4);
}

.input-wrapper label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}
```

## 🏆 Leaderboard Patterns

### Mode Toggle Buttons

```css
.mode-toggle {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.mode-chip {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-full);
  border: 2px solid var(--color-border-medium);
  background: var(--color-bg-card);
  cursor: pointer;
  transition: var(--transition-base);
}

.mode-chip.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-glow);
}
```

### Progress Bar

```css
.progress-bar-container {
  width: 100%;
  height: 8px;
  background: var(--color-gray-200);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
  box-shadow: var(--shadow-inner);
}
```

## 📱 Responsive Patterns

### Container with Max Width

```css
.content-container {
  width: 100%;
  max-width: var(--container-lg);
  margin: 0 auto;
  padding: var(--space-5);
}

/* Mobile */
@media (max-width: 600px) {
  .content-container {
    padding: var(--space-3);
  }
}
```

### Grid to Stack

```css
.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--max-width-card), 1fr));
  gap: var(--space-4);
}

/* Tablet */
@media (max-width: 768px) {
  .grid-layout {
    grid-template-columns: 1fr 1fr;
  }
}

/* Mobile */
@media (max-width: 600px) {
  .grid-layout {
    grid-template-columns: 1fr;
  }
}
```

### Hide/Show on Breakpoints

```css
.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

/* Desktop */
@media (max-width: 1024px) {
  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block;
  }
}
```

## 🎯 Empty States

```css
.empty-state {
  text-align: center;
  padding: var(--space-12);
  color: var(--color-text-tertiary);
}

.empty-state-icon {
  font-size: var(--font-size-6xl);
  margin-bottom: var(--space-4);
  opacity: 0.5;
}

.empty-state-text {
  font-size: var(--font-size-lg);
  color: var(--color-text-tertiary);
}
```

## 🔄 Loading States

```css
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-gray-200);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-full);
  animation: spin var(--transition-slowest) linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

## ✅ Best Practices

### DO ✅

1. **Use consistent patterns across similar components**

   ```css
   /* All cards use same base styling */
   .player-card,
   .team-card,
   .info-card {
     background: var(--color-bg-card);
     border-radius: var(--radius-lg);
     box-shadow: var(--shadow-md);
   }
   ```

2. **Maintain visual hierarchy with shadow elevation**

   ```css
   /* Base element */
   .card {
     box-shadow: var(--shadow-md);
   }

   /* Interactive/hover state */
   .card:hover {
     box-shadow: var(--shadow-lg);
   }

   /* Active/selected state */
   .card.active {
     box-shadow: var(--shadow-2xl);
   }
   ```

3. **Use semantic color tokens**

   ```css
   .success-button {
     background: var(--color-success);
     color: var(--color-text-inverse);
   }
   ```

4. **Apply consistent spacing**
   ```css
   .section {
     padding: var(--space-5);
     margin-bottom: var(--space-8);
   }
   ```

### DON'T ❌

1. **Don't create one-off button styles**

   ```css
   /* ❌ Bad - creates inconsistency */
   .special-button {
     background: #ff5722;
     padding: 14px 22px;
     border-radius: 6px;
   }

   /* ✅ Good - use existing pattern */
   .special-button {
     /* extends btn-primary or btn-secondary */
   }
   ```

2. **Don't mix patterns for same component type**

   ```css
   /* ❌ Bad - inconsistent card styling */
   .card-1 {
     padding: var(--space-5);
     box-shadow: var(--shadow-md);
   }

   .card-2 {
     padding: var(--space-6);
     box-shadow: 0 3px 7px rgba(0, 0, 0, 0.1);
   }
   ```

3. **Don't skip responsive considerations**

   ```css
   /* ❌ Bad - no mobile adjustment */
   .section {
     padding: var(--space-12);
   }

   /* ✅ Good - responsive padding */
   .section {
     padding: var(--space-12);
   }

   @media (max-width: 768px) {
     .section {
       padding: var(--space-5);
     }
   }
   ```

## 📚 Related Documentation

- **Design Tokens:** See [design-tokens.md](./design-tokens.md) for complete token reference
- **Copilot Instructions:** `.github/copilot-instructions.md` for AI coding guidelines
