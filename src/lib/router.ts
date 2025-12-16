import { writable } from "svelte/store";

export const currentRoute = writable(window.location.pathname);

export function navigate(path: string) {
  // Update history
  window.history.pushState({}, "", path);

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
