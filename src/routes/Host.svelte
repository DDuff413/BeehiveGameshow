<script lang="ts">
  import { onMount } from "svelte";
  import {
    players,
    teams,
    teamsWithPlayers,
    initializeStores,
  } from "../lib/db/store";
  import { supabase } from "../lib/db/supabase";
  import { createTeam } from "../lib/db/teamOperations";
  import ConnectionBanner from "../lib/components/ConnectionBanner.svelte";
  import TeamCard from "../lib/components/TeamCard.svelte";
  import QRCode from "qrcode";

  let qrCode = "";
  let joinUrl = "";
  let teamSize = 2;
  let newTeamName = "";
  let showManualAssign = false;
  let manualAssignments: Record<string, string | null> = {};
  let isActionPending = false;
  let operationError = "";
  let teamNameError = "";

  // Validation function
  function validateTeamName(name: string): string {
    if (!name.trim()) return ""; // Empty is allowed (will generate random)
    if (name.length > 50) return "Team name must be 50 characters or less";
    
    const existingTeam = $teams.find(
      (t) => t.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (existingTeam) return "A team with this name already exists";
    
    return "";
  }

  // Clear error when user types
  $: {
    teamNameError = validateTeamName(newTeamName);
  }

  onMount(async () => {
    // 1. Initialize Stores (Fetch + Subscribe)
    await initializeStores();

    // 2. Generate QR Code
    joinUrl = `${window.location.origin}/join`;
    try {
      qrCode = await QRCode.toDataURL(joinUrl);
    } catch (err) {
      console.error("QR Gen Error", err);
    }
  });

  // GAME LOGIC (Now Client-Side)

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
    
    if (teamSize < 1) {
      operationError = "Team size must be at least 1";
      return;
    }

    if ($players.length === 0) return;

    isActionPending = true;

    // Fisher-Yates shuffle
    const shuffled = [...$players];
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
      const currentTeamCount = $teams.length;

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
          const timeout = setTimeout(() => {
            unsubscribe();
            reject(new Error("Timeout waiting for teams to be created"));
          }, 5000);

          const unsubscribe = teams.subscribe((currentTeams) => {
            if (currentTeams.length >= teamsNeeded) {
              clearTimeout(timeout);
              unsubscribe();
              resolve();
            }
          });
        });

        await waitForTeams;
      }

      // Assign players to teams in round-robin fashion
      const updates = shuffled.map((p, index) => {
        const teamIndex = Math.floor(index / teamSize) % $teams.length;
        const team = $teams[teamIndex];
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
    $players.forEach((player) => {
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
      const updates = Object.entries(manualAssignments).map(([id, team_id]) => {
        // Find original player to keep name
        const original = $players.find((p) => p.id === id);
        return {
          id,
          team_id: team_id || null,
          name: original?.name || "Unknown",
        };
      });

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

  $: hasPlayers = $players.length > 0;
  $: hasTeams = $teamsWithPlayers.length > 0;
</script>

<ConnectionBanner />

<div class="container">
  <header>
    <h1>🐝 Beehive Gameshow</h1>
    <p class="subtitle">Host Dashboard</p>
  </header>

  <div class="main-content">
    <!-- QR Code Section -->
    <div class="qr-section">
      <h2>Player Join</h2>
      <div id="qrCodeContainer">
        {#if qrCode}
          <img id="qrCode" src={qrCode} alt="QR Code" />
        {/if}
      </div>
      <p class="join-url">Scan to join or visit: <span>{joinUrl}</span></p>
    </div>

    <!-- Players List -->
    <div class="players-section">
      <h2>Players <span id="playerCount">({$players.length})</span></h2>
      <div id="playersList" class="players-list">
        {#if !hasPlayers}
          <p class="empty-state">No players yet. Scan the QR code to join!</p>
        {:else}
          {#each $players as player (player.id)}
            <div class="player-card {player.team_id ? 'assigned' : ''}">
              <span class="player-name">{player.name}</span>
              {#if player.team_id}
                {@const playerTeam = $teams.find(
                  (t) => t.id === player.team_id
                )}
                <span class="team-badge">{playerTeam?.name || "Team"}</span>
              {/if}
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>

  <!-- Team Management -->
  <div class="team-management">
    <h2>Team Management</h2>

    <!-- Error Message Display -->
    {#if operationError}
      <div class="error-banner">
        <span class="error-icon">⚠️</span>
        <span>{operationError}</span>
        <button class="error-close" onclick={() => (operationError = "")}>×</button>
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
            maxlength="50"
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
          min="1"
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
      </div>
    </div>

    <!-- Manual Assignment Interface -->
    {#if showManualAssign}
      <div id="manualAssignContainer" class="manual-assign-container">
        <h3>Assign players to teams:</h3>
        <div id="manualAssignPlayers" class="assign-players-list">
          {#each $players as player (player.id)}
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
                  {#each $teams as team (team.id)}
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
        <button
          class="btn"
          onclick={hideManualAssignment}
          disabled={isActionPending}>Cancel</button
        >
      </div>
    {/if}
  </div>

  <!-- Teams Display -->
  {#if hasTeams}
    <div class="teams-section" id="teamsSection">
      <h2>Teams</h2>
      <div id="teamsList" class="teams-list">
        {#each $teamsWithPlayers as team (team.id)}
          <TeamCard {team} />
        {/each}
      </div>
    </div>
  {/if}
</div>
