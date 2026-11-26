// Boundary: derived from state, never stored. Health is checked before hunger, both before time.
import type {Config, Outcome, SimState} from './types.ts';

export function outcome(s: SimState, c: Config): Outcome {
  if (s.health <= 0) return 'lost_health';
  if (s.hunger <= 0) return 'lost_hunger';
  if (s.tick >= c.timeLimitTicks) return 'survived';
  return 'running';
}
