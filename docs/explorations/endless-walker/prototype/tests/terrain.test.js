import { test } from 'node:test';
import assert from 'node:assert/strict';
import { heightAt, slopeDegAt, fieldAt, zoneAt } from '../src/terrain.js';

const near = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} not within ${tol} of ${b}`);

test('heights: summit, base, ledge', () => {
  near(heightAt(0, 0), 320, 0.01);
  near(heightAt(0, -680), 0, 0.01);
  near(heightAt(0, -82.5), 273.75, 0.3);
});

test('approach centre line is walkable (under 45)', () => {
  for (const [a, b] of [[-14, -70], [-100, -596]])
    for (let z = a; z >= b; z -= 0.5) assert.ok(slopeDegAt(0, z) < 45, `z ${z}: ${slopeDegAt(0, z)}`);
});

test('both cliff pitches steeper than grab limit 50', () => {
  assert.ok(slopeDegAt(0, -78) > 50);
  assert.ok(slopeDegAt(0, -87) > 50);
});

test('slide face centre line: walkable everywhere, 20 to 38 degrees on the face', () => {
  for (let z = 0; z <= 640; z += 0.5) assert.ok(slopeDegAt(0, z) < 45, `z ${z}`);
  for (let z = 40; z <= 580; z += 0.5) {
    const s = slopeDegAt(0, z);
    assert.ok(s > 19.5 && s < 38, `z ${z}: ${s}`);
  }
});

test('field values by zone', () => {
  assert.equal(zoneAt(0, 300), 'slide');
  assert.equal(zoneAt(0, -300), 'approach');
  assert.equal(zoneAt(0, -78), 'cliff');
  assert.equal(zoneAt(-60, 200), 'rock');
  const s = fieldAt(0, 300, 0), a = fieldAt(0, -300, 0), c = fieldAt(0, -78, Math.PI);
  assert.equal(s.grip, 0.12); assert.equal(s.softness, 0.2);
  assert.equal(a.grip, 0.18); // owner 2026-11-12, was 0.35 assert.equal(a.softness, 0.6);
  assert.equal(c.grip, 0.8);  assert.equal(c.softness, 0);
});

test('slopeAlong sign: facing +z on approach is uphill, on slide face is downhill', () => {
  assert.ok(fieldAt(0, -300, 0).slopeAlongDeg > 20);
  assert.ok(fieldAt(0, 300, 0).slopeAlongDeg < -20);
  assert.ok(Math.abs(fieldAt(0, -300, Math.PI / 2).slopeAlongDeg) < 8);
});
