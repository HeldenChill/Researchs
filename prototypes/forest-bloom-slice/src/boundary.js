// Viability conditions V1 and V2 (pre-registration.md, L16).
import { SPECIES_IDS } from './config.js';
import { speciesCounts } from './derived.js';

export const VIABILITY = { monocultureShare: 0.9, monocultureMinTrees: 12, minSpecies: 2 };

export function viability(state) {
  const c = speciesCounts(state);
  const top = Math.max(...SPECIES_IDS.map(id => c[id]));
  const monoculture = c.total > VIABILITY.monocultureMinTrees && top / c.total >= VIABILITY.monocultureShare;
  const diverse = SPECIES_IDS.filter(id => c[id] > 0).length >= VIABILITY.minSpecies;
  return { monoculture, diverse, ok: !monoculture && diverse };
}
