import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as terrain from '../src/terrain.js';
import { config } from '../src/config.js';
import { createState } from '../src/state.js';
import { balance } from '../src/rules/balance.js';
import { stepWalker } from '../src/rules/step.js';

const dt = 1 / 60;
const act = (o = {}) => ({
  raw: { x: 0, y: 0 },
  move: { x: 0, z: 0, mag: 0 },
  sprint: false,
  jump: false,
  grab: false,
  crouch: false,
  loadDelta: 0,
  reset: false,
  toPeak: false,
  lookDX: 0,
  lookDY: 0,
  ...o
});
const flat = { ...terrain.fieldAt(0, 300, 0), slopeAcrossDeg: 0, bumpNorm: 0 };

test('18 m/s for 60 s straight: balance stays 100', () => {
  let s = { ...createState(config), mode: 'Sliding', speed: 18 };
  for (let i = 0; i < 3600; i++) s = balance(s, act(), flat, config, dt);
  assert.equal(s.balance, 100);
});

test('24 m/s straight: balance reaches zero in 2 to 5 s', () => {
  let s = { ...createState(config), mode: 'Sliding', speed: 24 }, t = 0;
  while (s.balance > 0 && t < 10) {
    s = balance(s, act(), flat, config, dt);
    t += dt;
  }
  assert.ok(t > 2 && t < 5, `t ${t}`);
});

test('relaxed slide down the real slide face never falls', () => {
  let s = { ...createState(config), pos: { x: 0, y: terrain.heightAt(0, 14), z: 14 }, mode: 'Sliding', speed: 1 };
  const a = act({ crouch: true });
  let minBal = 100;
  for (let i = 0; i < 60 * 90 && s.pos.z < 600; i++) {
    s = stepWalker(s, a, config, dt, terrain);
    minBal = Math.min(minBal, s.balance);
  }
  assert.notEqual(s.mode, 'Fallen');
  assert.equal(minBal, 100);
  assert.ok(s.pos.z > 590, `slide stopped at z ${s.pos.z}`);
});
