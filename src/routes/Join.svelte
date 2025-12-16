<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { supabase } from "../lib/db/supabase";
  import ConnectionBanner from "../lib/components/ConnectionBanner.svelte";
  import ErrorBanner from "../lib/components/ErrorBanner.svelte";
  import { initializeStores, players, connectionStatus } from "../lib/db/store";
  import { MAX_NAME_LENGTH, JOIN_SYNC_TIMEOUT } from "../lib/constants";
  import { navigate } from "../lib/router";
  import type { Player } from "../lib/types";
  import { get } from "svelte/store";

  let isLoading = true;

  onMount(async () => {
    // 1. Initialize Stores
    await initializeStores();
    isLoading = false;
  });

  let currentJoinId: string | null = null; // Track ID we are currently attempting to join with

  // Reactive Session Check
  // We wait for connection AND data to be ready before deciding to redirect.
  $: {
    if ($connectionStatus === "connected" && !isSubmitting) {
      const existingId = localStorage.getItem("beehive_player_id");
      if (existingId) {
        // If this is the ID we just joined with, skip this check
        // (let joinGame handle the waiting/redirect to avoid race conditions)
        if (currentJoinId === existingId) {
          // Do nothing, joinGame is handling it
        } else {
          // Validate that the player actually exists in the DB (fetched by store)
          const playerExists = $players.find(
            (p: Player) => p.id === existingId
          );

          if (playerExists) {
            navigate("/player");
          } else {
            // Stale session (deleted player), clean it up
            localStorage.removeItem("beehive_player_id");
          }
        }
      }
    }
  }

  let playerName = "";
  let errorMessage = "";
  let validationError = "";
  // isJoined could optionally be persisted in localStorage to handle refreshes
  let isJoined = false;
  let joinedName = "";
  let isSubmitting = false;
  let unsubscribe: (() => void) | null = null;

  // Cleanup on component destroy
  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  });

  // Validation function
  function validatePlayerName(name: string): string {
    const trimmed = name.trim();

    if (!trimmed) return "Name is required";
    if (trimmed.length > MAX_NAME_LENGTH)
      return `Name must be ${MAX_NAME_LENGTH} characters or less`;

    // Check for duplicates (case-insensitive)
    const duplicate = $players.find(
      (p: Player) => p.name.toLowerCase() === trimmed.toLowerCase()
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

      // Save session
      if (data) {
        currentJoinId = data.id; // Mark this ID as "just joined"
        localStorage.setItem("beehive_player_id", data.id);

        // Wait for the player to appear in the store (Realtime sync)
        // Use a Promise-based approach instead of polling
        await waitForPlayerInStore(data.id);
        
        // Navigate to player dashboard
        navigate("/player");
      }
    } catch (error: any) {
      console.error("Error joining game:", error);
      if (error.code === "23505") {
        errorMessage = "This name is already taken. Please choose another.";
      } else if (error.message) {
        errorMessage = `Failed to join game: ${error.message}. Please try again.`;
      } else {
        errorMessage = "Failed to join game. Please check your connection and try again.";
      }
    } finally {
      isSubmitting = false;
    }
  }

  /**
   * Wait for a player to appear in the reactive store
   * Uses a Promise that resolves when the player is found or times out
   */
  function waitForPlayerInStore(playerId: string): Promise<void> {
    return new Promise((resolve) => {
      // Check if player already exists
      const currentPlayers = get(players);
      if (currentPlayers.find((p: Player) => p.id === playerId)) {
        resolve();
        return;
      }

      // Set up timeout
      const timeoutId = setTimeout(() => {
        if (unsubscribe) {
          unsubscribe();
          unsubscribe = null;
        }
        console.warn(`Player sync timed out after ${JOIN_SYNC_TIMEOUT}ms, proceeding anyway`);
        resolve();
      }, JOIN_SYNC_TIMEOUT);

      // Subscribe to store changes
      unsubscribe = players.subscribe(($players) => {
        const exists = $players.find((p: Player) => p.id === playerId);
        if (exists) {
          clearTimeout(timeoutId);
          if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
          }
          resolve();
        }
      });
    });
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

  {#if isLoading}
    <div class="join-content">
      <div class="loading-container">
        <div class="loading-spinner-large"></div>
        <p>Connecting to game...</p>
      </div>
    </div>
  {:else}
    <div class="join-content">
    {#if !isJoined}
      <div id="joinForm" class="join-form">
        <h2>Enter Your Name</h2>
        
        <ErrorBanner message={errorMessage} onDismiss={() => (errorMessage = "")} />
        
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
  {/if}
</div>
