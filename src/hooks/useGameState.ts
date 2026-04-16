import { useState, useEffect, useRef } from "react";
import type { GameState, CareAction } from "../types/game";
import { DEFAULT_STATE } from "../types/game";
import { loadState, saveState } from "../utils/storage";

const DELTAS: Record<CareAction, { hunger: number; happiness: number; energy: number }> = {
  feed: { hunger: 25, happiness: 0, energy: -5 },
  play: { hunger: -5, happiness: 20, energy: -15 },
  rest: { hunger: 0, happiness: 5, energy: 30 },
};

const TICK_MS = 15000;

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function useGameState() {
  const saved = loadState();
  const hasValidName = saved !== null && saved.name.trim() !== "";

  const [state, setState] = useState<GameState>(hasValidName ? saved : DEFAULT_STATE);
  const [isNaming, setIsNaming] = useState(!hasValidName);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setState((prev) => {
        const next: GameState = {
          ...prev,
          hunger: clamp(prev.hunger - 2),
          happiness: clamp(prev.happiness - 1),
          energy: clamp(prev.energy - 1),
        };
        saveState(next);
        return next;
      });
    }, TICK_MS);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  function submitName(name: string): void {
    const trimmed = name.trim();
    if (trimmed === "") return;
    setState((prev) => {
      const next: GameState = { ...prev, name: trimmed };
      saveState(next);
      return next;
    });
    setIsNaming(false);
  }

  function performAction(action: CareAction): void {
    const delta = DELTAS[action];
    setState((prev) => {
      const next: GameState = {
        ...prev,
        hunger: clamp(prev.hunger + delta.hunger),
        happiness: clamp(prev.happiness + delta.happiness),
        energy: clamp(prev.energy + delta.energy),
        totalCareActions: prev.totalCareActions + 1,
        lastInteraction: Date.now(),
      };
      saveState(next);
      return next;
    });
  }

  return { state, isNaming, submitName, performAction };
}
