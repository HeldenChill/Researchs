import {test} from 'node:test';
import assert from 'node:assert/strict';
import {neglect} from '../src/ops/neglect.ts';
import type {SimEvent, SimState} from '../src/types.ts';
import {tiny} from './fixtures.ts';
import {acid, breach, floor, held, item, setup} from './helpers.ts';

const run = (s: SimState, times: number) => {
  const events: SimEvent[] = [];
  for (let i = 0; i < times; i++) neglect(s, tiny(), events);
  return events;
};

test('floor food becomes a breach on the fifth tick', () => {
  const s = setup(tiny(), {items: [item(1, floor('acid'))]});
  run(s, 4);
  assert.deepEqual([s.items[0].ageTicks, s.breaches.length], [4, 0]);
  const events = run(s, 1);
  assert.deepEqual(s.items, []);
  assert.deepEqual(s.breaches, [breach(100, 'acid')]);
  assert.equal(s.nextId, 101);
  assert.deepEqual(events, [{tick: 0, kind: 'breached', id: 100}]);
});

test('held and digesting food does not age', () => {
  const s = setup(tiny(), {items: [item(1, held(0)), item(2, acid)]});
  run(s, 10);
  assert.deepEqual(s.items.map(i => i.ageTicks), [0, 0]);
  assert.equal(s.breaches.length, 0);
});

test('pickup pauses the age and does not reset it', () => {
  const s = setup(tiny(), {items: [item(1, held(0), {ageTicks: 3})]});
  run(s, 10);
  s.items[0].place = floor('mouth');
  run(s, 1);
  assert.equal(s.breaches.length, 0);
  run(s, 1);
  assert.equal(s.breaches.length, 1);
});

test('breach ids follow item id order, not list order', () => {
  const s = setup(tiny(), {items: [item(2, floor('acid'), {ageTicks: 4}), item(1, floor('mouth'), {ageTicks: 4})]});
  run(s, 1);
  assert.deepEqual(s.breaches, [breach(100, 'mouth'), breach(101, 'acid')]);
});
