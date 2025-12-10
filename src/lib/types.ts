export interface Player {
  id: string;
  name: string;
  team: number;
  joinedAt: string;
}

export interface Team {
  teamNumber: number;
  players: Player[];
}
