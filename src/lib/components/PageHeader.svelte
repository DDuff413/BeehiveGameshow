<script lang="ts">
  export let subtitle: string | null = null;
</script>

<header>
  <h1>
    <img src="/beehive-icon.png" alt="Beehive" class="title-icon" />Gameshow
    of Totally Reasonable and Normal Games<img
      src="/beehive-icon.png"
      alt="Beehive"
      class="title-icon"
    />
  </h1>
  {#if subtitle}
    <p class="subtitle">{subtitle}</p>
  {/if}
</header>

<style>
  header {
    text-align: center;
    margin-bottom: var(--space-8);
  }

  h1 {
    font-size: var(--font-size-4xl);
    color: var(--color-text-primary);
    margin-bottom: var(--space-2);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .title-icon {
    width: var(--space-12);
    height: var(--space-12);
    object-fit: contain;
    vertical-align: middle;
  }

  .subtitle {
    font-size: var(--font-size-xl);
    color: var(--color-text-secondary);
  }
</style>
