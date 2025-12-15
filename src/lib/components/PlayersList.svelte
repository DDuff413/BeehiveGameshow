<script lang="ts">
  import type { Player, Team } from "../types";
  import { removePlayer } from "../db/playerOperations";

  export let players: Player[];
  export let teams: Team[];

  let isActionPending = false;

  async function handleRemove(id: string, name: string) {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;

    isActionPending = true;
    try {
      const result = await removePlayer(id);
      if (!result.success) {
        alert("Failed to remove player: " + result.error);
      }
    } catch (e) {
      console.error(e);
      alert("Error removing player");
    } finally {
      isActionPending = false;
    }
  }
</script>

<div class="players-section">
  <h2>Players <span id="playerCount">({players.length})</span></h2>
  <div id="playersList" class="players-list">
    {#if players.length === 0}
      <p class="empty-state">No players yet. Scan the QR code to join!</p>
    {:else}
      {#each players as player (player.id)}
        <div class="player-card {player.team_id ? 'assigned' : ''}">
          <div class="player-info">
            <span class="player-name">{player.name}</span>
            {#if player.team_id}
              {@const playerTeam = teams.find((t) => t.id === player.team_id)}
              <span class="team-badge">{playerTeam?.name || "Team"}</span>
            {/if}
          </div>
          <button
            class="btn-icon delete-btn"
            title="Remove Player"
            disabled={isActionPending}
            onclick={() => handleRemove(player.id, player.name)}
          >
            🗑️
          </button>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .player-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .player-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  /* Override global style to remove bottom margin inside this flex layout if needed */
  :global(.player-name) {
    margin-bottom: 2px;
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

  .delete-btn:hover:not(:disabled) {
    opacity: 1;
    background-color: rgba(255, 0, 0, 0.1);
    transform: scale(1.1);
  }

  .delete-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
</style>
