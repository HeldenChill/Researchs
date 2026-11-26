// O6 pick up and drop, resolved in crew id order.
import {acidUsed, heldItem} from '../state.ts';
import type {Command, Config, SimEvent, SimState} from '../types.ts';

export function handle(s: SimState, c: Config, events: SimEvent[], commands: readonly Command[]): void {
  for (const member of s.crew) {
    const command = commands[member.id];
    if (command?.kind !== 'pick' && command?.kind !== 'drop') continue;
    const crew = member.id;
    const spot = member.pos.kind === 'at' ? member.pos.spot : undefined;
    const holding = heldItem(s, crew);

    if (command.kind === 'pick') {
      const target = s.items.find(i => i.id === command.itemId);
      if (spot && !holding && target?.place.kind === 'floor' && target.place.spot === spot) {
        target.place = {kind: 'held', crew};
        events.push({tick: s.tick, kind: 'picked', id: target.id, crew});
      } else {
        events.push({tick: s.tick, kind: 'rejected', id: command.itemId, crew});
      }
    } else if (!spot || !holding) {
      events.push({tick: s.tick, kind: 'rejected', crew});
    } else if (spot === 'acid' && acidUsed(s, c) + c.food.size <= c.acidCapacity) {
      holding.place = {kind: 'acid'};
      holding.progressTicks = 0;
      events.push({tick: s.tick, kind: 'dropped', id: holding.id, crew});
    } else {
      holding.place = {kind: 'floor', spot};
      events.push({tick: s.tick, kind: spot === 'acid' ? 'acidFull' : 'dropped', id: holding.id, crew});
    }
  }
}
