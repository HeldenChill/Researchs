// Derived values: computed from state on demand, never stored (L5).
import { EMPTY, CANOPY, SPECIES_IDS } from './config.js';
import { neighbours } from './operators.js';

export function speciesCounts(state) {
  const c = { 1: 0, 2: 0, 3: 0, total: 0 };
  for (const id of state.species) if (id !== EMPTY) { c[id] += 1; c.total += 1; }
  return c;
}

// Exponential of Shannon entropy over species shares; 0 when there are no trees.
export function hillNumber(state) {
  const c = speciesCounts(state);
  if (c.total === 0) return 0;
  let h = 0;
  for (const id of SPECIES_IDS) if (c[id]) { const p = c[id] / c.total; h -= p * Math.log(p); }
  return Math.exp(h);
}

export function shadeAt(state, level, cell) {
  return neighbours(level, cell).filter(j => state.species[j] === CANOPY).length;
}

export function coverage(state, level) {
  let open = 0, trees = 0;
  for (let i = 0; i < state.species.length; i++) if (!level.rock[i]) { open += 1; if (state.species[i] !== EMPTY) trees += 1; }
  return open ? trees / open : 0;
}
