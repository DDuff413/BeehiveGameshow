<script lang="ts">
  import { onMount, tick } from "svelte";
  import {
    players,
    teams,
    initializeStores,
    connectionStatus,
  } from "../lib/db/store";
  import { removePlayer } from "../lib/db/playerOperations";
  import ConnectionBanner from "../lib/components/ConnectionBanner.svelte";
  import type { Player, Team } from "../lib/types";

  let currentPlayer: Player | undefined;
  let currentTeam: Team | undefined;
  let teammates: Player[] = [];
  let isActionPending = false;
  let showTeammates = false;

  onMount(async () => {
    // 1. Initialize Stores
    await initializeStores();

    // 2. Check Session
    const playerId = localStorage.getItem("beehive_player_id");
    if (!playerId) {
      window.location.href = "/join";
      return;
    }
  });

  // Reactive Logic
  $: playerId = localStorage.getItem("beehive_player_id");

  // Find Current Player
  $: currentPlayer = $players.find((p) => p.id === playerId);

  // Handle Removal / Invalid Session
  // Only redirect if we are fully connected and confirmed not to be in the list
  $: if ($connectionStatus === "connected" && !currentPlayer && playerId) {
    alert("You have been removed from the game.");
    localStorage.removeItem("beehive_player_id");
    window.location.href = "/join";
  }

  // Find Current Team
  $: currentTeam = currentPlayer?.team_id
    ? $teams.find((t) => t.id === currentPlayer?.team_id)
    : undefined;

  // Find Teammates
  $: teammates = currentPlayer?.team_id
    ? $players.filter(
        (p) => p.team_id === currentPlayer?.team_id && p.id !== currentPlayer.id
      )
    : [];

  async function handleLeaveGame() {
    if (!confirm("Are you sure you want to leave the game?")) return;
    if (!currentPlayer) return;

    isActionPending = true;
    try {
      const result = await removePlayer(currentPlayer.id);
      if (!result.success) {
        throw new Error(result.error);
      }
      localStorage.removeItem("beehive_player_id");
      window.location.href = "/join";
    } catch (error: any) {
      console.error("Leave game failed:", error);
      alert("Failed to leave game: " + error.message);
    } finally {
      isActionPending = false;
    }
  }
</script>

<ConnectionBanner />

<div class="container">
  {#if currentPlayer}
    <header>
      <h1>🐝 Beehive</h1>
      <p class="subtitle">Player Dashboard</p>
    </header>

    <div class="main-content player-dashboard">
      <!-- Player Info -->
      <div class="player-header-card">
        <h2>{currentPlayer.name}</h2>
        <div class="points-display">
          <span class="points-value">{currentPlayer.points || 0}</span>
          <span class="points-label">PTS</span>
        </div>
      </div>

      <!-- Team Info -->
      <div class="team-section-card">
        <h3>Your Team</h3>
        {#if currentTeam}
          <div class="team-name">{currentTeam.name}</div>

          {#if teammates.length > 0}
            <button
              class="toggle-teammates"
              on:click={() => (showTeammates = !showTeammates)}
            >
              {showTeammates ? "Hide" : "Show"} Teammates ({teammates.length})
              <span class="arrow">{showTeammates ? "▲" : "▼"}</span>
            </button>

            {#if showTeammates}
              <div class="teammates-list">
                {#each teammates as member}
                  <div class="teammate-row">
                    <span class="teammate-name">{member.name}</span>
                  </div>
                {/each}
              </div>
            {/if}
          {:else}
            <p class="no-teammates">No other teammates yet</p>
          {/if}
        {:else}
          <div class="no-team">You are not in a team yet</div>
        {/if}
      </div>

      <!-- Actions -->
      <button
        class="btn btn-danger leave-btn"
        disabled={isActionPending}
        on:click={handleLeaveGame}
      >
        Leave Game
      </button>
    </div>
  {:else}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading profile...</p>
    </div>
  {/if}
</div>

<style>
  .player-dashboard {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 500px;
    margin: 0 auto;
  }

  .player-header-card {
    background: var(--bg-secondary);
    padding: 2rem;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .points-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 1rem;
  }

  .points-value {
    font-size: 4rem;
    font-weight: 800;
    color: var(--primary);
    line-height: 1;
  }

  .points-label {
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 2px;
    opacity: 0.7;
  }

  .team-section-card {
    background: var(--bg-secondary);
    padding: 1.5rem;
    border-radius: 12px;
  }

  .team-name {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--accent);
    margin-bottom: 1rem;
  }

  .toggle-teammates {
    background: none;
    border: 1px solid var(--border);
    color: var(--text);
    width: 100%;
    padding: 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .teammates-list {
    margin-top: 0.5rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    padding: 0.5rem;
  }

  .teammate-row {
    padding: 0.5rem;
    border-bottom: 1px solid var(--border);
  }
  .teammate-row:last-child {
    border-bottom: none;
  }

  .leave-btn {
    width: 100%;
    margin-top: auto;
  }

  .loading-state {
    text-align: center;
    padding: 2rem;
  }
</style>
