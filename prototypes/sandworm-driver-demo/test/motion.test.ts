import { describe, expect, it } from 'vitest';
import { createInitialState } from '../src/sim/state.ts';
import { stepMotion } from '../src/sim/motion.ts';

describe('stepMotion (O2 + O3)', () => {
  it('accelerates forward with throttle and updates momentum', () => {
    const s = createInitialState();
    s.worm.vx = 5;
    stepMotion(s, { throttle: 1, steer: 0, boost: false, ping: false, preset: null }, 0.1);
    expect(s.worm.vx).toBeGreaterThan(5);
    expect(s.worm.x).toBeGreaterThan(0);
    expect(s.worm.momentum).toBeGreaterThan(20); // stored momentum builds under throttle
  });

  it('triggers shakeImpulse (O3) when slamming into ground from above', () => {
    const s = createInitialState();
    s.worm.y = 0.2;
    s.worm.vy = -20;
    stepMotion(s, { throttle: 0, steer: 0, boost: false, ping: false, preset: null }, 0.05);
    expect(s.worm.y).toBeLessThanOrEqual(0);
    expect(s.worm.shakeImpulse).toBeGreaterThan(0);
  });
});
