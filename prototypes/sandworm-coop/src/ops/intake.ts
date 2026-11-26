// S0 scripted intake: seeded arrivals at the mouth. The only randomness in the space.
import {nextRandom} from '../rng.ts';
import type {Config, SimEvent, SimState} from '../types.ts';

export function intake(s: SimState, c: Config, events: SimEvent[]): void {
  if (s.tick < s.nextArrivalTick) return;
  const id = s.nextId++;
  s.items.push({id, row: c.food.id, place: {kind: 'floor', spot: 'mouth'}, ageTicks: 0, progressTicks: 0});
  const {meanGapTicks, jitterTicks} = c.intake;
  const draw = nextRandom(s.rng);
  s.rng = draw.rng;
  s.nextArrivalTick = s.tick + meanGapTicks - jitterTicks + (draw.value % (2 * jitterTicks + 1));
  events.push({tick: s.tick, kind: 'arrived', id});
}
