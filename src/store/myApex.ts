/**
 * My Apex local store.
 *
 * Persists favourites, watchlists, history and preferences in this browser's
 * localStorage. There is no backend yet: nothing is synced between devices.
 * The shape is versioned so a future authenticated store can migrate it.
 */
import { useSyncExternalStore } from "react";

export type FavoriteKind = "championships" | "drivers" | "teams" | "cars" | "circuits";

export interface HistoryEntry {
  path: string;
  title: string;
  at: string;
}

export interface Preferences {
  /** Show clearly-labelled demonstration content where no real source exists. */
  demoMode: boolean;
  units: "metric" | "imperial";
  timeZone: "local" | "utc";
  density: "comfortable" | "compact";
  reduceMotion: boolean;
  recordHistory: boolean;
}

export interface MyApexState {
  version: 1;
  favorites: Record<FavoriteKind, string[]>;
  /** Session ids (races, qualifying…) the user wants to watch. */
  watchlist: string[];
  /** Event ids the user follows. */
  following: string[];
  history: HistoryEntry[];
  preferences: Preferences;
}

const STORAGE_KEY = "apex:my-apex";
const HISTORY_LIMIT = 40;

export const defaultState: MyApexState = {
  version: 1,
  favorites: { championships: [], drivers: [], teams: [], cars: [], circuits: [] },
  watchlist: [],
  following: [],
  history: [],
  preferences: {
    demoMode: true,
    units: "metric",
    timeZone: "local",
    density: "comfortable",
    reduceMotion: false,
    recordHistory: true,
  },
};

function load(): MyApexState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<MyApexState>;
    if (parsed.version !== 1) return defaultState;
    return {
      ...defaultState,
      ...parsed,
      favorites: { ...defaultState.favorites, ...parsed.favorites },
      preferences: { ...defaultState.preferences, ...parsed.preferences },
    };
  } catch {
    return defaultState;
  }
}

let state: MyApexState = typeof window === "undefined" ? defaultState : load();
const listeners = new Set<() => void>();

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be unavailable (private mode, quota). The session keeps working in memory.
  }
}

function setState(updater: (s: MyApexState) => MyApexState) {
  state = updater(state);
  persist();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      state = load();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getState() {
  return state;
}

export function useMyApex<T>(selector: (s: MyApexState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(defaultState),
  );
}

const toggleIn = (list: string[], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [id, ...list];

export const myApex = {
  toggleFavorite(kind: FavoriteKind, id: string) {
    setState((s) => ({ ...s, favorites: { ...s.favorites, [kind]: toggleIn(s.favorites[kind], id) } }));
  },
  toggleWatch(sessionId: string) {
    setState((s) => ({ ...s, watchlist: toggleIn(s.watchlist, sessionId) }));
  },
  toggleFollow(eventId: string) {
    setState((s) => ({ ...s, following: toggleIn(s.following, eventId) }));
  },
  recordVisit(path: string, title: string) {
    setState((s) => {
      if (!s.preferences.recordHistory) return s;
      if (s.history[0]?.path === path) return s;
      const history = [{ path, title, at: new Date().toISOString() }, ...s.history.filter((h) => h.path !== path)];
      return { ...s, history: history.slice(0, HISTORY_LIMIT) };
    });
  },
  clearHistory() {
    setState((s) => ({ ...s, history: [] }));
  },
  setPreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setState((s) => ({ ...s, preferences: { ...s.preferences, [key]: value } }));
  },
  reset() {
    setState(() => defaultState);
  },
  exportJson() {
    return JSON.stringify(state, null, 2);
  },
};
