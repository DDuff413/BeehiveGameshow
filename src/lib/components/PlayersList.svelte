<script lang="ts">
  import type { Player, Team } from "../types";

  export let players: Player[];
  export let teams: Team[];
</script>

<div class="players-section">
  <h2>Players <span id="playerCount">({players.length})</span></h2>
  <div id="playersList" class="players-list">
    {#if players.length === 0}
      <p class="empty-state">No players yet. Scan the QR code to join!</p>
    {:else}
      {#each players as player (player.id)}
        <div class="player-card {player.team_id ? 'assigned' : ''}">
          <span class="player-name">{player.name}</span>
          {#if player.team_id}
            {@const playerTeam = teams.find((t) => t.id === player.team_id)}
            <span class="team-badge">{playerTeam?.name || "Team"}</span>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
</div>
