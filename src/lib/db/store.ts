import type { Player, Team } from "../types";
import { derived, writable } from "svelte/store";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "./supabase";

// Stores
export const players = writable<Player[]>([]);
export const teams = writable<Team[]>([]);
export const connectionStatus = writable<
  "connected" | "disconnected" | "error"
>("disconnected");

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
const MAX_RETRIES = 2; // Total 3 attempts (1 initial + 2 retries)

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

    // Attempt retry if under limit
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(
        `Fetch failed. Retrying in 5s... (${retryCount}/${MAX_RETRIES})`
      );
      setTimeout(initializeStores, 5000);
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

    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(
        `Fetch failed. Retrying in 5s... (${retryCount}/${MAX_RETRIES})`
      );
      setTimeout(initializeStores, 5000);
    }
    return;
  }

  // Set initial state
  players.set(playersData as Player[]);
  teams.set(teamsData as Team[]);
  connectionStatus.set("connected");

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
    retryCount = 0; // Reset retries on success
  } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
    console.error(`Realtime subscription error (${channelName}):`, status);
    connectionStatus.set("error");

    // Clean up subscriptions to allow retry
    if (playersSubscription) {
      playersSubscription.unsubscribe();
      playersSubscription = null;
    }
    if (teamsSubscription) {
      teamsSubscription.unsubscribe();
      teamsSubscription = null;
    }

    // Attempt reconnection after 5 seconds if under limit
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(
        `Attempting reconnection in 5 seconds... (Attempt ${retryCount}/${MAX_RETRIES})`
      );
      setTimeout(() => {
        initializeStores();
      }, 5000);
    } else {
      console.error("Max reconnection attempts reached. Giving up.");
    }
  }
}
