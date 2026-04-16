# Requirements — Living Vitals

## Functional Requirements

### FR-1 State Initialisation

- On first load (no valid localStorage entry), all three stats initialise to **70**.
- `status` initialises to `'normal'`.
- `name` initialises to empty string `''`.
- The naming modal is shown immediately on first load.

### FR-2 Naming Flow

- The naming modal is displayed when `name` is empty.
- The player must enter a non-empty name (after whitespace trimming) to proceed.
- The modal cannot be dismissed without submitting a valid name.
- Once a name is submitted, it is persisted to localStorage immediately.
- The naming modal never appears again for this browser session unless localStorage is cleared.

### FR-3 Stat Decay

- Decay runs on a fixed interval of **every 15 seconds**.
- Per tick:
  - `hunger` decreases by **2**
  - `happiness` decreases by **1**
  - `energy` decreases by **1**
- All stat values are clamped to the range **[0, 100]** after every tick.
- Stats do not go below 0 or above 100 under any circumstance.
- The tick interval is **not paused** when the browser tab is in the background or hidden. It runs continuously from mount to unmount.

### FR-4 Persistence

- The full `GameState` object is written to localStorage key `zuki_game_state` after every tick and after `submitName`.
- On mount, if `zuki_game_state` exists and parses successfully, state is hydrated from it.
- If `zuki_game_state` is missing or malformed (JSON parse failure), the app silently falls back to default initial state.
- `lastSaved` is updated to `Date.now()` on every write.

### FR-5 Stat Display

- The three stats are always visible on screen, including while the naming modal is open.
- Each stat is displayed as:
  - A text label (Hunger / Happiness / Energy)
  - A numeric value (integer, 0–100)
  - A progress bar whose fill is proportional to the current value
- Progress bar colour:
  - > 50 → green
  - 25–50 → yellow
  - < 25 → red
- The display updates immediately after each tick (no manual refresh required).

---

## Technical Requirements

### TR-1 Language & Tooling

- TypeScript strict mode enabled (`"strict": true` in `tsconfig.json`).
- No `any` types in game logic files.

### TR-2 File Structure

```
src/
├── components/
│   ├── NamingModal.tsx
│   └── VitalsPanel.tsx
├── hooks/
│   └── useGameState.ts
├── types/
│   └── game.ts
├── utils/
│   └── storage.ts
└── App.tsx
```

### TR-3 Interval Management

- The `setInterval` call is inside a `useEffect` with an empty dependency array.
- The interval ID is stored in a `useRef` and cleared via `clearInterval` in the `useEffect` cleanup function.
- There must be exactly one active interval at any time — no interval leaks on re-render.

### TR-4 No External State Libraries

- No Redux, Zustand, Jotai, or similar. React `useState` and `useRef` only.

### TR-5 Accessibility (minimum)

- The naming modal input has a visible label.
- Progress bars use `role="progressbar"` with `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`.

---

## Edge Cases

| Scenario                                                      | Expected Behaviour                                                     |
| ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| localStorage contains a state where `name` is an empty string | Treat as first load: show naming modal                                 |
| localStorage value is not valid JSON                          | Silently fall back to default state; show naming modal                 |
| A stat is at 0 and a tick fires                               | Stat stays at 0 (clamped); no negative values                          |
| Player refreshes mid-game                                     | State is restored from localStorage; tick resumes from restored values |
| Player submits name with only whitespace                      | Trimmed value is empty; submit is rejected; modal remains open         |
