import { describe, it, expect, beforeEach, vi } from "vitest";
import { loadState, saveState } from "./storage";
import type { GameState } from "../types/game";
import { DEFAULT_STATE } from "../types/game";

const validState: GameState = {
  ...DEFAULT_STATE,
  name: "Zuki",
};

beforeEach(() => {
  localStorage.clear();
});

describe("storage", () => {
  it("T-1.1: loadState returns null when localStorage is empty", () => {
    expect(loadState()).toBeNull();
  });

  it("T-1.2: loadState returns the parsed object when a valid GameState is stored", () => {
    localStorage.setItem("zuki_game_state", JSON.stringify(validState));
    const result = loadState();
    expect(result).toMatchObject({ name: "Zuki", hunger: 70 });
  });

  it("T-1.3: loadState returns null when stored value is malformed JSON", () => {
    localStorage.setItem("zuki_game_state", "{not: valid json}");
    expect(loadState()).toBeNull();
  });

  it("T-1.4: saveState writes a JSON string to zuki_game_state", () => {
    saveState(validState);
    const raw = localStorage.getItem("zuki_game_state");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.name).toBe("Zuki");
  });

  it("T-1.5: saveState updates lastSaved to a timestamp >= the value before the call", () => {
    const before = Date.now();
    vi.setSystemTime(before + 10);
    saveState(validState);
    const raw = localStorage.getItem("zuki_game_state");
    const parsed = JSON.parse(raw!);
    expect(parsed.lastSaved).toBeGreaterThanOrEqual(before);
    vi.useRealTimers();
  });
});
