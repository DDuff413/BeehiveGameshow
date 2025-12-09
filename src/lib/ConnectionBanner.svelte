<script lang="ts">
  import { socketConnected, socketError, socketReconnecting } from './socket';
</script>

<!-- Connection Status Banner -->
{#if $socketError}
  <div class="connection-banner error">
    <span class="banner-icon">⚠️</span>
    <span>{$socketError}</span>
  </div>
{:else if $socketReconnecting}
  <div class="connection-banner reconnecting">
    <span class="banner-icon">🔄</span>
    <span>Reconnecting to server...</span>
  </div>
{:else if !$socketConnected}
  <div class="connection-banner warning">
    <span class="banner-icon">⏸️</span>
    <span>Disconnected from server</span>
  </div>
{/if}
