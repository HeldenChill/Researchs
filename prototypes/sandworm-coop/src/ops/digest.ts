// O14 digest: everything in the pit progresses together; payment removes the item.
import type {Config, SimEvent, SimState} from '../types.ts';

export function digest(s: SimState, c: Config, events: SimEvent[]): void {
  s.items = s.items.filter(i => {
    if (i.place.kind !== 'acid') return true;
    i.progressTicks++;
    if (i.progressTicks < c.food.digestTicks) return true;
    s.hunger = Math.min(c.hungerMax, s.hunger + c.food.yieldHunger);
    events.push({tick: s.tick, kind: 'digested', id: i.id});
    return false;
  });
}
