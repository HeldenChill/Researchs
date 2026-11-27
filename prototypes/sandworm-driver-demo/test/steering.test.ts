import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialState } from '../src/sim/state.ts';
import { stepMotion } from '../src/sim/motion.ts';
import { stepBite } from '../src/sim/bite.ts';
import { SIM_CONFIG, resetSimConfig } from '../src/sim/config.ts';
import { VIEW_CONFIG } from '../src/render/viewConfig.ts';
import { cameraTargetX } from '../src/render/camera.ts';
import type { DriverInput, SimState } from '../src/sim/types.ts';

const STEP = 1 / 60;
const LEFT = 1; // A: counterclockwise
const RIGHT = -1; // D: clockwise
const input = (throttle: number, steer: number): DriverInput => ({ throttle, steer, boost: false, ping: false, preset: null });
const angleBetween = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
const travel = (s: SimState) => Math.atan2(s.worm.vy, s.worm.vx);
const speedOf = (s: SimState) => Math.hypot(s.worm.vx, s.worm.vy);

beforeEach(() => resetSimConfig());

function wormAt(y: number, heading = 0, speed = 20): SimState {
  const s = createInitialState();
  Object.assign(s.worm, { y, heading, vx: speed * Math.cos(heading), vy: speed * Math.sin(heading), momentum: 60 });
  return s;
}

/** Runs and returns the largest nose change in one step, in degrees. */
function run(s: SimState, seconds: number, i: DriverInput): number {
  let worst = 0;
  for (let t = 0; t < Math.round(seconds / STEP); t++) {
    const before = s.worm.heading;
    stepMotion(s, i, STEP);
    worst = Math.max(worst, (angleBetween(s.worm.heading, before) * 180) / Math.PI);
  }
  return worst;
}

describe('steering turns the head and the momentum direction together', () => {
  for (const [name, start] of [['right', 0], ['left', Math.PI]] as const) {
    it(`A turns counterclockwise and D clockwise while travelling ${name}`, () => {
      const a = wormAt(-14, start);
      const d = wormAt(-14, start);
      run(a, 0.3, input(0, LEFT));
      run(d, 0.3, input(0, RIGHT));
      const turned = (s: SimState) => Math.atan2(Math.sin(s.worm.heading - start), Math.cos(s.worm.heading - start));
      expect(turned(a)).toBeGreaterThan(0.35);
      expect(turned(d)).toBeLessThan(-0.35);
      expect(angleBetween(travel(a), a.worm.heading)).toBeLessThan(0.05);
      expect(angleBetween(travel(d), d.worm.heading)).toBeLessThan(0.05);
    });
  }

  it('a U-turn carries momentum round without any cost of its own', () => {
    SIM_CONFIG.momentumDigGain = 0;
    SIM_CONFIG.momentumDigClimbCost = 0;
    SIM_CONFIG.momentumDiveGain = 0; // the turn may leave the sand: switch off air gravity too
    SIM_CONFIG.momentumClimbCost = 0;
    const s = wormAt(-14);
    let lowest = 60;
    for (let t = 0; t < 600 && Math.cos(s.worm.heading) > -0.98; t++) {
      stepMotion(s, input(0, LEFT), STEP);
      lowest = Math.min(lowest, s.worm.momentum);
    }
    expect(s.worm.vx).toBeLessThan(-10);
    expect(lowest).toBeCloseTo(60, 5);
  });

  it('turns smoothly through a full circle', () => {
    const s = wormAt(-14);
    expect(run(s, 5, input(1, LEFT))).toBeLessThan(6);
  });

  it('keeps heading and momentum with no key on level sand', () => {
    const s = wormAt(-14, 2.8);
    SIM_CONFIG.momentumDigGain = 0;
    SIM_CONFIG.momentumDigClimbCost = 0;
    run(s, 0.5, input(0, 0));
    expect(angleBetween(s.worm.heading, 2.8)).toBeLessThan(0.02);
    expect(s.worm.momentum).toBeCloseTo(60, 5);
  });

  it('rotates head and travel in the air too', () => {
    const turned = wormAt(10, 0);
    const free = wormAt(10, 0);
    run(turned, 0.3, input(0, LEFT));
    run(free, 0.3, input(0, 0));
    expect(travel(turned)).toBeGreaterThan(travel(free) + 0.2);
  });
});

describe('W pushes, S brakes', () => {
  it('W builds momentum whichever way the head points, also while steering', () => {
    for (const heading of [0, Math.PI, -0.4]) {
      const s = wormAt(-8, heading);
      run(s, 0.25, input(1, LEFT));
      expect(s.worm.momentum, `heading ${heading}`).toBeGreaterThan(62);
    }
  });

  it('S slows and drains momentum but never turns the worm around', () => {
    const s = wormAt(-14, Math.PI);
    run(s, 2, input(-1, 0));
    expect(angleBetween(s.worm.heading, Math.PI)).toBeLessThan(0.02);
    expect(s.worm.vx).toBeLessThan(0);
    expect(speedOf(s)).toBeLessThan(12);
    expect(s.worm.momentum).toBeLessThan(5);
  });
});

describe('bottom of the map', () => {
  for (const [name, heading, into] of [['right', -1.2, RIGHT], ['left', Math.PI + 1.2, LEFT]] as const) {
    it(`levels out smoothly when steering into the bottom heading ${name}`, () => {
      const s = wormAt(-14, heading);
      const worst = run(s, 0.3, input(1, into));
      const later = run(s, 3, input(1, 0));
      expect(Math.max(worst, later)).toBeLessThan(6);
      expect(s.worm.y).toBeGreaterThanOrEqual(SIM_CONFIG.maxDepth);
      expect(Math.abs(s.worm.vx)).toBeGreaterThan(8);
    });
  }
});

describe('rocks from the other side', () => {
  const fromTheRight = () => {
    const s = createInitialState();
    s.spawners = [];
    s.obstacles = [s.obstacles.find((o) => o.id === 2)!];
    s.worm.heart = { s: 2, r: 0, b: 4 };
    Object.assign(s.worm, { x: 225, y: -1, vx: -18, vy: 0, heading: Math.PI, momentum: 20 });
    return s;
  };
  const drive = (s: SimState, seconds: number, i: DriverInput) => {
    for (let t = 0; t < Math.round(seconds / STEP); t++) {
      stepMotion(s, i, STEP);
      stepBite(s, STEP);
    }
  };

  it('grinds through while holding W', () => {
    const s = fromTheRight();
    drive(s, 2, input(1, 0));
    expect(s.obstacles[0]!.broken).toBe(true);
    expect(s.worm.x).toBeLessThan(215);
  });

  it('lets go with S and does not bite again while braking', () => {
    const s = fromTheRight();
    drive(s, 0.8, input(1, 0));
    expect(s.worm.activeObstacleId).toBe(2);
    drive(s, 1.5, input(-1, 0));
    expect(s.worm.activeObstacleId).toBeNull();
    expect(s.obstacles[0]!.broken).toBe(false);
  });
});

describe('camera', () => {
  it('looks ahead in whichever direction the worm faces', () => {
    expect(cameraTargetX(100, 0)).toBeCloseTo(100 + VIEW_CONFIG.cameraLead);
    expect(cameraTargetX(100, Math.PI)).toBeCloseTo(100 - VIEW_CONFIG.cameraLead);
    expect(cameraTargetX(100, Math.PI / 2)).toBeCloseTo(100);
  });
});
