<script lang="ts">
  import type { Player, Team } from "../types";
  import { removePlayer } from "../db/playerOperations";
  import ErrorBanner from "./ErrorBanner.svelte";
  import PlayerDisplay from "./PlayerDisplay.svelte";

  export let players: Player[];
  export let teams: Team[];

  let isActionPending = false;
  let errorMessage = "";

  async function handleRemove(id: string, name: string) {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;

    errorMessage = "";
    isActionPending = true;
    try {
      const result = await removePlayer(id);
      if (!result.success) {
        errorMessage = `Failed to remove ${name}: ${result.error}`;
      }
    } catch (e: any) {
      console.error("Player removal failed:", e);
      errorMessage = `Failed to remove ${name}: ${e?.message || "Unknown error"}. Please try again.`;
    } finally {
      isActionPending = false;
    }
  }
</script>

<div class="players-section">
  <h2>Players <span id="playerCount">({players.length})</span></h2>
  
  <ErrorBanner message={errorMessage} autoDismiss={true} onDismiss={() => (errorMessage = "")} />
  
  <div id="playersList" class="players-list">
    {#if players.length === 0}
      <p class="empty-state">No players yet. Scan the QR code to join!</p>
    {:else}
      {#each players as player (player.id)}
        {@const playerTeam = player.team_id ? teams.find((t) => t.id === player.team_id) : null}
        <PlayerDisplay 
          {player} 
          variant="grid" 
          showDelete={true}
          showTeam={true}
          teamName={playerTeam?.name ?? ""}
          disabled={isActionPending}
          onDelete={(id) => handleRemove(id, player.name)}
        />
      {/each}
    {/if}
  </div>
</div>

<style>
</style>
