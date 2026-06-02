# Contract: Game Logic API (`src/game/*`)

These pure, DOM-free modules are the testable core of BGP-Shooter. Signatures are
conceptual (vanilla JS, ES modules). Each function is deterministic given its inputs
(randomness is injected so tests are reproducible). Every behaviour below maps to a
functional requirement and MUST be covered by a `node:test` unit test written test-first.

## Module: `attributes.js`

```text
ATTRIBUTE_TYPES: Record<string, BgpAttributeType>
  // AS_PATH, MED, LOCAL_PREF, PREFIX_LEN with preference MIN|MAX (FR-003)

isCorrectChoice(attributeType, candidateValue, allValues) -> boolean
  // True iff candidateValue is the strict best (min or max) among allValues
  // for the attribute's preference. (FR-003)

bestValue(attributeType, values) -> number
  // Returns the single strict-best value (throws if a tie for best exists). (FR-013)
```

## Module: `groupGenerator.js`

```text
generateGroup(attributeType, rng) -> TargetGroup
  // Produces exactly 4 targets, exactly one isCorrect, no tie for the best value.
  // (FR-001, FR-003, FR-013). rng is an injected random source for determinism.

nextAttributeType(groupsCleared, rng) -> BgpAttributeType
  // Selects the judged attribute for the next group, varying across the 4 types. (FR-012)
```

**Contract guarantees**:
- `generateGroup(...).targets.length === 4`
- Exactly one target has `isCorrect === true`
- No two targets tie for the best value of the judged attribute

## Module: `session.js`

```text
createSession(rng) -> Session
  // lives = 5, score = 0, status = PLAYING, currentGroup generated. (FR-006)

registerHit(session, target) -> Session
  // Correct target  -> clear group, add score, advance to next group. (FR-005, FR-015)
  // Wrong target    -> lives -= 1. (FR-007)
  // Then if lives === 0 -> status = GAME_OVER. (FR-009)

registerMiss(session) -> Session
  // Shot hit no target -> lives -= 1; if lives === 0 -> GAME_OVER. (FR-008, FR-009)

restart(rng) -> Session
  // Fresh session with 5 lives and a new group. (FR-010)
```

**Contract guarantees**:
- `createSession().lives === 5`
- Each `registerHit` on a wrong target and each `registerMiss` decrements `lives` by
  exactly 1 (SC-004)
- `lives` is clamped to `[0, 5]`
- `status` becomes `GAME_OVER` exactly when `lives` reaches 0

## Module: `scoring.js`

```text
pointsForCorrectHit(session) -> number
  // Score awarded for clearing a group (may scale with groupsCleared). (FR-015)
```

## Determinism & Testability

- No module imports the DOM, `window`, `document`, or Canvas.
- All randomness flows through an injected `rng` parameter so tests pin outcomes.
- Functions return new/updated state rather than relying on hidden globals.
