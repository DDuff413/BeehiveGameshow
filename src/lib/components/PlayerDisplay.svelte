<script lang="ts">
  import type { Player } from "../types";
  import { updatePlayerPoints } from "../db/pointsOperations";

  export let player: Player;
  export let variant: "leaderboard" | "team" | "grid" | "simple" = "simple";
  export let showPoints: boolean = false;
  export let showRank: boolean = false;
  export let showDelete: boolean = false;
  export let showPointControls: boolean = false;
  export let showTeam: boolean = false;
  export let teamName: string = "";
  export let rank: number | null = null;
  export let maxPoints: number = 0;
  export let disabled: boolean = false;
  export let onDelete: ((id: string) => void) | null = null;

  let pointsError = "";

  async function adjustPoints(delta: number) {
    pointsError = "";
    const result = await updatePlayerPoints(player.id, delta);
    if (!result.success) {
      pointsError = result.error || "Failed to update points";
      setTimeout(() => (pointsError = ""), 3000);
    }
  }

  // Calculate progress bar width for leaderboard
  $: progressWidth =
    variant === "leaderboard" && maxPoints > 0
      ? ((player.points ?? 0) / maxPoints) * 100
      : 0;
</script>

{#if variant === "leaderboard"}
  <div class="leaderboard-row" class:with-rank={showRank && rank !== null}>
    {#if showRank && rank !== null}
      <div class="rank-badge">#{rank}</div>
    {/if}
    <div class="player-info">
      <span class="player-name-leaderboard">{player.name}</span>
      {#if showPoints}
        <span class="points-badge">{player.points ?? 0} pts</span>
      {/if}
    </div>
    <div class="progress-container">
      <div class="progress-bar" style="width: {progressWidth}%"></div>
    </div>
  </div>
{:else if variant === "team"}
  <div class="team-member-wrapper">
    <div class="team-member-display">
      <span class="team-member-name">{player.name}</span>
      {#if showPoints && showPointControls}
        <div class="member-controls">
          <button
            class="btn-point small minus"
            on:click={() => adjustPoints(-1)}
            disabled={(player.points ?? 0) <= 0}
            aria-label="Subtract 1 point from {player.name}"
          >-</button>
          <span class="member-points">{player.points ?? 0}</span>
          <button
            class="btn-point small plus"
            on:click={() => adjustPoints(1)}
            aria-label="Add 1 point to {player.name}"
          >+</button>
        </div>
      {:else if showPoints}
        <span class="team-member-points">{player.points ?? 0} pts</span>
      {/if}
    </div>
    {#if pointsError}
      <span class="points-error">{pointsError}</span>
    {/if}
  </div>
{:else if variant === "grid"}
  <div class="player-card-grid" class:team-assigned={showTeam && teamName}>
    <div class="player-grid-info">
      <span class="player-name">{player.name}</span>
      {#if showTeam && teamName}
        <span class="player-team-name">{teamName}</span>
      {/if}
      {#if showPoints}
        <span class="player-points">{player.points ?? 0} pts</span>
      {/if}
    </div>
    {#if showDelete && onDelete}
      <button
        class="delete-btn"
        on:click={() => onDelete?.(player.id)}
        {disabled}
        aria-label="Remove {player.name}"
        title="Remove Player"
      >
        🗑️
      </button>
    {/if}
  </div>
{:else}
  <!-- Simple variant - just name and optional points -->
  <div class="player-simple">
    <span class="player-name">{player.name}</span>
    {#if showPoints}
      <span class="player-points">{player.points ?? 0} pts</span>
    {/if}
  </div>
{/if}

<style>
  /* Leaderboard variant */
  .leaderboard-row {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: var(--space-3);
    align-items: center;
    margin-bottom: var(--space-2);
    padding: var(--space-3) var(--space-4);
    background: var(--color-bg-primary);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-xs);
    transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  }

  .leaderboard-row.with-rank {
    grid-template-columns: var(--space-12) 1fr 2fr;
  }

  .leaderboard-row:hover {
    transform: translateX(var(--space-1));
    box-shadow: var(--shadow-md);
  }

  .rank-badge {
    width: var(--space-10);
    height: var(--space-10);
    background: var(--color-primary);
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-lg);
    color: var(--color-text-inverse);
    box-shadow: var(--shadow-md);
  }

  .player-info {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .player-name-leaderboard {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .points-badge {
    background: var(--color-success);
    color: var(--color-text-inverse);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    white-space: nowrap;
  }

  .progress-container {
    background: var(--color-success-alpha-10);
    border-radius: var(--radius-full);
    height: var(--space-6);
    overflow: hidden;
    position: relative;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(
      90deg,
      var(--color-primary) 0%,
      var(--color-primary-dark) 100%
    );
    border-radius: var(--radius-full);
    transition: width var(--transition-slowest);
    box-shadow: var(--shadow-inner);
  }

  /* Responsive styles for leaderboard variant */
  @media (max-width: 600px) {
    .leaderboard-row {
      grid-template-columns: 1fr;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
    }

    .leaderboard-row.with-rank {
      grid-template-columns: var(--space-10) 1fr;
    }

    .rank-badge {
      width: var(--space-8);
      height: var(--space-8);
      font-size: var(--font-size-base);
    }

    .player-info {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-2);
    }

    .player-name-leaderboard {
      font-size: var(--font-size-base);
    }

    .points-badge {
      font-size: var(--font-size-xs);
      padding: var(--space-1) var(--space-2);
    }

    .progress-container {
      height: var(--space-5);
      grid-column: 1 / -1;
    }
  }

  /* Team variant */
  .team-member-wrapper {
    margin-bottom: var(--space-2);
  }

  .team-member-wrapper:last-child {
    margin-bottom: 0;
  }

  .team-member-display {
    padding: var(--space-2) var(--space-3);
    background: var(--color-bg-primary);
    border-radius: var(--radius-md);
    border-left: var(--space-1) solid var(--color-primary);
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    box-sizing: border-box;
  }

  .team-member-name {
    font-weight: var(--font-weight-medium);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .team-member-points {
    font-weight: var(--font-weight-semibold);
    color: var(--color-primary);
    font-size: var(--font-size-base);
    min-width: var(--space-10);
    text-align: center;
  }

  .member-controls {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-shrink: 0;
  }

  .member-points {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    min-width: var(--space-8);
    text-align: center;
  }

  .btn-point.small {
    width: var(--space-7);
    height: var(--space-7);
    padding: 0;
    border: none;
    border-radius: var(--radius-full);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-bold);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
  }

  .btn-point.small.plus {
    background: var(--color-success-light);
    color: var(--color-success-dark);
  }

  .btn-point.small.minus {
    background: var(--color-danger-light);
    color: var(--color-danger-dark);
  }

  .btn-point.small:hover:not(:disabled) {
    transform: scale(1.1);
    filter: brightness(0.95);
  }

  .btn-point.small:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    background: var(--color-gray-200);
    color: var(--color-text-tertiary);
  }

  .points-error {
    display: block;
    color: var(--color-danger);
    font-size: var(--font-size-sm);
    margin-top: var(--space-1);
    padding-left: var(--space-4);
  }

  /* Grid variant */
  .player-card-grid {
    background: var(--color-bg-primary);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    border-left: var(--space-1) solid var(--color-primary);
    transition: transform var(--transition-fast);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .player-card-grid.team-assigned {
    border-left-color: var(--color-success);
    background: var(--color-success-alpha-10);
  }

  .player-card-grid:hover {
    transform: translateX(var(--space-1));
  }

  .player-team-name {
    font-size: var(--font-size-sm);
    color: var(--color-success);
    font-weight: var(--font-weight-semibold);
  }

  .player-grid-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .delete-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: var(--font-size-xl);
    padding: var(--space-2);
    opacity: 0.7;
    transition:
      opacity var(--transition-fast),
      transform var(--transition-fast);
    border-radius: var(--radius-full);
  }

  .delete-btn:hover {
    opacity: 1;
    background-color: var(--color-danger-alpha-10);
    transform: scale(1.1);
  }

  .delete-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    background: none;
  }

  .delete-btn:disabled:hover {
    transform: none;
    background: none;
  }

  /* Simple variant */
  .player-simple {
    padding: var(--space-2);
    background: var(--color-bg-primary);
    border-radius: var(--radius-md);
    border-left: var(--space-1) solid var(--color-primary);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* Shared styles */
  .player-name {
    font-weight: var(--font-weight-semibold);
    display: block;
  }

  .player-points {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }
</style>
