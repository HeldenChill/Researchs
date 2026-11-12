// Vocabulary and static config. Values are the rung 0 species table (pre-registration.md).
export const EMPTY = 0, PIONEER = 1, SHRUB = 2, CANOPY = 3, SOIL_MAX = 5;
export const SPECIES_IDS = [PIONEER, SHRUB, CANOPY];

export const CONFIG = {
  species: {
    1: { minSoil: 1, soilSelf: 0, soilNear: 1, enrichCap: 3, matureAge: 1, lifespan: 6, shadeLimit: 1, rank: 1 },
    2: { minSoil: 3, soilSelf: 0, soilNear: 1, enrichCap: 5, matureAge: 2, lifespan: 10, shadeLimit: 3, rank: 2 },
    3: { minSoil: 4, soilSelf: -1, soilNear: 0, enrichCap: 5, matureAge: 3, lifespan: 16, shadeLimit: 5, rank: 3 },
  },
};

// overrides: { [speciesId]: { field: value } }
export function withOverrides(config, overrides = {}) {
  const copy = structuredClone(config);
  for (const [id, fields] of Object.entries(overrides)) Object.assign(copy.species[id], fields);
  return copy;
}
