// Game loop + integration shell. Wires the tested pure modules (gameState, session,
// collision, controls) to Canvas rendering. Browser-only; no game rules live here.

import { SCREEN, start, toGameOver, restartScreen } from './game/gameState.js';
import { createSession, registerHit, registerMiss, restart } from './game/session.js';
import { hitTarget } from './game/collision.js';
import { attachControls, INTENT } from './input/controls.js';
import { createRng } from './game/rng.js';
import {
  clear,
  drawSpacecraft,
  drawProjectiles,
  drawTargets,
  drawHud,
  drawBanner,
  PALETTE,
} from './render/renderer.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

// Fixed-size projectile pool bounds memory regardless of session length (Constitution IV).
const POOL_SIZE = 24;
const TARGET_RADIUS = 46;
const TARGET_SLOTS = [
  { x: W * 0.2, y: H * 0.32 },
  { x: W * 0.4, y: H * 0.32 },
  { x: W * 0.6, y: H * 0.32 },
  { x: W * 0.8, y: H * 0.32 },
];

let screen = SCREEN.TITLE;
let rng = createRng(20260602);
let session = createSession(rng);

const ship = { position: { x: W / 2, y: H * 0.8 }, angle: -Math.PI / 2, velocity: { x: 0, y: 0 } };
const held = { left: false, right: false, thrust: false };
const projectiles = Array.from({ length: POOL_SIZE }, () => ({
  position: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
  radius: 3,
  life: 0,
  active: false,
}));

let renderTargets = [];
let feedback = { timer: 0, text: '' };

function buildRenderTargets() {
  renderTargets = session.currentGroup.targets.map((t, i) => ({
    ...t,
    position: { x: TARGET_SLOTS[i].x, y: TARGET_SLOTS[i].y },
    vx: (rng() - 0.5) * 1.4,
    vy: (rng() - 0.5) * 0.8,
    radius: TARGET_RADIUS,
    destroyed: false,
  }));
}

function resetShip() {
  ship.position = { x: W / 2, y: H * 0.8 };
  ship.angle = -Math.PI / 2;
  ship.velocity = { x: 0, y: 0 };
}

function fire() {
  const p = projectiles.find((q) => !q.active);
  if (!p) return;
  const speed = 8;
  p.position = {
    x: ship.position.x + Math.cos(ship.angle) * 18,
    y: ship.position.y + Math.sin(ship.angle) * 18,
  };
  p.velocity = { x: Math.cos(ship.angle) * speed, y: Math.sin(ship.angle) * speed };
  p.life = 120;
  p.active = true;
}

function showFeedback(text) {
  feedback = { timer: 48, text };
}

function startNewGame() {
  rng = createRng(20260602 + (Math.floor(performance.now()) % 1000));
  session = restart(rng);
  buildRenderTargets();
  resetShip();
  screen = SCREEN.PLAYING;
}

function handleIntent(intent, pressed) {
  if (screen === SCREEN.TITLE || screen === SCREEN.GAME_OVER) {
    if (intent === INTENT.START && pressed) startNewGame();
    return;
  }
  // PLAYING
  switch (intent) {
    case INTENT.STEER_LEFT:
      held.left = pressed;
      break;
    case INTENT.STEER_RIGHT:
      held.right = pressed;
      break;
    case INTENT.THRUST:
      held.thrust = pressed;
      break;
    case INTENT.FIRE:
      if (pressed) fire();
      break;
    default:
      break;
  }
}

function wrap(pos) {
  if (pos.x < 0) pos.x += W;
  if (pos.x > W) pos.x -= W;
  if (pos.y < 0) pos.y += H;
  if (pos.y > H) pos.y -= H;
}

function updateShip() {
  const TURN = 0.06;
  const ACCEL = 0.18;
  const FRICTION = 0.99;
  if (held.left) ship.angle -= TURN;
  if (held.right) ship.angle += TURN;
  if (held.thrust) {
    ship.velocity.x += Math.cos(ship.angle) * ACCEL;
    ship.velocity.y += Math.sin(ship.angle) * ACCEL;
  }
  ship.velocity.x *= FRICTION;
  ship.velocity.y *= FRICTION;
  ship.position.x += ship.velocity.x;
  ship.position.y += ship.velocity.y;
  ship.thrusting = held.thrust;
  wrap(ship.position);
}

function updateTargets() {
  for (const t of renderTargets) {
    if (t.destroyed) continue;
    t.position.x += t.vx;
    t.position.y += t.vy;
    if (t.position.x < t.radius || t.position.x > W - t.radius) t.vx *= -1;
    if (t.position.y < 70 + t.radius || t.position.y > H * 0.62 - t.radius) t.vy *= -1;
  }
}

function advanceAfterCorrect() {
  buildRenderTargets();
}

function resolveProjectile(p) {
  const id = hitTarget(p, renderTargets);
  if (id === null) {
    // Off-screen with no hit == a shot that struck nothing -> a miss (FR-008).
    if (p.life <= 0) {
      p.active = false;
      session = registerMiss(session);
      showFeedback('MISS!');
      checkGameOver();
    }
    return;
  }
  p.active = false;
  const target = renderTargets.find((t) => t.id === id);
  if (target.isCorrect) {
    session = registerHit(session, target); // clears group + advances + scores
    advanceAfterCorrect();
  } else {
    target.destroyed = true;
    session = registerHit(session, target); // wrong -> lose a life
    showFeedback('WRONG!');
    checkGameOver();
  }
}

function checkGameOver() {
  screen = toGameOver(screen, session.lives);
}

function updateProjectiles() {
  for (const p of projectiles) {
    if (!p.active) continue;
    p.position.x += p.velocity.x;
    p.position.y += p.velocity.y;
    p.life -= 1;
    if (p.position.x < 0 || p.position.x > W || p.position.y < 0 || p.position.y > H) {
      p.life = 0;
    }
    resolveProjectile(p);
  }
}

function update() {
  if (screen !== SCREEN.PLAYING) return;
  updateShip();
  updateTargets();
  updateProjectiles();
  if (feedback.timer > 0) feedback.timer -= 1;
}

function render() {
  clear(ctx, W, H);
  if (screen === SCREEN.TITLE) {
    drawBanner(ctx, W, H, [
      { text: 'BGP-SHOOTER', size: 44, color: PALETTE.ship },
      { text: 'Shoot the route BGP would prefer.', size: 18 },
      { text: 'Press ENTER to start', size: 20, color: PALETTE.targets[1] },
    ]);
    return;
  }

  const highlight = feedback.timer > 0;
  drawTargets(ctx, renderTargets, highlight);
  drawProjectiles(ctx, projectiles);
  drawSpacecraft(ctx, ship);
  drawHud(ctx, W, session, session.currentGroup.attributeType.prompt);

  if (highlight) {
    drawBanner(ctx, W, H * 0.55, [{ text: feedback.text, size: 26, color: PALETTE.correctFlash }]);
  }

  if (screen === SCREEN.GAME_OVER) {
    drawBanner(ctx, W, H, [
      { text: 'GAME OVER', size: 44, color: PALETTE.correctFlash },
      { text: `Final score ${session.score}`, size: 22 },
      { text: `Groups cleared ${session.groupsCleared}`, size: 18, color: PALETTE.dim },
      { text: 'Press ENTER to play again', size: 20, color: PALETTE.targets[2] },
    ]);
  }
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

attachControls(window, handleIntent, () => screen);
buildRenderTargets();
requestAnimationFrame(loop);

// Mirror restart's screen transition for completeness (used if started via state machine).
export { startNewGame, restartScreen, start };
