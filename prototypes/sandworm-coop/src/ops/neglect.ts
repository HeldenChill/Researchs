// O16 neglect: only floor food ages. An expired item becomes a breach and is removed.
import type {Config, SimEvent, SimState} from '../types.ts';

export function neglect(s: SimState, c: Config, events: SimEvent[]): void {
  // Id order keeps breach ids the same however the list is ordered.
  for (const i of [...s.items].sort((a, b) => a.id - b.id)) {
    if (i.place.kind !== 'floor') continue;
    i.ageTicks++;
    if (i.ageTicks < c.neglectLimitTicks) continue;
    const id = s.nextId++;
    s.breaches.push({id, spot: i.place.spot, sealTicks: 0});
    s.items.splice(s.items.indexOf(i), 1);
    events.push({tick: s.tick, kind: 'breached', id});
  }
}
