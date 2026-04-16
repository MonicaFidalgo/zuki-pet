# Tech Stack — Zuki

## Framework & Language

| Layer       | Choice                          | Rationale                                      |
| ----------- | ------------------------------- | ---------------------------------------------- |
| Framework   | React 19 + Vite 8               | Fast dev server, HMR, familiar tooling         |
| Language    | TypeScript (strict mode)        | Type safety for game state and stat logic      |
| Styling     | Tailwind CSS v4                 | Utility-first, no custom CSS build step needed |
| State       | React `useState` / `useReducer` | No external state lib needed at this scope     |
| Persistence | `localStorage`                  | Zero infrastructure, survives page refresh     |
| Runtime     | Browser only (SPA)              | Single `index.html`, no routing needed         |

## Pinned Package Versions (as of Phase 1)

| Package                       | Version  |
| ----------------------------- | -------- |
| react                         | ^19.2.4  |
| react-dom                     | ^19.2.4  |
| vite                          | ^8.0.4   |
| typescript                    | ~6.0.2   |
| tailwindcss                   | ^4.2.2   |
| @vitejs/plugin-react          | ^6.0.1   |
| vitest                        | ^3.2.4   |
| @testing-library/react        | ^16.3.2  |
| @testing-library/user-event   | ^14.6.1  |
| jsdom                         | ^27.0.1  |
| @testing-library/jest-dom     | ^6.9.1   |

## Architecture

Single-page application. One root component (`<App />`) owns all game state. Child components are purely presentational — they receive props and emit callbacks. No context, no global store.

**All UI must be responsive down to 375px viewport width.**

```
App (state owner)
├── NamingModal      (first-load naming flow — Phase 1)
├── VitalsPanel      (renders the three stat bars — Phase 1)
├── PetDisplay       (renders Zuki's current visual state — future)
├── ActionPanel      (Feed / Play / Rest buttons — future)
└── MessageBubble    (renders personality reactions — future)
```

## File Structure (as of Phase 1)

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
├── test/
│   └── setup.ts
├── App.tsx
├── main.tsx
└── index.css
```

## State Shape

```ts
type PetState = "normal" | "sick" | "evolved";

interface GameState {
  name: string;              // player-assigned name, set on first load
  hunger: number;            // 0–100, higher = more full
  happiness: number;         // 0–100
  energy: number;            // 0–100
  status: PetState;
  sickSince: number | null;          // timestamp (ms) when sick state began, null otherwise
  allStatsHighSince: number | null;  // timestamp (ms) when all stats first hit ≥80, null otherwise
  totalCareActions: number;          // cumulative count of Feed + Play + Rest
  lastInteraction: number;           // timestamp (ms) of last player action
  lastSaved: number;                 // timestamp (ms) of last localStorage write
}
```

## Tick System

A single `setInterval` fires every **15 seconds** (the "tick"). On each tick:

| Stat      | Decay per tick | Effective rate |
| --------- | -------------- | -------------- |
| Hunger    | −2             | −8 / min       |
| Happiness | −1             | −4 / min       |
| Energy    | −1             | −4 / min       |

All stats are clamped to [0, 100] after every tick and after every care action.

The interval is created once on mount and cleared on unmount. It is not paused when the tab is hidden — decay continues at the same rate regardless of visibility.

## Persistence Strategy

`localStorage` key: `zuki_game_state` (string, JSON-serialised `GameState`).

Write: on every state change (after every tick and after every user action).
Read: on app mount. If the key exists and parses successfully, hydrate state from it. If missing or malformed, initialise with defaults and prompt for a name.

Default initial values:

```ts
hunger: 70,
happiness: 70,
energy: 70,
status: 'normal',
sickSince: null,
allStatsHighSince: null,
totalCareActions: 0,
lastInteraction: Date.now(),
lastSaved: Date.now()
```

## Test Configuration

Vitest is configured in a **separate `vitest.config.ts`** file (not inside `vite.config.ts`). This is required because Vite 8 uses rolldown internally, which is type-incompatible with Vitest's bundled Vite version — merging the configs causes TS build errors.

```
vitest.config.ts   ← test config (jsdom, globals, setupFiles)
vite.config.ts     ← build config only
```

Tests run with `npx vitest run`. The setup file at `src/test/setup.ts` imports `@testing-library/jest-dom` and Vitest `globals: true` is enabled so `describe`/`it`/`expect` are available without explicit imports.

## Build & Deployment

- `npm create vite@latest zuki-pet -- --template react-ts`
- Build output: `dist/`
- Deployable to any static host (Cloudflare Pages, Vercel, Netlify)
- No environment variables required
