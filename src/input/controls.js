// Input handling. The PURE keyToIntent() function is unit-tested (a named critical path);
// attachControls() is a thin DOM listener that simply forwards to it (ui-contract.md).

import { SCREEN } from '../game/gameState.js';

export const INTENT = {
  STEER_LEFT: 'STEER_LEFT',
  STEER_RIGHT: 'STEER_RIGHT',
  THRUST: 'THRUST',
  FIRE: 'FIRE',
  START: 'START',
  NONE: 'NONE',
};

const KEY_MAP = {
  ArrowLeft: INTENT.STEER_LEFT,
  a: INTENT.STEER_LEFT,
  A: INTENT.STEER_LEFT,
  ArrowRight: INTENT.STEER_RIGHT,
  d: INTENT.STEER_RIGHT,
  D: INTENT.STEER_RIGHT,
  ArrowUp: INTENT.THRUST,
  w: INTENT.THRUST,
  W: INTENT.THRUST,
  ' ': INTENT.FIRE,
  Spacebar: INTENT.FIRE,
  Enter: INTENT.START,
};

/**
 * Map a key to a game intent given the current screen.
 * On menus (TITLE / GAME_OVER), both Space and Enter mean START.
 * @param {string} key  KeyboardEvent.key value
 * @param {string} screen  current SCREEN.*
 * @returns {string} INTENT.*
 */
export function keyToIntent(key, screen) {
  const intent = KEY_MAP[key];
  if (!intent) return INTENT.NONE;

  if (screen === SCREEN.TITLE || screen === SCREEN.GAME_OVER) {
    if (intent === INTENT.FIRE || intent === INTENT.START) return INTENT.START;
  }
  return intent;
}

/**
 * Attach keydown/keyup listeners that translate keys to intents and forward them.
 * Browser-only; not exercised by unit tests.
 * @param {Window} win
 * @param {(intent:string, pressed:boolean)=>void} onIntent
 * @param {() => string} getScreen
 * @returns {() => void} detach function
 */
export function attachControls(win, onIntent, getScreen) {
  const handler = (pressed) => (e) => {
    const intent = keyToIntent(e.key, getScreen());
    if (intent === INTENT.NONE) return;
    e.preventDefault();
    onIntent(intent, pressed);
  };
  const down = handler(true);
  const up = handler(false);
  win.addEventListener('keydown', down);
  win.addEventListener('keyup', up);
  return () => {
    win.removeEventListener('keydown', down);
    win.removeEventListener('keyup', up);
  };
}
