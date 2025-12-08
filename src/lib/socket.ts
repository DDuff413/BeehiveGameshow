import { writable } from 'svelte/store';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io();
  }
  return socket;
}

export const socketConnected = writable(false);

if (typeof window !== 'undefined') {
  const s = getSocket();
  s.on('connect', () => socketConnected.set(true));
  s.on('disconnect', () => socketConnected.set(false));
}
