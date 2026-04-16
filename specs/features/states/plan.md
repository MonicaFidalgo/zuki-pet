# Feature Plan — Dynamic States

## Overview

Introduce Zuki's three mutually exclusive states — `normal`, `sick`, and `evolved` — and the rules that govern transitions between them. This feature adds the state machine logic to the tick system and introduces the `PetDisplay` component, which renders Zuki visually differently depending on her current state.

## Scope

**In scope:**

- State machine logic inside the tick (evaluated on every tick)
- `sickSince` and `allStatsHighSince` timestamp tracking
- `PetDisplay` component with three distinct visual states
- Visual indicators for each state (label + appearance)

**Out of scope:**

- Personality reactions triggered by states — Phase 4
- Any sound or animation beyond CSS

---

## Task Groups

### Group 1 — State Machine Logic in useGameState

The state machine is evaluated **on every tick**, after decay is applied and stats are clamped. It is also evaluated after every `performAction` call.

**State machine rules (evaluated in this exact order):**

```
1. If status === 'evolved' → no transition possible. Skip all checks.

2. Sick transition (normal → sick):
   - If status === 'normal' AND any stat (hunger, happiness, energy) is ≤ 15:
     - If sickSince is null: set sickSince = Date.now()
     - If sickSince is not null AND (Date.now() - sickSince) ≥ 60_000ms: set status = 'sick'
   - If status === 'normal' AND all stats are > 15:
     - Reset sickSince = null

3. Recovery transition (sick → normal):
   - If status === 'sick' AND all stats are ≥ 40:
     - Set status = 'normal', reset sickSince = null

4. Evolution transition (normal → evolved):
   - If status === 'normal' AND all stats are ≥ 80 AND totalCareActions ≥ 15:
     - If allStatsHighSince is null: set allStatsHighSince = Date.now()
     - If allStatsHighSince is not null AND (Date.now() - allStatsHighSince) ≥ 180_000ms: set status = 'evolved'
   - If status === 'normal' AND any stat drops below 80:
     - Reset allStatsHighSince = null
```

**Important:** evolved is permanent. Once `status === 'evolved'`, it never changes.

State changes are persisted to localStorage immediately via `saveState`.

---

### Group 2 — PetDisplay Component

Create `src/components/PetDisplay.tsx`.

Props:

```ts
interface PetDisplayProps {
  status: PetState;
  name: string;
}
```

Renders a visual representation of Zuki based on her current state. Design choices are left to the implementer, but the following minimum requirements apply:

| State   | Visual requirement                                         |
| ------- | ---------------------------------------------------------- |
| normal  | Default Zuki appearance. No status label required.         |
| sick    | Desaturated or droopy appearance. "😷 Sick" label visible. |
| evolved | Distinct evolved appearance. "✨ Evolved" label visible.   |

The component may use emoji, CSS, SVG, or any combination. It must be visually distinguishable at a glance — a coloured border or badge alone is not sufficient.

---

### Group 3 — App Wiring

Update `src/App.tsx`:

- Render `<PetDisplay status={state.status} name={state.name} />` between the title and `<VitalsPanel />`.
- `PetDisplay` is not rendered while `isNaming === true`.
