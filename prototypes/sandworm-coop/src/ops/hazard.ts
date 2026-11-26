// O17 hazard tick: every open breach costs the same health.
import type {Config, SimEvent, SimState} from '../types.ts';

export function hazardTick(s: SimState, c: Config, _events: SimEvent[]): void {
  s.health = Math.max(0, s.health - c.breachDamagePerTick * s.breaches.length);
}
