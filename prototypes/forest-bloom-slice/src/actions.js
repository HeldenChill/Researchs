import { EMPTY, SPECIES_IDS } from './config.js';
import { cloneState } from './state.js';

function illegalReason(state, level, config, { species, cell }) {
  if (!config.species[species]) return 'unknown species';
  if (cell < 0 || cell >= state.species.length) return 'cell out of range';
  if (!(state.inventory[species] > 0)) return 'no seeds';
  if (level.rock[cell]) return 'rock';
  if (state.species[cell] !== EMPTY) return 'occupied';
  if (state.soil[cell] < config.species[species].minSoil) return 'soil too low';
  return null;
}

// Ordered by species id, then cell index.
export function legalActions(state, level, config) {
  const out = [];
  for (const species of SPECIES_IDS)
    for (let cell = 0; cell < state.species.length; cell++)
      if (!illegalReason(state, level, config, { species, cell })) out.push({ species, cell });
  return out;
}

export function applyAction(state, level, config, action) {
  const reason = illegalReason(state, level, config, action);
  if (reason) throw new Error(`illegal action: ${reason}`);
  const s = cloneState(state);
  s.species[action.cell] = action.species;
  s.age[action.cell] = 0;
  s.inventory[action.species] -= 1;
  return s;
}
