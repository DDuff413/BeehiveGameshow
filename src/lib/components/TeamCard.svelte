<script lang="ts">
  import type { Team, Player } from "../types";
  import { updateTeam, deleteTeam } from "../db/teamOperations";
  import { players } from "../db/store";

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
    playersToRemove = playersToRemove; // Trigger reactivity
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
        // Show errors but flip back to display mode
        errorMessage = result.errors.join("; ");
        setTimeout(() => {
          isEditMode = false;
          errorMessage = "";
        }, 3000);
      } else {
        // Success - flip back to display mode
        isEditMode = false;
      }
    } catch (error: any) {
      errorMessage = error.message || "An unexpected error occurred";
      setTimeout(() => {
        isEditMode = false;
        errorMessage = "";
      }, 3000);
    } finally {
      isSaving = false;
    }
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete ${team.name}?`)) {
      return;
    }

    const result = await deleteTeam(team.id);
    if (!result.success) {
      alert(`Failed to delete team: ${result.error}`);
    }
  }
</script>

<div class="team-card">
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
          <div class="team-member">{player.name}</div>
        {/each}
      {/if}
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
            <select bind:value={playerSelectionsToAdd[index]} disabled={isSaving}>
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
        <button class="btn btn-success" on:click={handleSave} disabled={isSaving}>
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
    border: 2px solid #333;
    border-radius: 8px;
    padding: 1rem;
    background: white;
    margin-bottom: 1rem;
  }

  .team-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .team-header h3 {
    margin: 0;
    color: #333;
  }

  .team-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-icon {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0.25rem;
  }

  .btn-icon:hover {
    opacity: 0.7;
  }

  .team-members {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .team-member {
    padding: 0.5rem;
    background: #f0f0f0;
    border-radius: 4px;
  }

  .empty-state {
    color: #666;
    font-style: italic;
    margin: 0.5rem 0;
  }

  /* Edit Mode Styles */
  .team-edit {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .edit-header label {
    display: block;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .edit-header input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }

  .edit-players,
  .edit-add-players {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .edit-players h4,
  .edit-add-players h4 {
    margin: 0 0 0.5rem 0;
    color: #333;
    font-size: 1rem;
  }

  .player-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: #f0f0f0;
    border-radius: 4px;
  }

  .btn-remove {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    opacity: 0.5;
    transition: opacity 0.2s;
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
    gap: 0.5rem;
    align-items: center;
  }

  .player-add-row select {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .btn-remove-selection {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1rem;
  }

  .btn-add-selection {
    padding: 0.5rem 1rem;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .btn-add-selection:hover:not(:disabled) {
    background: #45a049;
  }

  .btn-add-selection:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .info-text {
    font-size: 0.85rem;
    color: #666;
    font-style: italic;
    margin: 0;
  }

  .error-message {
    background: #ffebee;
    color: #c62828;
    padding: 0.75rem;
    border-radius: 4px;
    border: 1px solid #ef5350;
    font-size: 0.9rem;
  }

  .edit-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: bold;
    transition: background 0.2s;
  }

  .btn-success {
    background: #4CAF50;
    color: white;
  }

  .btn-success:hover:not(:disabled) {
    background: #45a049;
  }

  .btn-secondary {
    background: #757575;
    color: white;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #616161;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
