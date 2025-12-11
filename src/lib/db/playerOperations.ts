import type { Player } from "../types";
import { supabase } from "./supabase";

/**
 * Add a new player to the game
 */
export async function addPlayer(
  name: string
): Promise<{ success: boolean; error?: string; player?: Player }> {
  try {
    const { data, error } = await supabase
      .from("players")
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;

    return { success: true, player: data as Player };
  } catch (error: any) {
    console.error("Error adding player:", error);
    return { success: false, error: error.message || "Failed to add player" };
  }
}

/**
 * Remove a player from the game
 */
export async function removePlayer(
  playerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("players")
      .delete()
      .eq("id", playerId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error removing player:", error);
    return {
      success: false,
      error: error.message || "Failed to remove player",
    };
  }
}

/**
 * Update a player's team assignment
 */
export async function assignPlayerToTeam(
  playerId: string,
  teamId: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("players")
      .update({ team_id: teamId })
      .eq("id", playerId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error assigning player to team:", error);
    return {
      success: false,
      error: error.message || "Failed to assign player to team",
    };
  }
}

/**
 * Bulk update player team assignments
 */
export async function bulkAssignPlayers(
  assignments: { playerId: string; teamId: string | null }[]
): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];

  for (const { playerId, teamId } of assignments) {
    const result = await assignPlayerToTeam(playerId, teamId);
    if (!result.success) {
      errors.push(result.error || "Unknown error");
    }
  }

  return {
    success: errors.length === 0,
    errors,
  };
}
