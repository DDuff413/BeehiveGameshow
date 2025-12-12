<script lang="ts">
  import type { Player, Team } from "../types";
  import { createTeam } from "../db/teamOperations";
  import { supabase } from "../db/supabase";
  import { teams } from "../db/store";
  import {
    DEFAULT_TEAM_SIZE,
    MIN_TEAM_SIZE,
    MAX_NAME_LENGTH,
    TEAM_CREATION_TIMEOUT,
  } from "../constants";

  export let players: Player[];
  export let allTeams: Team[];
  export let hasPlayers: boolean;
  export let hasTeams: boolean;

  let teamSize = DEFAULT_TEAM_SIZE;
  let newTeamName = "";
  let showManualAssign = false;
  let manualAssignments: Record<string, string | null> = {};
  let isActionPending = false;
  let operationError = "";
  let teamNameError = "";

  // Validation function
  function validateTeamName(name: string): string {
    if (!name.trim()) return ""; // Empty is allowed (will generate random)
    if (name.length > MAX_NAME_LENGTH)
      return `Team name must be ${MAX_NAME_LENGTH} characters or less`;

    const existingTeam = allTeams.find(
      (t) => t.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (existingTeam) return "A team with this name already exists";

    return "";
  }

  // Clear error when user types
  $: {
    teamNameError = validateTeamName(newTeamName);
  }

  async function handleCreateTeam() {
    operationError = "";

    // Validate before proceeding
    if (newTeamName.trim() && teamNameError) {
      operationError = teamNameError;
      return;
    }

    isActionPending = true;
    try {
      const teamName = newTeamName.trim() || undefined;
      const result = await createTeam(teamName);
      if (!result.success) {
        operationError = `Failed to create team: ${result.error}`;
      } else {
        newTeamName = ""; // Clear input on success
      }
    } catch (error: any) {
      console.error("Create team failed:", error);
      operationError = error.message || "Failed to create team";
    } finally {
      isActionPending = false;
    }
  }

  async function handleShuffle() {
    operationError = "";

    if (teamSize < MIN_TEAM_SIZE) {
      operationError = `Team size must be at least ${MIN_TEAM_SIZE}`;
      return;
    }

    if (players.length === 0) return;

    isActionPending = true;

    // Fisher-Yates shuffle
    const shuffled = [...players];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i];
      const item = shuffled[j];
      if (temp && item) {
        [shuffled[i], shuffled[j]] = [item, temp];
      }
    }

    try {
      // Calculate how many teams we need based on player count and team size
      const teamsNeeded = Math.ceil(shuffled.length / teamSize);
      const currentTeamCount = allTeams.length;

      // Create additional teams if needed
      if (teamsNeeded > currentTeamCount) {
        const teamsToCreate = teamsNeeded - currentTeamCount;
        for (let i = 0; i < teamsToCreate; i++) {
          // Let createTeam generate random names automatically
          const result = await createTeam();
          if (!result.success) {
            throw new Error(`Failed to create team: ${result.error}`);
          }
        }
        // Wait for realtime to update the teams store
        const waitForTeams = new Promise<void>((resolve, reject) => {
          let unsubscribe: (() => void) | undefined;
          
          const timeout = setTimeout(() => {
            unsubscribe?.();
            reject(new Error("Timeout waiting for teams to be created"));
          }, TEAM_CREATION_TIMEOUT);

          unsubscribe = teams.subscribe((currentTeams) => {
            if (currentTeams.length >= teamsNeeded) {
              clearTimeout(timeout);
              unsubscribe?.();
              resolve();
            }
          });
        });

        await waitForTeams;
      }

      // Assign players to teams in round-robin fashion
      const updates = shuffled.map((p, index) => {
        const teamIndex = Math.floor(index / teamSize) % allTeams.length;
        const team = allTeams[teamIndex];
        if (!team) {
          throw new Error(`Team not found at index ${teamIndex}`);
        }
        return {
          id: p.id,
          team_id: team.id,
          name: p.name,
        };
      });

      // Bulk update using upsert
      const { error } = await supabase.from("players").upsert(updates);

      if (error) throw error;
    } catch (error: any) {
      console.error("Shuffle failed:", error);
      operationError = error.message || "Failed to shuffle players into teams";
    } finally {
      isActionPending = false;
    }
  }

  function showManualAssignment() {
    manualAssignments = {};
    players.forEach((player) => {
      manualAssignments[player.id] = player.team_id;
    });
    showManualAssign = true;
  }

  function hideManualAssignment() {
    showManualAssign = false;
  }

  async function saveManualAssignments() {
    operationError = "";
    isActionPending = true;
    try {
      // Prepare updates
      const updates = Object.entries(manualAssignments).map(
        ([id, team_id]) => {
          // Find original player to keep name
          const original = players.find((p) => p.id === id);
          return {
            id,
            team_id: team_id || null,
            name: original?.name || "Unknown",
          };
        }
      );

      const { error } = await supabase.from("players").upsert(updates);
      if (error) throw error;

      hideManualAssignment();
    } catch (error: any) {
      console.error("Manual assign failed:", error);
      operationError = error.message || "Failed to save team assignments";
    } finally {
      isActionPending = false;
    }
  }

  async function handleReset() {
    if (!confirm("Are you sure you want to reset all players and teams?")) {
      return;
    }
    operationError = "";
    isActionPending = true;

    try {
      // Use RPC to clear both tables cleanly
      const { error } = await supabase.rpc("reset_game");
      if (error) throw error;
    } catch (error: any) {
      console.error("Reset failed:", error);
      operationError = error.message || "Failed to reset game";
    } finally {
      isActionPending = false;
    }
  }

  async function handleResetTeams() {
    if (!confirm("Are you sure you want to delete all teams? Players will be unassigned.")) {
      return;
    }
    operationError = "";
    isActionPending = true;

    try {
      // Delete all teams (using 'not null' filter is more explicit than UUID workaround)
      const { error } = await supabase.from("teams").delete().not("id", "is", null);
      if (error) throw error;
    } catch (error: any) {
      console.error("Reset teams failed:", error);
      operationError = error.message || "Failed to reset teams";
    } finally {
      isActionPending = false;
    }
  }

  async function handleResetPlayers() {
    if (!confirm("Are you sure you want to remove all players?")) {
      return;
    }
    operationError = "";
    isActionPending = true;

    try {
      // Delete all players (using 'not null' filter is more explicit than UUID workaround)
      const { error } = await supabase.from("players").delete().not("id", "is", null);
      if (error) throw error;
    } catch (error: any) {
      console.error("Reset players failed:", error);
      operationError = error.message || "Failed to reset players";
    } finally {
      isActionPending = false;
    }
  }
</script>

<div class="team-management">
  <h2>Team Management</h2>

  <!-- Error Message Display -->
  {#if operationError}
    <div class="error-banner">
      <span class="error-icon">⚠️</span>
      <span>{operationError}</span>
      <button class="error-close" onclick={() => (operationError = "")}>
        ×
      </button>
    </div>
  {/if}

  <div class="team-controls">
    <!-- Row 1: Create Team -->
    <div class="control-group">
      <div class="input-wrapper">
        <input
          type="text"
          id="newTeamName"
          bind:value={newTeamName}
          placeholder="Team name (optional)"
          maxlength={MAX_NAME_LENGTH}
          disabled={isActionPending}
        />
        {#if teamNameError}
          <span class="validation-error">{teamNameError}</span>
        {/if}
      </div>
      <button
        id="createTeamBtn"
        class="btn btn-success"
        disabled={isActionPending || !!teamNameError}
        onclick={handleCreateTeam}
      >
        {#if isActionPending}
          <span class="spinner"></span>
        {:else}
          ➕
        {/if}
        Create Team
      </button>
    </div>

    <!-- Row 2: Shuffle and Manual Assign -->
    <div class="control-group">
      <button
        id="shuffleBtn"
        class="btn btn-primary"
        disabled={!hasPlayers || isActionPending}
        onclick={handleShuffle}
      >
        {#if isActionPending}
          <span class="spinner"></span>
        {:else}
          🎲
        {/if}
        Random Shuffle
      </button>
      <input
        type="number"
        id="teamSize"
        min={MIN_TEAM_SIZE}
        bind:value={teamSize}
        placeholder="Team size"
        disabled={isActionPending}
      />
      <button
        id="manualAssignBtn"
        class="btn btn-secondary"
        disabled={!hasPlayers || isActionPending || !hasTeams}
        onclick={showManualAssignment}
      >
        ✋ Manual Assign
      </button>
    </div>

    <!-- Row 3: Reset -->
    <div class="control-group">
      <button
        id="resetBtn"
        class="btn btn-danger"
        disabled={isActionPending}
        onclick={handleReset}
      >
        {#if isActionPending}
          <span class="spinner"></span>
        {:else}
          🔄
        {/if}
        Reset All
      </button>
      <button
        class="btn btn-danger"
        disabled={isActionPending || !hasTeams}
        onclick={handleResetTeams}
      >
        {#if isActionPending}
          <span class="spinner"></span>
        {:else}
          🗑️
        {/if}
        Clear Teams
      </button>
      <button
        class="btn btn-danger"
        disabled={isActionPending || !hasPlayers}
        onclick={handleResetPlayers}
      >
        {#if isActionPending}
          <span class="spinner"></span>
        {:else}
          👥
        {/if}
        Clear Players
      </button>
    </div>
  </div>

  <!-- Manual Assignment Interface -->
  {#if showManualAssign}
    <div id="manualAssignContainer" class="manual-assign-container">
      <h3>Assign players to teams:</h3>
      <div id="manualAssignPlayers" class="assign-players-list">
        {#each players as player (player.id)}
          <div class="assign-player-row">
            <span class="player-name">{player.name}</span>
            <div class="team-selector">
              <label for="team-{player.id}">Team:</label>
              <select
                id="team-{player.id}"
                bind:value={manualAssignments[player.id]}
                class="team-input"
              >
                <option value={null}>Unassigned</option>
                {#each allTeams as team (team.id)}
                  <option value={team.id}>{team.name}</option>
                {/each}
              </select>
              <button
                class="btn-small"
                onclick={() => (manualAssignments[player.id] = null)}
              >
                Clear
              </button>
            </div>
          </div>
        {/each}
      </div>
      <button
        class="btn btn-success"
        onclick={saveManualAssignments}
        disabled={isActionPending}
      >
        {#if isActionPending}
          <span class="spinner"></span>
        {:else}
          💾
        {/if}
        Save Team Assignments
      </button>
      <button class="btn" onclick={hideManualAssignment} disabled={isActionPending}
        >Cancel</button
      >
    </div>
  {/if}
</div>
