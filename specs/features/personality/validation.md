# Validation — Personality & Easter Eggs

## Overview

Two levels of testing required:

1. **Automated unit tests** — run with `npx vitest run`
2. **Manual smoke tests** — browser-based checks

---

## Level 1 — Automated Unit Tests

---

### Test Suite: `src/hooks/useGameState.test.ts` (additions)

**T-9.1** `currentMessage` is `null` on initial render.

**T-9.2** Calling `performAction('feed')` when `hunger > 90` sets `currentMessage` to `"I'm full!! Stop it."`.

**T-9.3** Calling `performAction('feed')` when `hunger === 90` does NOT set E-1 message (`hunger` must be strictly `> 90`).

**T-9.4** Calling `performAction('play')` when `energy < 10` sets `currentMessage` to `"Can't even lift a paw..."`.

**T-9.5** Calling `performAction('rest')` when `energy > 90` sets `currentMessage` to `"I'm NOT tired. But fine."`.

**T-9.6** After a message is set, advancing fake timers by 4 000ms sets `currentMessage` back to `null`.

**T-9.7** Setting a second message while one is active replaces it and resets the 4s timer.

**T-9.8** After `performAction` sets all stats to 100 (use initial state with all stats at 75 and call Rest), `currentMessage` is `"Ok. Maybe I like you a little."`.

**T-9.9** Idle guilt message fires after 300 000ms of no `performAction` (advance fake timers).

**T-9.10** After idle guilt fires and player calls `performAction`, idle flag resets — idle guilt does not fire again until another 5-minute idle window.

---

### Test Suite: `src/components/MessageBubble.test.tsx`

**T-10.1** Renders nothing when `message` is `null`.

**T-10.2** Renders the message text when `message` is a non-null string.

**T-10.3** Updating `message` from a string to `null` removes the rendered text.

---

### Test Suite: `src/components/PetDisplay.test.tsx` (additions)

**T-11.1** Clicking `PetDisplay` fewer than 5 times within 2s does NOT call `onPetClick`.

**T-11.2** Clicking `PetDisplay` exactly 5 times within 2s calls `onPetClick` once.

**T-11.3** After the 2s window resets, 5 more clicks within a new 2s window calls `onPetClick` again.

---

## Level 2 — Manual Smoke Tests

Run `npm run dev`.

**S-23 Overfed (E-1)**

- Use DevTools to set `hunger` to 95, reload.
- Click Feed.
- Message `"I'm full!! Stop it."` appears.
- Message disappears after ~4 seconds.

**S-24 Exhausted Play (E-2)**

- Set `energy` to 5, reload.
- Click Play.
- Message `"Can't even lift a paw..."` appears.

**S-25 Forced Rest (E-3)**

- Set `energy` to 95, reload.
- Click Rest.
- Message `"I'm NOT tired. But fine."` appears.

**S-26 Spam Click (E-4)**

- Click on Zuki (PetDisplay) 5 times within 2 seconds.
- Message `"Stop it. Only because it's you."` appears.

**S-27 Idle Guilt (E-5)**

- Leave the app open without clicking any action button for 5 minutes.
- Message `"Obviously you prefer your phone."` appears.
- Click an action. Wait 5 more minutes. Message fires again.

**S-28 Peak Happiness (E-6)**

- Use DevTools to set all stats to 95, reload.
- Click Rest.
- All stats hit 100 (hunger stays 95, happiness 100, energy 100 — not E-6 yet).
- Set all stats to 95 again. Click Feed (hunger 100), then Play (happiness 100, energy clamped), then Rest (energy 100).
- When all three simultaneously hit 100: `"Ok. Maybe I like you a little."` appears.

**S-29 Message Replacement**

- Set `hunger` to 95 and `energy` to 95, reload.
- Click Feed quickly, then Rest quickly.
- Second message replaces first. Only one message visible at a time.

**S-30 Boundary: E-1 does not fire at hunger = 90**

- Set `hunger` to exactly 90, reload.
- Click Feed. No E-1 message. Hunger becomes 100.

---

## Acceptance Criteria

This feature is complete when:

- [ ] All automated tests pass (`npx vitest run`) — no regressions in Phase 1, 2, or 3 tests
- [ ] All manual smoke tests S-23 through S-30 pass
- [ ] TypeScript compiles with no errors (`npm run build`)
- [ ] `currentMessage` is never persisted to localStorage
- [ ] All six Easter egg triggers fire under their documented conditions
