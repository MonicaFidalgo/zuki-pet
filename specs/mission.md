# Mission — Zuki: A Virtual Fox Companion

## Vision

Zuki is a single-user virtual pet web app centred on a small, opinionated fox who needs care — and isn't shy about asking for it. The project exists to demonstrate Spec-Driven Development: the quality of the specification is the primary artefact, and the implementation is its direct proof.

## Target Audience

A single end-user (no authentication). The app runs in a browser tab and persists state locally. There is no account, no server, no multiplayer.

## Core Idea

Zuki has three vital stats — Hunger, Happiness, and Energy — that decay over time. The player keeps her healthy through three simple actions: Feed, Play, and Rest. Neglect her long enough and she gets sick. Care for her consistently and she evolves. Throughout, her personality leaks through: she is cute, she is opinionated, and she will absolutely judge you.

## Features in Scope

| Feature        | Description                                           |
| -------------- | ----------------------------------------------------- |
| Pet naming     | Player sets Zuki's display name on first load         |
| Living Vitals  | Hunger, Happiness, Energy (0–100) decay in real time  |
| Care Loop      | Three actions: Feed, Play, Rest                       |
| Dynamic States | Normal → Sick → Recovered; Normal → Evolved           |
| Personality    | Contextual sassy/cute reactions (Easter eggs)         |
| Persistence    | Full game state saved to localStorage on every change |

## Explicitly Out of Scope

- Authentication or multiple users
- Multiple pets or inventories
- Mini-games, social features, push notifications
- Admin features or complex evolution trees
- Permanent death mechanics
- Currency or item systems
- Multiple evolution stages (exactly one evolution exists)

## Success Criteria

1. Vitals decay automatically without user interaction.
2. Each care action produces a measurable, predictable change in stats.
3. Sick state is triggered deterministically and has exactly one recovery path.
4. Evolved state is triggered deterministically and is visually distinct from Normal.
5. At least four Easter egg reactions fire under documented conditions.
6. State survives a full browser refresh.
7. The app is usable on a 375px wide mobile viewport.

## Constraints

- No backend. All logic runs client-side.
- No external APIs.
- State storage: localStorage only.
- A coding agent must be able to implement the full app from this spec and the feature specs alone, without asking clarifying questions about game logic.
