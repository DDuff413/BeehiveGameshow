import { writable } from "svelte/store";

export const currentRoute = writable(window.location.pathname);

export function navigate(path: string) {
  // Update history
  window.history.pushState({}, "", path);

  // Update store
  currentRoute.set(path);
}

// Handle browser back/forward buttons
window.addEventListener("popstate", () => {
  currentRoute.set(window.location.pathname);
});
