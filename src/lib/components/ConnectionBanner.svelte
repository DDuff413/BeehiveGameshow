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
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-weight: 500;
    z-index: 1000;
    animation: slideDown 0.3s ease;
  }

  .connection-banner.error {
    background: #dc3545;
    color: white;
  }

  .connection-banner.warning {
    background: #ffc107;
    color: #000;
  }

  .banner-icon {
    font-size: 1.2em;
  }

  .banner-content {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .retry-btn {
    background: white;
    color: #dc3545;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9em;
    transition: opacity 0.2s;
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
