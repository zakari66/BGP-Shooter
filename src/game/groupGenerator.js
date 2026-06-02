// Builds four-target groups with exactly one unambiguous correct target (FR-001, FR-013),
// and selects the judged attribute for successive groups (FR-012). Pure / DOM-free.

import { ATTRIBUTE_TYPES, bestValue } from './attributes.js';
import { randInt } from './rng.js';

const ORDER = ['AS_PATH', 'MED', 'LOCAL_PREF', 'PREFIX_LEN'];

// Value ranges per attribute, chosen so four distinct values read clearly on screen.
const RANGES = {
  AS_PATH: { min: 1, max: 8 }, // AS-path length (hops)
  MED: { min: 0, max: 500 },
  LOCAL_PREF: { min: 50, max: 400 },
  PREFIX_LEN: { min: 16, max: 30 },
};

/** Rotate through the four attribute types so training covers all of them (FR-012). */
export function nextAttributeType(groupsCleared, _rng) {
  return ATTRIBUTE_TYPES[ORDER[groupsCleared % ORDER.length]];
}

function distinctValues(rng, count, min, max) {
  const set = new Set();
  while (set.size < count) {
    set.add(randInt(rng, min, max));
  }
  return [...set];
}

function formatDisplay(attributeType, value, rng) {
  switch (attributeType.id) {
    case 'AS_PATH': {
      const hops = [];
      for (let i = 0; i < value; i++) hops.push(64500 + randInt(rng, 1, 99));
      return hops.join(' ');
    }
    case 'MED':
      return `MED ${value}`;
    case 'LOCAL_PREF':
      return `LP ${value}`;
    case 'PREFIX_LEN':
      return `10.0.0.0/${value}`;
    default:
      return String(value);
  }
}

/**
 * Generate a TargetGroup of four targets for the judged attribute.
 * Exactly one target is the strict best (no tie).
 */
export function generateGroup(attributeType, rng) {
  const range = RANGES[attributeType.id];
  if (!range) throw new Error(`Unknown attribute ${attributeType.id}`);

  const values = distinctValues(rng, 4, range.min, range.max);
  const best = bestValue(attributeType, values);

  const targets = values.map((value, i) => ({
    id: `t${i}`,
    attributeType: attributeType.id,
    value,
    displayValue: formatDisplay(attributeType, value, rng),
    isCorrect: value === best,
    destroyed: false,
  }));

  const correct = targets.find((t) => t.isCorrect);
  return {
    attributeType,
    targets,
    correctTargetId: correct.id,
    cleared: false,
  };
}
