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
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin: 20px 0;
    display: inline-block;
  }

  .qr-code {
    max-width: 256px;
    width: 100%;
    height: auto;
  }

  .join-url {
    font-size: 0.9rem;
    color: #666;
    word-break: break-all;
  }
</style>
