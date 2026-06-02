import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SCREEN, start, toGameOver, restartScreen } from '../../src/game/gameState.js';

test('start: TITLE -> PLAYING', () => {
  assert.equal(start(SCREEN.TITLE), SCREEN.PLAYING);
});

test('start: no-op when not on TITLE', () => {
  assert.equal(start(SCREEN.PLAYING), SCREEN.PLAYING);
  assert.equal(start(SCREEN.GAME_OVER), SCREEN.GAME_OVER);
});

test('toGameOver: PLAYING + lives==0 -> GAME_OVER', () => {
  assert.equal(toGameOver(SCREEN.PLAYING, 0), SCREEN.GAME_OVER);
});

test('toGameOver: stays PLAYING while lives remain', () => {
  assert.equal(toGameOver(SCREEN.PLAYING, 3), SCREEN.PLAYING);
});

test('restartScreen: GAME_OVER -> PLAYING', () => {
  assert.equal(restartScreen(SCREEN.GAME_OVER), SCREEN.PLAYING);
});

test('restartScreen: no-op when not on GAME_OVER', () => {
  assert.equal(restartScreen(SCREEN.TITLE), SCREEN.TITLE);
});
