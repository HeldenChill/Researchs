import { describe, it, expect } from 'vitest';
import { Vector3 } from 'three';
import { particle, integrate, setVelocity, solveDistance } from '../src/constraints';

describe('physics constraints', () => {
  it('equal masses x0 and x2, length 1, zero compliance become x0.5 and x1.5', () => {
    const a = particle(new Vector3(0, 0, 0), 1);
    const b = particle(new Vector3(2, 0, 0), 1);
    solveDistance(a, b, 1, 1 / 120, 0, 0, false);
    expect(a.p.x).toBeCloseTo(0.5, 8);
    expect(b.p.x).toBeCloseTo(1.5, 8);
  });

  it('pinned a leaves a at 0 and moves b to 1', () => {
    const a = particle(new Vector3(0, 0, 0), 0); // mass 0 is pinned
    const b = particle(new Vector3(2, 0, 0), 1);
    solveDistance(a, b, 1, 1 / 120, 0, 0, false);
    expect(a.p.x).toBeCloseTo(0, 8);
    expect(b.p.x).toBeCloseTo(1, 8);
  });

  it('maxOnly at distance 0.5 with limit 1 changes nothing', () => {
    const a = particle(new Vector3(0, 0, 0), 1);
    const b = particle(new Vector3(0.5, 0, 0), 1);
    const lambda = solveDistance(a, b, 1, 1 / 120, 0, 0, true);
    expect(a.p.x).toBeCloseTo(0, 8);
    expect(b.p.x).toBeCloseTo(0.5, 8);
    expect(lambda).toBe(0);
  });

  it('coincident points remain finite without division by zero', () => {
    const a = particle(new Vector3(1, 2, 3), 1);
    const b = particle(new Vector3(1, 2, 3), 1);
    solveDistance(a, b, 1, 1 / 120, 0, 0, false);
    expect(Number.isFinite(a.p.x)).toBe(true);
    expect(Number.isFinite(b.p.x)).toBe(true);
  });

  it('pinned gravity does nothing', () => {
    const a = particle(new Vector3(0, 5, 0), 0);
    integrate(a, new Vector3(0, -9.81, 0), 1 / 120, 0);
    expect(a.p.y).toBeCloseTo(5, 8);
  });

  it('120 gravity ticks from rest give y within 0.05 of -4.905', () => {
    const p = particle(new Vector3(0, 0, 0), 1);
    const h = 1 / 120;
    const g = new Vector3(0, -9.81, 0);
    for (let i = 0; i < 120; i++) {
      integrate(p, g, h, 0);
    }
    // Theoretical d = 0.5 * 9.81 * 1^2 = 4.905, so y = -4.905
    expect(p.p.y).toBeCloseTo(-4.905, 1);
    expect(Math.abs(p.p.y - (-4.905))).toBeLessThan(0.05);
  });

  it('setVelocity then one acceleration-free/drag-free tick advances v*h within 1e-8', () => {
    const p = particle(new Vector3(1, 2, 3), 1);
    const v = new Vector3(2, -4, 6);
    const h = 1 / 120;
    setVelocity(p, v, h);
    integrate(p, new Vector3(0, 0, 0), h, 0);
    expect(p.p.x).toBeCloseTo(1 + 2 * h, 8);
    expect(p.p.y).toBeCloseTo(2 - 4 * h, 8);
    expect(p.p.z).toBeCloseTo(3 + 6 * h, 8);
  });

  it('load-transfer fixture: movable tip and bobber, taut displaced terminal; both move with correct direction and inverse-mass response; slack no push; release into slack releases stale multiplier', () => {
    // Isolated two-particle constraint fixture
    const pTip = particle(new Vector3(0, 0, 0), 2); // invMass = 0.5
    const pBobber = particle(new Vector3(1.5, 0, 0), 1); // invMass = 1.0
    const h = 1 / 120;
    const length = 1.0;

    // Taut displaced terminal: distance is 1.5, length is 1.0. Error C = 0.5.
    // Total invMass = 1.5. Tip should move +x, Bobber should move -x.
    // Tip move: 0.5 * (0.5 / 1.5) = +1/6 = +0.16666667 -> x = 0.16666667
    // Bobber move: -0.5 * (1.0 / 1.5) = -1/3 = -0.33333333 -> x = 1.16666667
    let lambda = 0;
    lambda = solveDistance(pTip, pBobber, length, h, 0, lambda, true);

    expect(pTip.p.x).toBeCloseTo(1 / 6, 6);
    expect(pBobber.p.x).toBeCloseTo(1 + 1 / 6, 6);
    expect(pBobber.p.x - pTip.p.x).toBeCloseTo(length, 6);
    expect(lambda).toBeLessThan(0);

    // Slack fixture: distance is 0.5, length is 1.0. No compressive push.
    const pTipSlack = particle(new Vector3(0, 0, 0), 2);
    const pBobberSlack = particle(new Vector3(0.5, 0, 0), 1);
    const lambdaSlack = solveDistance(pTipSlack, pBobberSlack, length, h, 0, 0, true);
    expect(pTipSlack.p.x).toBe(0);
    expect(pBobberSlack.p.x).toBe(0.5);
    expect(lambdaSlack).toBe(0);

    // Seed nonzero multiplier then release into slack and confirm stale tension is released
    // Suppose lambda was -50 (in tension). In next step/solve, particles are now slack: dist = 0.8, length = 1.0.
    const lambdaReleased = solveDistance(pTipSlack, pBobberSlack, length, h, 0, -50, true);
    expect(lambdaReleased).toBe(0);
  });
});
