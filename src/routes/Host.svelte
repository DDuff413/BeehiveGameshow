<script lang="ts">
  import { onMount } from 'svelte';
  import { getSocket, socketConnected, socketError, socketReconnecting } from '../lib/socket';
  import type { Player, Team, PlayersUpdateData } from '../lib/types';

  let players: Player[] = [];
  let teams: Team[] = [];
  let qrCode = '';
  let joinUrl = '';
  let teamSize = 2;
  let showManualAssign = false;
  let manualAssignments: Record<string, number | null> = {};

  const socket = getSocket();

  onMount(async () => {
    // Load QR code
    try {
      const response = await fetch('/api/qrcode');
      const data = await response.json();
      qrCode = data.qrCode;
      joinUrl = data.joinUrl;
    } catch (error) {
      console.error('Failed to load QR code:', error);
    }

    // Socket listeners
    socket.on('playersUpdated', (data: PlayersUpdateData) => {
      players = data.players;
      teams = data.teams;
    });

    socket.on('teamsUpdated', (data: PlayersUpdateData) => {
      players = data.players;
      teams = data.teams;
    });

    socket.on('playerJoined', (player: Player) => {
      console.log('Player joined:', player.name);
    });

    return () => {
      socket.off('playersUpdated');
      socket.off('teamsUpdated');
      socket.off('playerJoined');
    };
  });

  async function handleShuffle() {
    if (teamSize < 1) {
      alert('Team size must be at least 1');
      return;
    }

    if (!$socketConnected) {
      alert('Cannot shuffle teams: Not connected to server');
      return;
    }

    try {
      const response = await fetch('/api/teams/shuffle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamSize })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to shuffle teams');
      }
    } catch (error) {
      console.error('Error shuffling teams:', error);
      alert(`Failed to shuffle teams: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  function showManualAssignment() {
    manualAssignments = {};
    players.forEach(player => {
      manualAssignments[player.id] = player.team;
    });
    showManualAssign = true;
  }

  function hideManualAssignment() {
    showManualAssign = false;
  }

  async function saveManualAssignments() {
    if (!$socketConnected) {
      alert('Cannot save teams: Not connected to server');
      return;
    }

    try {
      const response = await fetch('/api/teams/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments: manualAssignments })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save teams');
      }

      hideManualAssignment();
    } catch (error) {
      console.error('Error saving teams:', error);
      alert(`Failed to save teams: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function handleReset() {
    if (!confirm('Are you sure you want to reset all players and teams?')) {
      return;
    }

    if (!$socketConnected) {
      alert('Cannot reset: Not connected to server');
      return;
    }

    try {
      const response = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reset');
      }

      hideManualAssignment();
    } catch (error) {
      console.error('Error resetting:', error);
      alert(`Failed to reset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  $: hasPlayers = players.length > 0;
  $: hasTeams = teams.length > 0;
</script>

<!-- Connection Status Banner -->
{#if $socketError}
  <div class="connection-banner error">
    <span class="banner-icon">⚠️</span>
    <span>{$socketError}</span>
  </div>
{:else if $socketReconnecting}
  <div class="connection-banner reconnecting">
    <span class="banner-icon">🔄</span>
    <span>Reconnecting to server...</span>
  </div>
{:else if !$socketConnected}
  <div class="connection-banner warning">
    <span class="banner-icon">⏸️</span>
    <span>Disconnected from server</span>
  </div>
{/if}

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
          <img id="qrCode" src={qrCode} alt="QR Code">
        {/if}
      </div>
      <p class="join-url">Scan to join or visit: <span>{joinUrl}</span></p>
    </div>

    <!-- Players List -->
    <div class="players-section">
      <h2>Players <span id="playerCount">({players.length})</span></h2>
      <div id="playersList" class="players-list">
        {#if !hasPlayers}
          <p class="empty-state">No players yet. Scan the QR code to join!</p>
        {:else}
          {#each players as player}
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
          disabled={!hasPlayers}
          on:click={handleShuffle}
        >
          🎲 Random Shuffle
        </button>
        <input type="number" id="teamSize" min="1" bind:value={teamSize} placeholder="Team size">
      </div>
      
      <button 
        id="manualAssignBtn" 
        class="btn btn-secondary" 
        disabled={!hasPlayers}
        on:click={showManualAssignment}
      >
        ✋ Manual Assign
      </button>
      
      <button id="resetBtn" class="btn btn-danger" on:click={handleReset}>
        🔄 Reset All
      </button>
    </div>

    <!-- Manual Assignment Interface -->
    {#if showManualAssign}
      <div id="manualAssignContainer" class="manual-assign-container">
        <h3>Assign players to teams:</h3>
        <div id="manualAssignPlayers" class="assign-players-list">
          {#each players as player}
            <div class="assign-player-row">
              <span class="player-name">{player.name}</span>
              <div class="team-selector">
                <label>Team:</label>
                <input 
                  type="number" 
                  min="1" 
                  bind:value={manualAssignments[player.id]}
                  class="team-input"
                  placeholder="Team number"
                >
                <button 
                  class="btn-small" 
                  on:click={() => manualAssignments[player.id] = null}
                >
                  Clear
                </button>
              </div>
            </div>
          {/each}
        </div>
        <button class="btn btn-success" on:click={saveManualAssignments}>
          Save Team Assignments
        </button>
        <button class="btn" on:click={hideManualAssignment}>Cancel</button>
      </div>
    {/if}
  </div>

  <!-- Teams Display -->
  {#if hasTeams}
    <div class="teams-section" id="teamsSection">
      <h2>Teams</h2>
      <div id="teamsList" class="teams-list">
        {#each teams as team}
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

