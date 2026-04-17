# Validation — Living Vitals

## Overview

Two levels of testing are required:

1. **Automated unit tests** — fast, repeatable, run with `npm test`
2. **Manual smoke tests** — browser-based checks that confirm the rendered UI behaves correctly

---

## Level 1 — Automated Unit Tests

Framework: Vitest + React Testing Library.

Install:

```bash
npm install -D vitest @testing-library/react @testing-library/user-event jsdom @testing-library/jest-dom
```

Add to `vite.config.ts`:

```ts
test: {
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
}
```

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom";
```

---

### Test Suite: `src/utils/storage.test.ts`

**T-1.1** `loadState` returns `null` when localStorage is empty.

**T-1.2** `loadState` returns the parsed object when a valid `GameState` is stored.

**T-1.3** `loadState` returns `null` when the stored value is malformed JSON (no throw).

**T-1.4** `saveState` writes a JSON string to `zuki_game_state`.

**T-1.5** `saveState` updates `lastSaved` to a timestamp ≥ the value before the call.

---

### Test Suite: `src/hooks/useGameState.test.ts`

**T-2.1** On first render with empty localStorage, `isNaming` is `true`.

**T-2.2** On first render with a valid saved state (non-empty name), `isNaming` is `false` and stats match saved values.

**T-2.3** `submitName('Zuki')` sets `state.name` to `'Zuki'` and `isNaming` to `false`.

**T-2.4** `submitName('   ')` (whitespace only) does not change `isNaming` — it remains `true`.

**T-2.5** After one simulated tick (`vi.advanceTimersByTime(15000)`), `hunger` decreases by 2, `happiness` by 1, `energy` by 1 from their initial values.

**T-2.6** Stats do not go below 0. Set all stats to 1 and advance 15s — all values are 0, not negative.

**T-2.7** Exactly one interval is active at any time. Confirm no interval leak after re-render.

---

### Test Suite: `src/components/VitalsPanel.test.tsx`

**T-3.1** Renders three elements with labels "Hunger", "Happiness", "Energy".

**T-3.2** Each progress bar has `role="progressbar"` with correct `aria-valuenow`.

**T-3.3** A stat value of 75 renders a green bar — verified via `data-color="green"` attribute on the `progressbar` element.

**T-3.4** A stat value of 35 renders a yellow bar — verified via `data-color="yellow"` attribute.

**T-3.5** A stat value of 20 renders a red bar — verified via `data-color="red"` attribute.

---

### Test Suite: `src/components/NamingModal.test.tsx`

**T-4.1** Modal renders when `isNaming` is `true`.

**T-4.2** Submit button is disabled when input is empty.

**T-4.3** Submit button is disabled when input contains only whitespace.

**T-4.4** Submit button is enabled after typing a non-empty name.

**T-4.5** Submitting a valid name calls `submitName` with the trimmed value.

---

## Level 2 — Manual Smoke Tests

Run the dev server (`npm run dev`) and verify the following in the browser.

**S-1 First Load**

- Clear localStorage (`Application > Storage > Clear site data` in DevTools).
- Reload. The naming modal appears immediately.
- The vitals panel is visible behind/below the modal with values of 70.

**S-2 Name Submission**

- With the modal open, click submit with an empty field. Nothing happens.
- Type " " (spaces only), click submit. Nothing happens.
- Type "Zuki", click submit. Modal closes. Name persists on refresh.

**S-3 Stat Decay**

- Wait 15 seconds. Hunger drops to 68. Happiness and Energy drop to 69.
- Wait another 15 seconds. Hunger is 66. Happiness and Energy are 68.
- Confirm values update in real time without any user interaction.

**S-4 Colour Coding**

- Open DevTools console and run:
  ```js
  localStorage.setItem(
    "zuki_game_state",
    JSON.stringify({
      ...JSON.parse(localStorage.getItem("zuki_game_state")),
      hunger: 20,
      happiness: 40,
      energy: 75,
    }),
  );
  ```
- Reload. Hunger bar is red, Happiness is yellow, Energy is green.

**S-5 Persistence on Refresh**

- Let stats decay for ~1 minute (hunger ≈ 62, happiness/energy ≈ 65).
- Refresh the page. Values are restored from localStorage (not reset to 70).
- Naming modal does not appear.

**S-6 Background Tab**

- Start the app, switch to another tab for 60 seconds, return.
- Hunger has decreased by 8 (4 ticks × 2), happiness and energy by 4 each.

---

## Acceptance Criteria

This feature is complete when:

- [ ] All automated tests in Level 1 pass (`npm test`)
- [ ] All manual smoke tests in Level 2 pass without errors in the console
- [ ] TypeScript compiles with no errors (`npm run build`)
- [ ] No interval leak is detectable in DevTools Performance tab after 2 minutes of running
