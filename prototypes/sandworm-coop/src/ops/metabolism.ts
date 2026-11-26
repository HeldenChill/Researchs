// O19 hunger drain. Rung 1 has no heart, so no regeneration.
import type {Config, SimEvent, SimState} from '../types.ts';

export function metabolism(s: SimState, c: Config, _events: SimEvent[]): void {
  s.hunger = Math.max(0, s.hunger - c.drainPerTick);
}
