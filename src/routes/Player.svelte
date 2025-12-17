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
  import ErrorBanner from "../lib/components/ErrorBanner.svelte";
  import PageHeader from "../lib/components/PageHeader.svelte";
  import type { Player, Team } from "../lib/types";
  import { navigate } from "../lib/router";

  let playerId: string | null = null;
  let currentPlayer: Player | undefined;
  let currentTeam: Team | undefined;
  let teammates: Player[] = [];
  let isActionPending = false;
  let showTeammates = false;
  let errorMessage = "";
  let isLoading = true;

  onMount(async () => {
    // 1. Initialize Stores
    await initializeStores();

    // 2. Check Session
    playerId = localStorage.getItem("beehive_player_id");
    if (!playerId) {
      navigate("/join");
      return;
    }
    
    isLoading = false;
  });

  // Reactive Logic

  // Find Current Player
  $: currentPlayer = $players.find((p) => p.id === playerId);

  // Handle Removal / Invalid Session
  // Only redirect if we are fully connected and confirmed not to be in the list.
  // This implicitly handles the "reconnecting" -> "connected" transition:
  // once connection is restored, this block re-evaluates.
  $: if ($connectionStatus === "connected" && !currentPlayer && playerId) {
    alert("You have been removed from the game.");
    localStorage.removeItem("beehive_player_id");
    navigate("/join");
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

    errorMessage = "";
    isActionPending = true;
    try {
      const result = await removePlayer(currentPlayer.id);
      if (!result.success) {
        throw new Error(result.error);
      }
      localStorage.removeItem("beehive_player_id");
      navigate("/join");
    } catch (error: any) {
      console.error("Leave game failed:", error);
      errorMessage = `Failed to leave game: ${error.message || "Unknown error"}. Please try again.`;
    } finally {
      isActionPending = false;
    }
  }
</script>

<ConnectionBanner />

<div class="container">
  {#if isLoading}
    <div class="loading-container" aria-live="polite" aria-busy="true">
      <div class="loading-spinner-large" role="status" aria-label="Loading"></div>
      <p>Loading your dashboard...</p>
    </div>
  {:else if currentPlayer}
    <!-- Navigation Bar -->
    <nav class="player-nav">
      <a href="/leaderboard" class="nav-link">
        <span class="nav-icon">📊</span>
        <span>View Leaderboard</span>
      </a>
    </nav>

    <PageHeader subtitle="Player Dashboard" />

    <div class="main-content player-dashboard">
      <ErrorBanner message={errorMessage} autoDismiss={true} onDismiss={() => (errorMessage = "")} />
      
      <!-- Player Info -->
      <div class="player-header-card">
        <h2>{currentPlayer.name}</h2>
        <div class="points-display">
          <span class="points-value">{currentPlayer.points ?? 0}</span>
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
    gap: var(--space-8);
    max-width: 500px;
    margin: 0 auto;
  }

  .player-header-card {
    background: var(--color-bg-card);
    padding: var(--space-8);
    border-radius: var(--radius-lg);
    text-align: center;
    box-shadow: var(--shadow-lg);
  }

  .points-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: var(--space-4);
  }

  .points-value {
    font-size: var(--font-size-6xl);
    font-weight: var(--font-weight-extrabold);
    color: var(--color-primary);
    line-height: 1;
  }

  .points-label {
    font-size: var(--font-size-base);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-widest);
    opacity: 0.7;
  }

  .team-section-card {
    background: var(--color-bg-card);
    padding: var(--space-6);
    border-radius: var(--radius-lg);
  }

  .team-name {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-primary-light);
    margin-bottom: var(--space-4);
  }

  .toggle-teammates {
    background: none;
    border: 1px solid var(--color-border-medium);
    color: var(--color-text-primary);
    width: 100%;
    padding: var(--space-2);
    border-radius: var(--radius-md);
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .teammates-list {
    margin-top: var(--space-2);
    background: var(--color-bg-secondary);
    border-radius: var(--radius-md);
    padding: var(--space-2);
  }

  .teammate-row {
    padding: var(--space-2);
    border-bottom: 1px solid var(--color-border-medium);
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
    padding: var(--space-8);
  }

  .player-nav {
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
</style>
