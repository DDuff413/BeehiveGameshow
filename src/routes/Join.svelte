<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '../lib/supabase';
  import ConnectionBanner from '../lib/ConnectionBanner.svelte';
  import { initializeStores } from '../lib/store';

  onMount(() => {
    initializeStores();
  });
  
  let playerName = '';
  let errorMessage = '';
  // isJoined could optionally be persisted in localStorage to handle refreshes
  let isJoined = false;
  let joinedName = '';
  let isSubmitting = false;

  async function joinGame() {
    errorMessage = '';
    const name = playerName.trim();
    
    if (!name) {
      errorMessage = 'Please enter your name';
      return;
    }

    isSubmitting = true;
    
    try {
      // Direct insert to Supabase
      const { error } = await supabase
        .from('players')
        .insert([{ name }]);
      
      if (error) throw error;
      
      // Show success message
      isJoined = true;
      joinedName = name;
      
    } catch (error) {
      console.error('Error joining game:', error);
      errorMessage = 'Failed to join game. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      joinGame();
    }
  }
</script>

<ConnectionBanner />

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
          disabled={isSubmitting}
        >
        <button 
          id="joinBtn" 
          class="btn btn-primary btn-large" 
          on:click={joinGame}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Joining...' : 'Join Game'}
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

