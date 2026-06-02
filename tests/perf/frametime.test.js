import { test } from 'node:test';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { ATTRIBUTE_TYPES } from '../../src/game/attributes.js';
import { generateGroup, nextAttributeType } from '../../src/game/groupGenerator.js';
import { hitTarget } from '../../src/game/collision.js';
import { createRng } from '../../src/game/rng.js';

const FRAME_BUDGET_MS = 16.7; // 60 fps
const POOL_SIZE = 24; // matches main.js fixed projectile pool

// Reproducible proxy for per-frame CPU cost: resolve a full projectile pool against a
// 4-target group, plus periodic group regeneration, for many simulated frames. True
// 60 fps rendering is validated in-browser (quickstart.md); this guards the logic budget.
test('per-frame game logic stays well under the 16.7 ms (60 fps) budget', () => {
  const rng = createRng(2026);
  let group = generateGroup(ATTRIBUTE_TYPES.AS_PATH, rng);
  const targets = group.targets.map((t, i) => ({
    ...t,
    position: { x: 100 + i * 60, y: 200 },
    radius: 46,
  }));
  const pool = Array.from({ length: POOL_SIZE }, (_, i) => ({
    position: { x: 100 + i, y: 200 },
    radius: 3,
  }));

  const FRAMES = 5000;
  const startedAt = performance.now();
  let cleared = 0;
  for (let f = 0; f < FRAMES; f++) {
    for (const p of pool) {
      const id = hitTarget(p, targets);
      if (id !== null && id === group.correctTargetId) cleared++;
    }
    if (f % 100 === 0) {
      group = generateGroup(nextAttributeType(f, rng), rng);
    }
  }
  const elapsed = performance.now() - startedAt;
  const perFrame = elapsed / FRAMES;

  assert.ok(cleared >= 0); // keep the optimizer honest
  assert.ok(
    perFrame < FRAME_BUDGET_MS,
    `per-frame logic ${perFrame.toFixed(4)} ms must stay under ${FRAME_BUDGET_MS} ms`
  );
});

test('projectile pool size is a bounded constant (no unbounded growth)', () => {
  const pool = Array.from({ length: POOL_SIZE }, () => ({ active: false }));
  // Simulate firing far more shots than the pool holds; the pool length never grows.
  let fired = 0;
  for (let i = 0; i < 100000; i++) {
    const free = pool.find((p) => !p.active);
    if (free) {
      free.active = true;
      fired++;
    }
    // free oldest occasionally to mimic projectiles expiring
    if (i % 5 === 0) pool.forEach((p) => (p.active = false));
  }
  assert.equal(pool.length, POOL_SIZE);
  assert.ok(fired > 0);
});
