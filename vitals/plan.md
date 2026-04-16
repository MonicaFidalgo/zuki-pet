# Feature Plan — Living Vitals

## Overview

Establish the core game state, the real-time decay loop, the naming modal, and localStorage persistence. This feature has no visible pet or actions yet — it produces a working state engine with a stat display and a first-load naming flow.

## Scope

**In scope:**

- `GameState` type definition
- `useGameState` custom hook (state + tick interval + localStorage)
- Naming modal (first load only)
- `VitalsPanel` component (three labelled progress bars)
- localStorage read on mount, write on every change

**Out of scope for this feature:**

- Care actions (Feed / Play / Rest) — Phase 2
- State transitions (sick / evolved) — Phase 3
- Personality reactions — Phase 4
- Any pet visual/illustration

---

## Task Groups

### Group 1 — Types & Initial State

Define `GameState` and `PetState` in `src/types/game.ts`.

```ts
export type PetState = "normal" | "sick" | "evolved";

export interface GameState {
  name: string;
  hunger: number;
  happiness: number;
  energy: number;
  status: PetState;
  sickSince: number | null;
  allStatsHighSince: number | null;
  totalCareActions: number;
  lastInteraction: number;
  lastSaved: number;
}
```

Default initial values (used when no saved state exists):

```ts
{
  name: '',
  hunger: 70,
  happiness: 70,
  energy: 70,
  status: 'normal',
  sickSince: null,
  allStatsHighSince: null,
  totalCareActions: 0,
  lastInteraction: Date.now(),
  lastSaved: Date.now()
}
```

---

### Group 2 — localStorage Utility

Create `src/utils/storage.ts` with two functions:

- `loadState(): GameState | null` — reads and parses `zuki_game_state` from localStorage. Returns `null` if the key is missing or JSON parsing fails (do not throw).
- `saveState(state: GameState): void` — serialises and writes to `zuki_game_state`. Updates `lastSaved` to `Date.now()` before writing.

---

### Group 3 — useGameState Hook

Create `src/hooks/useGameState.ts`.

**On mount:**

1. Call `loadState()`.
2. If a valid saved state is found AND `state.name` is non-empty: hydrate from it.
3. Otherwise: use default initial values and set `isNaming = true`.

**Tick interval:**

- Created with `setInterval` at **15 000ms**.
- Cleared with `clearInterval` on unmount.
- Not paused on tab visibility change — runs continuously regardless of `document.visibilityState`.
- On each tick, apply decay:
  - `hunger -= 2`
  - `happiness -= 1`
  - `energy -= 1`
- All three values are clamped to `[0, 100]` after decay.
- After clamping, call `saveState` with the updated state.

**Exposed interface:**

```ts
{
  state: GameState;
  isNaming: boolean;
  submitName: (name: string) => void;
}
```

`submitName(name)`: trims the input, validates it is non-empty, sets `state.name`, sets `isNaming = false`, calls `saveState`.

---

### Group 4 — NamingModal Component

Create `src/components/NamingModal.tsx`.

Rendered by `App` when `isNaming === true`. Overlays the full viewport.

- Contains a text input and a submit button.
- Submit is disabled when the trimmed input value is empty.
- On submit, calls `submitName(inputValue.trim())`.
- Does not close until `submitName` is called with a valid name.
- No close/dismiss button — the modal cannot be bypassed.

---

### Group 5 — VitalsPanel Component

Create `src/components/VitalsPanel.tsx`.

Receives `hunger`, `happiness`, `energy` as numeric props (0–100).

Renders three labelled progress bars:

- Label: "Hunger", "Happiness", "Energy"
- Value: displayed as the integer (e.g. "73")
- Bar fill: proportional to value (0% to 100% width)
- Colour coding:
  - Value > 50: green
  - Value 25–50: yellow
  - Value < 25: red

---

### Group 6 — App Wiring

Update `src/App.tsx`:

- Call `useGameState()`.
- Render `<NamingModal />` when `isNaming === true`.
- Render `<VitalsPanel />` with current stat values at all times (including while modal is open).
- No routing needed — single page.
