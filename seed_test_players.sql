-- Seed script to add 10 test players with incrementally increasing scores
-- No team assignments
-- 
-- Usage: Run this script in your Supabase SQL Editor or via psql
-- To reset, you can run: DELETE FROM players WHERE name LIKE 'Player %';

INSERT INTO players (name, team_id, points) VALUES
  ('Player 1', NULL, 10),
  ('Player 2', NULL, 20),
  ('Player 3', NULL, 30),
  ('Player 4', NULL, 40),
  ('Player 5', NULL, 50),
  ('Player 6', NULL, 60),
  ('Player 7', NULL, 70),
  ('Player 8', NULL, 80),
  ('Player 9', NULL, 90),
  ('Player 10', NULL, 100);
