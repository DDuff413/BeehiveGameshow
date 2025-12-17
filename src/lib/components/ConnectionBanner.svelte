<script lang="ts">
  import { connectionStatus, errorMessage, reconnect } from "../db/store";
</script>

<!-- Connection Status Banner -->
{#if $connectionStatus === "error"}
  <div class="connection-banner error">
    <span class="banner-icon">⚠️</span>
    <div class="banner-content">
      <span>{$errorMessage || "Connection lost"}</span>
      <button class="retry-btn" onclick={reconnect}>Retry Now</button>
    </div>
  </div>
{:else if $connectionStatus === "reconnecting"}
  <div class="connection-banner warning">
    <span class="banner-icon">🔄</span>
    <span>Reconnecting to database...</span>
  </div>
{:else if $connectionStatus === "disconnected"}
  <div class="connection-banner warning">
    <span class="banner-icon">🔄</span>
    <span>Connecting to database...</span>
  </div>
{/if}

<style>
  .connection-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: var(--space-3) var(--space-5);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    font-weight: var(--font-weight-medium);
    z-index: var(--z-fixed);
    animation: slideDown var(--transition-base) ease;
  }

  .connection-banner.error {
    background: var(--color-danger);
    color: var(--color-text-inverse);
  }

  .connection-banner.warning {
    background: var(--color-warning);
    color: var(--color-text-primary);
  }

  .banner-icon {
    font-size: var(--font-size-xl);
  }

  .banner-content {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .retry-btn {
    background: var(--color-bg-card);
    color: var(--color-danger);
    border: none;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-sm);
    transition: opacity var(--transition-fast);
  }

  .retry-btn:hover {
    opacity: 0.9;
  }

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
    }
    to {
      transform: translateY(0);
    }
  }
</style>
