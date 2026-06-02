import { test } from 'node:test';
import assert from 'node:assert/strict';

// Headless integration smoke test: stub a minimal DOM/canvas, boot the real game loop,
// drive input, and run frames. Validates the main.js wiring (state machine + controls +
// render) without a browser. Full visual play-through is still done via quickstart.md.
test('main.js boots, Enter starts a game, and frames run without throwing', async () => {
  const listeners = {};
  const noopCtx = new Proxy({}, { get: () => () => {} });
  const canvas = { width: 900, height: 600, getContext: () => noopCtx };

  globalThis.document = { getElementById: () => canvas };
  const rafCbs = [];
  globalThis.requestAnimationFrame = (cb) => rafCbs.push(cb);
  globalThis.window = {
    addEventListener: (type, fn) => {
      (listeners[type] ||= []).push(fn);
    },
    removeEventListener: () => {},
  };

  await import('../../src/main.js');

  const runFrame = () => rafCbs[rafCbs.length - 1]();
  const press = (key) => {
    for (const fn of listeners.keydown || []) fn({ key, preventDefault() {} });
  };

  assert.ok(rafCbs.length > 0, 'a render loop was scheduled');
  assert.ok((listeners.keydown || []).length > 0, 'controls attached a keydown listener');

  runFrame(); // TITLE frame
  press('Enter'); // start a game
  runFrame(); // PLAYING frame
  press(' '); // fire
  for (let i = 0; i < 10; i++) runFrame();

  assert.ok(true, 'booted and ran frames without throwing');
});
