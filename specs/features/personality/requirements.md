# Requirements — Personality & Easter Eggs

## Functional Requirements

### FR-1 Message Display

- Only one message is visible at a time.
- When a new trigger fires while a message is already displayed, the new message replaces the current one immediately. The 4-second dismiss timer restarts.
- Messages auto-dismiss after exactly 4 000ms.
- There is no manual dismiss button.

### FR-2 Trigger: Overfed (E-1)

- Fires when `performAction('feed')` is called and `hunger > 90` at the time of the call (before the delta is applied).
- Message: `"Tô cheia!! Para com isso."`

### FR-3 Trigger: Exhausted Play (E-2)

- Fires when `performAction('play')` is called and `energy < 10` at the time of the call.
- Message: `"Nem consigo levantar as patas..."`

### FR-4 Trigger: Forced Rest (E-3)

- Fires when `performAction('rest')` is called and `energy > 90` at the time of the call.
- Message: `"Eu NÃO estou cansada. Mas ok."`

### FR-5 Trigger: Spam Click (E-4)

- Fires when the player clicks on `PetDisplay` 5 or more times within a 2 000ms window.
- The 2-second window starts on the first click and resets after 2 000ms regardless of outcome.
- Message: `"Pára. Só porque és tu."`
- The trigger can fire multiple times if the player spams again after the window resets.

### FR-6 Trigger: Idle Guilt (E-5)

- Fires when no `performAction` has been called for ≥ 300 000ms (5 minutes).
- The idle check runs every 30 seconds via a separate interval.
- The message fires **once** per idle window. It does not repeat until the player takes an action and goes idle again.
- `lastInteraction` is updated on every `performAction` call, which resets the idle window.
- Message: `"Óbvio que preferes o telemóvel."`

### FR-7 Trigger: Peak Happiness (E-6)

- Fires after `performAction` is called and **all three stats are simultaneously equal to 100** after clamping.
- Message: `"Ok. Talvez goste um bocadinho de ti."`
- Can fire multiple times if all stats reach 100 on separate occasions.

### FR-8 Idle Interval Cleanup

- The idle check interval is created on mount and cleared on unmount, the same as the tick interval.

---

## Technical Requirements

### TR-1 Message State

`currentMessage` is `string | null`. It is not part of `GameState` and is not persisted to localStorage — messages are ephemeral UI state only.

### TR-2 Dismiss Timer

The dismiss timer uses `setTimeout`. Its ref is stored in a `useRef` and cleared before setting a new message to prevent stale closures firing after replacement.

### TR-3 Trigger Evaluation Order (inside performAction)

For each action call, triggers are evaluated in this order:

1. Check E-1 / E-2 / E-3 (pre-delta, based on current stat values).
2. Apply deltas and clamp.
3. Check E-6 (post-delta, based on new stat values).

Only one message fires per `performAction` call. If E-1 fires, E-6 is not checked in the same call.

### TR-4 Spam Click Isolation

The spam click counter and window timer live entirely inside `PetDisplay`. The hook only exposes an `onPetClick` callback — it does not track clicks itself.

---

## Edge Cases

| Scenario                                                                         | Expected Behaviour                                                                         |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Feed when hunger is exactly 90                                                   | E-1 does not fire (condition is `> 90`, not `≥ 90`)                                        |
| Feed when hunger is 91                                                           | E-1 fires                                                                                  |
| Play when energy is exactly 10                                                   | E-2 does not fire (condition is `< 10`, not `≤ 10`)                                        |
| Rest when energy is exactly 90                                                   | E-3 does not fire (condition is `> 90`)                                                    |
| 4 clicks in 2s, then 1 more click immediately                                    | E-4 fires on the 5th click if within the 2s window                                         |
| Player takes action, then idles 5 min, then takes action, then idles 5 min again | E-5 fires once in the first idle window, once in the second                                |
| All stats at 99, player clicks Feed                                              | Hunger becomes 100 (clamped), but happiness and energy are not 100 → E-6 does not fire     |
| All stats at 100, player clicks Feed                                             | Hunger stays 100, delta applied but no change → E-1 fires (hunger > 90), E-6 check skipped |
