# Requirements — Care Loop

## Functional Requirements

### FR-1 Action Stat Deltas

Each action applies the following changes to stats simultaneously:

| Action | Hunger | Happiness | Energy |
| ------ | ------ | --------- | ------ |
| Feed   | +25    | 0         | −5     |
| Play   | −5     | +20       | −15    |
| Rest   | 0      | +5        | +30    |

All three stat values are clamped to [0, 100] **after** all deltas are applied. Clamping is applied to all three stats on every action regardless of which stats changed.

### FR-2 Care Action Counter

- `totalCareActions` increments by exactly 1 on every call to `performAction`, regardless of which action is performed.
- The counter is not capped — it accumulates indefinitely.

### FR-3 Last Interaction Timestamp

- `lastInteraction` is updated to `Date.now()` on every `performAction` call.
- This timestamp is used by the personality feature (Phase 4) to detect idle time.

### FR-4 Persistence

- `saveState` is called after every `performAction` call.
- The updated stats, `totalCareActions`, and `lastInteraction` are all persisted in the same write.

### FR-5 Button Availability

- All three buttons are always rendered and always clickable.
- There are no cooldowns, disabled states, or restrictions based on current stat values.
- Rapid repeated clicks are valid — each click calls `performAction` once.

### FR-6 Action Panel Visibility

- `ActionPanel` is not rendered while `isNaming === true`.
- Once the player submits a name, `ActionPanel` is visible for the remainder of the session.

---

## Technical Requirements

### TR-1 CareAction Type

`CareAction` is defined as a union type in `src/types/game.ts`:

```ts
export type CareAction = "feed" | "play" | "rest";
```

It is imported by both `useGameState.ts` and `ActionPanel.tsx`. No string literals outside of this type definition.

### TR-2 No Side Effects in Delta Calculation

The delta calculation must be a pure function — given a `CareAction` and a `GameState`, it returns the new stat values without mutating the original state.

### TR-3 Accessibility

- Each button has an `aria-label` that identifies both the action and the subject (e.g. `"Feed Zuki"`, `"Play with Zuki"`, `"Rest Zuki"`).
- Buttons are standard `<button>` elements, not `<div>` or `<span>`.

### TR-4 Responsive Layout

- `ActionPanel` must be usable at 375px viewport width.
- Buttons must not overflow or overlap at minimum width.

---

## Edge Cases

| Scenario                             | Expected Behaviour                                                                               |
| ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Feed when Hunger is 90               | Hunger becomes 100 (clamped), not 115                                                            |
| Play when Energy is 5                | Energy becomes 0 (clamped), not −10                                                              |
| Rest when Energy is 85               | Energy becomes 100 (clamped), not 115                                                            |
| Rapid clicks on Feed                 | Each click is processed independently; no debounce or cooldown                                   |
| Play when all stats are 0            | Hunger becomes 0 (already 0, delta −5 clamped), Happiness becomes 20, Energy becomes 0 (clamped) |
| Action performed while modal is open | Impossible — ActionPanel is not rendered during naming flow                                      |
