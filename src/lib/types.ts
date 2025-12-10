export interface Player {
  id: string;
  name: string;
  team: number;
  joined_at: string;
}

export interface Team {
  teamNumber: number;
  players: Player[];
}
