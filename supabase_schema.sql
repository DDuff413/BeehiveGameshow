-- BeehiveGameshow Database Schema
-- 
-- This schema defines the database structure for the BeehiveGameshow application.
-- It includes tables for teams and players, RLS policies for security, and RPC
-- functions for atomic points management.
--
-- Key Features:
-- - Teams: Manage team names and assignments
-- - Players: Store player information, team assignments, and points
-- - Points System: Atomic RPC functions ensure points never go below 0
-- - Realtime: All tables are published for live updates via Supabase Realtime

-- Create the teams table
create table teams (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create the players table
-- Points column: Stores player points, defaults to 0, managed via RPC functions
create table players (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  team_id uuid references teams(id) on delete set null,
  points int default 0,  -- Player points (managed via update_player_points/update_team_points RPCs)
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) for teams
alter table teams enable row level security;

create policy "Enable read access for all users"
on teams for select
using (true);

create policy "Enable insert access for all users"
on teams for insert
with check (true);

create policy "Enable update access for all users"
on teams for update
using (true);

create policy "Enable delete access for all users"
on teams for delete
using (true);

-- Enable Row Level Security (RLS) for players
-- For this simple gameshow, we will allow public read/write access.
-- In a real production app, you might want stricter auth.
alter table players enable row level security;

create policy "Enable read access for all users"
on players for select
using (true);

create policy "Enable insert access for all users"
on players for insert
with check (true);

create policy "Enable update access for all users"
on players for update
using (true);

create policy "Enable delete access for all users"
on players for delete
using (true);

-- Enable Realtime
-- This is CRITICAL for the "live updates" feature
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table teams;

-- Function to reset the game (delete all players and teams)
create or replace function reset_game()
returns void
language sql
security definer
as $$
  delete from players where true;
  delete from teams where true;
$$;

-- Function to update a single player's points atomically
-- Ensures points don't drop below 0
create or replace function update_player_points(p_id uuid, delta int)
returns void
language sql
security definer
as $$
  update players
  set points = greatest(points + delta, 0)
  where id = p_id;
$$;

-- Function to update points for all players in a team atomically
-- Ensures points don't drop below 0 for any player
create or replace function update_team_points(t_id uuid, delta int)
returns void
language sql
security definer
as $$
  update players
  set points = greatest(points + delta, 0)
  where team_id = t_id;
$$;

-- Run this command in your SQL editor to enable the unique constraint:
-- alter table players add constraint players_name_key unique (name);

-- Run this command to add the points column:
-- alter table players add column points int default 0;
