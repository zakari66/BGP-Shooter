// Seedable, injectable RNG so all randomness is deterministic in tests (research.md D2/D3).
// mulberry32 — small, fast, good enough for gameplay value generation.

/**
 * Create a deterministic pseudo-random generator.
 * @param {number} seed
 * @returns {() => number} function returning a float in [0, 1)
 */
export function createRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Inclusive integer in [min, max] drawn from the injected rng.
 * @param {() => number} rng
 * @param {number} min
 * @param {number} max
 */
export function randInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}
