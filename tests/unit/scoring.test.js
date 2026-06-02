import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pointsForCorrectHit } from '../../src/game/scoring.js';

test('a correct hit is worth a positive score', () => {
  assert.ok(pointsForCorrectHit({ groupsCleared: 0 }) > 0);
});

test('score scales up as more groups are cleared', () => {
  const early = pointsForCorrectHit({ groupsCleared: 0 });
  const later = pointsForCorrectHit({ groupsCleared: 5 });
  assert.ok(later > early, 'later groups should award more points');
});
