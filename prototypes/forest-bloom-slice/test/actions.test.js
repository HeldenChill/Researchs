import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../src/config.js';
import { createState } from '../src/state.js';
import { legalActions, applyAction } from '../src/actions.js';
import { L } from './helpers.js';

test('legal actions respect soil, rock, occupancy and inventory', () => {
  const level = L('1#4', '1,0,1'); const s = createState(level);
  assert.deepEqual(legalActions(s, level, CONFIG),
    [{ species: 1, cell: 0 }, { species: 1, cell: 2 }, { species: 3, cell: 2 }]);
});

test('applyAction plants, spends a seed, leaves input untouched', () => {
  const level = L('1'); const s = createState(level);
  const n = applyAction(s, level, CONFIG, { species: 1, cell: 0 });
  assert.equal(n.species[0], 1); assert.equal(n.inventory[1], 2);
  assert.equal(s.species[0], 0); assert.equal(s.inventory[1], 3);
});

for (const [name, grid, inv, action] of [
  ['rock', '#', '3,2,1', { species: 1, cell: 0 }],
  ['soil too low', '1', '3,2,1', { species: 3, cell: 0 }],
  ['no seeds', '1', '0,2,1', { species: 1, cell: 0 }],
]) test(`applyAction rejects ${name}`, () => {
  const level = L(grid, inv);
  assert.throws(() => applyAction(createState(level), level, CONFIG, action), /illegal action/);
});

test('applyAction rejects an occupied cell', () => {
  const level = L('1'); const s = applyAction(createState(level), level, CONFIG, { species: 1, cell: 0 });
  assert.throws(() => applyAction(s, level, CONFIG, { species: 1, cell: 0 }), /illegal action/);
});
