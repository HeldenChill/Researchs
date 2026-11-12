import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as terrain from '../src/terrain.js';
import { config } from '../src/config.js';
import { createState } from '../src/state.js';
import { stepWalker } from '../src/rules/step.js';
import { uphillFactor, targetSpeed } from '../src/rules/locomotion.js';

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
const fwd = (o = {}) => act({ raw: { x: 0, y: 1 }, move: { x: 0, z: 1, mag: 1 }, ...o });
const run = (s, a, sec) => {
  for (let i = 0; i < Math.round(sec / dt); i++) {
    s = stepWalker(s, a, config, dt, terrain);
  }
  return s;
};

test('uphill factor at 27 degrees and floor', () => {
  assert.ok(Math.abs(uphillFactor(27, config) - (1 - 0.9 * Math.sin(27 * Math.PI / 180))) < 1e-9);
  assert.equal(uphillFactor(89, config), 0.35);
  assert.equal(uphillFactor(-20, config), 1);
});

test('speed builds over time, not instantly, on flat base', () => {
  const s = run(createState(config), fwd(), 0.25);
  assert.ok(s.speed > 1.3 && s.speed < 1.7, `${s.speed}`);
  assert.ok(Math.abs(run(s, fwd(), 2).speed - 3.0 * (1 - 0.3 * 0.6)) < 0.01);
});

test('load does not change walking speed', () => {
  const f = terrain.fieldAt(0, -300, 0);
  const a = { ...createState(config), load: 0 }, b = { ...createState(config), load: 60 };
  assert.equal(targetSpeed(a, fwd(), f, config), targetSpeed(b, fwd(), f, config));
});

test('walking into the cliff without grab stops below it', () => {
  let s = { ...createState(config), pos: { x: 0, y: terrain.heightAt(0, -93), z: -93 } };
  s = run(s, fwd(), 10);
  assert.equal(s.mode, 'OnFoot');
  assert.ok(s.pos.z < -88.5, `${s.pos.z}`);
});

test('jump then land on flat', () => {
  let s = run(createState(config), act({ jump: true }), dt);
  assert.equal(s.mode, 'InAir');
  s = run(s, act(), 1.0);
  assert.equal(s.mode, 'OnFoot');
});

test('hard landing gives Fallen', () => {
  let s = { ...createState(config), mode: 'InAir', vel: { x: 0, y: -12, z: 0 }, pos: { x: 0, y: 1, z: -680 } };
  s = run(s, act(), 0.2);
  assert.equal(s.mode, 'Fallen');
});
