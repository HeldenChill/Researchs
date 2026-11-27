import { describe, expect, it } from 'vitest';
import { createInitialState } from '../src/sim/state.ts';
import { SIM_CONFIG } from '../src/sim/config.ts';

describe('createInitialState', () => {
  it('initializes worm, heart points, and world entities deterministically', () => {
    const s1 = createInitialState();
    const s2 = createInitialState();

    expect(s1).toEqual(s2);
    expect(s1.worm.x).toBe(0);
    expect(s1.worm.health).toBe(SIM_CONFIG.maxHealth);
    expect(s1.worm.hunger).toBe(SIM_CONFIG.maxHunger);
    expect(s1.worm.heart.s + s1.worm.heart.r + s1.worm.heart.b).toBe(SIM_CONFIG.heartPoints);
    expect(s1.obstacles.length).toBeGreaterThan(0);
    expect(s1.spawners.length).toBeGreaterThan(0);
    expect(s1.outcome).toBe('playing');
  });
});
