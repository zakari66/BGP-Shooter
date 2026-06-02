import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hitTarget } from '../../src/game/collision.js';

const target = (id, x, y, radius = 10) => ({
  id,
  position: { x, y },
  radius,
  destroyed: false,
});

test('returns the id of a target the projectile is inside', () => {
  const targets = [target('a', 100, 100), target('b', 300, 300)];
  const projectile = { position: { x: 102, y: 98 }, radius: 2 };
  assert.equal(hitTarget(projectile, targets), 'a');
});

test('returns null when the projectile hits nothing', () => {
  const targets = [target('a', 100, 100), target('b', 300, 300)];
  const projectile = { position: { x: 0, y: 0 }, radius: 2 };
  assert.equal(hitTarget(projectile, targets), null);
});

test('overlapping targets resolve deterministically to array order (FR-016)', () => {
  const targets = [target('first', 100, 100, 20), target('second', 105, 100, 20)];
  const projectile = { position: { x: 102, y: 100 }, radius: 1 };
  assert.equal(hitTarget(projectile, targets), 'first');
});

test('destroyed targets are skipped', () => {
  const dead = { ...target('a', 100, 100), destroyed: true };
  const targets = [dead, target('b', 110, 100, 20)];
  const projectile = { position: { x: 104, y: 100 }, radius: 1 };
  assert.equal(hitTarget(projectile, targets), 'b');
});
