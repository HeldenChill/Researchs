import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG, EMPTY, PIONEER, SHRUB, CANOPY } from '../src/config.js';
import { createState } from '../src/state.js';
import { tick, run } from '../src/operators.js';
import { L, put, RUNG0 } from './helpers.js';

test('pioneer spreads one cell per tick and enriches soil (rung 0 table)', () => {
  const level = L('111'); let s = createState(level); put(s, 0, PIONEER);
  s = tick(s, level, RUNG0);
  assert.deepEqual([...s.species], [1, 1, 0]);
  s = tick(s, level, RUNG0);
  assert.deepEqual([...s.species], [1, 1, 1]);
  assert.deepEqual([...s.soil], [2, 3, 2]);
});

test('pioneer dies after its lifespan', () => {
  const level = L('1'); let s = createState(level); put(s, 0, PIONEER);
  assert.equal(run(s, level, CONFIG, 6).species[0], PIONEER);
  assert.equal(run(s, level, CONFIG, 7).species[0], EMPTY);
});

test('lone canopy starves its own soil (rung 0 table)', () => {
  const level = L('4'); let s = createState(level); put(s, 0, CANOPY);
  const s1 = tick(s, level, RUNG0);
  assert.equal(s1.species[0], CANOPY); assert.equal(s1.soil[0], 3);
  assert.equal(tick(s1, level, RUNG0).species[0], EMPTY);
});

test('canopy shade kills a neighbouring pioneer', () => {
  const level = L('444'); let s = createState(level); put(s, 0, PIONEER); put(s, 1, CANOPY);
  assert.deepEqual([...tick(s, level, CONFIG).species], [0, 3, 0]);
});

test('higher rank wins a contested cell', () => {
  const level = L('333'); let s = createState(level); put(s, 0, PIONEER, 5); put(s, 2, SHRUB, 5);
  assert.equal(tick(s, level, CONFIG).species[1], SHRUB);
});

test('pioneer enrichment stops at its cap', () => {
  const level = L('11'); let s = createState(level); put(s, 0, PIONEER);
  assert.ok(run(s, level, CONFIG, 5).soil[1] <= 3);
});

test('nothing grows on rock and soil stays within 0 to 5', () => {
  const level = L('5#5'); let s = createState(level); put(s, 0, SHRUB, 5);
  s = run(s, level, CONFIG, 8);
  assert.equal(s.species[1], EMPTY);
  assert.ok([...s.soil].every(v => v >= 0 && v <= 5));
});

test('tick does not mutate its input and is deterministic', () => {
  const level = L('111'); const s = createState(level); put(s, 0, PIONEER);
  const before = JSON.stringify([...s.species, ...s.soil, ...s.age]);
  const a = run(s, level, CONFIG, 10), b = run(s, level, CONFIG, 10);
  assert.equal(JSON.stringify([...s.species, ...s.soil, ...s.age]), before);
  assert.deepEqual([...a.species], [...b.species]);
});

test('rung 1: pioneer no longer lifts bare soil, so it cannot cross soil 0', () => {
  const level = L('10'); let s = createState(level); put(s, 0, PIONEER);
  s = run(s, level, CONFIG, 3);
  assert.equal(s.soil[1], 0);
  assert.equal(s.species[1], EMPTY);
});

test('rung 2: canopy germinates and survives on soil 3', () => {
  const level = L('33'); let s = createState(level); put(s, 0, CANOPY, 3);
  s = tick(s, level, CONFIG);
  assert.equal(s.species[1], CANOPY);
});

test('rung 3: shrub dies after age 7', () => {
  const level = L('3'); const s = createState(level); put(s, 0, SHRUB);
  assert.equal(run(s, level, CONFIG, 7).species[0], SHRUB);
  assert.equal(run(s, level, CONFIG, 8).species[0], EMPTY);
});
