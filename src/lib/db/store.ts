import type { Player, Team } from "../types";
import { derived, writable } from "svelte/store";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "./supabase";

// Stores
export const players = writable<Player[]>([]);
export const teams = writable<Team[]>([]);
export const connectionStatus = writable<
  "connected" | "disconnected" | "error" | "reconnecting"
>("disconnected");
export const errorMessage = writable<string | null>(null);

// Derived store: teams with their players populated
export const teamsWithPlayers = derived(
  [teams, players],
  ([$teams, $players]) => {
    return $teams.map((team) => ({
      ...team,
      players: $players.filter((p) => p.team_id === team.id),
    }));
  }
);

// Track initialization to prevent duplicate subscriptions
let playersSubscription: RealtimeChannel | null = null;
let teamsSubscription: RealtimeChannel | null = null;
let retryCount = 0;
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds

// Manual reconnection function
export function reconnect() {
  retryCount = 0;
  errorMessage.set(null);
  cleanupSubscriptions();
  initializeStores();
}

function cleanupSubscriptions() {
  if (playersSubscription) {
    playersSubscription.unsubscribe();
    playersSubscription = null;
  }
  if (teamsSubscription) {
    teamsSubscription.unsubscribe();
    teamsSubscription = null;
  }
}

function getRetryDelay(): number {
  // Exponential backoff: 2s, 4s, 8s, 16s, 32s
  return Math.min(INITIAL_RETRY_DELAY * Math.pow(2, retryCount), 32000);
}

// Initial Fetch & Realtime Subscription
export async function initializeStores() {
  // If subscriptions exist, we're already connected or connecting
  if (playersSubscription && teamsSubscription) return;

  connectionStatus.set("disconnected");

  // 1. Fetch initial data for players
  const { data: playersData, error: playersError } = await supabase
    .from("players")
    .select("*")
    .order("joined_at", { ascending: true });

  if (playersError) {
    console.error("Error fetching players:", playersError);
    connectionStatus.set("error");
    errorMessage.set(`Failed to fetch players: ${playersError.message}`);

    // Attempt retry if under limit
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      const delay = getRetryDelay();
      connectionStatus.set("reconnecting");
      console.log(
        `Fetch failed. Retrying in ${
          delay / 1000
        }s... (${retryCount}/${MAX_RETRIES})`
      );
      setTimeout(initializeStores, delay);
    }
    return;
  }

  // 2. Fetch initial data for teams
  const { data: teamsData, error: teamsError } = await supabase
    .from("teams")
    .select("*")
    .order("created_at", { ascending: true });

  if (teamsError) {
    console.error("Error fetching teams:", teamsError);
    connectionStatus.set("error");
    errorMessage.set(`Failed to fetch teams: ${teamsError.message}`);

    if (retryCount < MAX_RETRIES) {
      retryCount++;
      const delay = getRetryDelay();
      connectionStatus.set("reconnecting");
      console.log(
        `Fetch failed. Retrying in ${
          delay / 1000
        }s... (${retryCount}/${MAX_RETRIES})`
      );
      setTimeout(initializeStores, delay);
    }
    return;
  }

  // Set initial state
  players.set(playersData as Player[]);
  teams.set(teamsData as Team[]);
  connectionStatus.set("connected");
  errorMessage.set(null);
  retryCount = 0;

  // 3. Subscribe to Realtime changes for players
  playersSubscription = supabase
    .channel("public:players")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "players" },
      (payload) => {
        console.log("Realtime update (players):", payload);

        players.update((currentPlayers) => {
          let newPlayers = [...currentPlayers];

          if (payload.eventType === "INSERT") {
            const exists = newPlayers.some((p) => p.id === payload.new.id);
            if (!exists) {
              newPlayers.push(payload.new as Player);
            }
          } else if (payload.eventType === "UPDATE") {
            const index = newPlayers.findIndex((p) => p.id === payload.new.id);
            if (index !== -1) {
              newPlayers[index] = payload.new as Player;
            }
          } else if (payload.eventType === "DELETE") {
            newPlayers = newPlayers.filter((p) => p.id !== payload.old.id);
          }

          return newPlayers;
        });
      }
    )
    .subscribe((status) => {
      handleSubscriptionStatus(status, "players");
    });

  // 4. Subscribe to Realtime changes for teams
  teamsSubscription = supabase
    .channel("public:teams")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "teams" },
      (payload) => {
        console.log("Realtime update (teams):", payload);

        teams.update((currentTeams) => {
          let newTeams = [...currentTeams];

          if (payload.eventType === "INSERT") {
            const exists = newTeams.some((t) => t.id === payload.new.id);
            if (!exists) {
              newTeams.push(payload.new as Team);
            }
          } else if (payload.eventType === "UPDATE") {
            const index = newTeams.findIndex((t) => t.id === payload.new.id);
            if (index !== -1) {
              newTeams[index] = payload.new as Team;
            }
          } else if (payload.eventType === "DELETE") {
            newTeams = newTeams.filter((t) => t.id !== payload.old.id);
          }

          return newTeams;
        });
      }
    )
    .subscribe((status) => {
      handleSubscriptionStatus(status, "teams");
    });

  console.log("Supabase Realtime initialized");
}

function handleSubscriptionStatus(status: string, channelName: string) {
  if (status === "SUBSCRIBED") {
    connectionStatus.set("connected");
    errorMessage.set(null);
    retryCount = 0; // Reset retries on success
  } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
    console.error(`Realtime subscription error (${channelName}):`, status);
    connectionStatus.set("error");
    errorMessage.set(`Connection lost. Attempting to reconnect...`);

    // Clean up subscriptions to allow retry
    cleanupSubscriptions();

    // Attempt reconnection with exponential backoff if under limit
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      const delay = getRetryDelay();
      connectionStatus.set("reconnecting");
      console.log(
        `Attempting reconnection in ${
          delay / 1000
        } seconds... (Attempt ${retryCount}/${MAX_RETRIES})`
      );
      setTimeout(() => {
        initializeStores();
      }, delay);
    } else {
      errorMessage.set(
        "Connection failed. Please refresh the page or try again later."
      );
      console.error("Max reconnection attempts reached.");
    }
  }
}
