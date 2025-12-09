<script lang="ts">
  import { onMount } from 'svelte';
  import Host from './routes/Host.svelte';
  import Join from './routes/Join.svelte';
  
  let currentPath = $state(window.location.pathname);

  onMount(() => {
    const handlePopState = () => {
      currentPath = window.location.pathname;
    };

    const handleLinkClick = (event: MouseEvent) => {
      // Only handle left-clicks without modifier keys
      if (
        event.defaultPrevented ||
        event.button !== 0 || // not left click
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
      ) return;

      // Find the closest anchor element
      let anchor = (event.target as HTMLElement).closest && (event.target as HTMLElement).closest('a');
      if (!anchor) return;

      // Only handle anchors with href starting with '/' (internal links)
      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('/') || href.startsWith('//')) return;

      // Prevent default navigation
      event.preventDefault();

      // Update history and currentPath
      history.pushState({}, '', href);
      currentPath = href;
    };

    window.addEventListener('popstate', handlePopState);
    document.addEventListener('click', handleLinkClick);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleLinkClick);
    };
  });
</script>

{#if currentPath === '/join'}
  <Join />
{:else}
  <Host />
{/if}

