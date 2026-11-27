import { describe, it, expect } from 'vitest';
import { Vector3 } from 'three';
import { makeWorldCollision, DEFAULT_SKIN } from '../src/collision';
import type { Ramp } from '../src/types';

describe('physics collision', () => {
  const box1: [number, number, number, number, number, number] = [0, 0, 0, 10, 1, 10];
  const bounds = { x: 20, z: 20, ceil: Infinity };

  it('landingY returns box top under the point', () => {
    const col = makeWorldCollision([box1], [], bounds);
    expect(col.landingY(5, 5, 10)).toBe(1);
  });

  it('project returns contact with upward normal for overlapping sphere', () => {
    const col = makeWorldCollision([box1], [], bounds);
    const contact = col.project(new Vector3(5, 1.2, 5), 0.3);
    expect(contact).not.toBeNull();
    if (contact) {
      expect(Math.abs(contact.normal.y - 1)).toBeLessThan(1e-6);
    }
  });

  it('sweep against wall detects entry side', () => {
    const wall: [number, number, number, number, number, number] = [5, 0, 0, 5.3, 2, 20];
    const col = makeWorldCollision([wall], [], bounds);
    const hit = col.sweep(new Vector3(0, 1, 10), new Vector3(10, 1, 10), 0.3);
    expect(hit).not.toBeNull();
    if (hit) {
      expect(hit.normal.x).toBeLessThan(-0.9);
    }
  });

  it('ramp landingY evaluates midpoint correctly', () => {
    const ramp: Ramp = {
      x0: 0,
      z0: 0,
      x1: 4,
      z1: 10,
      y0: 0,
      h0: 0,
      h1: 1,
      axis: 0,
      dir: 1,
      top: 1,
    };
    const col = makeWorldCollision([], [ramp], bounds);
    const y = col.landingY(2, 5, 10);
    expect(y).toBeGreaterThanOrEqual(0.49);
    expect(y).toBeLessThanOrEqual(0.51);
  });

  it('default skin is 0.002', () => {
    expect(DEFAULT_SKIN).toBe(0.002);
  });

  it('skin option keeps project results', () => {
    for (const col of [
      makeWorldCollision([box1], [], bounds),
      makeWorldCollision([box1], [], bounds, { skin: 0 }),
    ]) {
      const c1 = col.project(new Vector3(5, 1.29, 5), 0.3);
      expect(c1).not.toBeNull();
      if (c1) {
        expect(Math.abs(c1.normal.y - 1)).toBeLessThan(1e-6);
      }
      expect(col.project(new Vector3(5, 1.301, 5), 0.3)).toBeNull();
    }
  });
});
