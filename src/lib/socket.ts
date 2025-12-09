import { writable } from 'svelte/store';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });
  }
  return socket;
}

export const socketConnected = writable(false);
export const socketError = writable<string | null>(null);
export const socketReconnecting = writable(false);

if (typeof window !== 'undefined') {
  const s = getSocket();
  
  s.on('connect', () => {
    socketConnected.set(true);
    socketError.set(null);
    socketReconnecting.set(false);
    console.log('Socket.IO connected');
  });
  
  s.on('disconnect', (reason) => {
    socketConnected.set(false);
    console.log('Socket.IO disconnected:', reason);
    
    if (reason === 'io server disconnect') {
      socketError.set('Server disconnected. Please refresh the page.');
    } else {
      socketError.set(null);
      socketReconnecting.set(true);
    }
  });
  
  s.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error);
    socketError.set('Failed to connect to server. Please check your connection.');
    socketReconnecting.set(false);
  });
  
  s.on('reconnect_attempt', (attemptNumber) => {
    console.log(`Reconnection attempt ${attemptNumber}`);
    socketReconnecting.set(true);
  });
  
  s.on('reconnect', (attemptNumber) => {
    console.log(`Reconnected after ${attemptNumber} attempts`);
    socketConnected.set(true);
    socketError.set(null);
    socketReconnecting.set(false);
  });
  
  s.on('reconnect_failed', () => {
    console.error('Failed to reconnect');
    socketError.set('Failed to reconnect. Please refresh the page.');
    socketReconnecting.set(false);
  });
}

