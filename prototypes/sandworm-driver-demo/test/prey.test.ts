import { afterEach, describe, expect, it } from 'vitest';
import { createInitialState } from '../src/sim/state.ts';
import { SIM_CONFIG, resetSimConfig } from '../src/sim/config.ts';
import { bitePrey, preyBodyPoints, stepPrey } from '../src/sim/prey.ts';
import { stepInteriorAndBody } from '../src/sim/interior.ts';

const idle = { throttle: 0, steer: 0, boost: false, ping: false, preset: null };
afterEach(() => resetSimConfig());

describe('prey bite', () => {
  it('head bite eats prey whole', () => {
    const s = createInitialState();
    const p = s.prey[0]!;
    s.worm.x = p.x; s.worm.y = p.y;
    bitePrey(s);
    expect(p.alive).toBe(false);
    expect(s.interior.mouthQueue).toBe(5);
    expect(s.interior.preySections).toBe(5);
  });

  it('body bite eats one section and prey flees', () => {
    const s = createInitialState();
    const p = s.prey[0]!;
    const seg2 = preyBodyPoints(p)[2]!;
    s.worm.x = seg2.x; s.worm.y = seg2.y;
    bitePrey(s);
    expect(p.alive).toBe(true);
    expect(p.sections).toBe(4);
    expect(s.interior.mouthQueue).toBe(1);
    expect(p.mode).toBe('flee');
    expect(p.modeTimer).toBeCloseTo(1.0, 5);
  });

  it('one-section prey counts as head bite', () => {
    const s = createInitialState();
    const p = s.prey[0]!;
    p.sections = 1;
    s.worm.x = p.x; s.worm.y = p.y;
    bitePrey(s);
    expect(p.alive).toBe(false);
    expect(s.interior.mouthQueue).toBe(1);
  });

  it('prey section digests at preyYieldPerSection', () => {
    const s = createInitialState();
    s.interior.mouthQueue = 1;
    s.interior.preySections = 1;
    stepInteriorAndBody(s, idle, SIM_CONFIG.crewCarryTime);
    expect(s.interior.acidSlots[0]!.yieldHunger).toBe(15);
    expect(s.interior.preySections).toBe(0);
  });
});

describe('prey movement', () => {
  it('nose-on approach never lunges', () => {
    SIM_CONFIG.preySpeed = 0;
    const s = createInitialState();
    const p = s.prey[0]!;
    s.worm.x = p.x - 6; s.worm.y = p.y; s.worm.heading = 0;
    for (let i = 0; i < 30; i++) {
      stepPrey(s, 1 / 60);
      expect(p.mode).not.toBe('lunge');
    }
  });

  it('side-on approach within lungeRadius lunges', () => {
    const s = createInitialState();
    const p = s.prey[0]!;
    s.worm.x = p.x; s.worm.y = p.y + 6; s.worm.heading = 0;
    stepPrey(s, 1 / 60);
    expect(p.mode).toBe('lunge');
  });

  it('flee moves away from the player', () => {
    const s = createInitialState();
    const p = s.prey[0]!;
    s.worm.x = p.x - 20; s.worm.y = p.y; s.worm.heading = 0;
    const d0 = Math.hypot(p.x - s.worm.x, p.y - s.worm.y);
    for (let i = 0; i < 60; i++) stepPrey(s, 1 / 60);
    expect(p.mode).toBe('flee');
    expect(Math.hypot(p.x - s.worm.x, p.y - s.worm.y)).toBeGreaterThan(d0 + 5);
  });

  it('prey stays between floor and surface', () => {
    const s = createInitialState();
    const p = s.prey[0]!;
    p.y = -27.9; p.heading = -Math.PI / 2;
    for (let i = 0; i < 120; i++) stepPrey(s, 1 / 60);
    expect(p.y).toBeGreaterThanOrEqual(-28);
    expect(p.y).toBeLessThanOrEqual(0);
  });
});
