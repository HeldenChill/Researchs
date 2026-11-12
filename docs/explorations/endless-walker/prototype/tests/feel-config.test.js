import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FEEL_SPEC, feel } from '../src/feel-config.js';

const GROUPS = ['Walk feel', 'Slide feel', 'Screen FX', 'VFX', 'Hook', 'Sound', 'Scenery', 'Toggles'];

test('feel spec: 41 keys, valid ranges, live values match', () => {
  assert.equal(Object.keys(FEEL_SPEC).length, 41); // owner 2026-11-12: +hookLaunch, hookLift, hookGravity
  for (const [k, s] of Object.entries(FEEL_SPEC)) {
    assert.ok(s.min <= s.value && s.value <= s.max, k);
    assert.ok(GROUPS.includes(s.group), k);
    assert.equal(feel[k], s.value, k);
  }
});

test('hook is on by default (owner 2026-11-12); scenery matches today values', () => {
  assert.equal(feel.hookEnabled, 1);
  assert.equal(feel.hookRange, 120);
  assert.equal(feel.sunIntensity, 2.2);
  assert.equal(feel.fogNear, 700);
});
