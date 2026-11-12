import test from 'node:test';
import assert from 'node:assert/strict';
import { createState } from '../src/state.js';
import { viability } from '../src/boundary.js';
import { L, put } from './helpers.js';

test('viability: small monoculture is exempt, large one is not', () => {
  const level = L('1'.repeat(14)); const s = createState(level);
  for (let i = 0; i < 12; i++) put(s, i, 1);
  assert.equal(viability(s).monoculture, false);
  put(s, 12, 1);
  assert.equal(viability(s).monoculture, true);
  assert.equal(viability(s).ok, false);
});

test('viability on an empty forest does not divide by zero', () => {
  const v = viability(createState(L('111')));
  assert.deepEqual(v, { monoculture: false, diverse: false, ok: false });
});
