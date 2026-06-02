// Deterministic projectile-vs-targets resolution (FR-016).
// Returns the id of the first (array-order) live target the projectile overlaps, else null.

/**
 * @param {{position:{x:number,y:number}, radius?:number}} projectile
 * @param {Array<{id:string, position:{x:number,y:number}, radius?:number, destroyed?:boolean}>} targets
 * @returns {string|null}
 */
export function hitTarget(projectile, targets) {
  const pr = projectile.radius || 0;
  for (const t of targets) {
    if (t.destroyed) continue;
    const dx = t.position.x - projectile.position.x;
    const dy = t.position.y - projectile.position.y;
    const reach = (t.radius || 0) + pr;
    if (dx * dx + dy * dy <= reach * reach) {
      return t.id;
    }
  }
  return null;
}
