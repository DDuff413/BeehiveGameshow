<script lang="ts">
  import { onMount } from "svelte";
  import {
    players,
    teams,
    teamsWithPlayers,
    initializeStores,
  } from "../lib/db/store";
  import ConnectionBanner from "../lib/components/ConnectionBanner.svelte";
  import TeamCard from "../lib/components/TeamCard.svelte";
  import QRCodeSection from "../lib/components/QRCodeSection.svelte";
  import PlayersList from "../lib/components/PlayersList.svelte";
  import TeamControls from "../lib/components/TeamControls.svelte";
  import QRCode from "qrcode";

  let qrCode = "";
  let joinUrl = "";
  let isLoading = true;

  onMount(async () => {
    // 1. Initialize Stores (Fetch + Subscribe)
    await initializeStores();

    // 2. Generate QR Code
    joinUrl = `${window.location.origin}/join`;
    try {
      qrCode = await QRCode.toDataURL(joinUrl);
    } catch (err) {
      console.error("QR Gen Error", err);
    }
    
    isLoading = false;
  });

  $: hasPlayers = $players.length > 0;
  $: hasTeams = $teamsWithPlayers.length > 0;
</script>

<ConnectionBanner />

<div class="container">
  <header>
    <h1><img src="/beehive-icon.png" alt="Beehive" class="title-icon" />Gameshow of Totally Reasonable and Normal Games<img src="/beehive-icon.png" alt="Beehive" class="title-icon" /></h1>
    <p class="subtitle">Host Dashboard</p>
  </header>

  {#if isLoading}
    <div class="loading-container" aria-live="polite" aria-busy="true">
      <div class="loading-spinner-large" role="status" aria-label="Loading"></div>
      <p>Loading dashboard...</p>
    </div>
  {:else}
    <div class="main-content">
      <QRCodeSection {qrCode} {joinUrl} />
      <PlayersList players={$players} teams={$teams} />
    </div>

    <TeamControls
      players={$players}
      allTeams={$teams}
      {hasPlayers}
      {hasTeams}
    />

    <!-- Teams Display -->
    {#if hasTeams}
      <div class="teams-section" id="teamsSection">
        <h2>Teams</h2>
        <div id="teamsList" class="teams-list">
        {#each $teamsWithPlayers as team (team.id)}
          <TeamCard {team} />
        {/each}
      </div>
    </div>
  {/if}
  {/if}
</div>
