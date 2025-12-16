<script lang="ts">
  export let qrCode: string;
  export let joinUrl: string;
  export let compact: boolean = false;
</script>

<div class="qr-section" class:compact>
  <h2>Player Join</h2>
  <div id="qrCodeContainer" class:compact>
    {#if qrCode}
      <img id="qrCode" src={qrCode} alt="QR Code" />
    {/if}
  </div>
  <p class="join-url">Scan to join or visit: <span>{joinUrl}</span></p>
</div>

<style>
  .qr-section {
    text-align: center;
  }

  .qr-section.compact h2 {
    font-size: 1.2rem;
    margin-bottom: 15px;
  }

  #qrCodeContainer {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin: 20px 0;
    display: inline-block;
  }

  #qrCodeContainer.compact {
    padding: 12px;
    margin: 15px 0;
  }

  #qrCode {
    max-width: 256px;
    width: 100%;
    height: auto;
  }

  .compact #qrCode {
    max-width: 220px;
  }

  .join-url {
    font-size: 0.9rem;
    color: #666;
    word-break: break-all;
  }
</style>
