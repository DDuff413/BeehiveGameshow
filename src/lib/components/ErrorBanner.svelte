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
    gap: 12px;
    padding: 12px 16px;
    background-color: #fee;
    border: 1px solid #fcc;
    border-radius: 8px;
    color: #c33;
    margin-bottom: 16px;
    margin-top: 0;
    font-weight: 500;
    animation: errorSlideDown 0.3s ease-out;
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
    font-size: 1.2rem;
    flex-shrink: 0;
  }

  .error-banner-text {
    flex: 1;
    font-size: 0.95rem;
    line-height: 1.4;
    color: #c33;
    margin: 0;
  }

  .error-banner-dismiss {
    background: none;
    border: none;
    color: #c33;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 4px 8px;
    opacity: 0.7;
    transition: opacity 0.2s;
    flex-shrink: 0;
    margin-left: auto;
    line-height: 1;
  }

  .error-banner-dismiss:hover {
    opacity: 1;
  }

  .error-banner-dismiss:focus {
    outline: 2px solid #c33;
    outline-offset: 2px;
    border-radius: 4px;
  }
</style>
