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
  });

  $: hasPlayers = $players.length > 0;
  $: hasTeams = $teamsWithPlayers.length > 0;
</script>

<ConnectionBanner />

<div class="container">
  <header>
    <h1>🐝 Beehive Gameshow</h1>
    <p class="subtitle">Host Dashboard</p>
  </header>

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
</div>
