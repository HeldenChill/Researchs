import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CONFIG } from '../src/config.js';
import { parseLevel } from '../src/level.js';
import { cascadeProfile, uniformLevel, noIterationConfig } from '../src/detector.js';
import { L } from './helpers.js';

test('profile never returns NaN or Infinity', () => {
  const p = cascadeProfile(L('###'), CONFIG);
  assert.equal(p.actions, 0); assert.equal(p.skillGap, 0); assert.equal(p.pass, false);
});

test('detector rejects control N1, the uniform field', () => {
  assert.equal(cascadeProfile(uniformLevel(), CONFIG).pass, false);
});

test('detector rejects control N2, no iteration', () => {
  const level = parseLevel(readFileSync(new URL('../levels/level-01.txt', import.meta.url), 'utf8'));
  const p = cascadeProfile(level, noIterationConfig(CONFIG));
  assert.equal(p.best, 1); assert.equal(p.pass, false);
});
