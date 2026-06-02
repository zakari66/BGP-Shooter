# Contract: UI & Interaction

Defines the user-facing contract for the single page: controls, screen states, and visual
rules. Verified via in-browser smoke checks and against the spec's UX requirements
(Constitution Principle III).

## Screen States

| State | Shows | Transitions |
|-------|-------|-------------|
| `TITLE` | Title, brief instructions, start prompt | Start → `PLAYING` |
| `PLAYING` | Canvas with spacecraft, current target group, HUD (lives + score + judged-attribute prompt) | Lives reach 0 → `GAME_OVER` |
| `GAME_OVER` | Final score, groups cleared, restart prompt | Restart → `PLAYING` (fresh session, 5 lives) (FR-010) |

A `PAUSE` overlay is optional and out of scope for v1.

## Controls (keyboard)

| Action | Default key(s) | Notes |
|--------|----------------|-------|
| Steer / rotate left–right | Arrow Left / Right (or A / D) | Rotates spacecraft |
| Thrust / move | Arrow Up (or W) | Applies thrust |
| Fire | Spacebar | Fires one projectile per press |
| Start / Restart | Enter (or Spacebar on menus) | From TITLE / GAME_OVER |

Controls MUST behave identically across all states where they apply (Principle III).

## HUD Requirements

- **Lives** are visible at all times during `PLAYING` (FR-011) and show exactly the current
  count (start 5).
- **Judged attribute prompt** clearly states which attribute is being tested and the goal
  (e.g., "Destroy the shortest AS path") (FR-002).
- **Score** is visible during play (FR-015).

## Feedback Requirements

- On a **correct** hit: the group clears and the next group appears within 1 second
  (FR-005, SC-006).
- On a **wrong** target or a **missed** shot: a life is visibly removed and brief feedback
  is shown indicating the shot was wrong/missed; for an educational cue, the correct target
  MAY be briefly highlighted before advancing (Principle III: actionable feedback, no silent
  failure).
- No user action results in a silent failure.

## Visual Rules (FR-014)

- Background is **black** on all gameplay screens.
- Spacecraft and targets use **vibrant, high-contrast colours**.
- Every target's attribute `displayValue` is **legible** against the black background.
- Animation runs smoothly at the 60 fps target with no perceptible stutter (SC-006).
