export interface Player {
  id: string;
  name: string;
  team: number | null;
  joinedAt: string;
}

export interface Team {
  teamNumber: number;
  players: Player[];
}

export interface PlayersUpdateData {
  players: Player[];
  teams: Team[];
}

