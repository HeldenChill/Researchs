import {test} from 'node:test';
import assert from 'node:assert/strict';
import {digest} from '../src/ops/digest.ts';
import type {Config, SimEvent, SimState} from '../src/types.ts';
import {tiny} from './fixtures.ts';
import {acid, floor, held, item, setup} from './helpers.ts';

const run = (s: SimState, times: number, c: Config = tiny()) => {
  const events: SimEvent[] = [];
  for (let i = 0; i < times; i++) digest(s, c, events);
  return events;
};

test('food pays on the third tick, once', () => {
  const s = setup(tiny(), {items: [item(1, acid)]});
  run(s, 2);
  assert.deepEqual([s.items[0].progressTicks, s.hunger], [2, 500]);
  const events = run(s, 1);
  assert.deepEqual([s.items.length, s.hunger], [0, 1500]);
  assert.deepEqual(events, [{tick: 0, kind: 'digested', id: 1}]);
  run(s, 1);
  assert.equal(s.hunger, 1500);
});

test('payment is clamped at the hunger maximum', () => {
  const s = setup(tiny(), {hunger: 1900, items: [item(1, acid)]});
  run(s, 3);
  assert.equal(s.hunger, 2000);
});

test('everything in the pit digests together', () => {
  const c = tiny({acidCapacity: 2});
  const s = setup(c, {items: [item(1, acid), item(2, acid)]});
  run(s, 3, c);
  assert.deepEqual([s.items.length, s.hunger], [0, 2000]);
});

test('floor and held food do not digest', () => {
  const s = setup(tiny(), {items: [item(1, floor('acid')), item(2, held(0))]});
  run(s, 3);
  assert.deepEqual(s.items.map(i => i.progressTicks), [0, 0]);
});
