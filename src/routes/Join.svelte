<script lang="ts">
  import { onMount } from "svelte";
  import { supabase } from "../lib/db/supabase";
  import ConnectionBanner from "../lib/components/ConnectionBanner.svelte";
  import { initializeStores, players } from "../lib/db/store";
  import { MAX_NAME_LENGTH } from "../lib/constants";
  import { navigate } from "../lib/router";

  onMount(async () => {
    // 1. Initialize Stores
    await initializeStores();

    // 2. Check Session
    const existingId = localStorage.getItem("beehive_player_id");
    if (existingId) {
      navigate("/player");
    }
  });

  let playerName = "";
  let errorMessage = "";
  let validationError = "";
  // isJoined could optionally be persisted in localStorage to handle refreshes
  let isJoined = false;
  let joinedName = "";
  let isSubmitting = false;

  // Validation function
  function validatePlayerName(name: string): string {
    const trimmed = name.trim();

    if (!trimmed) return "Name is required";
    if (trimmed.length > MAX_NAME_LENGTH)
      return `Name must be ${MAX_NAME_LENGTH} characters or less`;

    // Check for duplicates (case-insensitive)
    const duplicate = $players.find(
      (p) => p.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) return "This name is already taken";

    return "";
  }

  // Clear validation error when user types
  $: {
    if (playerName.trim()) {
      validationError = validatePlayerName(playerName);
    } else {
      validationError = "";
    }
  }

  async function joinGame() {
    errorMessage = "";
    const name = playerName.trim();

    // Final validation check
    const validationResult = validatePlayerName(playerName);
    if (validationResult) {
      errorMessage = validationResult;
      return;
    }

    isSubmitting = true;

    try {
      // Direct insert to Supabase
      const { data, error } = await supabase
        .from("players")
        .insert([{ name }])
        .select()
        .single();

      if (error) throw error;

      // Show success message
      isJoined = true;
      joinedName = name;

      // Save session and redirect
      if (data) {
        localStorage.setItem("beehive_player_id", data.id);
        setTimeout(() => {
          navigate("/player");
        }, 1000);
      }
    } catch (error: any) {
      console.error("Error joining game:", error);
      if (error.code === "23505") {
        errorMessage = "This name is already taken. Please choose another.";
      } else {
        errorMessage = `Failed to join: ${error.message || "Unknown error"}`;
      }
    } finally {
      isSubmitting = false;
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter" && !validationError && !isSubmitting) {
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
        <div class="input-wrapper">
          <input
            type="text"
            id="playerName"
            placeholder="Your name"
            maxlength={MAX_NAME_LENGTH}
            bind:value={playerName}
            on:keypress={handleKeyPress}
            disabled={isSubmitting}
          />
          {#if validationError}
            <span class="validation-error">{validationError}</span>
          {/if}
        </div>
        <button
          id="joinBtn"
          class="btn btn-primary btn-large"
          on:click={joinGame}
          disabled={isSubmitting || !!validationError}
        >
          {#if isSubmitting}
            <span class="spinner"></span>
            Joining...
          {:else}
            Join Game
          {/if}
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
