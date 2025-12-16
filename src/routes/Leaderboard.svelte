<script lang="ts">
  import { onMount } from "svelte";
  import {
    players,
    teams,
    teamsWithPlayers,
    initializeStores,
  } from "../lib/db/store";
  import ConnectionBanner from "../lib/components/ConnectionBanner.svelte";
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

  <header>
    <h1>
      <img src="/beehive-icon.png" alt="Beehive" class="title-icon" />Gameshow
      of Totally Reasonable and Normal Games<img
        src="/beehive-icon.png"
        alt="Beehive"
        class="title-icon"
      />
    </h1>
    <p class="subtitle">Display Board</p>
  </header>

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
          <h2>Join the Game</h2>
          <div class="qr-container">
            {#if qrCode}
              <img class="qr-image" src={qrCode} alt="QR Code" />
            {/if}
          </div>
          <p class="join-url-display">
            Scan to join or visit: <strong>{joinUrl}</strong>
          </p>
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
                        <div class="team-member-display">{player.name}</div>
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
                    <div class="unassigned-player">{player.name}</div>
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
                    <div class="player-display-card">{player.name}</div>
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
              <div class="leaderboard-row">
                <div class="rank-badge">#{index + 1}</div>
                <div class="player-info">
                  <span class="player-name-leaderboard">{player.name}</span>
                  <span class="points-badge">{player.points ?? 0} pts</span>
                </div>
                <div class="progress-container">
                  <div
                    class="progress-bar"
                    style="width: {maxPoints > 0
                      ? ((player.points ?? 0) / maxPoints) * 100
                      : 0}%"
                  ></div>
                </div>
              </div>
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

  .qr-display h2 {
    margin-bottom: 20px;
    color: var(--text-color);
  }

  .qr-container {
    background: white;
    padding: 20px;
    border-radius: 12px;
    margin: 20px 0;
    display: inline-block;
  }

  .qr-image {
    max-width: 100%;
    height: auto;
    display: block;
  }

  .join-url-display {
    font-size: 1rem;
    color: #666;
    word-break: break-all;
    line-height: 1.6;
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

  .team-member-display {
    padding: 10px;
    margin-bottom: 8px;
    background: white;
    border-radius: 6px;
    border-left: 4px solid var(--primary-color);
    font-weight: 500;
  }

  .team-member-display:last-child {
    margin-bottom: 0;
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

  .unassigned-player {
    background: var(--bg-color);
    padding: 12px 15px;
    border-radius: 8px;
    border-left: 4px solid var(--warning-color);
    font-weight: 500;
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

  .player-display-card {
    background: var(--bg-color);
    padding: 15px 20px;
    border-radius: 8px;
    border-left: 4px solid var(--primary-color);
    font-weight: 600;
    font-size: 1.1rem;
    transition: transform 0.2s;
  }

  .player-display-card:hover {
    transform: translateX(5px);
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

  .leaderboard-row {
    display: grid;
    grid-template-columns: 50px 1fr 2fr;
    gap: 12px;
    align-items: center;
    margin-bottom: 8px;
    padding: 12px 16px;
    background: var(--bg-color);
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .leaderboard-row:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .rank-badge {
    width: 40px;
    height: 40px;
    background: var(--primary-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.1rem;
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }

  .player-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .player-name-leaderboard {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-color);
  }

  .points-badge {
    background: var(--success-color);
    color: white;
    padding: 4px 10px;
    border-radius: 16px;
    font-size: 0.85rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .progress-container {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 50px;
    height: 24px;
    overflow: hidden;
    position: relative;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(
      90deg,
      var(--primary-color) 0%,
      var(--secondary-color) 100%
    );
    border-radius: 50px;
    transition: width 0.6s ease-out;
    box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.3);
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

    .leaderboard-row {
      grid-template-columns: 50px 1fr;
      gap: 15px;
    }

    .player-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      grid-column: 1 / -1;
    }

    .progress-container {
      grid-column: 1 / -1;
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

    .player-name-leaderboard {
      font-size: 1.1rem;
    }
  }
</style>
