import test from 'node:test';
import assert from 'node:assert/strict';
import { createState } from '../src/state.js';
import { hillNumber } from '../src/derived.js';
import { L, put } from './helpers.js';

test('hill number: empty 0, monoculture 1, three equal species 3', () => {
  const level = L('555555'); const s = createState(level);
  assert.equal(hillNumber(s), 0);
  put(s, 0, 1); put(s, 1, 1);
  assert.ok(Math.abs(hillNumber(s) - 1) < 1e-9);
  put(s, 2, 2); put(s, 3, 2); put(s, 4, 3); put(s, 5, 3);
  assert.ok(Math.abs(hillNumber(s) - 3) < 1e-9);
});
