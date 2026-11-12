import { parseLevel } from '../src/level.js';

export const L = (grid, inv = '3,2,1') => parseLevel(`ticksPerTurn=8\ninventory=${inv}\n---\n${grid}`);

export function put(state, i, species, age = 0) {
  state.species[i] = species;
  state.age[i] = age;
}
