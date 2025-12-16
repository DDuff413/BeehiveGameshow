<script lang="ts">
  import { onMount } from "svelte";
  import {
    players,
    teams,
    teamsWithPlayers,
    initializeStores,
  } from "../lib/db/store";
  import ConnectionBanner from "../lib/components/ConnectionBanner.svelte";
  import PageHeader from "../lib/components/PageHeader.svelte";
  import PlayerDisplay from "../lib/components/PlayerDisplay.svelte";
  import QRCodeSection from "../lib/components/QRCodeSection.svelte";
  import QRCode from "qrcode";
  import type { Player, Team } from "../lib/types";

  type ViewMode = "players" | "leaderboard";

  let viewMode: ViewMode = "players";
  let qrCode = "";
  let joinUrl = "";
  let isLoading = true;

  onMount(async () => {
    // Initialize Stores
    await initializeStores();

    // Generate QR Code
    joinUrl = `${window.location.origin}/join`;
    try {
      qrCode = await QRCode.toDataURL(joinUrl, { width: 400 });
    } catch (err) {
      console.error("QR Gen Error", err);
    }

    isLoading = false;
  });

  $: hasTeams = $teamsWithPlayers.length > 0;
  $: unassignedPlayers = $players.filter((p) => !p.team_id);

  // Calculate leaderboard data - sort players by points descending
  $: leaderboardPlayers = [...$players].sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
  $: maxPoints = Math.max(...$players.map((p) => p.points ?? 0), 0);
</script>

<ConnectionBanner />

<div class="container leaderboard-container">
  <!-- Navigation Bar -->
  <nav class="leaderboard-nav">
    <a href="/player" class="nav-link">
      <span class="nav-icon">👤</span>
      <span>Back to Player Dashboard</span>
    </a>
  </nav>

  <PageHeader subtitle="Display Board" />

  {#if isLoading}
    <div class="loading-container" aria-live="polite" aria-busy="true">
      <div
        class="loading-spinner-large"
        role="status"
        aria-label="Loading"
      ></div>
      <p>Loading display...</p>
    </div>
  {:else}
    <!-- Mode Toggle -->
    <div class="mode-toggle">
      <button
        class="mode-chip {viewMode === 'players' ? 'active' : ''}"
        on:click={() => (viewMode = "players")}
      >
        Players
      </button>
      <button
        class="mode-chip {viewMode === 'leaderboard' ? 'active' : ''}"
        on:click={() => (viewMode = "leaderboard")}
      >
        Leaderboard
      </button>
    </div>

    {#if viewMode === "players"}
      <!-- Players Mode -->
      <div class="players-view">
        <!-- QR Code Section -->
        <div class="qr-display">
          <QRCodeSection {qrCode} {joinUrl} compact={true} />
        </div>

        <!-- Teams or Players List -->
        <div class="players-display">
          {#if hasTeams}
            <!-- Show Team Cards -->
            <div class="teams-grid">
              {#each $teamsWithPlayers as team (team.id)}
                <div class="team-display-card">
                  <h3 class="team-display-name">{team.name}</h3>
                  <div class="team-display-members">
                    {#if team.players && team.players.length > 0}
                      {#each team.players as player (player.id)}
                        <PlayerDisplay {player} variant="simple" />
                      {/each}
                    {:else}
                      <p class="empty-team">No players assigned</p>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>

            <!-- Unassigned Players -->
            {#if unassignedPlayers.length > 0}
              <div class="unassigned-section">
                <h3>Unassigned Players</h3>
                <div class="unassigned-list">
                  {#each unassignedPlayers as player (player.id)}
                    <PlayerDisplay {player} variant="simple" />
                  {/each}
                </div>
              </div>
            {/if}
          {:else}
            <!-- Show All Players List -->
            <div class="all-players-section">
              <h2>Players ({$players.length})</h2>
              {#if $players.length > 0}
                <div class="all-players-grid">
                  {#each $players as player (player.id)}
                    <PlayerDisplay {player} variant="simple" />
                  {/each}
                </div>
              {:else}
                <p class="empty-state">No players have joined yet</p>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    {:else}
      <!-- Leaderboard Mode -->
      <div class="leaderboard-view">
        <h2 class="leaderboard-title">Leaderboard</h2>
        {#if $players.length > 0}
          <div class="leaderboard-chart">
            {#each leaderboardPlayers as player, index (player.id)}
              <PlayerDisplay
                {player}
                variant="leaderboard"
                showPoints={true}
                showRank={true}
                rank={index + 1}
                {maxPoints}
              />
            {/each}
          </div>
        {:else}
          <p class="empty-state">No players to display</p>
        {/if}
      </div>
    {/if}
  {/if}
</div>

<style>
  .leaderboard-container {
    max-width: 1400px;
  }

  .mode-toggle {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 30px;
    padding: 10px;
    background: var(--card-bg);
    border-radius: 50px;
    box-shadow: var(--shadow);
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }

  .mode-chip {
    flex: 1;
    padding: 12px 24px;
    border: none;
    border-radius: 50px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    background: transparent;
    color: #666;
    transition: all 0.3s;
  }

  .mode-chip:hover {
    background: var(--bg-color);
  }

  .mode-chip.active {
    background: var(--primary-color);
    color: var(--text-color);
    box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
  }

  /* Players View */
  .players-view {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 30px;
    align-items: start;
  }

  .qr-display {
    background: var(--card-bg);
    border-radius: 12px;
    padding: 30px;
    box-shadow: var(--shadow);
    text-align: center;
    position: sticky;
    top: 20px;
  }

  .players-display {
    background: var(--card-bg);
    border-radius: 12px;
    padding: 30px;
    box-shadow: var(--shadow);
  }

  .teams-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .team-display-card {
    background: linear-gradient(
      135deg,
      var(--primary-color) 0%,
      var(--secondary-color) 100%
    );
    padding: 20px;
    border-radius: 12px;
    box-shadow: var(--shadow);
  }

  .team-display-name {
    font-size: 1.4rem;
    margin-bottom: 15px;
    color: white;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  }

  .team-display-members {
    background: rgba(255, 255, 255, 0.95);
    padding: 15px;
    border-radius: 8px;
  }

  .empty-team {
    color: #999;
    font-style: italic;
    text-align: center;
    padding: 10px;
  }

  .unassigned-section {
    margin-top: 30px;
    padding-top: 30px;
    border-top: 2px solid var(--border-color);
  }

  .unassigned-section h3 {
    margin-bottom: 15px;
    color: var(--text-color);
  }

  .unassigned-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
  }

  .all-players-section h2 {
    margin-bottom: 20px;
    color: var(--text-color);
  }

  .all-players-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }

  /* Leaderboard View */
  .leaderboard-view {
    background: var(--card-bg);
    border-radius: 12px;
    padding: 40px;
    box-shadow: var(--shadow);
  }

  .leaderboard-title {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 25px;
    color: var(--text-color);
  }

  .leaderboard-chart {
    max-width: 1000px;
    margin: 0 auto;
  }

  .empty-state {
    text-align: center;
    color: #999;
    padding: 60px 20px;
    font-size: 1.2rem;
    font-style: italic;
  }

  .leaderboard-nav {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: var(--card-bg);
    border-radius: 50px;
    text-decoration: none;
    color: var(--text-color);
    font-weight: 600;
    box-shadow: var(--shadow);
    transition: all 0.3s;
  }

  .nav-link:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background: var(--primary-color);
  }

  .nav-icon {
    font-size: 1.2rem;
  }

  /* Responsive Design */
  @media (max-width: 968px) {
    .players-view {
      grid-template-columns: 1fr;
    }

    .qr-display {
      position: static;
    }
  }

  @media (max-width: 768px) {
    .mode-toggle {
      max-width: 100%;
    }

    .teams-grid {
      grid-template-columns: 1fr;
    }

    .all-players-grid {
      grid-template-columns: 1fr;
    }

    .unassigned-list {
      grid-template-columns: 1fr;
    }

    .leaderboard-title {
      font-size: 2rem;
    }
  }
</style>
