<script lang="ts">
  import { onDestroy } from "svelte";

  export let message: string = "";
  export let autoDismiss: boolean = false;
  export let dismissDelay: number = 5000;
  export let onDismiss: (() => void) | null = null;

  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  $: if (message && autoDismiss) {
    // Clear any existing timeout
    if (timeoutId) clearTimeout(timeoutId);
    
    // Set new timeout
    timeoutId = setTimeout(() => {
      handleDismiss();
    }, dismissDelay);
  }

  // Cleanup timeout when component is destroyed
  onDestroy(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  });

  function handleDismiss() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    
    if (onDismiss) {
      onDismiss();
    } else {
      message = "";
    }
  }
</script>

{#if message}
  <div class="error-banner-component" role="alert">
    <span class="error-banner-icon">⚠️</span>
    <span class="error-banner-text">{message}</span>
    <button
      class="error-banner-dismiss"
      aria-label="Dismiss error"
      on:click={handleDismiss}
    >
      ✕
    </button>
  </div>
{/if}

<style>
  .error-banner-component {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background-color: var(--color-error-bg);
    border: 1px solid var(--color-error-border);
    border-radius: var(--radius-md);
    color: var(--color-error-text);
    margin-bottom: var(--space-4);
    margin-top: 0;
    font-weight: var(--font-weight-medium);
    animation: errorSlideDown var(--transition-base) ease-out;
  }

  @keyframes errorSlideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .error-banner-icon {
    font-size: var(--font-size-xl);
    flex-shrink: 0;
  }

  .error-banner-text {
    flex: 1;
    font-size: var(--font-size-base);
    line-height: var(--line-height-normal);
    color: var(--color-error-text);
    margin: 0;
  }

  .error-banner-dismiss {
    background: none;
    border: none;
    color: var(--color-error-text);
    cursor: pointer;
    font-size: var(--font-size-xl);
    padding: var(--space-1) var(--space-2);
    opacity: 0.7;
    transition: opacity var(--transition-fast);
    flex-shrink: 0;
    margin-left: auto;
    line-height: 1;
  }

  .error-banner-dismiss:hover {
    opacity: 1;
  }

  .error-banner-dismiss:focus {
    outline: 2px solid var(--color-error-border);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }
</style>
