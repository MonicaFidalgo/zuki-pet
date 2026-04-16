import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGameState } from "./useGameState";
import type { GameState } from "../types/game";
import { DEFAULT_STATE } from "../types/game";
import { loadState } from "../utils/storage";

const validState: GameState = {
  ...DEFAULT_STATE,
  name: "Zuki",
  hunger: 80,
  happiness: 75,
  energy: 60,
};

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useGameState", () => {
  it("T-2.1: isNaming is true on first render with empty localStorage", () => {
    const { result } = renderHook(() => useGameState());
    expect(result.current.isNaming).toBe(true);
  });

  it("T-2.2: isNaming is false and stats match when valid saved state with name exists", () => {
    localStorage.setItem("zuki_game_state", JSON.stringify(validState));
    const { result } = renderHook(() => useGameState());
    expect(result.current.isNaming).toBe(false);
    expect(result.current.state.hunger).toBe(80);
    expect(result.current.state.happiness).toBe(75);
    expect(result.current.state.energy).toBe(60);
  });

  it("T-2.3: submitName sets state.name and isNaming to false", () => {
    const { result } = renderHook(() => useGameState());
    act(() => {
      result.current.submitName("Zuki");
    });
    expect(result.current.state.name).toBe("Zuki");
    expect(result.current.isNaming).toBe(false);
  });

  it("T-2.4: submitName with whitespace only does not change isNaming", () => {
    const { result } = renderHook(() => useGameState());
    act(() => {
      result.current.submitName("   ");
    });
    expect(result.current.isNaming).toBe(true);
  });

  it("T-2.5: after one tick, hunger -2, happiness -1, energy -1", () => {
    const { result } = renderHook(() => useGameState());
    const initialHunger = result.current.state.hunger;
    const initialHappiness = result.current.state.happiness;
    const initialEnergy = result.current.state.energy;

    act(() => {
      vi.advanceTimersByTime(15000);
    });

    expect(result.current.state.hunger).toBe(initialHunger - 2);
    expect(result.current.state.happiness).toBe(initialHappiness - 1);
    expect(result.current.state.energy).toBe(initialEnergy - 1);
  });

  it("T-2.6: stats do not go below 0 when at 1 and tick fires", () => {
    const lowState: GameState = { ...DEFAULT_STATE, name: "Zuki", hunger: 1, happiness: 1, energy: 1 };
    localStorage.setItem("zuki_game_state", JSON.stringify(lowState));
    const { result } = renderHook(() => useGameState());

    act(() => {
      vi.advanceTimersByTime(15000);
    });

    expect(result.current.state.hunger).toBe(0);
    expect(result.current.state.happiness).toBe(0);
    expect(result.current.state.energy).toBe(0);
  });

  it("T-2.7: exactly one interval is active — no leak after re-render", () => {
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");
    const { rerender, unmount } = renderHook(() => useGameState());
    rerender();
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    unmount();
    setIntervalSpy.mockRestore();
  });

  it("T-5.1: performAction('feed') increases hunger by 25, leaves happiness unchanged, decreases energy by 5", () => {
    const base: GameState = { ...DEFAULT_STATE, name: "Zuki", hunger: 50, happiness: 50, energy: 50 };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    act(() => { result.current.performAction("feed"); });
    expect(result.current.state.hunger).toBe(75);
    expect(result.current.state.happiness).toBe(50);
    expect(result.current.state.energy).toBe(45);
  });

  it("T-5.2: performAction('play') decreases hunger by 5, increases happiness by 20, decreases energy by 15", () => {
    const base: GameState = { ...DEFAULT_STATE, name: "Zuki", hunger: 50, happiness: 50, energy: 50 };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    act(() => { result.current.performAction("play"); });
    expect(result.current.state.hunger).toBe(45);
    expect(result.current.state.happiness).toBe(70);
    expect(result.current.state.energy).toBe(35);
  });

  it("T-5.3: performAction('rest') leaves hunger unchanged, increases happiness by 5, increases energy by 30", () => {
    const base: GameState = { ...DEFAULT_STATE, name: "Zuki", hunger: 50, happiness: 50, energy: 50 };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    act(() => { result.current.performAction("rest"); });
    expect(result.current.state.hunger).toBe(50);
    expect(result.current.state.happiness).toBe(55);
    expect(result.current.state.energy).toBe(80);
  });

  it("T-5.4: feed when hunger is 90 clamps to 100", () => {
    const base: GameState = { ...DEFAULT_STATE, name: "Zuki", hunger: 90, happiness: 50, energy: 50 };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    act(() => { result.current.performAction("feed"); });
    expect(result.current.state.hunger).toBe(100);
  });

  it("T-5.5: play when energy is 5 clamps to 0", () => {
    const base: GameState = { ...DEFAULT_STATE, name: "Zuki", hunger: 50, happiness: 50, energy: 5 };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    act(() => { result.current.performAction("play"); });
    expect(result.current.state.energy).toBe(0);
  });

  it("T-5.6: performAction increments totalCareActions by 1", () => {
    const base: GameState = { ...DEFAULT_STATE, name: "Zuki", totalCareActions: 0 };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    act(() => { result.current.performAction("feed"); });
    expect(result.current.state.totalCareActions).toBe(1);
  });

  it("T-5.7: calling performAction three times results in totalCareActions === 3", () => {
    const base: GameState = { ...DEFAULT_STATE, name: "Zuki", totalCareActions: 0 };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    act(() => {
      result.current.performAction("feed");
      result.current.performAction("play");
      result.current.performAction("rest");
    });
    expect(result.current.state.totalCareActions).toBe(3);
  });

  it("T-5.8: performAction updates lastInteraction to a timestamp >= the value before the call", () => {
    const before = Date.now();
    const base: GameState = { ...DEFAULT_STATE, name: "Zuki", lastInteraction: before };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    act(() => { result.current.performAction("rest"); });
    expect(result.current.state.lastInteraction).toBeGreaterThanOrEqual(before);
  });

  it("T-5.9: performAction calls saveState — localStorage is updated after the call", () => {
    const base: GameState = { ...DEFAULT_STATE, name: "Zuki", hunger: 50, happiness: 50, energy: 50 };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    act(() => { result.current.performAction("feed"); });
    const saved = loadState();
    expect(saved?.hunger).toBe(75);
  });
});
