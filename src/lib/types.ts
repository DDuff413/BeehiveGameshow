export interface Player {
  id: string;
  name: string;
  team_id: string | null;
  joined_at: string;
}

export interface Team {
  id: string;
  name: string;
  created_at: string;
  players?: Player[]; // Populated on client side
}
