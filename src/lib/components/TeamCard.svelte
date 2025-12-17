<script lang="ts">
  import type { Team, Player } from "../types";
  import { updateTeam, deleteTeam } from "../db/teamOperations";
  import { updateTeamPoints, updatePlayerPoints } from "../db/pointsOperations";
  import { players } from "../db/store";
  import ErrorBanner from "./ErrorBanner.svelte";
  import PlayerDisplay from "./PlayerDisplay.svelte";

  export let team: Team;

  let isEditMode = false;
  let editedName = team.name;
  let playersToRemove = new Set<string>();
  let playerSelectionsToAdd: string[] = [];
  let errorMessage = "";
  let isSaving = false;

  // Get players that are NOT in any team
  $: unassignedPlayers = $players.filter((p) => !p.team_id);

  // Get players in this team
  $: teamPlayers = team.players || [];

  function toggleEditMode() {
    if (!isEditMode) {
      // Entering edit mode - reset state
      editedName = team.name;
      playersToRemove.clear();
      playerSelectionsToAdd = [];
      errorMessage = "";
    }
    isEditMode = !isEditMode;
  }

  function toggleRemovePlayer(playerId: string) {
    if (playersToRemove.has(playerId)) {
      playersToRemove.delete(playerId);
    } else {
      playersToRemove.add(playerId);
    }
    playersToRemove = new Set(playersToRemove); // Create new reference for reactivity
  }

  function addPlayerSelection() {
    playerSelectionsToAdd = [...playerSelectionsToAdd, ""];
  }

  function removePlayerSelection(index: number) {
    playerSelectionsToAdd = playerSelectionsToAdd.filter((_, i) => i !== index);
  }

  async function handleSave() {
    errorMessage = "";
    isSaving = true;

    try {
      const updates: any = {};

      // Only update name if it changed
      if (editedName.trim() !== team.name) {
        updates.name = editedName.trim();
      }

      // Players to remove
      if (playersToRemove.size > 0) {
        updates.playersToRemove = Array.from(playersToRemove);
      }

      // Players to add (filter empty selections, validate existence, and get unique values)
      const playersToAdd = playerSelectionsToAdd
        .filter((id) => id) // Remove empty strings
        .filter((id) => $players.some((p) => p.id === id)) // Validate player still exists
        .filter((id, index, arr) => arr.indexOf(id) === index); // Remove duplicates (keep first)

      if (playersToAdd.length > 0) {
        updates.playersToAdd = playersToAdd;
      }

      const result = await updateTeam(team.id, updates);

      if (!result.success) {
        errorMessage = `Failed to update team: ${result.errors.join(", ")}`;
      } else {
        // Success - flip back to display mode
        isEditMode = false;
        errorMessage = "";
      }
    } catch (error: any) {
      console.error("Team update failed:", error);
      errorMessage = `Failed to update team: ${error.message || "Unknown error"}. Please try again.`;
    } finally {
      isSaving = false;
    }
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete ${team.name}?`)) {
      return;
    }

    errorMessage = "";
    try {
      const result = await deleteTeam(team.id);
      if (!result.success) {
        errorMessage = `Failed to delete team: ${result.error}`;
      }
    } catch (error: any) {
      console.error("Team delete failed:", error);
      errorMessage = `Failed to delete team: ${error.message || "Unknown error"}. Please try again.`;
    }
  }

  async function handleTeamPoints(delta: number) {
    errorMessage = "";
    try {
      const result = await updateTeamPoints(team.id, delta);
      if (!result.success) {
        errorMessage = `Failed to update team points: ${result.error}`;
      }
    } catch (error: any) {
      console.error("Team points update failed:", error);
      errorMessage = `Failed to update team points: ${error.message || "Unknown error"}`;
    }
  }
</script>

<div class="team-card">
  <ErrorBanner message={errorMessage} autoDismiss={true} onDismiss={() => (errorMessage = "")} />
  
  {#if !isEditMode}
    <!-- Display Mode -->
    <div class="team-header">
      <h3>{team.name}</h3>
      <div class="team-actions">
        <button class="btn-icon" on:click={toggleEditMode} title="Edit team">
          ✏️
        </button>
        <button class="btn-icon" on:click={handleDelete} title="Delete team">
          🗑️
        </button>
      </div>
    </div>
    <div class="team-members">
      {#if teamPlayers.length === 0}
        <p class="empty-state">No players assigned</p>
      {:else}
        {#each teamPlayers as player (player.id)}
          <PlayerDisplay 
            {player} 
            variant="team" 
            showPoints={true} 
            showPointControls={true}
          />
        {/each}
      {/if}
    </div>
    <div class="team-footer">
      <span class="footer-label">Team Points:</span>
      <div class="team-points-controls">
        <button class="btn-point minus" on:click={() => handleTeamPoints(-1)}
          >-</button
        >
        <button class="btn-point plus" on:click={() => handleTeamPoints(1)}
          >+</button
        >
      </div>
    </div>
  {:else}
    <!-- Edit Mode -->
    <div class="team-edit">
      <div class="edit-header">
        <label>
          Team Name:
          <input
            type="text"
            bind:value={editedName}
            placeholder="Team name"
            disabled={isSaving}
          />
        </label>
      </div>

      <div class="edit-players">
        <h4>Current Players:</h4>
        {#if teamPlayers.length === 0}
          <p class="empty-state">No players in this team</p>
        {:else}
          {#each teamPlayers as player (player.id)}
            <div class="player-row">
              <span>{player.name}</span>
              <button
                class="btn-remove"
                class:active={playersToRemove.has(player.id)}
                on:click={() => toggleRemovePlayer(player.id)}
                disabled={isSaving}
                title="Toggle remove player"
              >
                ❌
              </button>
            </div>
          {/each}
        {/if}
      </div>

      <div class="edit-add-players">
        <h4>Add Players:</h4>
        {#each playerSelectionsToAdd as selection, index (index)}
          <div class="player-add-row">
            <select
              bind:value={playerSelectionsToAdd[index]}
              disabled={isSaving}
            >
              <option value="">Select a player...</option>
              {#each unassignedPlayers as player (player.id)}
                <option value={player.id}>{player.name}</option>
              {/each}
            </select>
            <button
              class="btn-remove-selection"
              on:click={() => removePlayerSelection(index)}
              disabled={isSaving}
              title="Remove selection"
            >
              ❌
            </button>
          </div>
        {/each}
        <button
          class="btn-add-selection"
          on:click={addPlayerSelection}
          disabled={isSaving || unassignedPlayers.length === 0}
        >
          ➕ Add Player Selection
        </button>
        {#if unassignedPlayers.length === 0}
          <p class="info-text">No unassigned players available</p>
        {/if}
      </div>

      {#if errorMessage}
        <div class="error-message">{errorMessage}</div>
      {/if}

      <div class="edit-actions">
        <button
          class="btn btn-success"
          on:click={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
        <button
          class="btn btn-secondary"
          on:click={toggleEditMode}
          disabled={isSaving}
        >
          Cancel
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .team-card {
    border: 2px solid var(--color-text-primary);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    background: var(--color-bg-card);
    margin-bottom: var(--space-4);
  }

  .team-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-2);
  }

  .team-header h3 {
    margin: 0;
    color: var(--color-text-primary);
  }

  .team-actions {
    display: flex;
    gap: var(--space-2);
  }

  .btn-icon {
    background: none;
    border: none;
    cursor: pointer;
    font-size: var(--font-size-xl);
    padding: var(--space-1);
  }

  .btn-icon:hover {
    opacity: 0.7;
  }

  .team-members {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .team-footer {
    margin-top: var(--space-4);
    padding-top: var(--space-2);
    border-top: 1px solid var(--color-gray-200);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .footer-label {
    font-weight: var(--font-weight-bold);
    color: var(--color-text-secondary);
  }

  .team-points-controls {
    display: flex;
    gap: var(--space-2);
  }

  /* Shared Point Button Styles */
  .btn-point {
    width: var(--space-7);
    height: var(--space-7);
    border-radius: var(--radius-full);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-weight: var(--font-weight-bold);
    transition: all var(--transition-fast);
    padding: 0;
  }

  .btn-point.minus {
    background: var(--color-danger-light);
    color: var(--color-danger-dark);
  }

  .btn-point.plus {
    background: var(--color-success-light);
    color: var(--color-success-dark);
  }

  .btn-point:hover:not(:disabled) {
    transform: scale(1.1);
    filter: brightness(0.95);
  }

  .btn-point:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    background: var(--color-gray-200);
    color: var(--color-text-tertiary);
  }

  .empty-state {
    color: var(--color-text-secondary);
    font-style: italic;
    margin: var(--space-2) 0;
  }

  /* Edit Mode Styles */
  .team-edit {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .edit-header label {
    display: block;
    font-weight: var(--font-weight-bold);
    margin-bottom: var(--space-2);
  }

  .edit-header input {
    width: 100%;
    padding: var(--space-2);
    border: 1px solid var(--color-border-medium);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-base);
  }

  .edit-players,
  .edit-add-players {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .edit-players h4,
  .edit-add-players h4 {
    margin: 0 0 var(--space-2) 0;
    color: var(--color-text-primary);
    font-size: var(--font-size-base);
  }

  .player-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-2);
    background: var(--color-bg-input);
    border-radius: var(--radius-sm);
  }

  .btn-remove {
    background: none;
    border: none;
    cursor: pointer;
    font-size: var(--font-size-base);
    opacity: 0.5;
    transition: opacity var(--transition-fast);
  }

  .btn-remove:hover,
  .btn-remove.active {
    opacity: 1;
  }

  .btn-remove.active {
    filter: brightness(1.2);
  }

  .player-add-row {
    display: flex;
    gap: var(--space-2);
    align-items: center;
  }

  .player-add-row select {
    flex: 1;
    padding: var(--space-2);
    border: 1px solid var(--color-border-medium);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
  }

  .btn-remove-selection {
    background: none;
    border: none;
    cursor: pointer;
    font-size: var(--font-size-base);
  }

  .btn-add-selection {
    padding: var(--space-2) var(--space-4);
    background: var(--color-success);
    color: var(--color-text-inverse);
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: var(--font-size-sm);
  }

  .btn-add-selection:hover:not(:disabled) {
    background: var(--color-success-dark);
  }

  .btn-add-selection:disabled {
    background: var(--color-border-medium);
    cursor: not-allowed;
  }

  .info-text {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    font-style: italic;
    margin: 0;
  }

  .error-message {
    background: var(--color-error-bg);
    color: var(--color-error-text);
    padding: var(--space-3);
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-error-border);
    font-size: var(--font-size-sm);
  }

  .edit-actions {
    display: flex;
    gap: var(--space-2);
    margin-top: var(--space-2);
  }

  .btn {
    padding: var(--space-3) var(--space-6);
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-bold);
    transition: background var(--transition-fast);
  }

  .btn-success {
    background: var(--color-success);
    color: var(--color-text-inverse);
  }

  .btn-success:hover:not(:disabled) {
    background: var(--color-success-dark);
  }

  .btn-secondary {
    background: var(--color-gray-600);
    color: var(--color-text-inverse);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--color-gray-700);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
