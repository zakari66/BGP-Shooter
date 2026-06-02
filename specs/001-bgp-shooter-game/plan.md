# Implementation Plan: BGP-Shooter

**Branch**: `001-bgp-shooter-game` | **Date**: 2026-06-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-bgp-shooter-game/spec.md`

## Summary

BGP-Shooter is a late-1980s asteroid-style arcade game that trains network engineers to
apply BGP best-path selection. The player flies a spacecraft and must shoot the single
target in each four-target group that BGP would prefer for a judged attribute (shortest
AS path, lowest MED, highest Local Preference, or longest prefix). The session starts with
five lives; a wrong shot or a shot that hits nothing costs a life, and the game ends at
zero lives.

Technical approach: a fully client-side, single-page web application built with vanilla
HTML, CSS, and JavaScript (ES modules), rendering gameplay on an HTML5 Canvas 2D context
against a black background with vibrant, high-contrast colours. There is no backend and no
persistence beyond the in-memory session. Core game logic (attribute correctness rules,
group generation, lives/score state) is isolated as pure, DOM-free ES modules so it can be
unit-tested test-first, satisfying the constitution's non-negotiable testing standard.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript ES2020+ (native ES modules, no transpiler)

**Primary Dependencies**: None at runtime (zero-dependency, vanilla). Dev-only tooling:
Node.js built-in test runner (`node --test`) for unit tests; ESLint + Prettier for static
analysis and formatting. HTML5 Canvas 2D API for rendering.

**Storage**: N/A — no backend, no persistence. All state is in-memory for the current
session only (per the "no backend saving mechanism" constraint).

**Testing**: Node.js built-in test runner (`node:test`) executing pure game-logic ES
modules with no DOM dependency; manual/scripted in-browser smoke checks for canvas
rendering and input.

**Target Platform**: Modern evergreen desktop browsers (Chrome, Firefox, Edge, Safari)
loading a static single page. Runs offline from the local filesystem or any static host.

**Project Type**: Single-page, frontend-only web application (single project).

**Performance Goals**: Sustained 60 fps animation via `requestAnimationFrame`; a new
target group appears within 1 second of the previous group clearing (SC-006); input-to-fire
response is visually immediate (<1 frame of perceptible delay).

**Constraints**: Offline-capable; no network calls; no build step required to run; bounded
memory via fixed-size object pools for projectiles/targets so resource use does not grow
with session length (Constitution IV).

**Scale/Scope**: Single local player, one page, ~4 game screens/states (title, play,
game-over, optional pause), small codebase (low thousands of LOC).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluated against `.specify/memory/constitution.md` v1.0.0.

| Principle | Gate | Status |
|-----------|------|--------|
| I. Code Quality & Maintainability | ESLint + Prettier configured; logic split into single-responsibility ES modules; no dead/commented code; documented module APIs | PASS (planned) |
| II. Testing Standards (NON-NEGOTIABLE) | Pure logic modules (attributes, group generation, session, scoring) authored test-first with `node:test`; each FR has covering tests; regression test per bug | PASS (planned) |
| III. User Experience Consistency | Consistent keyboard controls and HUD across all states; clear on-screen prompt per group; correct-answer feedback on wrong/missed shot; legible vibrant-on-black visuals | PASS (planned) |
| IV. Performance Requirements | Declared 60 fps + <1 s group transition targets; `requestAnimationFrame` loop; fixed object pools to bound allocations; profile-before-optimize | PASS (planned) |

**Conflict-resolution ordering** (Constitution: Testing → Code Quality → UX → Performance)
is respected: rendering/perf work depends on tested logic modules, not the reverse.

**Result**: PASS. No principle is relaxed; no exceptions required. Complexity Tracking
below is intentionally empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-bgp-shooter-game/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── game-logic-api.md   # Pure logic module contract
│   └── ui-contract.md      # Controls + screen-state contract
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created here)
```

### Source Code (repository root)

```text
index.html                 # Single page; hosts the <canvas> and HUD, loads main.js as a module

styles/
└── styles.css             # Black background, vibrant palette, HUD/layout

src/
├── game/                  # PURE logic — no DOM, no Canvas (unit-tested test-first)
│   ├── attributes.js      # BGP attribute types + "preferred value" rules (shortest/lowest/highest/longest)
│   ├── groupGenerator.js  # Build a 4-target group with exactly one unambiguous correct target
│   ├── session.js         # Lives (start 5), score, game-over state transitions
│   └── scoring.js         # Score rules for correct hits
├── render/
│   └── renderer.js        # Canvas 2D drawing of spacecraft, targets, HUD
├── input/
│   └── controls.js        # Keyboard handling → intent (move/steer/fire)
└── main.js                # Bootstrap + requestAnimationFrame game loop wiring logic↔render↔input

tests/
└── unit/                  # node:test specs for src/game/* pure modules
    ├── attributes.test.js
    ├── groupGenerator.test.js
    ├── session.test.js
    └── scoring.test.js
```

**Structure Decision**: Single frontend-only project (no `backend/`), matching the vanilla
single-page constraint. The critical decision is separating **DOM-free game logic**
(`src/game/`) from **rendering** (`src/render/`) and **input** (`src/input/`). This keeps
all best-path correctness, lives, and scoring rules unit-testable with the zero-dependency
`node:test` runner — directly serving Constitution Principle II — while `index.html` +
`main.js` remain a thin, manually-verified presentation/loop shell.

## Complexity Tracking

> No constitution violations. No entries required.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none)    | —          | —                                   |
