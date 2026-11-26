// Bot crews. They live outside the space: they only read state and return commands.
// They see the whole state, which is better information than a player has.
import {acidUsed, heldItem} from './state.ts';
import type {Command, Config, SimState, Spot} from './types.ts';

export type Status = 'work' | 'idle' | 'blocked';
export type Decision = {commands: Command[]; status: Status[]};
export type Policy = (s: SimState, c: Config) => Decision;

type Job = {spot: Spot; command: Command};

function policy(order: ('breach' | 'food')[]): Policy {
  return (s, c) => {
    const commands: Command[] = [];
    const status: Status[] = [];
    const claimed = new Set<number>(); // item and breach ids share one counter
    let room = c.acidCapacity - acidUsed(s, c);

    // Lowest id first for breaches; oldest first, then lowest id, for food.
    const breaches = [...s.breaches].sort((a, b) => a.id - b.id);
    const food = s.items.filter(i => i.place.kind === 'floor').sort((a, b) => b.ageTicks - a.ageTicks || a.id - b.id);

    const find = {
      breach: (): Job | undefined => {
        const b = breaches.find(x => !claimed.has(x.id));
        if (!b) return undefined;
        claimed.add(b.id);
        return {spot: b.spot, command: {kind: 'seal', breachId: b.id}};
      },
      food: (): Job | undefined => {
        const i = food.find(x => !claimed.has(x.id));
        if (!i || i.place.kind !== 'floor') return undefined;
        claimed.add(i.id);
        return {spot: i.place.spot, command: {kind: 'pick', itemId: i.id}};
      },
    };

    for (const member of s.crew) {
      const here = member.pos.kind === 'at' ? member.pos.spot : undefined;
      const act = (command: Command, state: Status) => {
        commands[member.id] = command;
        status[member.id] = state;
      };

      if (heldItem(s, member.id)) {
        if (here !== 'acid') act({kind: 'move', to: 'acid'}, 'work');
        else if (room >= c.food.size) {
          room -= c.food.size;
          act({kind: 'drop'}, 'work');
        } else act({kind: 'wait'}, 'blocked');
        continue;
      }

      const job = find[order[0]]() ?? find[order[1]]();
      if (job) act(here === job.spot ? job.command : {kind: 'move', to: job.spot}, 'work');
      // No job. The walk back to the mouth counts as work (R1-D1).
      else if (here === 'mouth') act({kind: 'wait'}, 'idle');
      else act({kind: 'move', to: 'mouth'}, 'work');
    }
    return {commands, status};
  };
}

export const sealFirst: Policy = policy(['breach', 'food']);
export const foodFirst: Policy = policy(['food', 'breach']);
