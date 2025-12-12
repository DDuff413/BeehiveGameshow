<script lang="ts">
  export let qrCode: string;
  export let joinUrl: string;
</script>

<div class="qr-section">
  <h2>Player Join</h2>
  <div id="qrCodeContainer">
    {#if qrCode}
      <img id="qrCode" src={qrCode} alt="QR Code" />
    {/if}
  </div>
  <p class="join-url">Scan to join or visit: <span>{joinUrl}</span></p>
</div>
