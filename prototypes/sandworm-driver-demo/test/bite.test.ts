import { describe, expect, it } from 'vitest';
import { createInitialState } from '../src/sim/state.ts';
import { stepBite } from '../src/sim/bite.ts';

describe('stepBite (O4)', () => {
  it('bounces when bite points are below obstacle requiredBite', () => {
    const s = createInitialState();
    const t2 = s.obstacles.find((o) => o.tier === 2)!;
    s.worm.heart = { s: 4, r: 1, b: 1 };
    s.worm.x = t2.x - 1;
    s.worm.y = t2.y;
    s.worm.vx = 20;

    stepBite(s, 0.05);
    expect(t2.broken).toBe(false);
    expect(s.worm.vx).toBeLessThan(0);
    expect(s.worm.shakeImpulse).toBeGreaterThan(0);
  });

  it('breaks Tier 2 obstacle instantly when bite >= required and momentum is high', () => {
    const s = createInitialState();
    const t2 = s.obstacles.find((o) => o.tier === 2)!;
    s.worm.heart = { s: 1, r: 1, b: 4 };
    s.worm.x = t2.x - 1;
    s.worm.y = t2.y;
    s.worm.momentum = 85; // momentum is 0..100, break threshold 70

    stepBite(s, 0.05);
    expect(t2.broken).toBe(true);
  });

  it('consumes touched spawner and adds item to interior mouthQueue', () => {
    const s = createInitialState();
    const sp = s.spawners[0]!;
    s.worm.x = sp.x;
    s.worm.y = sp.y;

    stepBite(s, 0.05);
    expect(sp.eaten).toBe(true);
    expect(s.interior.mouthQueue).toBe(1);
  });
});
