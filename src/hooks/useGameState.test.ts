import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGameState } from "./useGameState";
import type { GameState } from "../types/game";
import { DEFAULT_STATE } from "../types/game";

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
});
