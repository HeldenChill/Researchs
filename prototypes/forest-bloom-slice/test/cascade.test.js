import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../src/config.js';
import { createState } from '../src/state.js';
import { cascade } from '../src/cascade.js';
import { playthrough, greedyAgent } from '../src/agents.js';
import { L } from './helpers.js';

test('cascade of one pioneer in a corridor', () => {
  const level = L('111111'); const s = createState(level);
  assert.deepEqual(cascade(s, level, CONFIG, { species: 1, cell: 0 }, 12), { size: 6, depth: 5 });
});

test('cascade is 1 when nothing can spread', () => {
  const level = L('1#1'); const s = createState(level);
  assert.deepEqual(cascade(s, level, CONFIG, { species: 1, cell: 0 }, 12), { size: 1, depth: 0 });
});

test('greedy playthrough plays one seed for one turn of 8 ticks', () => {
  const level = L('111111', '1,0,0');
  const { final, history } = playthrough(level, CONFIG, greedyAgent());
  assert.equal(final.inventory[1], 0);
  assert.equal(history.length, 8);
});

test('playthrough ends when no legal action is left, seeds unspent', () => {
  const level = L('11', '2,0,0');
  const { final, history } = playthrough(level, CONFIG, greedyAgent());
  assert.equal(final.inventory[1], 1);   // both cells are occupied after turn 1: each death is reseeded by the neighbour
  assert.equal(history.length, 8);
});
