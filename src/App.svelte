<script lang="ts">
  import { onMount } from "svelte";
  import Host from "./routes/Host.svelte";
  import Join from "./routes/Join.svelte";
  import Player from "./routes/Player.svelte";
  import { currentRoute, navigate } from "./lib/router";

  onMount(() => {
    const handleLinkClick = (event: MouseEvent) => {
      // Only handle left-clicks without modifier keys
      if (
        event.defaultPrevented ||
        event.button !== 0 || // not left click
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;

      // Find the closest anchor element
      if (!(event.target instanceof HTMLElement)) return;
      const anchor = event.target.closest("a");
      if (!anchor) return;

      // Only handle anchors with href starting with '/' (internal links)
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("//")) return;

      // Prevent default navigation
      event.preventDefault();

      // Use centralized router
      navigate(href);
    };

    document.addEventListener("click", handleLinkClick);

    return () => {
      document.removeEventListener("click", handleLinkClick);
    };
  });
</script>

{#if $currentRoute === "/join"}
  <Join />
{:else if $currentRoute === "/player"}
  <Player />
{:else}
  <Host />
{/if}
