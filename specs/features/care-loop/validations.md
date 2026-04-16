# Validation — Care Loop

## Overview

Two levels of testing required:

1. **Automated unit tests** — run with `npx vitest run`
2. **Manual smoke tests** — browser-based checks

---

## Level 1 — Automated Unit Tests

Add to existing test suites or create new files as appropriate.

---

### Test Suite: `src/hooks/useGameState.test.ts` (additions)

**T-5.1** `performAction('feed')` increases `hunger` by 25, leaves `happiness` unchanged, decreases `energy` by 5.

**T-5.2** `performAction('play')` decreases `hunger` by 5, increases `happiness` by 20, decreases `energy` by 15.

**T-5.3** `performAction('rest')` leaves `hunger` unchanged, increases `happiness` by 5, increases `energy` by 30.

**T-5.4** Clamping — calling `performAction('feed')` when `hunger` is 90 results in `hunger === 100`, not 115.

**T-5.5** Clamping — calling `performAction('play')` when `energy` is 5 results in `energy === 0`, not −10.

**T-5.6** `performAction` increments `totalCareActions` by 1 on each call.

**T-5.7** Calling `performAction` three times results in `totalCareActions === 3`.

**T-5.8** `performAction` updates `lastInteraction` to a timestamp ≥ the value before the call.

**T-5.9** `performAction` calls `saveState` — verified by checking that localStorage is updated after the call.

---

### Test Suite: `src/components/ActionPanel.test.tsx`

**T-6.1** Renders three buttons with visible text containing "Feed", "Play", and "Rest".

**T-6.2** Each button has an `aria-label` attribute.

**T-6.3** Clicking "Feed" calls `onAction` with `'feed'`.

**T-6.4** Clicking "Play" calls `onAction` with `'play'`.

**T-6.5** Clicking "Rest" calls `onAction` with `'rest'`.

**T-6.6** All three buttons are enabled (not disabled) regardless of any prop values.

---

## Level 2 — Manual Smoke Tests

Run `npm run dev` and verify the following.

**S-7 Buttons Appear**

- Complete the naming flow if needed.
- Three buttons are visible below the vitals panel: Feed 🍙, Play 🎾, Rest 💤.
- No buttons are visible while the naming modal is open (clear localStorage to test this).

**S-8 Feed Action**

- Note current Hunger and Energy values.
- Click Feed.
- Hunger increases by 25 (clamped to 100 max). Energy decreases by 5. Happiness unchanged.
- `zuki_game_state` in localStorage reflects new values immediately.

**S-9 Play Action**

- Note current values.
- Click Play.
- Happiness increases by 20. Energy decreases by 15. Hunger decreases by 5.
- All values clamped to [0, 100].

**S-10 Rest Action**

- Note current values.
- Click Rest.
- Energy increases by 30. Happiness increases by 5. Hunger unchanged.

**S-11 Clamping at Maximum**

- Use DevTools to set hunger to 90 in localStorage, reload.
- Click Feed. Hunger shows 100, not 115.

**S-12 Clamping at Minimum**

- Use DevTools to set energy to 5, reload.
- Click Play. Energy shows 0, not −10.

**S-13 Care Counter**

- Open DevTools console and run:
  ```js
  JSON.parse(localStorage.getItem("zuki_game_state")).totalCareActions;
  ```
- Click Feed, Play, Rest once each.
- Run the command again. Value has increased by 3.

**S-14 Responsive Layout**

- Open DevTools, set viewport to 375px wide.
- All three buttons are fully visible and not overlapping.

---

## Acceptance Criteria

This feature is complete when:

- [ ] All automated tests pass (`npx vitest run`) — no regressions in Phase 1 tests
- [ ] All manual smoke tests S-7 through S-14 pass
- [ ] TypeScript compiles with no errors (`npm run build`)
- [ ] No console errors when clicking buttons rapidly
