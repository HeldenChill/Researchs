import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as terrain from '../src/terrain.js';
import { config } from '../src/config.js';
import { createState } from '../src/state.js';
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
const at = (z, o = {}) => ({ ...createState(config), pos: { x: 0, y: terrain.heightAt(0, z), z }, ...o });

test('grab at cliff foot enters OnWall', () => {
  const s = stepWalker(at(-90.5), act({ grab: true }), config, dt, terrain);
  assert.equal(s.mode, 'OnWall');
});

test('climb with stamina empty drops to InAir', () => {
  const s = stepWalker(at(-87, { mode: 'OnWall', stamina: 0 }), act({ grab: true, raw: { x: 0, y: 1 } }), config, dt, terrain);
  assert.equal(s.mode, 'InAir');
});

test('release grab drops to InAir', () => {
  const s = stepWalker(at(-87, { mode: 'OnWall' }), act({ grab: false }), config, dt, terrain);
  assert.equal(s.mode, 'InAir');
});

test('lower pitch at load 60: reaches the ledge with a little stamina left', () => {
  let s = at(-90.5, { load: 60, stamina: 40 });
  const a = act({ grab: true, raw: { x: 0, y: 1 } });
  let t = 0;
  while (t < 30 && !(s.mode === 'OnFoot' && t > 0.5)) {
    s = stepWalker(s, a, config, dt, terrain);
    t += dt;
  }
  assert.equal(s.mode, 'OnFoot', `mode ${s.mode} at t ${t}`);
  assert.ok(s.pos.z > -84.5 && s.pos.z < -80.5, `z ${s.pos.z}`);
  assert.ok(s.stamina > 0 && s.stamina < 10, `stamina ${s.stamina}`);
});
