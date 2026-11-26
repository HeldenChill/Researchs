// P3 witnesses: each rung 1 mechanic is reached by an exact command list.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {outcome} from '../src/boundary.ts';
import {initialState} from '../src/state.ts';
import {step} from '../src/tick.ts';
import type {Command, SimState} from '../src/types.ts';
import {tiny} from './fixtures.ts';

const c = tiny();
const wait: Command = {kind: 'wait'};
const toAcid: Command = {kind: 'move', to: 'acid'};
const play = (s: SimState, commands: Command[]) => commands.reduce((now, command) => step(now, c, [command]).state, s);

// Arrival ages on step 1. Carrying at 50% needs four moves for 200 units. The drop tick gives progress 1,
// so payment is on step 9. Hunger is 500 - 8 x 10 = 420, then +1000 = 1420, then -10 = 1410.
test('witness 1: food is carried to the pit and feeds the worm', () => {
  const s = play(initialState(c, 1),
    [wait, {kind: 'pick', itemId: 1}, toAcid, toAcid, toAcid, toAcid, {kind: 'drop'}, wait, wait]);
  assert.deepEqual([s.items.length, s.breaches.length, s.hunger, s.health, s.tick], [0, 0, 1410, 1000, 9]);
  assert.equal(outcome(s, c), 'running');
});

// Arrival ages on step 1 and expires on step 5. The first seal tick leaves the breach to damage once more;
// the second removes it before damage.
test('witness 2: neglected food breaches the worm and sealing repairs it', () => {
  let s = play(initialState(c, 1), [wait, wait, wait, wait, wait]);
  assert.deepEqual([s.breaches.length, s.breaches[0]?.id, s.health], [1, 2, 993]);
  s = play(s, [{kind: 'seal', breachId: 2}]);
  assert.equal(s.health, 986);
  s = play(s, [{kind: 'seal', breachId: 2}]);
  assert.deepEqual([s.breaches.length, s.health, s.hunger], [0, 986, 430]);
});
