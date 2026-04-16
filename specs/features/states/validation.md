# Validation — Dynamic States

## Overview

Two levels of testing required:

1. **Automated unit tests** — run with `npx vitest run`
2. **Manual smoke tests** — browser-based checks

---

## Level 1 — Automated Unit Tests

Add to `src/hooks/useGameState.test.ts`.

All timing tests use `vi.useFakeTimers()`.

---

### State Machine Tests

**T-7.1** When a stat drops to ≤ 15 on a tick, `sickSince` is set to a non-null timestamp.

**T-7.2** When `sickSince` is set and 60 000ms elapses (4 ticks), `status` transitions to `'sick'`.

**T-7.3** When all stats recover to > 15 before 60s, `sickSince` resets to `null` and `status` remains `'normal'`.

**T-7.4** When `status === 'sick'` and all stats are raised to ≥ 40 via `performAction`, `status` transitions to `'normal'` and `sickSince` resets to `null`.

**T-7.5** Recovery requires **all** stats ≥ 40 — raising only hunger to 40 while happiness is 30 does not trigger recovery.

**T-7.6** When all stats are ≥ 80 and `totalCareActions` ≥ 15, `allStatsHighSince` is set to a non-null timestamp.

**T-7.7** When `allStatsHighSince` is set and 180 000ms elapses, `status` transitions to `'evolved'`.

**T-7.8** If any stat drops below 80 before 180s, `allStatsHighSince` resets to `null`.

**T-7.9** Evolution does not trigger if `totalCareActions` < 15, even with all stats ≥ 80 for 180s.

**T-7.10** Once `status === 'evolved'`, a subsequent tick with a stat ≤ 15 does not set `sickSince` or change `status`.

---

### PetDisplay Component Tests (`src/components/PetDisplay.test.tsx`)

**T-8.1** Renders without errors for each of the three states: `'normal'`, `'sick'`, `'evolved'`.

**T-8.2** When `status === 'sick'`, the text "Sick" is present in the rendered output.

**T-8.3** When `status === 'evolved'`, the text "Evolved" is present in the rendered output.

**T-8.4** When `status === 'normal'`, neither "Sick" nor "Evolved" appears in the rendered output.

---

## Level 2 — Manual Smoke Tests

Run `npm run dev`.

**S-15 Normal State (default)**

- Fresh session (clear localStorage, enter name).
- `PetDisplay` renders in normal state. No "Sick" or "Evolved" label visible.

**S-16 Sick Transition**

- Use DevTools to set `hunger` to 10 in localStorage, reload.
- Wait 60 seconds (4 ticks).
- `PetDisplay` switches to sick appearance. "😷 Sick" label is visible.
- `status` in localStorage is `"sick"`.

**S-17 Recovery from Sick**

- While Zuki is sick, click Feed and Play repeatedly until all stats are ≥ 40.
- `PetDisplay` switches back to normal. "😷 Sick" label disappears.
- `status` in localStorage is `"normal"`.

**S-18 Sick Timer Reset**

- Set a stat to ≤ 15. Wait 30s (2 ticks). Raise the stat above 15 via Feed.
- Wait another 30s. Zuki does not become sick (timer reset when stat recovered).

**S-19 Evolution**

- Use DevTools to set all stats to 85 and `totalCareActions` to 15, reload.
- Wait 3 minutes (12 ticks).
- `PetDisplay` switches to evolved appearance. "✨ Evolved" label is visible.
- `status` in localStorage is `"evolved"`.

**S-20 Evolution Requires Care Actions**

- Set all stats to 85 and `totalCareActions` to 14, reload.
- Wait 3+ minutes. Zuki does not evolve.

**S-21 Evolved Overrides Sick**

- While Zuki is evolved, use DevTools to set `hunger` to 5, reload.
- Wait 60+ seconds. Status remains `"evolved"`. No sick label appears.

**S-22 State Survives Refresh**

- While Zuki is sick, refresh the page.
- She is still sick. `sickSince` in localStorage is preserved.

---

## Acceptance Criteria

This feature is complete when:

- [ ] All automated tests pass (`npx vitest run`) — no regressions in Phase 1 or 2 tests
- [ ] All manual smoke tests S-15 through S-22 pass
- [ ] TypeScript compiles with no errors (`npm run build`)
- [ ] All three states are visually distinguishable at a glance
