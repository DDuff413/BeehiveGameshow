import type { Database } from "./db/database.types";

// Use generated Supabase types for database operations
export type Player = Database["public"]["Tables"]["players"]["Row"];
export type PlayerInsert = Database["public"]["Tables"]["players"]["Insert"];
export type PlayerUpdate = Database["public"]["Tables"]["players"]["Update"];

export type Team = Database["public"]["Tables"]["teams"]["Row"] & {
  players?: Player[]; // Populated on client side
};
export type TeamInsert = Database["public"]["Tables"]["teams"]["Insert"];
export type TeamUpdate = Database["public"]["Tables"]["teams"]["Update"];
