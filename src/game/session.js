// Authoritative game session: lives (start 5), score, current group, game-over state.
// Pure transitions return a new session object (FR-006..FR-010). The injected rng is
// stored on the session so group advancement stays deterministic without extra args.

import { generateGroup, nextAttributeType } from './groupGenerator.js';
import { pointsForCorrectHit } from './scoring.js';

const START_LIVES = 5;

/** Create a fresh session with 5 lives and the first generated group (FR-006). */
export function createSession(rng) {
  const attributeType = nextAttributeType(0, rng);
  return {
    lives: START_LIVES,
    score: 0,
    status: 'PLAYING',
    groupsCleared: 0,
    currentGroup: generateGroup(attributeType, rng),
    rng,
  };
}

function loseLife(session) {
  const lives = Math.max(0, session.lives - 1);
  const status = lives === 0 ? 'GAME_OVER' : session.status;
  return { ...session, lives, status };
}

/**
 * Resolve a shot that struck `target`.
 * - correct target: clear group, add score, advance to the next group (FR-005, FR-015)
 * - wrong target: lose one life (FR-007), ending the game at zero (FR-009)
 */
export function registerHit(session, target) {
  if (session.status !== 'PLAYING') return session;

  if (target.isCorrect) {
    const groupsCleared = session.groupsCleared + 1;
    const score = session.score + pointsForCorrectHit(session);
    const attributeType = nextAttributeType(groupsCleared, session.rng);
    return {
      ...session,
      groupsCleared,
      score,
      currentGroup: generateGroup(attributeType, session.rng),
    };
  }

  return loseLife(session);
}

/** Resolve a shot that hit no target — lose one life (FR-008, FR-009). */
export function registerMiss(session) {
  if (session.status !== 'PLAYING') return session;
  return loseLife(session);
}

/** Start over with a fresh 5-life session (FR-010). */
export function restart(rng) {
  return createSession(rng);
}
