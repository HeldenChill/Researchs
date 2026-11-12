import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG_SPEC, config } from '../src/config.js';
import { createState } from '../src/state.js';

test('every config key has a valid slider range and matches config', () => {
  assert.equal(Object.keys(CONFIG_SPEC).length, 62);
  for (const [k, s] of Object.entries(CONFIG_SPEC)) {
    assert.ok(s.min <= s.value && s.value <= s.max, k);
    assert.ok(['Locomotion','Stamina','Climb','Slide','Balance','Camera'].includes(s.group), k);
    assert.equal(config[k], s.value, k);
  }
  assert.equal(config.dragTucked, 0.0062);
});

test('start state', () => {
  const s = createState(config);
  assert.deepEqual([s.pos.x, s.pos.z, s.heading, s.mode, s.stamina, s.balance, s.load], [0, -680, 0, 'OnFoot', 100, 100, 0]);
});
