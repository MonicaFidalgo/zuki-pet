# Requirements — Dynamic States

## Functional Requirements

### FR-1 State Exclusivity

At any point in time, `status` is exactly one of: `'normal'`, `'sick'`, `'evolved'`. No intermediate or combined states exist.

### FR-2 Sick Transition (normal → sick)

- The sick check runs on every tick and after every `performAction` call.
- A stat is considered "critically low" when its value is ≤ 15.
- When `status === 'normal'` and any stat is critically low:
  - `sickSince` is set to the current timestamp if it is currently `null`.
  - If `sickSince` is already set and at least 60 seconds have elapsed since `sickSince`, `status` transitions to `'sick'`.
- When `status === 'normal'` and **all** stats are > 15:
  - `sickSince` is reset to `null`. The 60-second window restarts from zero if a stat drops again.

### FR-3 Recovery Transition (sick → normal)

- When `status === 'sick'` and **all** stats are ≥ 40:
  - `status` transitions to `'normal'`.
  - `sickSince` is reset to `null`.
- Recovery requires all three stats to be ≥ 40 simultaneously. Raising only one or two stats is not sufficient.

### FR-4 Evolution Transition (normal → evolved)

- The evolution check only runs when `status === 'normal'`.
- When all three stats are ≥ 80 AND `totalCareActions` ≥ 15:
  - `allStatsHighSince` is set to the current timestamp if it is currently `null`.
  - If `allStatsHighSince` is already set and at least 180 seconds (3 minutes) have elapsed, `status` transitions to `'evolved'`.
- If any stat drops below 80 while `status === 'normal'`:
  - `allStatsHighSince` is reset to `null`. The 3-minute window restarts from zero.
- `totalCareActions` < 15 prevents evolution even if all stats are ≥ 80 for 3+ minutes.

### FR-5 Evolved is Permanent

- Once `status === 'evolved'`, no further state transitions occur.
- Evolved overrides sick: if Zuki is evolved and a stat drops to ≤ 15, she does not become sick.
- `allStatsHighSince` and `sickSince` are not evaluated when `status === 'evolved'`.

### FR-6 Visual Distinction

- Each state is visually distinguishable from the others at a glance.
- `sick` state displays a visible "😷 Sick" label.
- `evolved` state displays a visible "✨ Evolved" label.
- `normal` state requires no label.

### FR-7 Persistence

- `status`, `sickSince`, and `allStatsHighSince` are persisted to localStorage on every state change.
- On refresh, the correct state is restored including in-progress timers (`sickSince`, `allStatsHighSince`).

---

## Technical Requirements

### TR-1 Evaluation Order

State machine checks are evaluated in this exact order on every tick and after every `performAction`:

1. If evolved → skip all checks.
2. Sick transition check.
3. Recovery check.
4. Evolution check.

### TR-2 Timestamp Precision

All timestamps use `Date.now()` (milliseconds). No rounding or truncation.

### TR-3 No setInterval Changes

The tick interval remains at 15 000ms. No additional intervals are added for state management.

---

## Edge Cases

| Scenario                                              | Expected Behaviour                                                                        |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Stat drops to ≤ 15, recovers before 60s, drops again  | `sickSince` resets on recovery, restarts on second drop                                   |
| All stats hit ≥ 80 for 2 min 59s, then one drops      | `allStatsHighSince` resets to null; window restarts if stats recover                      |
| `totalCareActions` is 14, all stats ≥ 80 for 3+ min   | No evolution — counter threshold not met                                                  |
| Zuki is sick and player raises all stats to ≥ 80      | Recovery to normal first (all stats ≥ 40 satisfied); evolution window starts on next tick |
| Zuki is evolved and Hunger drops to 0                 | No sick transition — evolved overrides all checks                                         |
| Page refreshed while `sickSince` is set (40s elapsed) | On next tick, remaining 20s counts toward the 60s window using persisted `sickSince`      |
