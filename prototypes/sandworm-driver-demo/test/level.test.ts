import { describe, expect, it } from 'vitest';
import { createInitialState } from '../src/sim/state.ts';
import { apocalypseSpeedAt } from '../src/sim/tick.ts';
import { SIM_CONFIG } from '../src/sim/config.ts';

describe('long level and storm phases', () => {
  it('level is 6000 m with the 600 m content block repeated 10 times', () => {
    const s = createInitialState();
    expect(SIM_CONFIG.goalX).toBe(6000);
    expect(s.obstacles.length).toBe(40);
    expect(s.spawners.length).toBe(70);
    expect(s.prey.length).toBe(40);
    expect(new Set([...s.obstacles, ...s.spawners, ...s.prey].map((e) => e.id)).size).toBe(150);
    expect(Math.max(...s.obstacles.map((o) => o.x))).toBe(5400 + 470);
  });

  it('storm is slow early, medium mid-run, fast near the end', () => {
    expect(apocalypseSpeedAt(0)).toBe(9);
    expect(apocalypseSpeedAt(2399)).toBe(9);
    expect(apocalypseSpeedAt(2400)).toBe(13.5);
    expect(apocalypseSpeedAt(4499)).toBe(13.5);
    expect(apocalypseSpeedAt(4500)).toBe(19);
    expect(apocalypseSpeedAt(-65)).toBe(9);
  });
});
