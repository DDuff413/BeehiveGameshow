import { writable } from 'svelte/store';
import { supabase } from './supabase';
import type { Player, Team } from './types';

// Stores
export const players = writable<Player[]>([]);
export const teams = writable<Team[]>([]);
export const connectionStatus = writable<'connected' | 'disconnected' | 'error'>('disconnected');

// Helper to derive teams from players (client-side logic now)
function updateTeams(allPlayers: Player[]) {
  const teamsMap: Record<number, Player[]> = {};
  
  allPlayers.forEach(player => {
    if (player.team !== 0) {
      if (!teamsMap[player.team]) {
        teamsMap[player.team] = [];
      }
      teamsMap[player.team].push(player);
    }
  });

  const headers = Object.keys(teamsMap)
    .sort((a, b) => Number(a) - Number(b))
    .map(teamNum => ({
      teamNumber: parseInt(teamNum),
      players: teamsMap[Number(teamNum)]
    }));
    
  teams.set(headers);
}

// Track initialization to prevent duplicate subscriptions
let initialized = false;

// Initial Fetch & Realtime Subscription
export async function initializeStores() {
  if (initialized) return;
  initialized = true;

  connectionStatus.set('disconnected');

  // 1. Fetch initial data
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('joined_at', { ascending: true });

  if (error) {
    console.error('Error fetching players:', error);
    connectionStatus.set('error');
    initialized = false; // Allow retry
    return;
  }

  // Set initial state
  const initialPlayers = data as Player[];
  players.set(initialPlayers);
  updateTeams(initialPlayers);
  connectionStatus.set('connected');

  // 2. Subscribe to Realtime changes
  supabase
    .channel('public:players')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, (payload) => {
      console.log('Realtime update:', payload);
      
      players.update(currentPlayers => {
        let newPlayers = [...currentPlayers];

        if (payload.eventType === 'INSERT') {
          // Prevent duplicate keys by checking if ID already exists
          const exists = newPlayers.some(p => p.id === payload.new.id);
          if (!exists) {
            newPlayers.push(payload.new as Player);
          }
        } else if (payload.eventType === 'UPDATE') {
          const index = newPlayers.findIndex(p => p.id === payload.new.id);
          if (index !== -1) {
            newPlayers[index] = payload.new as Player;
          }
        } else if (payload.eventType === 'DELETE') {
          newPlayers = newPlayers.filter(p => p.id !== payload.old.id);
        }
        
        // Update teams whenever players change
        updateTeams(newPlayers);
        return newPlayers;
      });
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        connectionStatus.set('connected');
      } else if (status === 'CHANNEL_ERROR') {
        connectionStatus.set('error');
      } else if (status === 'TIMED_OUT') {
         connectionStatus.set('error');
      }
    });

  console.log('Supabase Realtime initialized');
}
