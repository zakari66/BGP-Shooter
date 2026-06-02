# Phase 0 Research: BGP-Shooter

All Technical Context items were resolved from the user's explicit constraints (vanilla
HTML/CSS/JS, single page, no backend). No `NEEDS CLARIFICATION` markers remained; the
research below records the design decisions and rejected alternatives.

## Decision 1: Rendering technology — HTML5 Canvas 2D

- **Decision**: Render gameplay with the HTML5 Canvas 2D context.
- **Rationale**: An asteroid-style game has many moving sprites (spacecraft, projectiles,
  four drifting targets) animated at 60 fps. Canvas gives per-frame imperative drawing
  with low overhead and is ideal for the vector/neon late-80s look on a black background.
  It is built into every target browser with zero dependencies.
- **Alternatives considered**:
  - **DOM + CSS-animated elements**: simpler for static labels but does not scale to
    smooth per-frame motion and collision of many objects; layout thrash hurts the 60 fps
    goal (Constitution IV).
  - **WebGL / a game engine**: more power than needed, adds dependencies and a build step,
    violating the vanilla / no-build constraint.

## Decision 2: Testing approach — Node built-in runner over pure logic modules

- **Decision**: Author BGP correctness, group generation, lives, and scoring as DOM-free
  ES modules in `src/game/`, and unit-test them test-first with `node --test` (`node:test`).
- **Rationale**: Constitution Principle II (NON-NEGOTIABLE) requires Test-First with a
  failing-then-passing progression and full-suite green before merge. Pure modules with no
  DOM/Canvas can run directly under Node's built-in runner — **zero install, no backend,
  no framework** — keeping the project vanilla while making every functional rule
  (FR-001…FR-016) verifiable.
- **Alternatives considered**:
  - **Browser test frameworks (Jest/Vitest/Karma)**: add heavy dependencies and config,
    conflicting with the zero-dependency goal.
  - **Manual-only testing**: violates the non-negotiable testing standard.
  - **In-browser assertion harness**: viable but harder to run in CI; reserved for
    rendering/input smoke checks only.

## Decision 3: State & game loop — in-memory session + requestAnimationFrame

- **Decision**: Hold all state in memory in a `Session` object; drive updates with a single
  `requestAnimationFrame` loop in `main.js`.
- **Rationale**: "No backend saving mechanism" means no persistence is needed or wanted.
  `requestAnimationFrame` is the standard 60 fps loop and pauses when the tab is hidden,
  conserving resources. A single authoritative session object makes state transitions
  (life loss, game-over, restart) explicit and testable.
- **Alternatives considered**:
  - **localStorage persistence**: explicitly out of scope per the constraint; would add
    state to reason about for no required benefit.
  - **setInterval loop**: not frame-synced; causes stutter and wasted work when hidden.

## Decision 4: Unambiguous group generation (no ties)

- **Decision**: `groupGenerator` produces four distinct attribute values such that exactly
  one is strictly best for the judged attribute (strictly shortest / lowest / highest /
  longest); regenerate/adjust if a tie for best would occur.
- **Rationale**: FR-013 / SC-002 require a single unambiguous correct target. Enforcing
  strict uniqueness of the best value at generation time guarantees correctness and makes
  it directly testable.
- **Alternatives considered**:
  - **Allow ties, pick one correct arbitrarily**: confuses the trainee and breaks the
    educational contract; rejected.

## Decision 5: Life-loss semantics — fire-driven only

- **Decision**: A life is lost only as a result of a fired shot that either hits a wrong
  target or hits no target. Idle time costs nothing; no per-group timer in v1.
- **Rationale**: Matches the spec's documented assumption and the literal reading of "shoot
  the wrong target or shoot no target at all." Keeps the rule deterministic and testable.
- **Alternatives considered**:
  - **Timed rounds (lose a life on timeout)**: adds difficulty tuning and was not
    requested; deferred to a future iteration.

## Decision 6: Tooling for code quality — ESLint + Prettier (dev-only)

- **Decision**: Use ESLint (flat config) and Prettier as dev-only tooling for static
  analysis and formatting; they do not ship to the browser.
- **Rationale**: Constitution Principle I requires automated formatting and static analysis
  as a merge precondition. These run in dev/CI only and keep the runtime fully vanilla.
- **Alternatives considered**:
  - **No linter**: violates Principle I.
  - **Build-time bundlers (Webpack/Rollup)**: unnecessary for native ES modules; avoided to
    honour the no-build constraint.

## Resolved Unknowns

| Technical Context item | Resolution |
|------------------------|------------|
| Language/Version | HTML5 + CSS3 + JS ES2020 modules, no transpiler |
| Primary Dependencies | None at runtime; dev-only node:test, ESLint, Prettier |
| Storage | N/A (in-memory session only) |
| Testing | `node --test` over pure `src/game/*` modules |
| Target Platform | Evergreen desktop browsers, static/offline |
| Performance Goals | 60 fps; <1 s group transition |
| Constraints | Offline, no network, no build, bounded object pools |
