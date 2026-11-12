// Y map: what the player sees. Reads state, never writes it (L13, L17).
import { SPECIES_IDS } from './config.js';
import { hillNumber, shadeAt, speciesCounts } from './derived.js';

export const TREND_LAG = 8, TREND_DEADBAND = 0.05, WARNING_SHARE = 0.75, WARNING_MIN_TREES = 12;

export function observe(state, level, history) {
  const cells = [];
  for (let i = 0; i < state.species.length; i++)
    cells.push({ rock: !!level.rock[i], soil: state.soil[i], species: state.species[i], shaded: shadeAt(state, level, i) > 0 });
  const hill = hillNumber(state);
  const richness = Math.max(0, Math.min(1, hill / 3));
  let trend = 'flat';
  if (history.length > TREND_LAG) {
    const d = hillNumber(history.at(-1)) - hillNumber(history.at(-1 - TREND_LAG));
    trend = d > TREND_DEADBAND ? 'up' : d < -TREND_DEADBAND ? 'down' : 'flat';
  }
  const c = speciesCounts(state);
  let warning = 0;
  if (c.total > WARNING_MIN_TREES) for (const id of SPECIES_IDS) if (c[id] / c.total >= WARNING_SHARE) warning = id;
  return { cells, hill, richness, trend, warning };
}
