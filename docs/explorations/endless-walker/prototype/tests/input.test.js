import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toWorldMove, applyDeadzone } from '../src/input.js';

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} vs ${b}`);

test('forward at yaw 0 is +z', () => {
  const m = toWorldMove(0, 1, 0);
  near(m.x, 0);
  near(m.z, 1);
  near(m.mag, 1);
});

test('forward at yaw pi/2 is +x', () => {
  const m = toWorldMove(0, 1, Math.PI / 2);
  near(m.x, 1);
  near(m.z, 0);
});

test('diagonal keyboard clamps magnitude to 1', () => near(toWorldMove(1, 1, 0).mag, 1));

test('deadzone', () => {
  assert.equal(applyDeadzone(0.1), 0);
  near(applyDeadzone(1), 1);
  near(applyDeadzone(-1), -1);
});
