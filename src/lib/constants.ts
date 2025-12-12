// Application Constants

// Validation Limits
export const MAX_NAME_LENGTH = 50;
export const MIN_NAME_LENGTH = 1;

// Team Settings
export const DEFAULT_TEAM_SIZE = 2;
export const MIN_TEAM_SIZE = 1;
export const MAX_TEAM_SIZE = 100;

// Connection & Retry Settings
export const MAX_RETRY_ATTEMPTS = 5;
export const INITIAL_RETRY_DELAY = 2000; // 2 seconds
export const MAX_RETRY_DELAY = 32000; // 32 seconds
export const TEAM_CREATION_TIMEOUT = 5000; // 5 seconds

// Database
export const PLAYERS_TABLE = "players";
export const TEAMS_TABLE = "teams";
