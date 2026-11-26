import {acidUsed} from './state.ts';
import type {Config, SimState} from './types.ts';

const SPOTS = ['mouth', 'acid'];

export function checkInvariants(s: SimState, c: Config): string[] {
  const found: string[] = [];
  const fail = (id: string, text: string) => found.push(`${id} ${text}`);
  const whole = (name: string, value: number) => {
    if (!Number.isInteger(value)) fail('R1-A', `${name} is not an integer: ${value}`);
  };

  for (const name of ['tick', 'seed', 'rng', 'nextId', 'nextArrivalTick', 'hunger', 'health'] as const) whole(name, s[name]);
  if (s.hunger < 0 || s.hunger > c.hungerMax) fail('IV2', `hunger out of range: ${s.hunger}`);
  if (s.health < 0 || s.health > c.healthMax) fail('IV2', `health out of range: ${s.health}`);

  const crewIds = new Set(s.crew.map(m => m.id));
  const holding = new Map<number, number>();
  for (const i of s.items) {
    whole('ageTicks', i.ageTicks);
    whole('progressTicks', i.progressTicks);
    const p = i.place;
    if (p.kind === 'floor') {
      if (!SPOTS.includes(p.spot)) fail('IV3', `item ${i.id} is on an unknown spot`);
    } else if (p.kind === 'held') {
      if (!crewIds.has(p.crew)) fail('IV3', `item ${i.id} is held by missing crew ${p.crew}`);
      holding.set(p.crew, (holding.get(p.crew) ?? 0) + 1);
    } else if (p.kind !== 'acid') {
      fail('IV3', `item ${i.id} has an unknown place`);
    }
  }
  for (const [crew, count] of holding) if (count > 1) fail('IV4', `crew ${crew} holds ${count} items`);

  for (const b of s.breaches) whole('sealTicks', b.sealTicks);
  for (const m of s.crew) if (m.pos.kind === 'walking') whole('left', m.pos.left);

  const ids = [...s.items, ...s.breaches].map(x => x.id);
  ids.forEach(id => whole('id', id));
  if (new Set(ids).size !== ids.length) fail('IV10', 'an id is used twice');
  if (ids.some(id => id >= s.nextId)) fail('IV10', 'an id is not below nextId');

  if (acidUsed(s, c) > c.acidCapacity) fail('IV12', `pit holds ${acidUsed(s, c)} of ${c.acidCapacity}`);
  return found;
}
