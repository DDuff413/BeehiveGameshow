import { supabase } from "./supabase";

export async function updatePlayerPoints(playerId: string, delta: number) {
  try {
    const { error } = await supabase.rpc("update_player_points", {
      p_id: playerId,
      delta: delta,
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error updating player points:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTeamPoints(teamId: string, delta: number) {
  try {
    const { error } = await supabase.rpc("update_team_points", {
      t_id: teamId,
      delta: delta,
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error updating team points:", error);
    return { success: false, error: error.message };
  }
}
