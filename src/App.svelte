<script lang="ts">
  import { onMount } from 'svelte';
  import Host from './routes/Host.svelte';
  import Join from './routes/Join.svelte';
  
  let currentPath = $state(window.location.pathname);

  onMount(() => {
    const handlePopState = () => {
      currentPath = window.location.pathname;
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  });
</script>

{#if currentPath === '/join'}
  <Join />
{:else}
  <Host />
{/if}

