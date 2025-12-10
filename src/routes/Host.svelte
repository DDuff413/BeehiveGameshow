<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import {
    players,
    teams,
    connectionStatus,
    initializeStores,
  } from "../lib/store";
  import { supabase } from "../lib/supabase";
  import ConnectionBanner from "../lib/ConnectionBanner.svelte";
  import QRCode from "qrcode";

  let qrCode = "";
  let joinUrl = "";
  let teamSize = 2;
  let showManualAssign = false;
  let manualAssignments: Record<string, number> = {};
  let isActionPending = false;

  // Reactive connection status for the banner
  $: isConnected = $connectionStatus === "connected";

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

  async function handleShuffle() {
    if (teamSize < 1) {
      alert("Team size must be at least 1");
      return;
    }

    if ($players.length === 0) return;
    isActionPending = true;

    // Fisher-Yates shuffle
    const shuffled = [...$players];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    try {
      // Create updates array
      const updates = shuffled.map((p, index) => ({
        id: p.id,
        team: Math.floor(index / teamSize) + 1,
        name: p.name,
      }));

      // Bulk update using upsert
      const { error } = await supabase.from("players").upsert(updates);

      if (error) throw error;
    } catch (error) {
      console.error("Shuffle failed:", error);
      alert("Failed to update teams on server");
    } finally {
      isActionPending = false;
    }
  }

  function showManualAssignment() {
    manualAssignments = {};
    $players.forEach((player) => {
      manualAssignments[player.id] = player.team;
    });
    showManualAssign = true;
  }

  function hideManualAssignment() {
    showManualAssign = false;
  }

  async function saveManualAssignments() {
    isActionPending = true;
    try {
      // Prepare updates
      const updates = Object.entries(manualAssignments).map(([id, team]) => {
        // Find original player to keep name
        const original = $players.find((p) => p.id === id);
        return {
          id,
          team: Number(team),
          name: original?.name || "Unknown",
        };
      });

      const { error } = await supabase.from("players").upsert(updates);
      if (error) throw error;

      hideManualAssignment();
    } catch (error) {
      console.error("Manual assign failed:", error);
      alert("Failed to save teams");
    } finally {
      isActionPending = false;
    }
  }

  async function handleReset() {
    if (!confirm("Are you sure you want to reset all players and teams?")) {
      return;
    }
    isActionPending = true;

    try {
      // Delete all rows
      const { error } = await supabase
        .from("players")
        .delete()
        .gt("joined_at", "2000-01-01T00:00:00Z"); // Delete all players joined after year 2000 (effectively all)
      if (error) throw error;
    } catch (error) {
      console.error("Reset failed:", error);
      alert("Failed to reset game");
    } finally {
      isActionPending = false;
    }
  }

  $: hasPlayers = $players.length > 0;
  $: hasTeams = $teams.length > 0;
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
            <div class="player-card {player.team ? 'assigned' : ''}">
              <span class="player-name">{player.name}</span>
              {#if player.team}
                <span class="team-badge">Team {player.team}</span>
              {/if}
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>

  <!-- Team Management -->
  <div class="team-management">
    <h2>Team Assignment</h2>

    <div class="team-controls">
      <div class="control-group">
        <button
          id="shuffleBtn"
          class="btn btn-primary"
          disabled={!hasPlayers || isActionPending}
          on:click={handleShuffle}
        >
          🎲 Random Shuffle
        </button>
        <input
          type="number"
          id="teamSize"
          min="1"
          bind:value={teamSize}
          placeholder="Team size"
        />
      </div>

      <button
        id="manualAssignBtn"
        class="btn btn-secondary"
        disabled={!hasPlayers || isActionPending}
        on:click={showManualAssignment}
      >
        ✋ Manual Assign
      </button>

      <button
        id="resetBtn"
        class="btn btn-danger"
        disabled={isActionPending}
        on:click={handleReset}
      >
        🔄 Reset All
      </button>
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
                <label>Team:</label>
                <select
                  bind:value={manualAssignments[player.id]}
                  class="team-input"
                >
                  <option value={0}>Unassigned</option>
                  {#each Array(10) as _, i}
                    <option value={i + 1}>{i + 1}</option>
                  {/each}
                </select>
                <button
                  class="btn-small"
                  on:click={() => (manualAssignments[player.id] = 0)}
                >
                  Clear
                </button>
              </div>
            </div>
          {/each}
        </div>
        <button
          class="btn btn-success"
          on:click={saveManualAssignments}
          disabled={isActionPending}
        >
          Save Team Assignments
        </button>
        <button
          class="btn"
          on:click={hideManualAssignment}
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
        {#each $teams as team (team.teamNumber)}
          <div class="team-card">
            <h3>Team {team.teamNumber}</h3>
            <div class="team-members">
              {#each team.players as player}
                <div class="team-member">{player.name}</div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
