import { parseLevel } from '../src/level.js';
import { CONFIG, withOverrides } from '../src/config.js';

// Rung 0 species table, frozen. Mechanics tests that depend on rung 0 values use this,
// so a ladder rung changes CONFIG without rewriting old expectations.
export const RUNG0 = withOverrides(CONFIG, { 1: { enrichCap: 3 } });

export const L = (grid, inv = '3,2,1') => parseLevel(`ticksPerTurn=8\ninventory=${inv}\n---\n${grid}`);

export function put(state, i, species, age = 0) {
  state.species[i] = species;
  state.age[i] = age;
}
