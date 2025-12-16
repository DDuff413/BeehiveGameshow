<script lang="ts">
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
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    padding: 12px 16px !important;
    background-color: #fee !important;
    border: 1px solid #fcc !important;
    border-radius: 8px !important;
    color: #c33 !important;
    margin-bottom: 16px !important;
    margin-top: 0 !important;
    font-weight: 500 !important;
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
    font-size: 1.2rem !important;
    flex-shrink: 0 !important;
  }

  .error-banner-text {
    flex: 1 !important;
    font-size: 0.95rem !important;
    line-height: 1.4 !important;
    color: #c33 !important;
    margin: 0 !important;
  }

  .error-banner-dismiss {
    background: none !important;
    border: none !important;
    color: #c33 !important;
    cursor: pointer !important;
    font-size: 1.2rem !important;
    padding: 4px 8px !important;
    opacity: 0.7 !important;
    transition: opacity 0.2s !important;
    flex-shrink: 0 !important;
    margin-left: auto !important;
    line-height: 1 !important;
  }

  .error-banner-dismiss:hover {
    opacity: 1 !important;
  }

  .error-banner-dismiss:focus {
    outline: 2px solid #c33 !important;
    outline-offset: 2px !important;
    border-radius: 4px !important;
  }
</style>
