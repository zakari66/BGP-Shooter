// Score awarded for clearing a group; scales with progression (FR-015).

const BASE = 100;
const PER_GROUP_BONUS = 50;

/** @param {{groupsCleared:number}} session */
export function pointsForCorrectHit(session) {
  return BASE + (session.groupsCleared || 0) * PER_GROUP_BONUS;
}
