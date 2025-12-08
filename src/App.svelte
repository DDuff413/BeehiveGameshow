<script lang="ts">
  import Host from './routes/Host.svelte';
  import Join from './routes/Join.svelte';
  
  // Simple routing based on path
  let currentPath = window.location.pathname;
</script>

{#if currentPath === '/join'}
  <Join />
{:else}
  <Host />
{/if}
