import { useState, useEffect, useRef } from "react";
import type { GameState } from "../types/game";
import { DEFAULT_STATE } from "../types/game";
import { loadState, saveState } from "../utils/storage";

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

  return { state, isNaming, submitName };
}
