import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ATTRIBUTE_TYPES, bestValue } from '../../src/game/attributes.js';
import { generateGroup, nextAttributeType } from '../../src/game/groupGenerator.js';
import { createRng } from '../../src/game/rng.js';

const ALL = Object.values(ATTRIBUTE_TYPES);

test('generateGroup produces exactly 4 targets', () => {
  const group = generateGroup(ATTRIBUTE_TYPES.AS_PATH, createRng(1));
  assert.equal(group.targets.length, 4);
});

test('generateGroup marks exactly one correct target', () => {
  for (const attr of ALL) {
    const group = generateGroup(attr, createRng(42));
    const correct = group.targets.filter((t) => t.isCorrect);
    assert.equal(correct.length, 1, `${attr.id} must have exactly one correct target`);
    assert.equal(group.correctTargetId, correct[0].id);
  }
});

test('generated groups never tie for the best value (no ambiguity)', () => {
  // Property check across many seeds and every attribute type (FR-013 / SC-002).
  for (let seed = 1; seed <= 500; seed++) {
    for (const attr of ALL) {
      const group = generateGroup(attr, createRng(seed));
      const values = group.targets.map((t) => t.value);
      assert.equal(new Set(values).size, 4, 'values must be distinct');
      // bestValue throws if there is a tie — so this asserts a single strict winner.
      const best = bestValue(attr, values);
      const correct = group.targets.find((t) => t.isCorrect);
      assert.equal(correct.value, best);
    }
  }
});

test('every target carries a non-empty displayValue', () => {
  for (const attr of ALL) {
    const group = generateGroup(attr, createRng(7));
    for (const t of group.targets) {
      assert.equal(typeof t.displayValue, 'string');
      assert.ok(t.displayValue.length > 0);
    }
  }
});

test('nextAttributeType cycles across all four attribute types', () => {
  const rng = createRng(99);
  const seen = new Set();
  for (let i = 0; i < 4; i++) {
    seen.add(nextAttributeType(i, rng).id);
  }
  assert.equal(seen.size, 4, 'first four groups should cover all attribute types');
});
