# Feature Plan — Care Loop

## Overview

Add three action buttons — Feed, Play, Rest — that let the player interact with Zuki. Each action produces a deterministic, immediate change to her stats and increments the care action counter. This feature also introduces the `ActionPanel` component and the first visible feedback that player actions matter.

## Scope

**In scope:**

- `ActionPanel` component with three buttons
- Stat deltas per action (Feed, Play, Rest)
- `totalCareActions` increment on every action
- `lastInteraction` timestamp update on every action
- Clamping of all resulting values to [0, 100]
- Persistence of updated state to localStorage after every action

**Out of scope for this feature:**

- State transitions (sick / evolved) — Phase 3
- Personality reactions / Easter eggs — Phase 4
- Any visual pet illustration
- Button disabled states based on stats (no cooldowns or restrictions)

---

## Task Groups

### Group 1 — Extend useGameState Hook

Add a `performAction` function to the hook exposed interface.

```ts
type CareAction = 'feed' | 'play' | 'rest';

performAction: (action: CareAction) => void;
```

**Stat deltas per action (applied simultaneously, then clamped):**

| Action | Hunger | Happiness | Energy |
| ------ | ------ | --------- | ------ |
| feed   | +25    | 0         | −5     |
| play   | −5     | +20       | −15    |
| rest   | 0      | +5        | +30    |

**On every `performAction` call:**

1. Apply the deltas to the current stat values.
2. Clamp all three stats to [0, 100].
3. Increment `totalCareActions` by 1.
4. Set `lastInteraction` to `Date.now()`.
5. Call `saveState` with the updated state.

The `CareAction` type must be exported from `src/types/game.ts`.

---

### Group 2 — ActionPanel Component

Create `src/components/ActionPanel.tsx`.

Props:

```ts
interface ActionPanelProps {
  onAction: (action: CareAction) => void;
}
```

Renders three buttons:

- "Feed 🍙" → calls `onAction('feed')`
- "Play 🎾" → calls `onAction('play')`
- "Rest 💤" → calls `onAction('rest')`

No disabled states. All three buttons are always active regardless of current stat values.

Each button must have a descriptive `aria-label` (e.g. `aria-label="Feed Zuki"`).

---

### Group 3 — App Wiring

Update `src/App.tsx`:

- Destructure `performAction` from `useGameState()`.
- Render `<ActionPanel onAction={performAction} />` below `<VitalsPanel />`.
- `ActionPanel` is not rendered while the naming modal is open (`isNaming === true`).
