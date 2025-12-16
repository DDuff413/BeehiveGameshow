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
    margin-bottom: 30px;
  }

  h1 {
    font-size: 2.5rem;
    color: var(--text-color);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .title-icon {
    width: 48px;
    height: 48px;
    object-fit: contain;
    vertical-align: middle;
  }

  .subtitle {
    font-size: 1.2rem;
    color: #666;
  }
</style>
