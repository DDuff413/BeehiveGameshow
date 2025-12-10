<script lang="ts">
  import { connectionStatus } from "./store";
</script>

<!-- Connection Status Banner -->
{#if $connectionStatus === "error"}
  <div class="connection-banner error">
    <span class="banner-icon">⚠️</span>
    <span>Connection lost. Reconnecting...</span>
  </div>
{:else if $connectionStatus === "disconnected"}
  <!-- Optionally show this, or stay silent on initial load. 
       Usually disconnected state is brief. Let's show it yellow. -->
  <div class="connection-banner warning">
    <span class="banner-icon">🔄</span>
    <span>Connecting to database...</span>
  </div>
{/if}
