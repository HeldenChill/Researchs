import {test} from 'node:test';
import assert from 'node:assert/strict';
import {handle} from '../src/ops/handle.ts';
import type {Command, Config, SimEvent, SimState} from '../src/types.ts';
import {tiny} from './fixtures.ts';
import {acid, at, floor, held, item, setup, walking} from './helpers.ts';

const run = (s: SimState, commands: Command[], c: Config = tiny()) => {
  const events: SimEvent[] = [];
  handle(s, c, events, commands);
  return events.map(e => `${e.kind}:${e.crew}`);
};
const pick = (itemId: number): Command => ({kind: 'pick', itemId});
const drop: Command = {kind: 'drop'};
const two = tiny({crewCount: 2});

test('picking a floor item keeps its age', () => {
  const s = setup(tiny(), {items: [item(1, floor('mouth'), {ageTicks: 3})]});
  assert.deepEqual(run(s, [pick(1)]), ['picked:0']);
  assert.deepEqual(s.items[0], item(1, held(0), {ageTicks: 3}));
});

const refusedPicks: [string, (s: SimState) => number][] = [
  ['while walking', s => { s.crew[0].pos = walking('acid', 100); return 1; }],
  ['an item at the other spot', s => { s.items[0].place = floor('acid'); return 1; }],
  ['a missing id', () => 42],
  ['a held item', s => { s.items[0].place = held(0); return 1; }],
  ['an item in the pit', s => { s.items[0].place = acid; return 1; }],
  ['with full hands', s => { s.items.push(item(2, held(0))); return 1; }],
];
for (const [name, arrange] of refusedPicks) {
  test(`picking ${name} is rejected and changes nothing`, () => {
    const s = setup(tiny(), {items: [item(1, floor('mouth'))]});
    const id = arrange(s);
    const before = structuredClone(s);
    assert.deepEqual(run(s, [pick(id)]), ['rejected:0']);
    assert.deepEqual(s, before);
  });
}

test('two crew picking one item: the lower id gets it', () => {
  const s = setup(two, {items: [item(1, floor('mouth'))]});
  assert.deepEqual(run(s, [pick(1), pick(1)], two), ['picked:0', 'rejected:1']);
  assert.deepEqual(s.items[0].place, held(0));
});

test('dropping at the mouth keeps the age', () => {
  const s = setup(tiny(), {items: [item(1, held(0), {ageTicks: 3})]});
  assert.deepEqual(run(s, [drop]), ['dropped:0']);
  assert.deepEqual(s.items[0], item(1, floor('mouth'), {ageTicks: 3}));
});

test('dropping into an empty pit starts at zero progress', () => {
  const s = setup(tiny(), {items: [item(1, held(0), {progressTicks: 2})]});
  s.crew[0].pos = at('acid');
  assert.deepEqual(run(s, [drop]), ['dropped:0']);
  assert.deepEqual(s.items[0], item(1, acid));
});

test('dropping at a full pit puts the item on the pit floor', () => {
  const s = setup(tiny(), {items: [item(1, acid), item(2, held(0), {ageTicks: 3})]});
  s.crew[0].pos = at('acid');
  assert.deepEqual(run(s, [drop]), ['acidFull:0']);
  assert.deepEqual(s.items[1], item(2, floor('acid'), {ageTicks: 3}));
});

test('two drops into one space: lower id enters, the other lands on the floor', () => {
  const s = setup(two, {items: [item(1, held(0)), item(2, held(1))]});
  for (const m of s.crew) m.pos = at('acid');
  assert.deepEqual(run(s, [drop, drop], two), ['dropped:0', 'acidFull:1']);
  assert.deepEqual(s.items.map(i => i.place), [acid, floor('acid')]);
});

test('size 2 food into capacity 3: only one of two enters', () => {
  const c = tiny({crewCount: 2, acidCapacity: 3, food: {...tiny().food, size: 2}});
  const s = setup(c, {items: [item(1, held(0)), item(2, held(1))]});
  for (const m of s.crew) m.pos = at('acid');
  run(s, [drop, drop], c);
  assert.deepEqual(s.items.map(i => i.place), [acid, floor('acid')]);
});

test('dropping with empty hands or while walking is rejected', () => {
  assert.deepEqual(run(setup(tiny()), [drop]), ['rejected:0']);
  const s = setup(tiny(), {items: [item(1, held(0))]});
  s.crew[0].pos = walking('acid', 100);
  assert.deepEqual(run(s, [drop]), ['rejected:0']);
  assert.deepEqual(s.items[0].place, held(0));
});
