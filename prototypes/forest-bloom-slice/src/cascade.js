// Counterfactual cascade: run the world with and without one action, count cells
// whose species differs. size = peak count; depth = ticks in which the peak rose.
import { applyAction } from './actions.js';
import { tick } from './operators.js';

function diff(a, b) {
  let n = 0;
  for (let i = 0; i < a.species.length; i++) if (a.species[i] !== b.species[i]) n += 1;
  return n;
}

export function cascade(state, level, config, action, horizon = 12) {
  let withA = applyAction(state, level, config, action), without = state;
  let peak = diff(withA, without), depth = 0;
  for (let t = 0; t < horizon; t++) {
    withA = tick(withA, level, config);
    without = tick(without, level, config);
    const n = diff(withA, without);
    if (n > peak) { peak = n; depth += 1; }
  }
  return { size: peak, depth };
}
