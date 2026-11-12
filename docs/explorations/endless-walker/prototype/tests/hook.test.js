import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as terrain from '../src/terrain.js';
import { config } from '../src/config.js';
import { FEEL_SPEC } from '../src/feel-config.js';
import { createState } from '../src/state.js';
import { stepWalker } from '../src/rules/step.js';
import { hook, raycastTerrain } from '../src/rules/hook.js';
const dt = 1 / 60;
const defaults = () => Object.fromEntries(Object.entries(FEEL_SPEC).map(([k, s]) => [k, s.value]));
const feelOn = () => ({ ...defaults(), hookEnabled: 1 });
const feelOff = () => ({ ...defaults(), hookEnabled: 0 });
const act = (o = {}) => ({ raw: { x: 0, y: 0 }, move: { x: 0, z: 0, mag: 0 }, sprint: false, jump: false, grab: false, crouch: false, loadDelta: 0, reset: false, toPeak: false, lookDX: 0, lookDY: 0, hookFire: false, hookToggle: false, aim: null, ...o });
const at = (z, o = {}) => ({ ...createState(config), pos: { x: 0, y: terrain.heightAt(0, z), z }, ...o });
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

test('raycast down hits the approach surface', () => {
  const p = raycastTerrain({ x: 0, y: 160, z: -310 }, { x: 0, y: -1, z: 0 }, 60, terrain);
  assert.ok(p && Math.abs(p.y - terrain.heightAt(0, -310)) < 0.1, JSON.stringify(p));
});

test('raycast up misses', () => assert.equal(raycastTerrain({ x: 0, y: 160, z: -310 }, { x: 0, y: 1, z: 0 }, 60, terrain), null));

test('hook off is identical to no hook', () => {
  const s = at(-300), a = act({ hookFire: true, aim: { ox: 0, oy: 160, oz: -310, dx: 0, dy: -1, dz: 0 }, move: { x: 0, z: 1, mag: 1 } });
  assert.deepEqual(stepWalker(s, a, config, dt, terrain, feelOff()), stepWalker(s, a, config, dt, terrain));
});

test('fire and hit from OnFoot enters Hooked', () => {
  const L = Math.hypot(0.2, 0.98);
  const a = act({ hookFire: true, aim: { ox: 0, oy: terrain.heightAt(0, -300) + 1.5, oz: -300, dx: 0, dy: 0.2 / L, dz: 0.98 / L } });
  const s = hook(at(-300), a, feelOn(), dt, terrain, config);
  assert.equal(s.mode, 'Hooked'); assert.ok(s.hookAnchor.z > -296 && s.hookAnchor.z < -292, `anchor z ${s.hookAnchor.z}`);
});

test('pull closes distance fast and caps speed', () => {
  const anchor = { x: 0, y: terrain.heightAt(0, -270) + 1, z: -270 };
  let s = at(-300, { mode: 'Hooked', hookAnchor: anchor });
  s = { ...s, pos: { ...s.pos, y: s.pos.y + 0.1 } };
  const d0 = dist(s.pos, anchor);
  const a = act({ hookFire: true });
  for (let i = 0; i < 60 && s.mode === 'Hooked'; i++) s = hook(s, a, feelOn(), dt, terrain, config);
  assert.ok(d0 - dist(s.pos, anchor) > 10, `closed ${d0 - dist(s.pos, anchor)}`);
  let t = at(-300, { mode: 'Hooked', hookAnchor: { x: 0, y: 900, z: -300 } }), vmax = 0;
  for (let i = 0; i < 300; i++) { t = hook(t, a, feelOn(), dt, terrain, config); vmax = Math.max(vmax, Math.hypot(t.vel.x, t.vel.y, t.vel.z)); }
  assert.ok(vmax <= 35 + 1e-9, `vmax ${vmax}`);
});

test('pull never goes under ground', () => {
  let s = at(-300, { mode: 'Hooked', hookAnchor: { x: 0, y: terrain.heightAt(0, -200), z: -200 } });
  const a = act({ hookFire: true });
  for (let i = 0; i < 600 && s.mode === 'Hooked'; i++) {
    s = hook(s, a, feelOn(), dt, terrain, config);
    assert.ok(s.pos.y >= terrain.heightAt(s.pos.x, s.pos.z) - 1e-6, `under at step ${i}`);
  }
});

test('release keeps velocity and flies', () => {
  const s = hook(at(-300, { mode: 'Hooked', hookAnchor: { x: 0, y: 200, z: -250 }, vel: { x: 0, y: 5, z: 20 } }), act(), feelOn(), dt, terrain, config);
  assert.equal(s.mode, 'InAir'); assert.deepEqual(s.vel, { x: 0, y: 5, z: 20 }); assert.equal(s.hookAnchor, null);
});

test('hook at own feet arrives, no NaN', () => {
  const y = terrain.heightAt(0, -680);
  let s = hook(at(-680), act({ hookFire: true, aim: { ox: 0, oy: y + 1.5, oz: -680, dx: 0, dy: -1, dz: 0 } }), feelOn(), dt, terrain, config);
  for (let i = 0; i < 5 && s && s.mode === 'Hooked'; i++) s = hook(s, act({ hookFire: true }), feelOn(), dt, terrain, config);
  assert.equal(s.mode, 'OnFoot'); assert.ok(Number.isFinite(s.pos.x + s.pos.y + s.pos.z));
});

test('switching hook off while Hooked drops to InAir', () => {
  const s = hook(at(-300, { mode: 'Hooked', hookAnchor: { x: 0, y: 200, z: -250 } }), act({ hookFire: true }), feelOff(), dt, terrain, config);
  assert.equal(s.mode, 'InAir');
});

test('hook launches the walker into the air (owner 2026-11-12)', () => {
  const y0 = terrain.heightAt(0, -680);
  const eye = { x: 0, y: y0 + 1.5, z: -680 };
  const tgt = { x: 0, y: terrain.heightAt(0, -640), z: -640 };
  const L = Math.hypot(tgt.x - eye.x, tgt.y - eye.y, tgt.z - eye.z);
  const aim = { ox: eye.x, oy: eye.y, oz: eye.z, dx: (tgt.x - eye.x) / L, dy: (tgt.y - eye.y) / L, dz: (tgt.z - eye.z) / L };
  let s = hook(at(-680), act({ hookFire: true, aim }), feelOn(), dt, terrain, config);
  assert.equal(s.mode, 'Hooked');
  let maxClear = 0;
  for (let i = 0; i < 30 && s.mode === 'Hooked'; i++) {
    s = hook(s, act({ hookFire: true }), feelOn(), dt, terrain, config);
    maxClear = Math.max(maxClear, s.pos.y - terrain.heightAt(s.pos.x, s.pos.z));
  }
  assert.ok(maxClear > 1.5, `max clearance ${maxClear}`);
});
