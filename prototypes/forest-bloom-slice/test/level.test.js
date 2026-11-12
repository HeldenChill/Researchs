import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseLevel } from '../src/level.js';
import { createState, cloneState } from '../src/state.js';

const L = (grid, inv = '3,2,1') => parseLevel(`ticksPerTurn=8\ninventory=${inv}\n---\n${grid}`);

test('parses level 01', () => {
  const level = parseLevel(readFileSync(new URL('../levels/level-01.txt', import.meta.url), 'utf8'));
  assert.equal(level.width, 12);
  assert.equal(level.height, 12);
  assert.equal(level.ticksPerTurn, 8);
  assert.deepEqual(level.inventory, { 1: 3, 2: 2, 3: 1 });
  assert.equal(level.rock[6], 1);            // x 6, y 0
  assert.equal(level.initialSoil[1 * 12 + 9], 1);
  assert.equal(level.initialSoil[1 * 12 + 10], 3);
});

test('rejects ragged rows, naming the line', () => {
  assert.throws(() => L('111\n11'), /line 5/);
});

test('rejects unknown characters', () => {
  assert.throws(() => L('1x1'), /line 4/);
});

test('rejects a missing header', () => {
  assert.throws(() => parseLevel('111'), /ticksPerTurn/);
});

test('state copies level data and clone is independent', () => {
  const level = L('123');
  const s = createState(level);
  assert.deepEqual([...s.soil], [1, 2, 3]);
  assert.deepEqual(s.inventory, { 1: 3, 2: 2, 3: 1 });
  const c = cloneState(s);
  c.soil[0] = 5; c.inventory[1] = 0;
  assert.equal(s.soil[0], 1);
  assert.equal(s.inventory[1], 3);
});
