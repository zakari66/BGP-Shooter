import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ATTRIBUTE_TYPES,
  PREFERENCE,
  bestValue,
  isCorrectChoice,
} from '../../src/game/attributes.js';

const { AS_PATH, MED, LOCAL_PREF, PREFIX_LEN } = ATTRIBUTE_TYPES;

test('AS_PATH prefers the shortest (MIN)', () => {
  assert.equal(AS_PATH.preference, PREFERENCE.MIN);
  assert.equal(bestValue(AS_PATH, [4, 2, 6, 3]), 2);
  assert.ok(isCorrectChoice(AS_PATH, 2, [4, 2, 6, 3]));
  assert.ok(!isCorrectChoice(AS_PATH, 4, [4, 2, 6, 3]));
});

test('MED prefers the lowest (MIN)', () => {
  assert.equal(MED.preference, PREFERENCE.MIN);
  assert.equal(bestValue(MED, [100, 50, 200, 75]), 50);
  assert.ok(isCorrectChoice(MED, 50, [100, 50, 200, 75]));
});

test('LOCAL_PREF prefers the highest (MAX)', () => {
  assert.equal(LOCAL_PREF.preference, PREFERENCE.MAX);
  assert.equal(bestValue(LOCAL_PREF, [100, 300, 150, 200]), 300);
  assert.ok(isCorrectChoice(LOCAL_PREF, 300, [100, 300, 150, 200]));
});

test('PREFIX_LEN prefers the longest / most specific (MAX)', () => {
  assert.equal(PREFIX_LEN.preference, PREFERENCE.MAX);
  assert.equal(bestValue(PREFIX_LEN, [20, 24, 18, 28]), 28);
  assert.ok(isCorrectChoice(PREFIX_LEN, 28, [20, 24, 18, 28]));
});

test('bestValue throws on a tie for best (no ambiguous group)', () => {
  assert.throws(() => bestValue(AS_PATH, [2, 2, 6, 3]), /Ambiguous|tie/i);
  assert.throws(() => bestValue(LOCAL_PREF, [300, 300, 150, 200]), /Ambiguous|tie/i);
});
