// Test-only command generator with its own random cursor, separate from state.rng.
import {nextRandom} from '../src/rng.ts';
import type {Command, SimState} from '../src/types.ts';

export function commandSource(seed: number) {
  let cursor = seed >>> 0;
  const below = (n: number) => {
    const draw = nextRandom(cursor);
    cursor = draw.rng;
    return draw.value % n;
  };
  // Mostly real ids so rules are exercised; sometimes an id that does not exist.
  const anId = (list: {id: number}[]) => (list.length && below(8) ? list[below(list.length)].id : 100000 + below(5));
  return (s: SimState): Command[] =>
    s.crew.map((): Command => {
      switch (below(5)) {
        case 0: return {kind: 'move', to: below(2) ? 'mouth' : 'acid'};
        case 1: return {kind: 'pick', itemId: anId(s.items)};
        case 2: return {kind: 'drop'};
        case 3: return {kind: 'seal', breachId: anId(s.breaches)};
        default: return {kind: 'wait'};
      }
    });
}
