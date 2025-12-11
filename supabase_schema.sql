-- Create the teams table
create table teams (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create the players table
create table players (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  team_id uuid references teams(id) on delete set null,
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

-- Run this command in your SQL editor to enable the unique constraint:
-- alter table players add constraint players_name_key unique (name);
