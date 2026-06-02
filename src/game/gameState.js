// Pure screen-state machine (no DOM). Drives which screen main.js renders.
// Distinct from Session, which owns lives/score; this owns TITLE/PLAYING/GAME_OVER.

export const SCREEN = {
  TITLE: 'TITLE',
  PLAYING: 'PLAYING',
  GAME_OVER: 'GAME_OVER',
};

/** TITLE -> PLAYING on start; otherwise unchanged. */
export function start(screen) {
  return screen === SCREEN.TITLE ? SCREEN.PLAYING : screen;
}

/** PLAYING -> GAME_OVER once lives reach zero; otherwise unchanged. */
export function toGameOver(screen, lives) {
  return screen === SCREEN.PLAYING && lives === 0 ? SCREEN.GAME_OVER : screen;
}

/** GAME_OVER -> PLAYING on restart; otherwise unchanged. */
export function restartScreen(screen) {
  return screen === SCREEN.GAME_OVER ? SCREEN.PLAYING : screen;
}
