// O18 seal: bare hands, progress saved on the breach.
import {heldItem} from '../state.ts';
import type {Command, Config, SimEvent, SimState} from '../types.ts';

export function seal(s: SimState, c: Config, events: SimEvent[], commands: readonly Command[]): void {
  for (const member of s.crew) {
    const command = commands[member.id];
    if (command?.kind !== 'seal') continue;
    const crew = member.id;
    const target = s.breaches.find(b => b.id === command.breachId);
    if (!target || member.pos.kind !== 'at' || member.pos.spot !== target.spot || heldItem(s, crew)) {
      events.push({tick: s.tick, kind: 'rejected', id: command.breachId, crew});
      continue;
    }
    target.sealTicks++;
    if (target.sealTicks >= c.sealWorkTicks) {
      s.breaches.splice(s.breaches.indexOf(target), 1);
      events.push({tick: s.tick, kind: 'sealed', id: target.id, crew});
    }
  }
}
