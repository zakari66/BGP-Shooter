// Canvas 2D rendering: black background, vibrant neon spacecraft/targets, HUD, and
// wrong/miss feedback (FR-001, FR-002, FR-011, FR-014, US4). Pure drawing — no game logic.

export const PALETTE = {
  background: '#000000',
  ship: '#00ffd5',
  shipThrust: '#ff8a00',
  projectile: '#ffffff',
  targets: ['#ff3df0', '#ffe93d', '#3dff6e', '#3da8ff'],
  correctFlash: '#ff2d2d',
  text: '#ffffff',
  dim: '#8a8a8a',
  lives: '#ff5d5d',
};

export function clear(ctx, width, height) {
  ctx.fillStyle = PALETTE.background;
  ctx.fillRect(0, 0, width, height);
}

export function drawSpacecraft(ctx, ship) {
  const { x, y } = ship.position;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ship.angle);
  ctx.lineWidth = 2;
  ctx.strokeStyle = PALETTE.ship;
  ctx.shadowColor = PALETTE.ship;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(16, 0);
  ctx.lineTo(-12, -10);
  ctx.lineTo(-6, 0);
  ctx.lineTo(-12, 10);
  ctx.closePath();
  ctx.stroke();
  if (ship.thrusting) {
    ctx.strokeStyle = PALETTE.shipThrust;
    ctx.shadowColor = PALETTE.shipThrust;
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(-18, 0);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawProjectiles(ctx, projectiles) {
  ctx.save();
  ctx.fillStyle = PALETTE.projectile;
  ctx.shadowColor = PALETTE.projectile;
  ctx.shadowBlur = 8;
  for (const p of projectiles) {
    if (!p.active) continue;
    ctx.beginPath();
    ctx.arc(p.position.x, p.position.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawTargets(ctx, targets, highlightCorrect) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    if (t.destroyed) continue;
    const color = highlightCorrect && t.isCorrect ? PALETTE.correctFlash : PALETTE.targets[i % 4];
    ctx.lineWidth = highlightCorrect && t.isCorrect ? 4 : 2;
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(t.position.x, t.position.y, t.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = PALETTE.text;
    ctx.font = '16px "Courier New", monospace';
    ctx.fillText(t.displayValue, t.position.x, t.position.y);
  }
  ctx.restore();
}

export function drawHud(ctx, width, session, promptText) {
  ctx.save();
  ctx.shadowBlur = 0;
  ctx.font = '18px "Courier New", monospace';
  ctx.textBaseline = 'top';

  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.lives;
  ctx.fillText(`LIVES ${'◆'.repeat(session.lives)}`, 16, 14);

  ctx.textAlign = 'right';
  ctx.fillStyle = PALETTE.text;
  ctx.fillText(`SCORE ${session.score}`, width - 16, 14);

  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.ship;
  ctx.font = '20px "Courier New", monospace';
  ctx.fillText(promptText, width / 2, 14);
  ctx.restore();
}

export function drawBanner(ctx, width, height, lines) {
  ctx.save();
  ctx.shadowBlur = 0;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let y = height / 2 - (lines.length - 1) * 22;
  for (const line of lines) {
    ctx.fillStyle = line.color || PALETTE.text;
    ctx.font = `${line.size || 24}px "Courier New", monospace`;
    ctx.fillText(line.text, width / 2, y);
    y += (line.size || 24) + 16;
  }
  ctx.restore();
}
