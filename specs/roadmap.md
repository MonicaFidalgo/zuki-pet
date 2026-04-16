# Roadmap — Zuki

Each phase produces its own feature spec folder (`/feature-name/plan.md`, `requirements.md`, `validation.md`). Phases are sequential — each one builds on the previous.

---

## Phase 0 — Project Bootstrap

**Goal:** Working Vite + React + TypeScript + Tailwind scaffold. App renders "Hello Zuki" in the browser.

**Steps:**

1. Scaffold with `npm create vite@latest`
2. Install and configure Tailwind CSS v3
3. Delete boilerplate, confirm hot reload works
4. Commit as `chore: project scaffold`

No feature spec needed for this phase.

---

## Phase 1 — Living Vitals

**Feature folder:** `/vitals/`

**Goal:** Three stats (Hunger, Happiness, Energy) initialise at 70, decay on every tick (every 15s), are clamped to [0, 100], and are persisted to localStorage.

**Deliverables:**

- `GameState` type defined
- `useGameState` hook (or equivalent) managing state + interval
- `VitalsPanel` component rendering three labelled progress bars
- localStorage read on mount, write on every change

**Done when:** Stats visibly decay in the browser without user interaction and survive a refresh.

---

## Phase 2 — Care Loop

**Feature folder:** `/care-loop/`

**Goal:** Three action buttons — Feed, Play, Rest — each produce a deterministic stat change and increment `totalCareActions`.

| Action | Hunger | Happiness | Energy |
| ------ | ------ | --------- | ------ |
| Feed   | +25    | 0         | −5     |
| Play   | −5     | +20       | −15    |
| Rest   | 0      | +5        | +30    |

All resulting values are clamped to [0, 100]. `lastInteraction` is updated on every action.

**Done when:** Each button fires, stats update correctly, and values persist on refresh.

---

## Phase 3 — Dynamic States

**Feature folder:** `/states/`

**Goal:** The app tracks three mutually exclusive states — `normal`, `sick`, `evolved` — and displays Zuki differently for each.

**State machine:**

```
normal ──[any stat ≤ 15 for ≥ 60s]──► sick
sick   ──[all stats ≥ 40]───────────► normal
normal ──[all stats ≥ 80 for ≥ 180s AND totalCareActions ≥ 15]──► evolved
```

Rules:

- Sick check runs on every tick. `sickSince` is set to the timestamp of the first tick where any stat first drops to ≤ 15. If stats recover before 60s elapses, `sickSince` resets to null.
- Evolved state is permanent once reached. It cannot revert to normal or sick.
- If the pet is evolved and a stat drops to ≤ 15, no sick transition occurs. Evolved overrides sick.
- `allStatsHighSince` is set when all three stats reach ≥ 80 simultaneously for the first time and reset to null if any stat drops below 80 before the 180s window completes.

**Visual requirements (minimum):**

- `normal`: default Zuki appearance
- `sick`: desaturated / droopy visual indicator + "sick" label
- `evolved`: distinct evolved appearance + "evolved" label (design choice left to implementer)

**Done when:** All three states are reachable via normal gameplay and are visually distinct.

---

## Phase 4 — Personality & Easter Eggs

**Feature folder:** `/personality/`

**Goal:** Zuki reacts to specific conditions with short contextual messages. These are the "Easter eggs" that give her a sassy, opinionated personality.

| Trigger        | Condition                          | Message (example — implementer may adjust wording) |
| -------------- | ---------------------------------- | -------------------------------------------------- |
| Overfed        | Feed action when Hunger > 90       | "Tô cheia!! Para com isso."                        |
| Exhausted play | Play action when Energy < 10       | "Nem consigo levantar as patas..."                 |
| Forced rest    | Rest action when Energy > 90       | "Eu NÃO estou cansada. Mas ok."                    |
| Spam click     | 5+ clicks on Zuki within 2 seconds | "Pára. Só porque és tu."                           |
| Idle guilt     | No player action for ≥ 5 minutes   | "Óbvio que preferes o telemóvel."                  |
| Peak happiness | All stats simultaneously at 100    | "Ok. Talvez goste um bocadinho de ti."             |

Rules:

- Only one message is shown at a time. If a new trigger fires while a message is displayed, the new message replaces the old one.
- Messages auto-dismiss after 4 seconds.
- The idle guilt message fires once per idle window. It does not repeat until the player takes an action and then goes idle again.
- Spam click detection resets after the 2-second window closes.

**Done when:** All six triggers fire under their documented conditions and display the correct message.

---

## Replanning Checkpoint

After Phase 4, review the Constitution for consistency with the implementation. Update `tech-stack.md` or `mission.md` if any design decisions changed during development. Commit updated docs before submission.
