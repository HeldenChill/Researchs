import {test} from 'node:test';
import assert from 'node:assert/strict';
import {nextRandom} from '../src/rng.ts';
import {acidUsed, carryPercent, heldItem, initialState} from '../src/state.ts';
import {checkInvariants} from '../src/invariants.ts';
import type {Item, Place, SimState} from '../src/types.ts';
import {tiny} from './fixtures.ts';

const item = (id: number, place: Place): Item => ({id, row: 'meat', place, ageTicks: 0, progressTicks: 0});

test('initial state puts every crew member at the mouth with empty sets', () => {
  const s = initialState(tiny({crewCount: 2}), 5);
  assert.deepEqual(s.crew, [{id: 0, pos: {kind: 'at', spot: 'mouth'}}, {id: 1, pos: {kind: 'at', spot: 'mouth'}}]);
  assert.deepEqual(
    [s.tick, s.seed, s.rng, s.nextId, s.nextArrivalTick, s.hunger, s.health, s.items.length, s.breaches.length],
    [0, 5, 5, 1, 0, 500, 1000, 0, 0],
  );
});

test('held item and used pit capacity are calculated from item places', () => {
  const c = tiny({acidCapacity: 3, food: {...tiny().food, size: 2}});
  const s = initialState(c, 1);
  s.items.push(item(1, {kind: 'held', crew: 0}), item(2, {kind: 'acid'}));
  assert.equal(heldItem(s, 0)?.id, 1);
  assert.equal(heldItem(s, 1), undefined);
  assert.equal(acidUsed(s, c), 2);
});

test('carry speed comes from mass', () => {
  assert.equal(carryPercent(tiny(), 1), 50);
  assert.equal(carryPercent(tiny(), 2), 25);
});

test('random numbers repeat for the same input and differ between seeds', () => {
  assert.deepEqual(nextRandom(1), nextRandom(1));
  assert.notEqual(nextRandom(1).value, nextRandom(2).value);
  const {value, rng} = nextRandom(4_000_000_000);
  for (const n of [value, rng]) assert.ok(Number.isInteger(n) && n >= 0 && n < 2 ** 32);
});

test('initial state breaks no invariant', () => {
  assert.deepEqual(checkInvariants(initialState(tiny(), 1), tiny()), []);
});

const broken: [string, string, (s: SimState) => void][] = [
  ['negative hunger', 'IV2', s => (s.hunger = -1)],
  ['health above maximum', 'IV2', s => (s.health = 1001)],
  ['two items in one hand', 'IV4', s => {
    s.items.push(item(1, {kind: 'held', crew: 0}), item(2, {kind: 'held', crew: 0}));
    s.nextId = 3;
  }],
  ['pit over capacity', 'IV12', s => {
    s.items.push(item(1, {kind: 'acid'}), item(2, {kind: 'acid'}));
    s.nextId = 3;
  }],
  ['duplicate id', 'IV10', s => {
    s.items.push(item(1, {kind: 'floor', spot: 'mouth'}));
    s.breaches.push({id: 1, spot: 'mouth', sealTicks: 0});
    s.nextId = 2;
  }],
  ['id not below next id', 'IV10', s => s.items.push(item(1, {kind: 'floor', spot: 'mouth'}))],
  ['held by a missing crew member', 'IV3', s => {
    s.items.push(item(1, {kind: 'held', crew: 9}));
    s.nextId = 2;
  }],
  ['fractional hunger', 'R1-A', s => (s.hunger = 0.5)],
];

for (const [name, id, damage] of broken) {
  test(`invariant ${id} reports ${name}`, () => {
    const s = initialState(tiny(), 1);
    damage(s);
    const found = checkInvariants(s, tiny());
    assert.ok(found.some(f => f.startsWith(`${id} `)), found.join('; '));
  });
}
