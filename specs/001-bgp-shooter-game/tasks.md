---
description: "Task list for BGP-Shooter implementation"
---

# Tasks: BGP-Shooter

**Input**: Design documents from `/specs/001-bgp-shooter-game/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: INCLUDED and REQUIRED. The project constitution (v1.0.0) makes Test-First a
NON-NEGOTIABLE gate. For each pure logic module, the unit test is written FIRST and MUST
fail before the implementing code is written (Red-Green-Refactor).

**Organization**: Tasks are grouped by the four user stories from spec.md to enable
independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1, US2, US3, US4
- All paths are repository-relative (single frontend-only project per plan.md)

## Path Conventions

- Pure logic (DOM-free, tested): `src/game/`
- Rendering / input / loop: `src/render/`, `src/input/`, `src/main.js`
- Page & styles: `index.html`, `styles/styles.css`
- Unit tests (`node --test`): `tests/unit/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project directory structure (`index.html`, `styles/`, `src/game/`, `src/render/`, `src/input/`, `tests/unit/`) per plan.md
- [X] T002 Initialize `package.json` at repo root with a `"test": "node --test tests/unit"` script and `"type": "module"` (no runtime dependencies)
- [X] T003 [P] Configure ESLint (flat config `eslint.config.js`) and Prettier (`.prettierrc`) for `src/` and `tests/` per Constitution Principle I

**Checkpoint**: Empty project scaffold builds/serves and `node --test` runs with zero tests

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Implement a seedable, injectable RNG utility in `src/game/rng.js` (deterministic for tests) per research.md Decision 2/3
- [X] T005a [P] Unit tests for the screen-state machine transitions (TITLE→PLAYING on start; PLAYING→GAME_OVER when lives==0; GAME_OVER→PLAYING on restart) in `tests/unit/gameState.test.js` — write FIRST, MUST FAIL before T005b (Constitution II)
- [X] T005b Implement a pure `src/game/gameState.js` (TITLE/PLAYING/GAME_OVER transitions, no DOM) per ui-contract.md (depends on T005a)
- [X] T005 Create the page shell and game-loop bootstrap: `index.html` (canvas + HUD containers, loads `src/main.js` as a module) and `src/main.js` with a `requestAnimationFrame` loop that drives the state machine from `src/game/gameState.js` (FR-009, ui-contract.md) (depends on T005b)
- [X] T006 [P] Create renderer scaffold in `src/render/renderer.js` that acquires the Canvas 2D context and clears to a black background each frame (FR-014)
- [X] T007a [P] Unit tests for `keyToIntent` (each bound key → correct steer/thrust/fire/start intent; unbound keys → no intent) in `tests/unit/controls.test.js` — write FIRST, MUST FAIL before T007 (Constitution II — input handling is a named critical path)
- [X] T007 [P] Create input handling in `src/input/controls.js`: a PURE `keyToIntent(key, state) -> intent` function (steer/thrust/fire/start) plus a thin DOM listener that calls it, per ui-contract.md (depends on T007a)

**Checkpoint**: Loop runs, black canvas renders, key presses produce intents — story work can begin

---

## Phase 3: User Story 1 - Shoot the winning BGP attribute to advance (Priority: P1) 🎯 MVP

**Goal**: Present a four-target AS-path group, let the player fly and fire, and clear the
group + advance when the correct (shortest AS path) target is destroyed.

**Independent Test**: Launch, see four labelled AS-path targets with the prompt, shoot the
shortest AS path, and confirm the group clears and a new group appears.

### Tests for User Story 1 (write FIRST, ensure they FAIL) ⚠️

- [X] T008 [P] [US1] Unit tests for `isCorrectChoice`/`bestValue` on the AS_PATH rule (strict shortest wins) in `tests/unit/attributes.test.js`
- [X] T009 [P] [US1] Unit tests for `generateGroup` (exactly 4 targets, exactly one `isCorrect`, no tie for best) in `tests/unit/groupGenerator.test.js`
- [X] T010 [P] [US1] Unit tests for deterministic projectile-vs-targets collision resolution in `tests/unit/collision.test.js` (FR-016)

### Implementation for User Story 1

- [X] T011 [P] [US1] Implement the attribute framework + AS_PATH type (preference MIN, `isCorrectChoice`, `bestValue` throwing on tie) in `src/game/attributes.js` per contracts/game-logic-api.md (FR-003, FR-013)
- [X] T012 [US1] Implement `generateGroup` for AS_PATH (4 distinct values, single strict-best, no tie) in `src/game/groupGenerator.js` (depends on T011)
- [X] T013 [P] [US1] Implement deterministic collision detection (`hitTarget(projectile, targets) -> targetId|null`) in `src/game/collision.js` (FR-016)
- [X] T014 [US1] Implement Spacecraft + pooled Projectile entities with steer/thrust/fire wiring across `src/render/renderer.js`, `src/input/controls.js`, and `src/main.js` (FR-004, data-model.md)
- [X] T015 [US1] Render the active target group (4 targets with `displayValue`) and the judged-attribute prompt on the canvas in `src/render/renderer.js` (FR-001, FR-002)
- [X] T016 [US1] Wire correct-hit handling in `src/main.js`: on destroying the correct target, clear the group and generate the next group (FR-005) (depends on T012, T013, T014, T015)

**Checkpoint**: A playable single-attribute loop — shoot shortest AS path, group clears, next appears

---

## Phase 4: User Story 2 - Lives and game over (Priority: P1)

**Goal**: Start with five lives; lose one on a wrong target or a missed shot; end the game
at zero lives with a restart option.

**Independent Test**: Start a game showing 5 lives, shoot a wrong target (−1), fire into
empty space (−1), repeat to zero, and confirm game-over + restart.

### Tests for User Story 2 (write FIRST, ensure they FAIL) ⚠️

- [X] T017 [P] [US2] Unit tests for `session.js` in `tests/unit/session.test.js`: `createSession` lives=5; `registerHit` wrong→lives−1; `registerMiss`→lives−1; lives clamps to [0,5]; lives==0→GAME_OVER; `restart` resets to 5 (FR-006–FR-010, SC-004)

### Implementation for User Story 2

- [X] T018 [US2] Implement `session.js` (`createSession`, `registerHit`, `registerMiss`, `restart`, status transitions) in `src/game/session.js` per contracts/game-logic-api.md (depends on T012)
- [X] T019 [US2] Integrate the session into `src/main.js`: deduct a life on wrong-target hit and on missed shot, advance on correct hit (FR-007, FR-008) (depends on T016, T018)
- [X] T020 [US2] Implement the lives HUD, the GAME_OVER screen, and restart input in `src/render/renderer.js` + `src/main.js` (FR-009, FR-010, FR-011)

**Checkpoint**: Full core game — lives deplete correctly, game ends and restarts

---

## Phase 5: User Story 3 - Train across multiple BGP attribute types (Priority: P2)

**Goal**: Vary the judged attribute across groups — AS-path, MED, Local Preference, prefix
length — each with the correct best-path rule, and track score.

**Independent Test**: Play several groups and confirm the judged attribute varies, each
states its goal, and the correct target follows the standard rule (lowest MED, highest
Local Pref, longest prefix).

### Tests for User Story 3 (write FIRST, ensure they FAIL) ⚠️

- [X] T021 [P] [US3] Extend `tests/unit/attributes.test.js` with MED (lowest), LOCAL_PREF (highest), and PREFIX_LEN (longest) correctness rules (FR-003)
- [X] T022 [P] [US3] Extend `tests/unit/groupGenerator.test.js`: `generateGroup` produces valid no-tie groups for every attribute type and `nextAttributeType` varies across the four types (FR-012, FR-013)
- [X] T023 [P] [US3] Unit tests for `pointsForCorrectHit` in `tests/unit/scoring.test.js` (FR-015)

### Implementation for User Story 3

- [X] T024 [P] [US3] Add MED, LOCAL_PREF, PREFIX_LEN types with `preference` and `format()` to `src/game/attributes.js` (FR-003)
- [X] T025 [US3] Extend `generateGroup` to all attribute types and add `nextAttributeType(groupsCleared, rng)` selection in `src/game/groupGenerator.js` (FR-012) (depends on T024)
- [X] T026 [P] [US3] Implement `scoring.js` (`pointsForCorrectHit`) in `src/game/scoring.js` (FR-015)
- [X] T027 [US3] Integrate score into the session/HUD and show the per-group judged-attribute prompt for all types in `src/main.js` + `src/render/renderer.js` (FR-002, FR-015) (depends on T025, T026)

**Checkpoint**: Rotating multi-attribute training with score, all rules correct

---

## Phase 6: User Story 4 - Retro late-80s arcade presentation (Priority: P3)

**Goal**: Black backdrop, vibrant high-contrast spacecraft/targets, legible labels, and
clear wrong/miss feedback.

**Independent Test**: Launch and confirm black background, vibrant colours, legible target
values, and a brief correct-target highlight on a wrong/missed shot.

### Implementation for User Story 4

- [X] T028 [P] [US4] Define the black background and vibrant high-contrast palette + legible label typography in `styles/styles.css` and renderer color constants (FR-014)
- [X] T029 [P] [US4] Apply 80s vector/neon styling to the spacecraft, targets, and projectiles in `src/render/renderer.js` (FR-014)
- [X] T030 [US4] Add wrong/missed-shot feedback (brief highlight of the correct target before advancing) in `src/render/renderer.js` + `src/main.js` (Principle III: actionable feedback, no silent failure)

**Checkpoint**: Game looks and feels like a late-80s arcade title with educational feedback

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates and validation spanning all stories

- [X] T031 [P] Run the full unit suite (`node --test tests/unit`) and confirm green (Constitution Principle II — full suite must pass)
- [X] T032 [P] Run ESLint + Prettier across `src/` and `tests/` and resolve all findings (Constitution Principle I)
- [X] T033 Add a reproducible performance check in `tests/perf/frametime.test.js` (or a logged harness): assert average frame time ≤ 16.7 ms (60 fps) under a full 4-target group and that a cleared group is replaced within 1000 ms, measured deterministically with an injected clock; also confirm fixed-size object pools for projectiles/targets in `src/render/renderer.js` and `src/main.js` (Constitution Principle IV, SC-006)
- [X] T034 [P] Validate the no-tie guarantee end-to-end (SC-002) and the four correctness rules (SC-003) via a randomized property test in `tests/unit/groupGenerator.test.js`
- [X] T035 Run quickstart.md play-through smoke test (serve page, complete groups across all attributes, exhaust lives, restart)
- [X] T036 [P] Add/refresh `README.md` with run + test + BGP cheat-sheet instructions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3–6)**: All depend on Foundational
  - US1 (P1) is the MVP and should be completed first
  - US2 (P1) depends on US1 (session advances the group US1 generates)
  - US3 (P2) depends on US1's attribute/group modules; independent of US2
  - US4 (P3) depends only on a renderer producing the game (US1)
- **Polish (Phase 7)**: Depends on all targeted stories being complete

### User Story Dependencies

- **US1 (P1)**: After Foundational — no story dependencies (MVP)
- **US2 (P1)**: After US1 (consumes the group/advance loop)
- **US3 (P2)**: After US1 (extends attributes/group generation) — independent of US2
- **US4 (P3)**: After US1 (styles the rendered game) — independent of US2/US3

### Within Each User Story

- Tests are written and MUST FAIL before implementation (Constitution II)
- Foundational: T005a before T005b before T005; T007a before T007 (Test-First)
- Pure logic modules (`src/game/*`) before render/loop integration
- `attributes.js` before `groupGenerator.js`; both before `session.js` integration

### Parallel Opportunities

- Setup: T003 runs parallel to T001/T002 after structure exists
- Foundational: T004, T005a, T006, T007a are parallel (different files); T005b/T007 follow their tests; T005 wires the shell after T005b
- US1 tests T008/T009/T010 are fully parallel; impl T011 and T013 are parallel
- US3 tests T021/T022/T023 are parallel; T024 and T026 are parallel
- US4 T028/T029 are parallel
- Polish T031/T032/T034/T036 are parallel

---

## Parallel Example: User Story 1

```bash
# Write all US1 tests first (they must fail):
Task: "Unit tests for AS_PATH isCorrectChoice/bestValue in tests/unit/attributes.test.js"
Task: "Unit tests for generateGroup in tests/unit/groupGenerator.test.js"
Task: "Unit tests for collision detection in tests/unit/collision.test.js"

# Then the independent implementation modules:
Task: "Implement attributes.js framework + AS_PATH in src/game/attributes.js"
Task: "Implement collision.js in src/game/collision.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Shoot the shortest AS path, confirm clear + advance
5. Demo the single-attribute loop

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. US1 → playable shoot-to-advance loop (MVP)
3. US2 → lives + game over + restart (complete core game)
4. US3 → all four attributes + score (full training value)
5. US4 → retro presentation + feedback (polish the experience)

### Parallel Team Strategy

After Foundational completes: one developer takes US1→US2 (the core loop chain), while
another prepares US3's attribute extensions and US4's visual styling against US1's
interfaces once US1 lands.

---

## Notes

- [P] = different files, no dependencies on incomplete tasks
- [Story] label maps each task to its user story for traceability
- Verify every unit test FAILS before writing the implementing module (Constitution II)
- Commit after each task or logical group
- Stop at any checkpoint to validate a story independently
