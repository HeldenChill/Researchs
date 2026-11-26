import {test} from 'node:test';
import assert from 'node:assert/strict';
import {foodFirst, sealFirst, type Policy} from '../src/bots.ts';
import type {SimState} from '../src/types.ts';
import {tiny} from './fixtures.ts';
import {acid, at, breach, floor, held, item, setup, walking} from './helpers.ts';

const c = tiny();
const two = tiny({crewCount: 2});
// Runs a policy and also proves it did not change the state.
const decide = (s: SimState, policy: Policy = sealFirst, config = c) => {
  const before = structuredClone(s);
  const d = policy(s, config);
  assert.deepEqual(s, before);
  return d;
};
const one = (s: SimState, policy: Policy = sealFirst) => {
  const d = decide(s, policy);
  return [d.commands[0], d.status[0]];
};
const holder = (spot: 'mouth' | 'acid', extra = [] as SimState['items']) => {
  const s = setup(c, {items: [item(1, held(0)), ...extra]});
  s.crew[0].pos = at(spot);
  return s;
};

test('a holder away from the pit walks to it', () => {
  assert.deepEqual(one(holder('mouth')), [{kind: 'move', to: 'acid'}, 'work']);
});

test('a holder at the pit drops when there is room, else waits as blocked', () => {
  assert.deepEqual(one(holder('acid')), [{kind: 'drop'}, 'work']);
  assert.deepEqual(one(holder('acid', [item(2, acid)])), [{kind: 'wait'}, 'blocked']);
});

test('two holders and one space: only the lower id drops', () => {
  const s = setup(two, {items: [item(1, held(0)), item(2, held(1))]});
  for (const m of s.crew) m.pos = at('acid');
  const d = decide(s, sealFirst, two);
  assert.deepEqual(d.commands, [{kind: 'drop'}, {kind: 'wait'}]);
  assert.deepEqual(d.status, ['work', 'blocked']);
});

test('sealFirst takes the breach and foodFirst takes the food', () => {
  const s = setup(c, {breaches: [breach(3)], items: [item(1, floor('mouth'))]});
  assert.deepEqual(one(s), [{kind: 'seal', breachId: 3}, 'work']);
  assert.deepEqual(one(s, foodFirst), [{kind: 'pick', itemId: 1}, 'work']);
});

test('a job at the other spot means walking there', () => {
  assert.deepEqual(one(setup(c, {breaches: [breach(3, 'acid')]})), [{kind: 'move', to: 'acid'}, 'work']);
});

test('crew claim different items, oldest first', () => {
  const s = setup(two, {items: [item(1, floor('mouth'), {ageTicks: 1}), item(2, floor('mouth'), {ageTicks: 4})]});
  assert.deepEqual(decide(s, sealFirst, two).commands, [{kind: 'pick', itemId: 2}, {kind: 'pick', itemId: 1}]);
});

test('equal ages go to the lower item id, and breaches to the lower id', () => {
  const s = setup(c, {items: [item(2, floor('mouth')), item(1, floor('mouth'))]});
  assert.deepEqual(one(s)[0], {kind: 'pick', itemId: 1});
  assert.deepEqual(one(setup(c, {breaches: [breach(5), breach(4)]}))[0], {kind: 'seal', breachId: 4});
});

test('a second crew member with nothing left is idle', () => {
  const s = setup(two, {items: [item(1, floor('mouth'))]});
  assert.deepEqual(decide(s, sealFirst, two).status, ['work', 'idle']);
});

test('no job: the walk back is work and standing at the mouth is idle', () => {
  const back = setup(c);
  back.crew[0].pos = at('acid');
  assert.deepEqual(one(back), [{kind: 'move', to: 'mouth'}, 'work']);
  const midway = setup(c);
  midway.crew[0].pos = walking('mouth', 100);
  assert.deepEqual(one(midway), [{kind: 'move', to: 'mouth'}, 'work']);
  assert.deepEqual(one(setup(c)), [{kind: 'wait'}, 'idle']);
});
