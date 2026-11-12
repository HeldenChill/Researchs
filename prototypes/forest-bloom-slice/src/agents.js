import { legalActions, applyAction } from './actions.js';
import { cascade } from './cascade.js';
import { createState } from './state.js';
import { tick } from './operators.js';

// Seeded RNG; the only randomness in the slice lives in agents.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomAgent(rng) {
  return (state, level, config) => {
    const acts = legalActions(state, level, config);
    return acts.length ? acts[Math.floor(rng() * acts.length)] : null;
  };
}

// Largest cascade size; first one on ties.
export function greedyAgent(horizon = 12) {
  return (state, level, config) => {
    let best = null, bestSize = -1;
    for (const a of legalActions(state, level, config)) {
      const { size } = cascade(state, level, config, a, horizon);
      if (size > bestSize) { best = a; bestSize = size; }
    }
    return best;
  };
}

export function playthrough(level, config, agent) {
  let state = createState(level);
  const history = [];
  for (let action = agent(state, level, config); action; action = agent(state, level, config)) {
    state = applyAction(state, level, config, action);
    for (let t = 0; t < level.ticksPerTurn; t++) { state = tick(state, level, config); history.push(state); }
  }
  return { final: state, history };
}
