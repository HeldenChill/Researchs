import {test} from 'node:test';
import assert from 'node:assert/strict';
import {outcome} from '../src/boundary.ts';
import {PLACEHOLDER_CONFIG} from '../src/config.ts';
import {checkInvariants} from '../src/invariants.ts';
import {initialState} from '../src/state.ts';
import {step} from '../src/tick.ts';
import type {SimEvent, SimState} from '../src/types.ts';
import {tiny} from './fixtures.ts';
import {commandSource} from './randomCommands.ts';

function play(reloadAt?: number) {
  const commands = commandSource(99);
  let s: SimState = initialState(PLACEHOLDER_CONFIG, 7);
  const states: SimState[] = [];
  const events: SimEvent[] = [];
  for (let i = 0; i < 500 && outcome(s, PLACEHOLDER_CONFIG) === 'running'; i++) {
    if (i === reloadAt) s = JSON.parse(JSON.stringify(s));
    const result = step(s, PLACEHOLDER_CONFIG, commands(s));
    s = result.state;
    states.push(s);
    events.push(...result.events);
  }
  return {states, events};
}

test('the same seed and commands repeat exactly', () => {
  const first = play();
  assert.equal(first.states.length, 500);
  assert.deepEqual(play(), first);
});

test('save and load mid-run continues the same way, including arrivals', () => {
  const plain = play();
  assert.ok(plain.events.filter(e => e.kind === 'arrived' && e.tick > 250).length > 0);
  assert.deepEqual(play(250), plain);
});

// A crowded setting with a long-lived worm, so random commands reach every rule.
const busy = tiny({
  crewCount: 3, neglectLimitTicks: 12, drainPerTick: 1, breachDamagePerTick: 1,
  hungerStart: 1_000_000, hungerMax: 1_000_000, healthMax: 1_000_000, timeLimitTicks: 1_000_000,
  intake: {firstArrivalTick: 0, meanGapTicks: 4, jitterTicks: 2},
});

test('random commands never break an invariant, and only floor food ages', () => {
  const seen = new Set<string>();
  for (let seed = 1; seed <= 20; seed++) {
    const commands = commandSource(seed * 7919);
    let s = initialState(busy, seed);
    for (let i = 0; i < 2000 && outcome(s, busy) === 'running'; i++) {
      const ages = new Map(s.items.map(x => [x.id, x.ageTicks]));
      const result = step(s, busy, commands(s));
      s = result.state;
      const found = checkInvariants(s, busy);
      if (found.length) assert.fail(`seed ${seed} tick ${s.tick}: ${found.join('; ')}`);
      for (const x of s.items) {
        const grew = x.ageTicks - (ages.get(x.id) ?? 0);
        const expected = x.place.kind === 'floor' ? 1 : 0;
        if (grew !== expected) assert.fail(`seed ${seed} tick ${s.tick}: item ${x.id} ${x.place.kind} aged ${grew}`);
      }
      for (const e of result.events) seen.add(e.kind);
    }
  }
  // The run only counts if every kind of event actually happened.
  assert.deepEqual([...seen].sort(),
    ['acidFull', 'arrived', 'breached', 'digested', 'dropped', 'picked', 'rejected', 'sealed']);
});
