import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialState } from '../src/sim/state.ts';
import { stepMotion } from '../src/sim/motion.ts';
import { SIM_CONFIG, resetSimConfig } from '../src/sim/config.ts';
import type { DriverInput, SimState } from '../src/sim/types.ts';

const STEP = 1 / 60;
const input = (over: Partial<DriverInput> = {}): DriverInput => ({
  throttle: 0, steer: 0, boost: false, ping: false, preset: null, ...over,
});

function run(s: SimState, seconds: number, i: DriverInput): void {
  for (let t = 0; t < Math.round(seconds / STEP); t++) stepMotion(s, i, STEP);
}

function secondsUntil(s: SimState, i: DriverInput, done: () => boolean): number {
  for (let t = 0; t < 60 * 30; t++) {
    stepMotion(s, i, STEP);
    if (done()) return (t + 1) * STEP;
  }
  return Infinity;
}

beforeEach(() => resetSimConfig());

describe('stored momentum', () => {
  it('takes 2.5 to 5 seconds of straight running to fill from empty', () => {
    const s = createInitialState();
    s.worm.momentum = 0;
    const t = secondsUntil(s, input({ throttle: 1 }), () => s.worm.momentum >= SIM_CONFIG.momentumMax - 0.5);
    expect(t).toBeGreaterThan(2.5);
    expect(t).toBeLessThan(5);
  });

  it('reaches the break threshold on a flat run with every preset, no boost', () => {
    const s = createInitialState();
    run(s, 6, input({ throttle: 1 }));
    expect(s.worm.momentum).toBeGreaterThanOrEqual(SIM_CONFIG.highMomentumThreshold);
  });

  it('raises speed as momentum builds', () => {
    const s = createInitialState();
    s.worm.momentum = 0;
    run(s, 1, input({ throttle: 1 }));
    const early = s.worm.vx;
    run(s, 4, input({ throttle: 1 }));
    expect(s.worm.vx).toBeGreaterThan(early * 1.3);
  });

  it('is not lost on flat ground when all keys are released', () => {
    const s = createInitialState();
    s.worm.y = -7;
    s.worm.momentum = 90;
    run(s, 5, input());
    expect(s.worm.momentum).toBeCloseTo(90, 5);
  });

  it('rewards a dive from the air with momentum and a speed burst', () => {
    const dive = createInitialState();
    dive.worm.y = 12;
    dive.worm.momentum = 20;
    const flat = createInitialState();
    flat.worm.momentum = 20;
    secondsUntil(dive, input(), () => dive.worm.y <= 0);
    run(flat, 1.1, input());
    expect(dive.worm.momentum).toBeGreaterThan(flat.worm.momentum + 20);
    const entry = Math.hypot(dive.worm.vx, dive.worm.vy);
    run(dive, 0.5, input());
    // burst fades gradually, it does not vanish within half a second
    expect(Math.hypot(dive.worm.vx, dive.worm.vy)).toBeGreaterThan(entry * 0.75);
  });

});

describe('only braking is against travel', () => {
  /** Momentum change per second in one step while travelling at the given angle, no gravity gain. */
  const oneStep = (travel: number, over: Partial<DriverInput>) => {
    const s = createInitialState();
    Object.assign(s.worm, { y: -14, momentum: 60, vx: 24 * Math.cos(travel), vy: 24 * Math.sin(travel), heading: travel });
    SIM_CONFIG.momentumDigGain = 0;
    SIM_CONFIG.momentumDigClimbCost = 0;
    stepMotion(s, input(over), STEP);
    return (s.worm.momentum - 60) / STEP;
  };

  it('drains at the full rate while braking, whichever way the worm travels', () => {
    for (const travel of [0, 0.6, -2, Math.PI]) {
      expect(oneStep(travel, { throttle: -1 })).toBeCloseTo(-SIM_CONFIG.momentumReverseDrain, 3);
    }
  });

  it('costs nothing to steer', () => {
    expect(oneStep(0, { steer: 1 })).toBeCloseTo(0, 3);
    expect(oneStep(2.5, { steer: -1 })).toBeCloseTo(0, 3);
  });

  it('builds while pushing forward, whichever way the worm travels', () => {
    for (const travel of [0, 0.6, -2, Math.PI]) {
      expect(oneStep(travel, { throttle: 1 })).toBeGreaterThan(20);
    }
  });

  it('also drains for an opposite input in the air', () => {
    const lose = (throttle: number) => {
      const s = createInitialState();
      s.worm.y = 10;
      s.worm.momentum = 60;
      SIM_CONFIG.momentumDiveGain = 0;
      SIM_CONFIG.momentumClimbCost = 0;
      stepMotion(s, input({ throttle }), STEP);
      return s.worm.momentum;
    };
    expect(lose(-1)).toBeLessThan(lose(0));
  });

  it('loses momentum climbing with no input, because of gravity alone', () => {
    const s = createInitialState();
    s.worm.y = -14;
    s.worm.momentum = 80;
    s.worm.vx = 20;
    s.worm.vy = 12;
    run(s, 0.3, input());
    expect(s.worm.y).toBeGreaterThan(-13);
    expect(s.worm.momentum).toBeLessThan(78);
  });
});

describe('gravity underground', () => {
  const dig = (y: number, heading: number) => {
    const s = createInitialState();
    Object.assign(s.worm, { y, heading, vx: 14 * Math.cos(heading), vy: 14 * Math.sin(heading), momentum: 40 });
    run(s, 0.8, input({ throttle: 1 }));
    return { momentum: s.worm.momentum, speed: Math.hypot(s.worm.vx, s.worm.vy) };
  };

  it('builds clearly more momentum and speed digging down than running flat', () => {
    const down = dig(-0.5, -0.8);
    const flat = dig(-14, 0);
    expect(down.momentum).toBeGreaterThan(flat.momentum + 10);
    expect(down.speed).toBeGreaterThan(flat.speed + 1);
  });

  it('builds less momentum and speed digging up than running flat', () => {
    const up = dig(-20, 0.8);
    const flat = dig(-14, 0);
    expect(up.momentum).toBeLessThan(flat.momentum - 5);
    expect(up.speed).toBeLessThan(flat.speed - 1);
  });

});

describe('smooth steering', () => {
  it('never turns the nose by more than 5 degrees in one step while crossing the surface', () => {
    const s = createInitialState();
    s.worm.y = -0.5;
    let prev = s.worm.heading;
    let worst = 0;
    for (let t = 0; t < 60 * 6; t++) {
      stepMotion(s, input({ throttle: 1, steer: t < 30 ? 1 : t < 180 ? 0 : t < 210 ? -1 : 0 }), STEP);
      worst = Math.max(worst, Math.abs(s.worm.heading - prev));
      prev = s.worm.heading;
    }
    expect(worst * 180 / Math.PI).toBeLessThan(5);
  });

  it('leaves the sand and comes back once, without porpoising, on an upward run', () => {
    const s = createInitialState();
    Object.assign(s.worm, { y: -4, heading: 0.7, vx: 22 * Math.cos(0.7), vy: 22 * Math.sin(0.7), momentum: 60 });
    let above = false;
    let crossings = 0;
    for (let t = 0; t < 60 * 3; t++) {
      stepMotion(s, input({ throttle: 1 }), STEP);
      if ((s.worm.y > 0) !== above) { crossings++; above = !above; }
    }
    expect(crossings).toBe(2);
  });
});
