# Tech Stack — Zuki

## Framework & Language

| Layer       | Choice                          | Rationale                                      |
| ----------- | ------------------------------- | ---------------------------------------------- |
| Framework   | React 18 + Vite                 | Fast dev server, HMR, familiar tooling         |
| Language    | TypeScript (strict mode)        | Type safety for game state and stat logic      |
| Styling     | Tailwind CSS v3                 | Utility-first, no custom CSS build step needed |
| State       | React `useState` / `useReducer` | No external state lib needed at this scope     |
| Persistence | `localStorage`                  | Zero infrastructure, survives page refresh     |
| Runtime     | Browser only (SPA)              | Single `index.html`, no routing needed         |

## Architecture

Single-page application. One root component (`<App />`) owns all game state. Child components are purely presentational — they receive props and emit callbacks. No context, no global store.

```
App (state owner)
├── PetDisplay       (renders Zuki's current visual state)
├── VitalsPanel      (renders the three stat bars)
├── ActionPanel      (Feed / Play / Rest buttons)
└── MessageBubble    (renders personality reactions)
```

## State Shape

```ts
type PetState = "normal" | "sick" | "evolved";

interface GameState {
  name: string; // player-assigned name, set on first load
  hunger: number; // 0–100, higher = more full
  happiness: number; // 0–100
  energy: number; // 0–100
  status: PetState;
  sickSince: number | null; // timestamp (ms) when sick state began, null otherwise
  allStatsHighSince: number | null; // timestamp (ms) when all stats first hit ≥80, null otherwise
  totalCareActions: number; // cumulative count of Feed + Play + Rest
  lastInteraction: number; // timestamp (ms) of last player action
  lastSaved: number; // timestamp (ms) of last localStorage write
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

## Build & Deployment

- `npm create vite@latest zuki-pet -- --template react-ts`
- Build output: `dist/`
- Deployable to any static host (Cloudflare Pages, Vercel, Netlify)
- No environment variables required
