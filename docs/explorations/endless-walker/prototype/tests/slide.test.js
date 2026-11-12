import { test } from 'node:test';
import assert from 'node:assert/strict';
import { config } from '../src/config.js';
import { slideAccel } from '../src/rules/slide.js';

const settle = (tucked) => {
  let v = 1;
  for (let i = 0; i < 60 * 120; i++) {
    v = Math.max(0, v + slideAccel(v, -28, 0.12, tucked, false, config) / 60);
  }
  return v;
};

test('relaxed slide on 28 degrees settles near 15 m/s', () => {
  assert.ok(Math.abs(settle(false) - 15.42) < 0.1, `${settle(false)}`);
});

test('tucked slide on 28 degrees settles near 24 m/s', () => {
  assert.ok(Math.abs(settle(true) - 23.99) < 0.1, `${settle(true)}`);
});

test('brake on 28 degrees slows the walker', () => {
  assert.ok(slideAccel(15, -28, 0.12, false, true, config) < -3);
});
