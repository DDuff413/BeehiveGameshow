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
  let hasPlayerId = false;

  onMount(async () => {
    // Initialize Stores
    await initializeStores();

    // Check if player ID exists
    hasPlayerId = !!localStorage.getItem("beehive_player_id");

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
  {#if hasPlayerId}
    <nav class="leaderboard-nav">
      <a href="/player" class="nav-link">
        <span class="nav-icon">👤</span>
        <span>Back to Player Dashboard</span>
      </a>
    </nav>
  {/if}

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
        <!-- QR Code Section - Desktop (sidebar) -->
        <div class="qr-desktop">
          <QRCodeSection {qrCode} {joinUrl} />
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

        <!-- QR Code Section - Mobile (bottom) -->
        <div class="qr-mobile">
          <QRCodeSection {qrCode} {joinUrl} />
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
    max-width: var(--container-2xl);
  }

  .mode-toggle {
    display: flex;
    justify-content: center;
    gap: var(--space-2);
    margin-bottom: var(--space-8);
    padding: var(--space-2);
    background: var(--color-bg-card);
    border-radius: var(--radius-full);
    box-shadow: var(--shadow-md);
    max-width: var(--max-width-input);
    margin-left: auto;
    margin-right: auto;
  }

  .mode-chip {
    flex: 1;
    padding: var(--space-3) var(--space-6);
    border: none;
    border-radius: var(--radius-full);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    cursor: pointer;
    background: transparent;
    color: var(--color-text-secondary);
    transition: all var(--transition-base);
  }

  .mode-chip:hover {
    background: var(--color-bg-primary);
  }

  .mode-chip.active {
    background: var(--color-primary);
    color: var(--color-text-primary);
    box-shadow: var(--shadow-glow);
  }

  /* Players View */
  .players-view {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: var(--space-8);
    align-items: start;
  }

  .qr-desktop {
    position: sticky;
    top: var(--space-5);
  }

  .qr-mobile {
    display: none;
  }

  .players-display {
    background: var(--color-bg-card);
    border-radius: var(--radius-lg);
    padding: var(--space-8);
    box-shadow: var(--shadow-md);
  }

  .teams-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-5);
    margin-bottom: var(--space-8);
  }

  .team-display-card {
    background: linear-gradient(
      135deg,
      var(--color-primary) 0%,
      var(--color-primary-dark) 100%
    );
    padding: var(--space-5);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
  }

  .team-display-name {
    font-size: var(--font-size-2xl);
    margin-bottom: var(--space-4);
    color: var(--color-text-inverse);
    text-shadow: var(--shadow-sm);
  }

  .team-display-members {
    background: var(--color-overlay-light);
    padding: var(--space-4);
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .empty-team {
    color: var(--color-text-tertiary);
    font-style: italic;
    text-align: center;
    padding: var(--space-2);
  }

  .unassigned-section {
    margin-top: var(--space-8);
    padding-top: var(--space-8);
    border-top: 2px solid var(--color-border-light);
  }

  .unassigned-section h3 {
    margin-bottom: var(--space-4);
    color: var(--color-text-primary);
  }

  .unassigned-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--space-2);
  }

  .all-players-section h2 {
    margin-bottom: var(--space-5);
    color: var(--color-text-primary);
  }

  .all-players-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--space-4);
  }

  /* Leaderboard View */
  .leaderboard-view {
    background: var(--color-bg-card);
    border-radius: var(--radius-lg);
    padding: var(--space-10);
    box-shadow: var(--shadow-md);
  }

  .leaderboard-title {
    text-align: center;
    font-size: var(--font-size-4xl);
    margin-bottom: var(--space-6);
    color: var(--color-text-primary);
  }

  .leaderboard-chart {
    max-width: var(--container-lg);
    margin: 0 auto;
  }

  .empty-state {
    text-align: center;
    color: var(--color-text-tertiary);
    padding: var(--space-16) var(--space-5);
    font-size: var(--font-size-xl);
    font-style: italic;
  }

  .leaderboard-nav {
    display: flex;
    justify-content: center;
    margin-bottom: var(--space-5);
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-6);
    background: var(--color-bg-card);
    border-radius: var(--radius-full);
    text-decoration: none;
    color: var(--color-text-primary);
    font-weight: var(--font-weight-semibold);
    box-shadow: var(--shadow-md);
    transition: all var(--transition-base);
  }

  .nav-link:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-2xl);
    background: var(--color-primary);
  }

  .nav-icon {
    font-size: var(--font-size-xl);
  }

  /* Responsive Design */
  /* Desktop breakpoint - see tokens.css for breakpoint documentation */
  @media (max-width: 1024px) {
    .players-view {
      grid-template-columns: 1fr;
    }

    .qr-desktop {
      display: none;
    }

    .qr-mobile {
      display: block;
      margin-top: var(--space-8);
    }
  }

  /* Tablet breakpoint - see tokens.css for breakpoint documentation */
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
      font-size: var(--font-size-4xl);
    }
  }
</style>
