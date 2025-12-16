<script lang="ts">
  import type { Player } from "../types";
  import { updatePlayerPoints } from "../db/pointsOperations";

  export let player: Player;
  export let variant: "leaderboard" | "team" | "grid" | "simple" = "simple";
  export let showPoints: boolean = false;
  export let showRank: boolean = false;
  export let showDelete: boolean = false;
  export let showPointControls: boolean = false;
  export let rank: number | null = null;
  export let maxPoints: number = 0;
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
  <div class="leaderboard-row">
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
  <div class="team-member-display">
    <span class="team-member-name">{player.name}</span>
    {#if showPoints}
      <span class="team-member-points">{player.points ?? 0} pts</span>
    {/if}
    {#if showPointControls}
      <div class="point-controls">
        <button
          class="point-btn point-btn-add"
          on:click={() => adjustPoints(1)}
          aria-label="Add 1 point to {player.name}"
        >
          +1
        </button>
        <button
          class="point-btn point-btn-subtract"
          on:click={() => adjustPoints(-1)}
          aria-label="Subtract 1 point from {player.name}"
        >
          -1
        </button>
      </div>
    {/if}
    {#if pointsError}
      <span class="points-error">{pointsError}</span>
    {/if}
  </div>
{:else if variant === "grid"}
  <div class="player-card-grid">
    <div class="player-grid-info">
      <span class="player-name">{player.name}</span>
      {#if showPoints}
        <span class="player-points">{player.points ?? 0} pts</span>
      {/if}
    </div>
    {#if showDelete && onDelete}
      <button
        class="delete-btn"
        on:click={() => onDelete?.(player.id)}
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

  /* Team variant */
  .team-member-display {
    padding: 10px;
    margin-bottom: 8px;
    background: white;
    border-radius: 6px;
    border-left: 4px solid var(--primary-color);
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .team-member-display:last-child {
    margin-bottom: 0;
  }

  .team-member-name {
    font-weight: 500;
    flex: 1;
    min-width: 100px;
  }

  .team-member-points {
    font-weight: 600;
    color: var(--primary-color);
    margin-left: auto;
  }

  .point-controls {
    display: flex;
    gap: 6px;
  }

  .point-btn {
    padding: 4px 10px;
    border: none;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .point-btn-add {
    background: var(--success-color);
    color: white;
  }

  .point-btn-add:hover {
    background: #45a049;
  }

  .point-btn-subtract {
    background: var(--danger-color);
    color: white;
  }

  .point-btn-subtract:hover {
    background: #da190b;
  }

  .points-error {
    width: 100%;
    color: var(--danger-color);
    font-size: 0.85rem;
    margin-top: 4px;
  }

  /* Grid variant */
  .player-card-grid {
    background: var(--bg-color);
    padding: 12px 15px;
    border-radius: 8px;
    border-left: 4px solid var(--primary-color);
    transition: transform 0.2s;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .player-card-grid:hover {
    transform: translateX(5px);
  }

  .player-grid-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .delete-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 8px;
    opacity: 0.7;
    transition:
      opacity 0.2s,
      transform 0.2s;
    border-radius: 50%;
  }

  .delete-btn:hover {
    opacity: 1;
    background-color: rgba(255, 0, 0, 0.1);
    transform: scale(1.1);
  }

  /* Simple variant */
  .player-simple {
    padding: 10px;
    background: white;
    border-radius: 6px;
    border-left: 3px solid var(--primary-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* Shared styles */
  .player-name {
    font-weight: 600;
    display: block;
  }

  .player-points {
    font-size: 0.9rem;
    color: #666;
  }
</style>
