import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stepsForFrame } from '../src/loop.js';

test('normal frame', () => assert.equal(stepsForFrame(0, 1 / 60).steps, 1));

test('long frame is clamped to 5 steps and drops the rest', () => {
  const r = stepsForFrame(0, 3.0);
  assert.equal(r.steps, 5);
  assert.ok(r.acc < 1 / 60);
});
