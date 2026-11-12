import test from 'node:test';
import assert from 'node:assert/strict';
import { CANOPY } from '../src/config.js';
import { createState, cloneState } from '../src/state.js';
import { observe } from '../src/observe.js';
import { L, put } from './helpers.js';

test('richness and trend follow the hill number', () => {
  const level = L('555555'); const s = createState(level);
  put(s, 0, 1); put(s, 1, 1);
  const mono = cloneState(s);
  put(s, 2, 2); put(s, 3, 2); put(s, 4, 3); put(s, 5, 3);
  const history = [...Array(8).fill(mono), s];
  const o = observe(s, level, history);
  assert.ok(Math.abs(o.richness - 1) < 1e-9);
  assert.equal(o.trend, 'up');
  assert.equal(observe(mono, level, [mono]).trend, 'flat');
});

test('warning names the dominant species only above 12 trees', () => {
  const level = L('1'.repeat(16)); const s = createState(level);
  for (let i = 0; i < 12; i++) put(s, i, 1);
  assert.equal(observe(s, level, [s]).warning, 0);
  put(s, 12, 1);
  assert.equal(observe(s, level, [s]).warning, 1);
});

test('observe marks rock and shaded cells', () => {
  const level = L('4#4'); const s = createState(level); put(s, 0, CANOPY);
  const o = observe(s, level, [s]);
  assert.equal(o.cells[1].rock, true);
  assert.equal(o.cells[0].shaded, false);
});
