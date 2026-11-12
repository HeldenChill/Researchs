import { test } from 'node:test';
import assert from 'node:assert/strict';
import { config } from '../src/config.js';
import { createState } from '../src/state.js';
import { stamina, usableMax } from '../src/rules/stamina.js';
import { fieldAt } from '../src/terrain.js';

const dt = 1 / 60;
const act = (o = {}) => ({
  raw: { x: 0, y: 0 },
  move: { x: 0, z: 0, mag: 0 },
  sprint: false,
  jump: false,
  grab: false,
  crouch: false,
  loadDelta: 0,
  ...o
});
const loop = (s, a, f, sec) => {
  for (let i = 0; i < Math.round(sec / dt); i++) s = stamina(s, a, f, config, dt);
  return s;
};

test('usable stamina at load 0 and 60', () => {
  assert.equal(usableMax(0, config), 100);
  assert.equal(usableMax(60, config), 40);
});

test('raising load clamps stamina', () => {
  let s = { ...createState(config), load: 50, stamina: 50 };
  s = stamina(s, act({ loadDelta: 1 }), fieldAt(0, -680, 0), config, dt);
  assert.equal(s.load, 60);
  assert.equal(s.stamina, 40);
});

test('sprint drains 6 per second', () => {
  const s = loop({ ...createState(config), speed: 5.5 }, act({ sprint: true }), fieldAt(0, -680, 0), 1);
  assert.ok(Math.abs(s.stamina - 94) < 0.05, `${s.stamina}`);
});

test('regain waits 0.8 s then 12 per second standing', () => {
  const s = loop({ ...createState(config), stamina: 50 }, act(), fieldAt(0, -680, 0), 1.8);
  assert.ok(Math.abs(s.stamina - 62) < 0.3, `${s.stamina}`);
});

test('climbing drains 3 moving, 1 hanging', () => {
  const f = fieldAt(0, -87, Math.PI);
  const m = loop({ ...createState(config), mode: 'OnWall' }, act({ raw: { x: 0, y: 1 } }), f, 2);
  const h = loop({ ...createState(config), mode: 'OnWall' }, act(), f, 2);
  assert.ok(Math.abs(m.stamina - 94) < 0.05);
  assert.ok(Math.abs(h.stamina - 98) < 0.05);
});
