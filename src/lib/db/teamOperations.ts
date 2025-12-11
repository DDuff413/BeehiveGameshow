import type { Player } from "../types";
import { get } from "svelte/store";
import { supabase } from "./supabase";
import { teams } from "./store";

export interface TeamUpdateData {
  name?: string;
  playersToAdd?: string[]; // Player IDs
  playersToRemove?: string[]; // Player IDs
}

/**
 * Create a new team with auto-generated name "Team X"
 * @param teamName - Optional custom team name. If not provided, generates "Team X" based on current count
 */
export async function createTeam(teamName?: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const currentTeams = get(teams);
    const name = teamName ?? `Team ${currentTeams.length + 1}`;

    const { error } = await supabase.from("teams").insert([{ name }]);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error creating team:", error);
    return { success: false, error: error.message || "Failed to create team" };
  }
}

/**
 * Update team with name changes and player assignments
 * Returns individual error messages for failed operations
 */
export async function updateTeam(
  teamId: string,
  updates: TeamUpdateData
): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];

  try {
    // 1. Update team name if provided
    if (updates.name !== undefined) {
      const { error } = await supabase
        .from("teams")
        .update({ name: updates.name })
        .eq("id", teamId);

      if (error) {
        errors.push(`Failed to update team name: ${error.message}`);
      }
    }

    // 2. Remove players from team (set team_id to null)
    if (updates.playersToRemove && updates.playersToRemove.length > 0) {
      const { error } = await supabase
        .from("players")
        .update({ team_id: null })
        .in("id", updates.playersToRemove);

      if (error) {
        errors.push(`Failed to remove some players: ${error.message}`);
      }
    }

    // 3. Add players to team (set team_id to teamId)
    if (updates.playersToAdd && updates.playersToAdd.length > 0) {
      // Filter out duplicates and empty strings
      const uniquePlayers = [...new Set(updates.playersToAdd)].filter(
        (id) => id
      );

      if (uniquePlayers.length > 0) {
        const { error } = await supabase
          .from("players")
          .update({ team_id: teamId })
          .in("id", uniquePlayers);

        if (error) {
          errors.push(`Failed to add some players: ${error.message}`);
        }
      }
    }

    return {
      success: errors.length === 0,
      errors,
    };
  } catch (error: any) {
    console.error("Error updating team:", error);
    return {
      success: false,
      errors: [error.message || "Unknown error occurred"],
    };
  }
}

/**
 * Delete a team (players will have their team_id set to null automatically)
 */
export async function deleteTeam(
  teamId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("teams").delete().eq("id", teamId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting team:", error);
    return { success: false, error: error.message || "Failed to delete team" };
  }
}
