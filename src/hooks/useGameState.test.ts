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

  it("T-2.7: intervals created once on mount — no leak after re-render (tick + idle = 2)", () => {
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");
    const { rerender, unmount } = renderHook(() => useGameState());
    rerender();
    // Phase 4 adds a second interval (idle guilt check), so 2 is correct
    expect(setIntervalSpy).toHaveBeenCalledTimes(2);
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

// ─── Phase 3: State Machine (T-7) ────────────────────────────────────────────

describe("useGameState — state machine (T-7)", () => {
  it("T-7.1: when a stat drops ≤15 on tick, sickSince is set to a non-null timestamp", () => {
    const base: GameState = { ...DEFAULT_STATE, name: "Zuki", hunger: 14, happiness: 70, energy: 70 };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    act(() => { vi.advanceTimersByTime(15_000); });
    expect(result.current.state.sickSince).not.toBeNull();
    expect(result.current.state.status).toBe("normal");
  });

  it("T-7.2: after sickSince set and 60 000ms elapses (4 ticks), status transitions to sick", () => {
    const sickSince = Date.now() - 45_001;
    const base: GameState = { ...DEFAULT_STATE, name: "Zuki", hunger: 10, happiness: 70, energy: 70, sickSince };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    act(() => { vi.advanceTimersByTime(15_000); });
    expect(result.current.state.status).toBe("sick");
  });

  it("T-7.3: when all stats recover to >15 before 60s, sickSince resets and status stays normal", () => {
    const sickSince = Date.now() - 20_000;
    const base: GameState = { ...DEFAULT_STATE, name: "Zuki", hunger: 10, happiness: 70, energy: 70, sickSince };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    // Raise hunger above 15 via feed before next tick
    act(() => { result.current.performAction("feed"); });
    expect(result.current.state.sickSince).toBeNull();
    expect(result.current.state.status).toBe("normal");
  });

  it("T-7.4: when sick and all stats raised to ≥40 via performAction, status becomes normal and sickSince resets", () => {
    const base: GameState = {
      ...DEFAULT_STATE, name: "Zuki", status: "sick", sickSince: Date.now() - 70_000,
      hunger: 30, happiness: 30, energy: 30,
    };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    // Feed: hunger +25 → 55, energy -5 → 25 (still < 40 — need more)
    act(() => { result.current.performAction("feed"); }); // hunger=55, energy=25
    act(() => { result.current.performAction("rest"); }); // energy=55, happiness=35
    act(() => { result.current.performAction("rest"); }); // happiness=40, energy=85
    expect(result.current.state.status).toBe("normal");
    expect(result.current.state.sickSince).toBeNull();
  });

  it("T-7.5: recovery requires ALL stats ≥40 — raising only one stat is insufficient", () => {
    const base: GameState = {
      ...DEFAULT_STATE, name: "Zuki", status: "sick", sickSince: Date.now() - 70_000,
      hunger: 30, happiness: 30, energy: 30,
    };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    act(() => { result.current.performAction("feed"); }); // only hunger goes to 55
    expect(result.current.state.status).toBe("sick");
  });

  it("T-7.6: when all stats ≥80 and totalCareActions ≥15, allStatsHighSince is set", () => {
    const base: GameState = {
      ...DEFAULT_STATE, name: "Zuki", hunger: 82, happiness: 82, energy: 82, totalCareActions: 15,
    };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    act(() => { vi.advanceTimersByTime(15_000); });
    expect(result.current.state.allStatsHighSince).not.toBeNull();
    expect(result.current.state.status).toBe("normal");
  });

  it("T-7.7: when allStatsHighSince set and 180 000ms elapses, status transitions to evolved", () => {
    const allStatsHighSince = Date.now() - 165_001;
    const base: GameState = {
      ...DEFAULT_STATE, name: "Zuki", hunger: 82, happiness: 82, energy: 82,
      totalCareActions: 15, allStatsHighSince,
    };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    act(() => { vi.advanceTimersByTime(15_000); });
    expect(result.current.state.status).toBe("evolved");
  });

  it("T-7.8: if any stat drops <80 before 180s, allStatsHighSince resets", () => {
    const allStatsHighSince = Date.now() - 10_000;
    const base: GameState = {
      ...DEFAULT_STATE, name: "Zuki", hunger: 82, happiness: 82, energy: 82,
      totalCareActions: 15, allStatsHighSince,
    };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    // play: energy -15 → 67 (below 80)
    act(() => { result.current.performAction("play"); });
    expect(result.current.state.allStatsHighSince).toBeNull();
  });

  it("T-7.9: evolution not triggered if totalCareActions < 15, even with all stats ≥80 for 180s", () => {
    const allStatsHighSince = Date.now() - 165_001;
    const base: GameState = {
      ...DEFAULT_STATE, name: "Zuki", hunger: 82, happiness: 82, energy: 82,
      totalCareActions: 14, allStatsHighSince,
    };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    act(() => { vi.advanceTimersByTime(15_000); });
    expect(result.current.state.status).toBe("normal");
    expect(result.current.state.allStatsHighSince).toBeNull(); // reset because care < 15
  });

  it("T-7.10: once evolved, tick with stat ≤15 does not set sickSince or change status", () => {
    const base: GameState = {
      ...DEFAULT_STATE, name: "Zuki", status: "evolved", hunger: 10, happiness: 10, energy: 10,
    };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    act(() => { vi.advanceTimersByTime(15_000); });
    expect(result.current.state.status).toBe("evolved");
    expect(result.current.state.sickSince).toBeNull();
  });
});

// ─── Phase 4: Personality (T-9) ──────────────────────────────────────────────

describe("useGameState — personality (T-9)", () => {
  it("T-9.1: currentMessage is null on initial render", () => {
    const { result } = renderHook(() => useGameState());
    expect(result.current.currentMessage).toBeNull();
  });

  it("T-9.2: feed when hunger > 90 sets overfed message", () => {
    const base: GameState = { ...DEFAULT_STATE, name: "Zuki", hunger: 91 };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    act(() => { result.current.performAction("feed"); });
    expect(result.current.currentMessage).toBe("Tô cheia!! Para com isso.");
  });

  it("T-9.3: feed when hunger === 90 does NOT set E-1 message", () => {
    const base: GameState = { ...DEFAULT_STATE, name: "Zuki", hunger: 90 };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    act(() => { result.current.performAction("feed"); });
    expect(result.current.currentMessage).toBeNull();
  });

  it("T-9.4: play when energy < 10 sets exhausted message", () => {
    const base: GameState = { ...DEFAULT_STATE, name: "Zuki", energy: 9 };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    act(() => { result.current.performAction("play"); });
    expect(result.current.currentMessage).toBe("Nem consigo levantar as patas...");
  });

  it("T-9.5: rest when energy > 90 sets forced rest message", () => {
    const base: GameState = { ...DEFAULT_STATE, name: "Zuki", energy: 91 };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    act(() => { result.current.performAction("rest"); });
    expect(result.current.currentMessage).toBe("Eu NÃO estou cansada. Mas ok.");
  });

  it("T-9.6: after message set, advancing 4000ms clears it", () => {
    const base: GameState = { ...DEFAULT_STATE, name: "Zuki", energy: 91 };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    act(() => { result.current.performAction("rest"); });
    expect(result.current.currentMessage).not.toBeNull();
    act(() => { vi.advanceTimersByTime(4_000); });
    expect(result.current.currentMessage).toBeNull();
  });

  it("T-9.7: second message while first is active replaces it and resets 4s timer", () => {
    const base: GameState = { ...DEFAULT_STATE, name: "Zuki", energy: 91 };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    act(() => { result.current.performAction("rest"); });
    act(() => { vi.advanceTimersByTime(2_000); });
    // Now set a second message via triggerSpamClick
    act(() => { result.current.triggerSpamClick(); });
    expect(result.current.currentMessage).toBe("Pára. Só porque és tu.");
    // 3s later (2+3=5s since first), first message would have expired but second should still be showing
    act(() => { vi.advanceTimersByTime(3_000); });
    expect(result.current.currentMessage).toBe("Pára. Só porque és tu.");
    // Now 4s after second message, it should clear
    act(() => { vi.advanceTimersByTime(1_001); });
    expect(result.current.currentMessage).toBeNull();
  });

  it("T-9.8: performAction that raises all stats to 100 sets peak happiness message", () => {
    // Use a state where feed hits exactly 100 on all
    const base2: GameState = { ...DEFAULT_STATE, name: "Zuki", hunger: 76, happiness: 100, energy: 100 };
    localStorage.setItem("zuki_game_state", JSON.stringify(base2));
    const { result: result2 } = renderHook(() => useGameState());
    act(() => { result2.current.performAction("feed"); }); // hunger=100, energy=95 — not peak
    expect(result2.current.currentMessage).toBeNull();
    // Setup where all will be 100: hunger=76 feed→100, happiness=100, energy=100 but feed takes energy-5=95
    // Try rest: happiness+5=100 if 95, energy+30=100 if 70
    const base3: GameState = { ...DEFAULT_STATE, name: "Zuki", hunger: 100, happiness: 95, energy: 70 };
    localStorage.setItem("zuki_game_state", JSON.stringify(base3));
    const { result: result3 } = renderHook(() => useGameState());
    act(() => { result3.current.performAction("rest"); }); // happiness=100, energy=100, hunger=100
    expect(result3.current.currentMessage).toBe("Ok. Talvez goste um bocadinho de ti.");
  });

  it("T-9.9: idle guilt fires after 300 000ms with no performAction", () => {
    const base: GameState = { ...DEFAULT_STATE, name: "Zuki", lastInteraction: Date.now() - 300_001 };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    act(() => { vi.advanceTimersByTime(30_000); });
    expect(result.current.currentMessage).toBe("Óbvio que preferes o telemóvel.");
  });

  it("T-9.10: after idle guilt fires and player acts, idle flag resets — no repeat until next 5min idle", () => {
    const base: GameState = { ...DEFAULT_STATE, name: "Zuki", lastInteraction: Date.now() - 300_001 };
    localStorage.setItem("zuki_game_state", JSON.stringify(base));
    const { result } = renderHook(() => useGameState());
    // First idle fires
    act(() => { vi.advanceTimersByTime(30_000); });
    expect(result.current.currentMessage).toBe("Óbvio que preferes o telemóvel.");
    // Player acts — resets idle flag and lastInteraction
    act(() => { result.current.performAction("rest"); });
    // Clear message
    act(() => { vi.advanceTimersByTime(4_000); });
    expect(result.current.currentMessage).toBeNull();
    // Idle check fires again but not 5min since last action → no message
    act(() => { vi.advanceTimersByTime(30_000); });
    expect(result.current.currentMessage).toBeNull();
  });
});
