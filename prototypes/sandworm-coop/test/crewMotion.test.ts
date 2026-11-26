import {test} from 'node:test';
import assert from 'node:assert/strict';
import {crewMotion} from '../src/ops/crewMotion.ts';
import type {Command, SimState} from '../src/types.ts';
import {tiny} from './fixtures.ts';
import {at, held, item, setup, walking} from './helpers.ts';

const toAcid: Command = {kind: 'move', to: 'acid'};
const toMouth: Command = {kind: 'move', to: 'mouth'};
const run = (s: SimState, command: Command, times = 1) => {
  for (let i = 0; i < times; i++) crewMotion(s, tiny(), [], [command]);
  return s.crew[0].pos;
};
const carrying = (mass: number) => {
  const c = tiny({food: {...tiny().food, mass}});
  const s = setup(c, {items: [item(1, held(0))]});
  return {
    s,
    run(times: number) {
      for (let i = 0; i < times; i++) crewMotion(s, c, [], [toAcid]);
      return s.crew[0].pos;
    },
  };
};

test('empty crew walks half a leg per tick', () => {
  const s = setup(tiny());
  assert.deepEqual(run(s, toAcid), walking('acid', 100));
  assert.deepEqual(run(s, toAcid), at('acid'));
});

test('carrying mass 1 takes exactly four ticks', () => {
  const c = carrying(1);
  assert.equal(c.run(3).kind, 'walking');
  assert.deepEqual(c.run(1), at('acid'));
});

test('carrying mass 2 takes exactly eight ticks', () => {
  const c = carrying(2);
  assert.equal(c.run(7).kind, 'walking');
  assert.deepEqual(c.run(1), at('acid'));
});

test('waiting mid-walk keeps the position', () => {
  const s = setup(tiny());
  run(s, toAcid);
  assert.deepEqual(run(s, {kind: 'wait'}), walking('acid', 100));
});

test('turning back keeps the position and advances in the same tick', () => {
  const s = setup(tiny());
  run(s, toAcid);
  assert.deepEqual(run(s, toMouth), at('mouth'));

  const c = carrying(1);
  assert.deepEqual(c.run(1), walking('acid', 150));
  crewMotion(c.s, tiny(), [], [toMouth]);
  assert.deepEqual(c.s.crew[0].pos, at('mouth'));
});

test('moving to the current spot changes nothing', () => {
  assert.deepEqual(run(setup(tiny()), toMouth), at('mouth'));
});
