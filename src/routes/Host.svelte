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
  import PageHeader from "../lib/components/PageHeader.svelte";
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
  <PageHeader subtitle="Host Dashboard" />
  
  <div style="text-align: center; margin-bottom: 20px;">
    <button 
      class="btn btn-secondary open-leaderboard-btn"
      on:click={() => window.open('/leaderboard', '_blank')}
    >
      📊 Open Leaderboard Display
    </button>
  </div>

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
