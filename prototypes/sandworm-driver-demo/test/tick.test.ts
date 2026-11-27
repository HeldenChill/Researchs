import { describe, expect, it } from 'vitest';
import { createInitialState } from '../src/sim/state.ts';
import { stepSim } from '../src/sim/tick.ts';
import { SIM_CONFIG } from '../src/sim/config.ts';

describe('stepSim & boundary (Ω)', () => {
  it('switches heart preset when requested', () => {
    const s = createInitialState();
    stepSim(s, { throttle: 0, steer: 0, boost: false, ping: false, preset: 'bite' }, 0.05);
    expect(s.worm.preset).toBe('bite');
    expect(s.worm.heart.b).toBe(4);
  });

  it('creates interior breach on heavy shakeImpulse and drains health', () => {
    const s = createInitialState();
    s.worm.y = 0.1;
    s.worm.vy = -25;
    stepSim(s, { throttle: 0, steer: 0, boost: false, ping: false, preset: null }, 0.05);
    expect(s.interior.breaches).toBeGreaterThanOrEqual(1);
    expect(s.worm.health).toBeLessThan(SIM_CONFIG.maxHealth);
  });

  it('wins when worm reaches goalX and loses when apocalypse catches up', () => {
    const winState = createInitialState();
    winState.worm.x = SIM_CONFIG.goalX;
    stepSim(winState, { throttle: 1, steer: 0, boost: false, ping: false, preset: null }, 0.05);
    expect(winState.outcome).toBe('win');

    const loseState = createInitialState();
    loseState.apocalypseX = loseState.worm.x + 1;
    stepSim(loseState, { throttle: 0, steer: 0, boost: false, ping: false, preset: null }, 0.05);
    expect(loseState.outcome).toBe('loss_apocalypse');
  });
});
