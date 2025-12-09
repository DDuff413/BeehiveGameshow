<script lang="ts">
  import { onMount } from 'svelte';
  import { getSocket, socketConnected } from '../lib/socket';
  import type { Player, Team, PlayersUpdateData } from '../lib/types';
  import ConnectionBanner from '../lib/ConnectionBanner.svelte';

  let players: Player[] = [];
  let teams: Team[] = [];
  let qrCode = '';
  let joinUrl = '';
  let teamSize = 2;
  let showManualAssign = false;
  let manualAssignments: Record<string, number> = {};

  const socket = getSocket();

  // Helper function to safely parse error responses
  async function getErrorMessage(response: Response, defaultMessage: string): Promise<string> {
    const fallbackMessage = `${defaultMessage} (${response.status} ${response.statusText})`;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.toLowerCase().startsWith('application/json')) {
        const data = await response.json();
        return data.error || fallbackMessage;
      }
    } catch {
      // If JSON parsing fails, fall through to fallback message
    }
    return fallbackMessage;
  }

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
        const errorMessage = await getErrorMessage(response, 'Failed to shuffle teams');
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error shuffling teams:', error);
      alert(`Failed to shuffle teams: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  function showManualAssignment() {
    manualAssignments = {};
    players.forEach(player => {
      // Initialize with current team assignments (0 for unassigned)
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
        const errorMessage = await getErrorMessage(response, 'Failed to save teams');
        throw new Error(errorMessage);
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
        const errorMessage = await getErrorMessage(response, 'Failed to reset');
        throw new Error(errorMessage);
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
                  on:click={() => manualAssignments[player.id] = 0}
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

