// I6 detector: cascade profile over every legal first action of a level (pre-registration.md).
import { SPECIES_IDS, withOverrides } from './config.js';
import { parseLevel } from './level.js';
import { createState } from './state.js';
import { legalActions } from './actions.js';
import { cascade } from './cascade.js';

export const THRESHOLDS = { skillGap: 3.0, bestShare: 0.25, nearBestShare: 0.15, depth: 6 };
export const HORIZON = 12;

export function cascadeProfile(level, config, thresholds = THRESHOLDS) {
  const state = createState(level);
  const acts = legalActions(state, level, config);
  const results = acts.map(a => cascade(state, level, config, a, HORIZON));
  const open = level.rock.reduce((n, r) => n + (r ? 0 : 1), 0);
  const sizes = results.map(r => r.size);
  const best = sizes.length ? Math.max(...sizes) : 0;
  const mean = sizes.length ? sizes.reduce((a, b) => a + b, 0) / sizes.length : 0;
  const skillGap = mean > 0 ? best / mean : 0;
  const bestShare = open > 0 ? best / open : 0;
  const nearBestShare = best > 0 ? sizes.filter(s => s >= 0.8 * best).length / sizes.length : 0;
  const bestIndex = sizes.indexOf(best);
  const depth = bestIndex >= 0 ? results[bestIndex].depth : 0;
  const checks = {
    D1: skillGap >= thresholds.skillGap,
    D2: bestShare >= thresholds.bestShare,
    D3: best > 0 && nearBestShare <= thresholds.nearBestShare,
    D4: depth >= thresholds.depth,
  };
  const pass = mean > 0 && Object.values(checks).every(Boolean);
  return {
    actions: acts.length, best, mean, skillGap, bestShare, nearBestShare, depth,
    bestAction: bestIndex >= 0 ? acts[bestIndex] : null, checks, pass,
  };
}

// Control N1: 12 by 12, no rock, all soil 1, same inventory as level 01.
export function uniformLevel() {
  const row = '1'.repeat(12);
  return parseLevel(`ticksPerTurn=8\ninventory=3,2,1\n---\n${Array(12).fill(row).join('\n')}`);
}

// Control N2: no plant ever matures, so nothing seeds.
export function noIterationConfig(config) {
  return withOverrides(config, Object.fromEntries(SPECIES_IDS.map(id => [id, { matureAge: 999 }])));
}
