import { test } from 'node:test';
import assert from 'node:assert/strict';
import { keyToIntent, INTENT } from '../../src/input/controls.js';
import { SCREEN } from '../../src/game/gameState.js';

test('bound movement keys map to intents during play', () => {
  assert.equal(keyToIntent('ArrowLeft', SCREEN.PLAYING), INTENT.STEER_LEFT);
  assert.equal(keyToIntent('a', SCREEN.PLAYING), INTENT.STEER_LEFT);
  assert.equal(keyToIntent('ArrowRight', SCREEN.PLAYING), INTENT.STEER_RIGHT);
  assert.equal(keyToIntent('d', SCREEN.PLAYING), INTENT.STEER_RIGHT);
  assert.equal(keyToIntent('ArrowUp', SCREEN.PLAYING), INTENT.THRUST);
  assert.equal(keyToIntent('w', SCREEN.PLAYING), INTENT.THRUST);
});

test('spacebar fires during play', () => {
  assert.equal(keyToIntent(' ', SCREEN.PLAYING), INTENT.FIRE);
});

test('enter starts during play does nothing special but maps to START', () => {
  assert.equal(keyToIntent('Enter', SCREEN.PLAYING), INTENT.START);
});

test('on menus, space and enter both START', () => {
  assert.equal(keyToIntent(' ', SCREEN.TITLE), INTENT.START);
  assert.equal(keyToIntent('Enter', SCREEN.TITLE), INTENT.START);
  assert.equal(keyToIntent(' ', SCREEN.GAME_OVER), INTENT.START);
});

test('unbound keys produce NONE', () => {
  assert.equal(keyToIntent('z', SCREEN.PLAYING), INTENT.NONE);
  assert.equal(keyToIntent('Shift', SCREEN.PLAYING), INTENT.NONE);
});
