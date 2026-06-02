# Feature Specification: BGP-Shooter

**Feature Branch**: `001-bgp-shooter-game`

**Created**: 2026-06-02

**Status**: Draft

**Input**: User description: "Develop BGP-Shooter, a late 80s style asteroid shooter. It's a network engineering training game, where the goal is to shoot the right BGP path attribute. Example of target groups could be ASpath (4 targets with various ASPath, shoot the smallest ASPath to make it to the next target group) or MED, Local preference, prefix length. I want the game to start with five lives, you lose a life when you shoot the wrong target or shoot no target at all. The graphical style should be a black background and vibrant colors for the targets / spacecraft."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Shoot the winning BGP attribute to advance (Priority: P1)

A network engineer launches the game and is presented with a group of four drifting targets, each labelled with a BGP route attribute value (for example, four different AS-path lengths). A prompt tells the player which attribute is being judged and that they must destroy the route that BGP would actually prefer (the shortest AS path). The player flies the spacecraft, aims, and fires at the correct target. When the correct target is destroyed, the group clears and the next group appears.

**Why this priority**: This is the core game loop and the entire educational value of the product. Without the ability to present a target group and reward the correct best-path choice, there is no game and no training. It is independently playable as a minimum viable product.

**Independent Test**: Launch the game, observe a single target group of four labelled targets with a stated attribute, shoot the route BGP would prefer, and confirm the group clears and a new group is presented. Delivers the full "learn-by-shooting" value on its own.

**Acceptance Scenarios**:

1. **Given** an AS-path target group of four routes with differing AS-path lengths, **When** the player shoots the route with the shortest AS path, **Then** that target is destroyed, the group is cleared, and a new target group is presented.
2. **Given** any active target group with a stated judged attribute, **When** the player shoots the target that represents BGP's preferred value for that attribute, **Then** the shot is counted as correct and the player advances.
3. **Given** an active target group, **When** the player moves and rotates the spacecraft, **Then** the craft responds to controls and projectiles travel in the aimed direction.

---

### User Story 2 - Lives and game over (Priority: P1)

The player starts each session with five lives. Every time the player shoots a wrong target, or fires a shot that strikes no target at all, they lose one life. When all five lives are gone, the game ends and the player is shown a game-over result and can start again.

**Why this priority**: The lives mechanic creates stakes and is the failure condition that makes the training meaningful. It is tightly coupled to the core loop and is required for a complete, demonstrable game.

**Independent Test**: Start a new game showing five lives, deliberately shoot a wrong target and confirm one life is lost, fire a shot into empty space and confirm one life is lost, repeat until lives reach zero, and confirm the game-over state appears with an option to restart.

**Acceptance Scenarios**:

1. **Given** a new game, **When** the session begins, **Then** the player has exactly five lives and the life count is visible.
2. **Given** an active target group, **When** the player shoots a target that is not BGP's preferred route, **Then** the player loses exactly one life and the life count updates.
3. **Given** an active target group, **When** the player fires a shot that hits no target, **Then** the player loses exactly one life.
4. **Given** the player has one life remaining, **When** they lose that life, **Then** the game ends and a game-over result is displayed with an option to restart.
5. **Given** a game-over result, **When** the player chooses to restart, **Then** a fresh session begins with five lives and a new target group.

---

### User Story 3 - Train across multiple BGP attribute types (Priority: P2)

As the player advances, successive target groups test different BGP best-path attributes — AS-path length, MED, Local Preference, and prefix length — so the player practices the full set of common decision criteria rather than one. Each group clearly states which attribute is being judged and presents values appropriate to that attribute.

**Why this priority**: Variety across attribute types delivers the breadth of the training objective. The game is still valuable with a single attribute (P1), but covering MED, Local Preference, and prefix length is what makes it a rounded BGP teaching tool.

**Independent Test**: Play through several consecutive groups and confirm that the judged attribute varies across AS-path, MED, Local Preference, and prefix length, that each group states its attribute, and that the "correct" target in each follows the standard BGP preference rule for that attribute.

**Acceptance Scenarios**:

1. **Given** a Local Preference target group, **When** the player shoots the route with the highest Local Preference, **Then** the shot is correct and the player advances.
2. **Given** a MED target group, **When** the player shoots the route with the lowest MED, **Then** the shot is correct and the player advances.
3. **Given** a prefix-length target group, **When** the player shoots the route with the longest (most specific) prefix, **Then** the shot is correct and the player advances.
4. **Given** a sequence of cleared groups, **When** the player progresses, **Then** the judged attribute varies across the supported attribute types.

---

### User Story 4 - Retro late-80s arcade presentation (Priority: P3)

The player experiences a late-1980s asteroid-shooter aesthetic: a black backdrop of space with vibrantly coloured targets and spacecraft, so attribute values are easy to read at a glance and the game feels like a classic arcade title.

**Why this priority**: The visual style strongly shapes appeal and readability but is not required for the core training loop to function. It elevates an otherwise-playable game.

**Independent Test**: Launch the game and confirm the background is black, the spacecraft and targets are rendered in vibrant, high-contrast colours, and every target's attribute value is legible against the background.

**Acceptance Scenarios**:

1. **Given** the game is running, **When** any screen with gameplay is shown, **Then** the background is black and the spacecraft and targets are displayed in vibrant, high-contrast colours.
2. **Given** an active target group, **When** the player views the targets, **Then** each target's attribute value is clearly legible against the background.

---

### Edge Cases

- **Tie within a group**: What happens when two or more targets share the same "best" value for the judged attribute (e.g., two equal-shortest AS paths)? The system MUST avoid generating ambiguous groups so exactly one target is unambiguously correct.
- **Simultaneous/overlapping targets**: How does the game handle a single shot that overlaps more than one target? Resolution MUST be deterministic so the player is never penalised by ambiguity.
- **Rapid firing**: How are multiple shots fired in quick succession scored against one group — does each errant shot independently cost a life? Life loss MUST be applied consistently per the rules.
- **Last life on a missed shot**: Losing the final life by firing into empty space MUST trigger game-over the same as losing it on a wrong target.
- **Destroying the correct target while wrong targets remain**: Hitting the correct route MUST clear the entire group and advance, regardless of remaining wrong targets.
- **No input**: If the player never fires, the game MUST remain stable and not lose lives merely from the passage of time (a life is lost only by a fired shot that misses or hits the wrong target).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The game MUST present target groups of four targets, each displaying a BGP route with a value for the judged attribute.
- **FR-002**: Each target group MUST clearly indicate which BGP attribute is being judged (AS-path length, MED, Local Preference, or prefix length).
- **FR-003**: Exactly one target in each group MUST be the unambiguously correct choice according to standard BGP best-path preference for the judged attribute:
  - AS-path length → shortest AS path is correct.
  - MED → lowest MED is correct.
  - Local Preference → highest Local Preference is correct.
  - Prefix length → longest (most specific) prefix is correct.
- **FR-004**: Players MUST be able to control a spacecraft (move/steer and aim) and fire projectiles at targets.
- **FR-005**: When the player destroys the correct target, the system MUST clear the current group and present the next target group.
- **FR-006**: The game MUST start each new session with exactly five lives.
- **FR-007**: The system MUST deduct exactly one life when the player shoots an incorrect target.
- **FR-008**: The system MUST deduct exactly one life when the player fires a shot that strikes no target.
- **FR-009**: The system MUST end the game and present a game-over result when lives reach zero.
- **FR-010**: The system MUST allow the player to restart a fresh session (five lives, new group) from the game-over result.
- **FR-011**: The system MUST display the current life count to the player at all times during play.
- **FR-012**: The game MUST cover multiple attribute types across successive groups (AS-path length, MED, Local Preference, and prefix length).
- **FR-013**: The system MUST NOT generate a target group in which the correct choice is ambiguous (no ties for the best value of the judged attribute).
- **FR-014**: The game MUST render with a black background and vibrant, high-contrast colours for the spacecraft and targets, with all attribute values legible.
- **FR-015**: The system MUST track and display the player's score, rewarding correct target destruction. *(Assumption — see Assumptions.)*
- **FR-016**: The system MUST resolve a single shot deterministically when it could affect more than one target, so the player is never penalised by rendering or overlap ambiguity.

### Key Entities *(include if feature involves data)*

- **Spacecraft**: The player-controlled vessel. Has a position, orientation, and the ability to fire projectiles. One per session.
- **Target**: A drifting object representing a single BGP route. Carries the attribute value being judged (e.g., an AS-path, a MED value, a Local Preference, a prefix length) and a flag for whether it is the correct best-path choice for its group.
- **Target Group**: A set of four targets presented together, bound to one judged attribute type, with exactly one correct target. Cleared when the correct target is destroyed.
- **BGP Attribute Type**: The decision criterion for a group — AS-path length, MED, Local Preference, or prefix length — each with its own "preferred value" rule (shortest / lowest / highest / longest).
- **Game Session**: The current play-through. Tracks remaining lives (starting at five), score, the active target group, and game-over state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time player can read a target group, identify the judged attribute, and fire at a chosen target within 15 seconds of the group appearing, without external instructions beyond the on-screen prompt.
- **SC-002**: In 100% of generated target groups, exactly one target is the correct best-path choice (no ambiguous or tie groups occur).
- **SC-003**: Across the four supported attribute types, the target labelled correct always matches the standard BGP preference rule (shortest AS path, lowest MED, highest Local Preference, longest prefix) in 100% of groups.
- **SC-004**: Every life-loss event (wrong target or missed shot) reduces the visible life count by exactly one, and the game ends within one group of the fifth life being lost, in 100% of sessions.
- **SC-005**: After playing 10 groups, a network-engineering trainee improves their best-path selection accuracy compared with their first 3 groups (measured by correct-shot rate), demonstrating a learning effect.
- **SC-006**: Average frame time stays at or below 16.7 ms (60 fps) during normal play, and a new target group appears within 1 second of the previous group being cleared.
- **SC-007**: 90% of new players correctly clear at least one target group within their first three attempts without instruction beyond the on-screen prompt.

## Assumptions

- **Endless, score-based session**: No fixed "win" state was specified; the game is assumed to be an endless arcade run that continues presenting groups until the player loses all five lives, with score as the measure of success.
- **"Shoot no target at all" means a fired shot that hits nothing**: A life is lost only as the result of firing — either striking a wrong target or striking empty space. Merely letting time pass without firing does not cost a life. No per-group timer is assumed for v1.
- **Score is in scope (FR-015)**: A score is assumed as a natural arcade companion to lives; if undesired it can be dropped without affecting the core loop.
- **Single-player, single local session**: One player at a time on one device; no accounts, networking between players, leaderboards, or persistence across sessions are assumed for v1.
- **Standard BGP best-path rules for the supported attributes**: Correctness uses the conventional preference for each attribute in isolation; full multi-step BGP best-path tie-breaking beyond the four named attributes is out of scope for v1.
- **Desktop arcade-style play with keyboard controls**: A standard desktop game with keyboard controls (move/steer + fire) is assumed; specific control bindings are an implementation detail to be set during planning.
- **Difficulty may scale with progression**: Later groups may use closer/larger attribute values to increase challenge, but progression difficulty curve specifics are deferred to planning.
