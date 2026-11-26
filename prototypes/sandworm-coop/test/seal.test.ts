import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seal} from '../src/ops/seal.ts';
import type {Command, Config, SimEvent, SimState} from '../src/types.ts';
import {tiny} from './fixtures.ts';
import {breach, held, item, setup, walking} from './helpers.ts';

const run = (s: SimState, commands: Command[], c: Config = tiny()) => {
  const events: SimEvent[] = [];
  seal(s, c, events, commands);
  return events.map(e => `${e.kind}:${e.crew}`);
};
const on = (breachId: number): Command => ({kind: 'seal', breachId});

test('two calls remove a breach', () => {
  const s = setup(tiny(), {breaches: [breach(1)]});
  assert.deepEqual(run(s, [on(1)]), []);
  assert.deepEqual(s.breaches, [breach(1, 'mouth', 1)]);
  assert.deepEqual(run(s, [on(1)]), ['sealed:0']);
  assert.deepEqual(s.breaches, []);
});

test('seal progress is kept across waiting', () => {
  const s = setup(tiny(), {breaches: [breach(1)]});
  run(s, [on(1)]);
  for (let i = 0; i < 10; i++) run(s, [{kind: 'wait'}]);
  run(s, [on(1)]);
  assert.deepEqual(s.breaches, []);
});

test('two crew seal in one tick; a third finds it gone', () => {
  const c = tiny({crewCount: 3});
  const s = setup(c, {breaches: [breach(1)]});
  assert.deepEqual(run(s, [on(1), on(1), on(1)], c), ['sealed:1', 'rejected:2']);
  assert.deepEqual(s.breaches, []);
});

const refused: [string, (s: SimState) => number][] = [
  ['with full hands', s => { s.items.push(item(2, held(0))); return 1; }],
  ['a breach at the other spot', s => { s.breaches[0].spot = 'acid'; return 1; }],
  ['while walking', s => { s.crew[0].pos = walking('acid', 100); return 1; }],
  ['a missing id', () => 42],
];
for (const [name, arrange] of refused) {
  test(`sealing ${name} is rejected and changes nothing`, () => {
    const s = setup(tiny(), {breaches: [breach(1)]});
    const id = arrange(s);
    const before = structuredClone(s);
    assert.deepEqual(run(s, [on(id)]), ['rejected:0']);
    assert.deepEqual(s, before);
  });
}
