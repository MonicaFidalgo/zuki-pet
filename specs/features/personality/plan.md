# Feature Plan — Personality & Easter Eggs

## Overview

Add Zuki's voice. Six contextual triggers fire short sassy/cute messages that give her a personality beyond the numbers. Messages are displayed in a `MessageBubble` component and auto-dismiss after 4 seconds.

## Scope

**In scope:**

- Six Easter egg triggers with exact conditions
- `MessageBubble` component
- Message queue logic (new message replaces current)
- Idle guilt detection using `lastInteraction`

**Out of scope:**

- Sound effects
- Animations beyond a simple fade
- More than one message visible at a time

---

## Task Groups

### Group 1 — Message System in useGameState

Add to the hook's exposed interface:

```ts
currentMessage: string | null;
```

Internally, the hook manages:

- `currentMessage: string | null` — the message currently displayed, or null
- A `setTimeout` ref that clears the message after 4 000ms

**Setting a message:**

- Call `setMessage(text: string)`:
  1. Clear any existing dismiss timeout.
  2. Set `currentMessage` to `text`.
  3. Start a new 4 000ms timeout that sets `currentMessage` to `null`.

**Idle guilt detection:**

- A separate `setInterval` runs every 30 seconds.
- On each idle check: if `Date.now() - state.lastInteraction ≥ 300_000ms` (5 minutes) AND no idle message has fired since the last interaction, call `setMessage` with the idle guilt message.
- The idle flag resets when `performAction` is called.

---

### Group 2 — Trigger Conditions

Triggers are checked at the point of the relevant action or tick. Each trigger calls `setMessage` with its message text.

| ID  | Name           | When checked                                          | Condition                                | Message                                |
| --- | -------------- | ----------------------------------------------------- | ---------------------------------------- | -------------------------------------- |
| E-1 | Overfed        | Inside `performAction('feed')`, before applying delta | `hunger > 90`                            | "Tô cheia!! Para com isso."            |
| E-2 | Exhausted play | Inside `performAction('play')`, before applying delta | `energy < 10`                            | "Nem consigo levantar as patas..."     |
| E-3 | Forced rest    | Inside `performAction('rest')`, before applying delta | `energy > 90`                            | "Eu NÃO estou cansada. Mas ok."        |
| E-4 | Spam click     | Tracked separately (see Group 3)                      | 5+ clicks on `PetDisplay` within 2 000ms | "Pára. Só porque és tu."               |
| E-5 | Idle guilt     | Idle interval (every 30s)                             | No `performAction` for ≥ 5 minutes       | "Óbvio que preferes o telemóvel."      |
| E-6 | Peak happiness | After every `performAction`, after clamping           | All three stats === 100 simultaneously   | "Ok. Talvez goste um bocadinho de ti." |

**Condition evaluation timing:**

- E-1, E-2, E-3: checked **before** the delta is applied (based on current values at time of click).
- E-6: checked **after** the delta is applied and clamped.
- E-4: tracked via click counter in `PetDisplay` (see Group 3).
- E-5: tracked via idle interval.

---

### Group 3 — Spam Click Detection in PetDisplay

Add an `onPetClick` prop to `PetDisplay`:

```ts
interface PetDisplayProps {
  status: PetState;
  name: string;
  onPetClick: () => void;
}
```

Inside `PetDisplay`, track clicks internally:

- Maintain a click counter and a timestamp of the first click in the current window.
- On each click: increment counter. If this is the first click, record `Date.now()` as window start.
- After each click: if counter ≥ 5 AND `Date.now() - windowStart ≤ 2 000ms`, call `onPetClick()`.
- Reset the counter and window start after 2 000ms from the first click (use `setTimeout`).

`onPetClick` in `App.tsx` calls `setMessage('Pára. Só porque és tu.')` directly.

---

### Group 4 — MessageBubble Component

Create `src/components/MessageBubble.tsx`.

Props:

```ts
interface MessageBubbleProps {
  message: string | null;
}
```

- Renders nothing when `message` is `null`.
- Renders the message text in a visible container when `message` is non-null.
- No manual dismiss button — messages auto-dismiss via the 4s timeout in the hook.

---

### Group 5 — App Wiring

Update `src/App.tsx`:

- Destructure `currentMessage` and `onPetClick` handler from `useGameState()`.
- Render `<MessageBubble message={currentMessage} />` above `<VitalsPanel />`.
- Pass `onPetClick` to `<PetDisplay />`.
