// O5 crew motion. Distances are in units; one walk is walkTicks * WALK_SPEED units.
import {WALK_SPEED} from '../config.ts';
import {carryPercent, heldItem} from '../state.ts';
import type {Command, Config, SimEvent, SimState} from '../types.ts';

export function crewMotion(s: SimState, c: Config, _events: SimEvent[], commands: readonly Command[]): void {
  const length = c.walkTicks * WALK_SPEED;
  for (const member of s.crew) {
    const command = commands[member.id];
    if (command?.kind !== 'move') continue;
    const {to} = command;
    let left: number;
    if (member.pos.kind === 'at') {
      if (member.pos.spot === to) continue;
      left = length;
    } else {
      // Turning back keeps the position: the distance left is measured from the other end.
      left = member.pos.to === to ? member.pos.left : length - member.pos.left;
    }
    left -= heldItem(s, member.id) ? carryPercent(c, c.food.mass) : WALK_SPEED;
    member.pos = left <= 0 ? {kind: 'at', spot: to} : {kind: 'walking', to, left};
  }
}
