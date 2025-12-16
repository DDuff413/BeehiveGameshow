import { writable } from "svelte/store";

export const currentRoute = writable(window.location.pathname);

export function navigate(path: string) {
  // Update history
  try {
    window.history.pushState({}, "", path);
  } catch (err) {
    // Optionally log the error for debugging
    console.error("Failed to update browser history with pushState:", err);
  }

  // Update store
  currentRoute.set(path);
}

// Handle browser back/forward buttons
// Returns a cleanup function
export function initRouter() {
  const onPopState = () => currentRoute.set(window.location.pathname);
  window.addEventListener("popstate", onPopState);

  return () => {
    window.removeEventListener("popstate", onPopState);
  };
}
