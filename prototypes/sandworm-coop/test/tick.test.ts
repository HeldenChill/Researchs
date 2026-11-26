import {test} from 'node:test';
import assert from 'node:assert/strict';
import {outcome} from '../src/boundary.ts';
import {initialState} from '../src/state.ts';
import {step} from '../src/tick.ts';
import type {Command, SimState} from '../src/types.ts';
import {tiny} from './fixtures.ts';
import {acid, breach, floor, item, setup} from './helpers.ts';

const c = tiny();
const wait: Command = {kind: 'wait'};
const after = (s: SimState, command: Command = wait) => step(s, c, [command]).state;

test('outcome order: health, then hunger, then time', () => {
  assert.equal(outcome(setup(c), c), 'running');
  assert.equal(outcome(setup(c, {health: 0, hunger: 0}), c), 'lost_health');
  assert.equal(outcome(setup(c, {hunger: 0}), c), 'lost_hunger');
  assert.equal(outcome(setup(c, {tick: 1000}), c), 'survived');
  assert.equal(outcome(setup(c, {tick: 1000, health: 0}), c), 'lost_health');
});

test('steps reach each end', () => {
  const both = after(setup(c, {health: 7, hunger: 10, breaches: [breach(1)]}));
  assert.deepEqual([both.health, both.hunger, outcome(both, c)], [0, 0, 'lost_health']);
  assert.equal(outcome(after(setup(c, {hunger: 10})), c), 'lost_hunger');
  assert.equal(outcome(after(setup(c, {tick: 999})), c), 'survived');
});

test('stepping an ended run throws', () => {
  assert.throws(() => after(setup(c, {hunger: 0})), /ended/);
});

test('a seal finished this tick prevents this tick damage', () => {
  assert.equal(after(setup(c, {breaches: [breach(1, 'mouth', 1)]}), {kind: 'seal', breachId: 1}).health, 1000);
});

test('a last-moment meal counts before the drain', () => {
  const s = after(setup(c, {hunger: 5, items: [item(1, acid, {progressTicks: 2})]}));
  assert.deepEqual([s.hunger, outcome(s, c)], [995, 'running']);
});

test('a pickup on the expiry tick saves the floor', () => {
  const s = after(setup(c, {items: [item(1, floor('mouth'), {ageTicks: 4})]}), {kind: 'pick', itemId: 1});
  assert.equal(s.breaches.length, 0);
});

test('a new breach damages in the same tick', () => {
  const s = after(setup(c, {items: [item(1, floor('mouth'), {ageTicks: 4})]}));
  assert.deepEqual([s.breaches.length, s.health], [1, 993]);
});

test('arriving food ages on its arrival tick', () => {
  let s = initialState(c, 1);
  for (let i = 0; i < 4; i++) s = after(s);
  assert.equal(s.breaches.length, 0);
  s = after(s);
  assert.deepEqual([s.breaches.length, s.health], [1, 993]);
});

test('step leaves its input unchanged and advances the tick', () => {
  const s = setup(c, {items: [item(1, floor('mouth'))]});
  const before = structuredClone(s);
  assert.equal(after(s, {kind: 'pick', itemId: 1}).tick, 1);
  assert.deepEqual(s, before);
});
