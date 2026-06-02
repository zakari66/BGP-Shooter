// BGP attribute types and their best-path preference rules (FR-003).
// Pure logic — comparisons operate on a single numeric `value` per target.

export const PREFERENCE = { MIN: 'MIN', MAX: 'MAX' };

export const ATTRIBUTE_TYPES = {
  AS_PATH: {
    id: 'AS_PATH',
    label: 'AS Path',
    prompt: 'Destroy the route with the SHORTEST AS path',
    preference: PREFERENCE.MIN,
  },
  MED: {
    id: 'MED',
    label: 'MED',
    prompt: 'Destroy the route with the LOWEST MED',
    preference: PREFERENCE.MIN,
  },
  LOCAL_PREF: {
    id: 'LOCAL_PREF',
    label: 'Local Preference',
    prompt: 'Destroy the route with the HIGHEST Local Preference',
    preference: PREFERENCE.MAX,
  },
  PREFIX_LEN: {
    id: 'PREFIX_LEN',
    label: 'Prefix Length',
    prompt: 'Destroy the LONGEST (most specific) prefix',
    preference: PREFERENCE.MAX,
  },
};

/**
 * The single strict-best value for the attribute. Throws if there is a tie for
 * best, guaranteeing an unambiguous correct target (FR-013).
 */
export function bestValue(attributeType, values) {
  const best =
    attributeType.preference === PREFERENCE.MIN ? Math.min(...values) : Math.max(...values);
  const winners = values.filter((v) => v === best).length;
  if (winners !== 1) {
    throw new Error(`Ambiguous group: tie for best value (${attributeType.id})`);
  }
  return best;
}

/** True iff candidateValue is BGP's preferred value among allValues (FR-003). */
export function isCorrectChoice(attributeType, candidateValue, allValues) {
  return candidateValue === bestValue(attributeType, allValues);
}
