import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSession, registerHit, registerMiss, restart } from '../../src/game/session.js';
import { createRng } from '../../src/game/rng.js';

const newSession = () => createSession(createRng(123));

test('createSession starts with 5 lives, score 0, PLAYING, and a group', () => {
  const s = newSession();
  assert.equal(s.lives, 5);
  assert.equal(s.score, 0);
  assert.equal(s.status, 'PLAYING');
  assert.equal(s.currentGroup.targets.length, 4);
  assert.equal(s.groupsCleared, 0);
});

test('registerHit on a wrong target loses exactly one life', () => {
  const s = newSession();
  const wrong = s.currentGroup.targets.find((t) => !t.isCorrect);
  const next = registerHit(s, wrong);
  assert.equal(next.lives, 4);
  assert.equal(next.status, 'PLAYING');
});

test('registerMiss loses exactly one life', () => {
  const s = newSession();
  const next = registerMiss(s);
  assert.equal(next.lives, 4);
});

test('registerHit on the correct target advances and adds score, no life lost', () => {
  const s = newSession();
  const correct = s.currentGroup.targets.find((t) => t.isCorrect);
  const next = registerHit(s, correct);
  assert.equal(next.lives, 5);
  assert.equal(next.groupsCleared, 1);
  assert.ok(next.score > 0);
  assert.equal(next.currentGroup.targets.length, 4);
});

test('lives clamp to 0 and the game ends at GAME_OVER', () => {
  let s = newSession();
  for (let i = 0; i < 5; i++) {
    s = registerMiss(s);
  }
  assert.equal(s.lives, 0);
  assert.equal(s.status, 'GAME_OVER');
  // No further life loss past zero.
  s = registerMiss(s);
  assert.equal(s.lives, 0);
});

test('restart yields a fresh 5-life PLAYING session', () => {
  const played = registerMiss(newSession());
  assert.equal(played.lives, 4);
  const fresh = restart(createRng(5));
  assert.equal(fresh.lives, 5);
  assert.equal(fresh.status, 'PLAYING');
  assert.equal(fresh.score, 0);
});
