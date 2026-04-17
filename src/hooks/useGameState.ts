import { useState, useEffect, useRef } from "react";
import type { GameState, CareAction } from "../types/game";
import { DEFAULT_STATE } from "../types/game";
import { loadState, saveState } from "../utils/storage";

const TICK_MS = 15_000;
const IDLE_CHECK_MS = 30_000;
const IDLE_THRESHOLD_MS = 300_000;
const MESSAGE_DISMISS_MS = 4_000;

const DELTAS: Record<CareAction, { hunger: number; happiness: number; energy: number }> = {
  feed: { hunger: 25, happiness: 0, energy: -5 },
  play: { hunger: -5, happiness: 20, energy: -15 },
  rest: { hunger: 0, happiness: 5, energy: 30 },
};

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function applyStateMachine(state: GameState, now: number): GameState {
  if (state.status === "evolved") return state;

  let next = { ...state };

  // Sick transition (normal → sick)
  if (next.status === "normal") {
    const anyCritical = next.hunger <= 15 || next.happiness <= 15 || next.energy <= 15;
    if (anyCritical) {
      if (next.sickSince === null) next.sickSince = now;
      else if (now - next.sickSince >= 60_000) next.status = "sick";
    } else {
      next.sickSince = null;
    }
  }

  // Recovery (sick → normal)
  if (next.status === "sick" && next.hunger >= 40 && next.happiness >= 40 && next.energy >= 40) {
    next.status = "normal";
    next.sickSince = null;
  }

  // Evolution (normal → evolved)
  if (next.status === "normal") {
    const allHigh = next.hunger >= 80 && next.happiness >= 80 && next.energy >= 80;
    if (allHigh && next.totalCareActions >= 15) {
      if (next.allStatsHighSince === null) next.allStatsHighSince = now;
      else if (now - next.allStatsHighSince >= 180_000) next.status = "evolved";
    } else {
      next.allStatsHighSince = null;
    }
  }

  return next;
}

export function useGameState() {
  const saved = loadState();
  const hasValidName = saved !== null && saved.name.trim() !== "";

  const [state, setState] = useState<GameState>(hasValidName ? saved : DEFAULT_STATE);
  const [isNaming, setIsNaming] = useState(!hasValidName);
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasIdledRef = useRef(false);

  function setMessage(text: string): void {
    if (dismissRef.current !== null) clearTimeout(dismissRef.current);
    setCurrentMessage(text);
    dismissRef.current = setTimeout(() => setCurrentMessage(null), MESSAGE_DISMISS_MS);
  }

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setState((prev) => {
        const now = Date.now();
        const decayed: GameState = {
          ...prev,
          hunger: clamp(prev.hunger - 2),
          happiness: clamp(prev.happiness - 1),
          energy: clamp(prev.energy - 1),
        };
        const next = applyStateMachine(decayed, now);
        saveState(next);
        return next;
      });
    }, TICK_MS);

    idleIntervalRef.current = setInterval(() => {
      setState((prev) => {
        if (!hasIdledRef.current && Date.now() - prev.lastInteraction >= IDLE_THRESHOLD_MS) {
          hasIdledRef.current = true;
          setMessage("Obviously you prefer your phone.");
        }
        return prev;
      });
    }, IDLE_CHECK_MS);

    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
      if (idleIntervalRef.current !== null) clearInterval(idleIntervalRef.current);
      if (dismissRef.current !== null) clearTimeout(dismissRef.current);
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
    setState((prev) => {
      let messageToSet: string | null = null;

      // Pre-delta personality checks (E-1, E-2, E-3)
      if (action === "feed" && prev.hunger > 90) {
        messageToSet = "I'm full!! Stop it.";
      } else if (action === "play" && prev.energy < 10) {
        messageToSet = "Can't even lift a paw...";
      } else if (action === "rest" && prev.energy > 90) {
        messageToSet = "I'm NOT tired. But fine.";
      }

      const delta = DELTAS[action];
      const now = Date.now();
      const afterDelta: GameState = {
        ...prev,
        hunger: clamp(prev.hunger + delta.hunger),
        happiness: clamp(prev.happiness + delta.happiness),
        energy: clamp(prev.energy + delta.energy),
        totalCareActions: prev.totalCareActions + 1,
        lastInteraction: now,
      };

      const next = applyStateMachine(afterDelta, now);

      // Post-delta E-6 check (only if no earlier message fired)
      if (
        messageToSet === null &&
        next.hunger === 100 &&
        next.happiness === 100 &&
        next.energy === 100
      ) {
        messageToSet = "Ok. Maybe I like you a little.";
      }

      if (messageToSet !== null) setMessage(messageToSet);

      hasIdledRef.current = false;

      saveState(next);
      return next;
    });
  }

  function triggerSpamClick(): void {
    setMessage("Stop it. Only because it's you.");
  }

  return { state, isNaming, submitName, performAction, currentMessage, triggerSpamClick };
}
