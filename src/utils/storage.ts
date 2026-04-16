import type { GameState } from "../types/game";

const STORAGE_KEY = "zuki_game_state";

export function loadState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function saveState(state: GameState): void {
  const toSave: GameState = { ...state, lastSaved: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}
