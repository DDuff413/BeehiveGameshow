<script lang="ts">
  export let qrCode: string;
  export let joinUrl: string;
</script>

<div class="qr-section">
  <h2>Player Join</h2>
  <div class="qr-code-container">
    {#if qrCode}
      <img class="qr-code" src={qrCode} alt="QR Code" />
    {/if}
  </div>
  <p class="join-url">Scan to join or visit: <span>{joinUrl}</span></p>
</div>

<style>
  .qr-section {
    text-align: center;
  }

  .qr-code-container {
    background: var(--color-bg-card);
    padding: var(--space-5);
    border-radius: var(--radius-md);
    margin: var(--space-5) 0;
    display: inline-block;
  }

  .qr-code {
    display: block;
    max-width: var(--max-width-qr);
    width: 100%;
    height: auto;
  }

  .join-url {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    word-break: break-all;
  }
</style>
