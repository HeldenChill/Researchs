import { describe, expect, it } from 'vitest';
import { createStraightTrail, pointAtArc, pushTrail, segmentPositions } from '../src/sim/trail.ts';

describe('path trail', () => {
  it('segments lie at i*spacing along a straight path', () => {
    const t = createStraightTrail(0, 0, 0, 0, 0.5);
    for (let x = 0.25; x <= 30; x += 0.25) pushTrail(t, x, 0, 0.5, 40);
    const segs = segmentPositions(t, 30, 0, 5, 2.2);
    [30, 27.8, 25.6, 23.4, 21.2].forEach((ex, i) => {
      expect(segs[i]!.x).toBeCloseTo(ex, 5);
      expect(segs[i]!.y).toBeCloseTo(0, 5);
    });
  });

  it('follows a bend', () => {
    // Path: along +x to (10,0), then straight down to (10,-10).
    const t = createStraightTrail(10, 0, 0, 10, 0.5);
    for (let y = -0.5; y >= -10; y -= 0.5) pushTrail(t, 10, y, 0.5, 40);
    const p = pointAtArc(t, 10, -10, 12);
    expect(p.x).toBeCloseTo(8, 5);
    expect(p.y).toBeCloseTo(0, 5);
  });

  it('clamps to oldest sample when trail is too short', () => {
    const t = createStraightTrail(0, 0, 0, 0, 0.5);
    const p = pointAtArc(t, 1, 0, 50);
    expect(p).toEqual({ x: 0, y: 0 });
    expect(Number.isNaN(p.x)).toBe(false);
  });

  it('drops samples beyond maxLength', () => {
    const t = createStraightTrail(0, 0, 0, 0, 0.5);
    for (let x = 0.5; x <= 100; x += 0.5) pushTrail(t, x, 0, 0.5, 20);
    expect(t.arc[t.arc.length - 1]!).toBeLessThanOrEqual(20.5);
  });
});
