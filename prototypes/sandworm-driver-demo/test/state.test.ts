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

  it('spawns preyCount prey with full bodies and a player trail', () => {
    const s = createInitialState();
    expect(s.prey.slice(0, 4).map((p) => p.id)).toEqual([201, 202, 203, 204]); // first 600 m block; level repeats it
    for (const p of s.prey) {
      expect(p.sections).toBe(5);
      expect(p.alive).toBe(true);
      expect(p.y).toBeGreaterThanOrEqual(-28);
      expect(p.y).toBeLessThanOrEqual(0);
      expect(p.trail.arc[p.trail.arc.length - 1]!).toBeGreaterThanOrEqual(4 * 2.2);
    }
    expect(s.worm.latchedPreyId).toBeNull();
    expect(s.worm.trail.pts[0]).toEqual({ x: 0, y: -2 });
    expect(s.interior.preySections).toBe(0);
  });
});
