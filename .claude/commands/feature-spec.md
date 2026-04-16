You are writing a feature spec for the Zuki Pet project.

The user invoked this skill with: $ARGUMENTS

Parse $ARGUMENTS to extract:
- **feature-name**: the first word or hyphenated slug (e.g. `sound-effects`, `achievements`)
- **brief description**: the rest of the string

If $ARGUMENTS is empty, ask the user for a feature name and description before continuing.

---

## Your job

You will interview the user, then write three spec files:
- `specs/features/<feature-name>/plan.md`
- `specs/features/<feature-name>/requirements.md`
- `specs/features/<feature-name>/validation.md`

Do NOT write any files until the interview is complete. Do NOT write code.

---

## Step 1 — Confirm and orient

Tell the user:
- The feature name you parsed
- Where the files will be created (`specs/features/<feature-name>/`)
- That you will ask a few questions before writing anything

Then proceed immediately to Step 2 — do not wait for the user to reply.

---

## Step 2 — Interview

Ask ALL of the following questions in a single message. Number them clearly. Tell the user they can skip any question with "skip" and you will make a reasonable decision.

**Scope questions:**
1. What is the player-visible goal of this feature? What changes for the player once it's implemented?
2. What is explicitly OUT of scope — things that seem related but should not be included?
3. Does this feature depend on anything already built (Phase 1–4), or is it standalone?

**Behaviour questions:**
4. Walk me through the main interaction. What triggers this feature, what happens, and what is the result?
5. Are there any timers, counters, or thresholds involved? If yes, what are the values?
6. Does state need to persist across page refreshes? If yes, what gets saved?

**Edge case questions:**
7. What happens if the player does the "wrong" thing (e.g. triggers this feature at a bad moment, rapid-clicks, or has extreme stat values)?
8. What should happen on first load vs. a returning session?

**Validation questions:**
9. How will you know this feature is working correctly? Describe what you'd check manually.
10. Are there any acceptance criteria that are hard to automate (visual, timing-dependent, subjective)?

---

## Step 3 — Clarify if needed

If any answer is ambiguous or contradicts another, ask a targeted follow-up question. Keep it to one question at a time. Do not proceed to writing until you are confident you have enough information.

---

## Step 4 — Write the files

Once the interview is complete, create the folder and write all three files.

### `plan.md` format

Follow this structure exactly — same as the existing specs in this project:

```markdown
# Feature Plan — <Feature Name>

## Overview

<2–3 sentence summary of what this feature does and why it exists.>

## Scope

**In scope:**

- <bullet list of what is included>

**Out of scope for this feature:**

- <bullet list of what is explicitly excluded>

---

## Task Groups

### Group 1 — <descriptive name>

<Describe what needs to be built. Include exact interfaces, function signatures, prop shapes, or data structures where known. Be specific enough that an implementer could start without asking questions.>

---

### Group 2 — <descriptive name>

<Same pattern. Add as many groups as needed — typically 3–6.>
```

Rules for plan.md:
- Each task group should map to a coherent unit of work (a type, a hook change, a new component, an App wiring step)
- Include exact TypeScript types or interfaces for any new state or props
- If a group modifies an existing file, name the file explicitly
- If a group creates a new file, specify the path

---

### `requirements.md` format

```markdown
# Requirements — <Feature Name>

## Functional Requirements

### FR-1 <Short Name>

<Describe the requirement in plain language. Be precise about thresholds, conditions, and outcomes.>

### FR-2 <Short Name>

...

---

## Technical Requirements

### TR-1 <Short Name>

<Implementation constraint — type safety, no external libs, specific evaluation order, accessibility, responsive layout, etc.>

---

## Edge Cases

| Scenario | Expected Behaviour |
| -------- | ------------------ |
| <situation> | <what happens> |
```

Rules for requirements.md:
- FR entries cover what the feature does from the user's perspective
- TR entries cover how it must be implemented (constraints, not behaviour)
- Edge case table must include at least 4 rows covering boundary values, rapid input, and persistence

---

### `validation.md` format

```markdown
# Validation — <Feature Name>

## Overview

<One sentence describing the two levels of testing required.>

---

## Level 1 — Automated Unit Tests

Framework: Vitest + React Testing Library.

---

### Test Suite: `src/<path>/file.test.ts` (additions)

**T-N.1** <Test description — one sentence stating what is asserted.>

**T-N.2** ...

---

### Test Suite: `src/components/<Component>.test.tsx`

**T-M.1** ...

---

## Level 2 — Manual Smoke Tests

**S-N <Short Name>**

- <Step-by-step verification. Start from a known state (clear localStorage, set specific stat values via DevTools, etc.). End with what you expect to see.>

---

## Acceptance Criteria

This feature is complete when:

- [ ] All automated tests pass (`npx vitest run`) — no regressions in prior tests
- [ ] All manual smoke tests S-N through S-M pass
- [ ] TypeScript compiles with no errors (`npm run build`)
- [ ] <Any additional criteria specific to this feature>
```

Rules for validation.md:
- Use the next available T-N numbering continuing from where the project left off (Phase 4 ended at T-11, so start at T-12)
- Use the next available S-N numbering (Phase 4 ended at S-30, so start at S-31)
- Every FR in requirements.md must have at least one corresponding test (T or S)
- Each automated test description must be precise enough to write without reading the source code
- Manual smoke tests must start from a reproducible state (clear localStorage, DevTools console snippet, etc.)

---

## Step 5 — Report back

After writing all three files, tell the user:
- The exact paths of the three files created
- A one-paragraph summary of the spec
- Any assumptions you made where the user said "skip" or was ambiguous
- A reminder that they can now run `/implement <feature-name>` (or equivalent) to implement it
