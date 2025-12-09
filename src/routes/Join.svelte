<script lang="ts">
  import { socketConnected, socketError, socketReconnecting } from '../lib/socket';
  
  let playerName = '';
  let errorMessage = '';
  let isJoined = false;
  let joinedName = '';

  async function joinGame() {
    errorMessage = '';
    const name = playerName.trim();
    
    if (!name) {
      errorMessage = 'Please enter your name';
      return;
    }

    if (!$socketConnected) {
      errorMessage = 'Not connected to server. Please wait and try again.';
      return;
    }
    
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        errorMessage = data.error || 'Failed to join game';
        return;
      }
      
      // Show success message
      isJoined = true;
      joinedName = name;
      
    } catch (error) {
      console.error('Error joining game:', error);
      errorMessage = error instanceof Error ? error.message : 'Failed to join game. Please try again.';
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      joinGame();
    }
  }
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

<div class="container join-container">
  <header>
    <h1>🐝 Beehive Gameshow</h1>
    <p class="subtitle">Join the Game</p>
  </header>

  <div class="join-content">
    {#if !isJoined}
      <div id="joinForm" class="join-form">
        <h2>Enter Your Name</h2>
        <input 
          type="text" 
          id="playerName" 
          placeholder="Your name" 
          maxlength="50" 
          bind:value={playerName}
          on:keypress={handleKeyPress}
          autofocus
        >
        <button id="joinBtn" class="btn btn-primary btn-large" on:click={joinGame}>
          Join Game
        </button>
        {#if errorMessage}
          <p id="errorMessage" class="error-message">{errorMessage}</p>
        {/if}
      </div>
    {:else}
      <div id="successMessage" class="success-message">
        <div class="success-icon">✅</div>
        <h2>Successfully Joined!</h2>
        <p>Welcome, <strong id="joinedName">{joinedName}</strong>!</p>
        <p>Wait for the host to assign teams.</p>
      </div>
    {/if}
  </div>
</div>

