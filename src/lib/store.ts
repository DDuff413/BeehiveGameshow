import { writable } from "svelte/store";
import { supabase } from "./supabase";
import type { Player, Team } from "./types";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Stores
export const players = writable<Player[]>([]);
export const teams = writable<Team[]>([]);
export const connectionStatus = writable<
  "connected" | "disconnected" | "error"
>("disconnected");

// Helper to derive teams from players (client-side logic now)
function updateTeams(allPlayers: Player[]) {
  const teamsMap: Record<number, Player[]> = {};

  allPlayers.forEach((player) => {
    if (player.team !== 0) {
      if (!teamsMap[player.team]) {
        teamsMap[player.team] = [];
      }
      teamsMap[player.team].push(player);
    }
  });

  const headers = Object.keys(teamsMap)
    .sort((a, b) => Number(a) - Number(b))
    .map((teamNum) => ({
      teamNumber: parseInt(teamNum),
      players: teamsMap[Number(teamNum)],
    }));

  teams.set(headers);
}

// Track initialization to prevent duplicate subscriptions
let subscription: RealtimeChannel | null = null;

// Initial Fetch & Realtime Subscription
export async function initializeStores() {
  // If subscription exists, we're already connected or connecting
  if (subscription) return;

  connectionStatus.set("disconnected");

  // 1. Fetch initial data
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("joined_at", { ascending: true });

  if (error) {
    console.error("Error fetching players:", error);
    connectionStatus.set("error");
    return;
  }

  // Set initial state
  const initialPlayers = data as Player[];
  players.set(initialPlayers);
  updateTeams(initialPlayers);
  connectionStatus.set("connected");

  // 2. Subscribe to Realtime changes
  subscription = supabase
    .channel("public:players")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "players" },
      (payload) => {
        console.log("Realtime update:", payload);

        players.update((currentPlayers) => {
          let newPlayers = [...currentPlayers];

          if (payload.eventType === "INSERT") {
            // Prevent duplicate keys by checking if ID already exists
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

          // Update teams whenever players change
          updateTeams(newPlayers);
          return newPlayers;
        });
      }
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        connectionStatus.set("connected");
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.error("Realtime subscription error:", status);
        connectionStatus.set("error");
        // Clean up subscription to allow retry
        if (subscription) {
          subscription.unsubscribe();
          subscription = null;
        }
      }
    });

  console.log("Supabase Realtime initialized");
}
