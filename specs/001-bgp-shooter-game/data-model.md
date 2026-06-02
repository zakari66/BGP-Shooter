# Phase 1 Data Model: BGP-Shooter

All entities are in-memory JavaScript objects for the current session (no persistence).
Derived from the spec's Key Entities and Functional Requirements.

## Entity: BgpAttributeType

The decision criterion for a group and its "preferred value" rule.

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | One of `AS_PATH`, `MED`, `LOCAL_PREF`, `PREFIX_LEN` |
| `label` | string | Human-readable prompt, e.g. "Shortest AS Path" |
| `preference` | enum | `MIN` (AS path, MED), `MAX` (Local Pref, prefix length) |
| `format(value)` | function | Renders a value for display (e.g. AS path as `65001 65010 65020`) |

**Rules (FR-003)**:
- `AS_PATH` → `preference = MIN` (shortest AS-path length wins)
- `MED` → `preference = MIN` (lowest MED wins)
- `LOCAL_PREF` → `preference = MAX` (highest Local Preference wins)
- `PREFIX_LEN` → `preference = MAX` (longest / most specific prefix wins)

## Entity: Target

A single drifting BGP route in a group.

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | Unique within the group |
| `attributeType` | BgpAttributeType.id | The judged attribute for this group |
| `value` | number | Comparable value (AS-path length, MED, local-pref, prefix length) |
| `displayValue` | string | Pre-formatted label shown on the target |
| `isCorrect` | boolean | True for exactly one target per group |
| `position` | {x, y} | Current canvas position (render-time) |
| `velocity` | {x, y} | Drift vector (render-time) |
| `destroyed` | boolean | Set when hit |

**Validation**:
- For a group, exactly one `Target` has `isCorrect === true` (FR-003, FR-013).
- `value` is unique enough that the best value is strictly singular (no tie) (FR-013).

## Entity: TargetGroup

Four targets bound to one judged attribute.

| Field | Type | Notes |
|-------|------|-------|
| `attributeType` | BgpAttributeType | Judged attribute |
| `targets` | Target[4] | Exactly four targets |
| `correctTargetId` | string | The id of the single correct target |
| `cleared` | boolean | True once the correct target is destroyed |

**State transitions**:
- `active` → `cleared` when the correct target is destroyed (FR-005), then the session
  advances to a freshly generated group.

**Validation**:
- `targets.length === 4` (FR-001).
- Exactly one target's `value` is the strict best for `attributeType.preference` (FR-013).

## Entity: Spacecraft

Player-controlled vessel (render-time entity).

| Field | Type | Notes |
|-------|------|-------|
| `position` | {x, y} | Current location |
| `angle` | number | Facing direction (radians) |
| `velocity` | {x, y} | Movement vector |

## Entity: Projectile

A fired shot.

| Field | Type | Notes |
|-------|------|-------|
| `position` | {x, y} | Current location |
| `velocity` | {x, y} | Travel vector from spacecraft angle |
| `active` | boolean | Pooled; deactivated on hit or off-screen |

Resolution of a projectile against targets MUST be deterministic (FR-016). A projectile is
drawn from a fixed-size pool to bound allocations (Constitution IV).

## Entity: Session

The authoritative current play-through.

| Field | Type | Notes |
|-------|------|-------|
| `lives` | integer | Starts at 5 (FR-006); range 0–5 |
| `score` | integer | Starts at 0; increases on correct hit (FR-015) |
| `currentGroup` | TargetGroup | The active group |
| `status` | enum | `PLAYING` or `GAME_OVER` |
| `groupsCleared` | integer | Count of cleared groups (progression metric) |

**State transitions**:
- New session: `lives = 5`, `score = 0`, `status = PLAYING`, first group generated (FR-006).
- Correct hit: clear group, `score += points`, `groupsCleared += 1`, advance (FR-005, FR-015).
- Wrong-target hit: `lives -= 1` (FR-007).
- Missed shot (hits nothing): `lives -= 1` (FR-008).
- `lives === 0`: `status = GAME_OVER` (FR-009).
- Restart from `GAME_OVER`: reset to a new session (FR-010).

**Validation**:
- `lives` never below 0 and never above 5.
- Each life-loss event decrements `lives` by exactly one (SC-004).
