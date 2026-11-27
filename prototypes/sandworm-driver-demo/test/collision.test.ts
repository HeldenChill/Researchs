import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialState } from '../src/sim/state.ts';
import { stepMotion } from '../src/sim/motion.ts';
import { stepBite } from '../src/sim/bite.ts';
import { SIM_CONFIG, resetSimConfig } from '../src/sim/config.ts';
import type { DriverInput, ImpactKind, SimState } from '../src/sim/types.ts';

const STEP = 1 / 60;
const input = (over: Partial<DriverInput> = {}): DriverInput => ({
  throttle: 0, steer: 0, boost: false, ping: false, preset: null, ...over,
});

beforeEach(() => resetSimConfig());

/** One Tier 2 rock at (215, -1), worm 10 m in front of it. */
function facingRock(bite: number, speed: number, momentum: number): SimState {
  const s = createInitialState();
  s.spawners = [];
  s.obstacles = [s.obstacles.find((o) => o.id === 2)!];
  s.worm.heart = { s: 2, r: 4 - bite < 0 ? 0 : 4 - bite, b: bite };
  s.worm.x = 205;
  s.worm.y = -1;
  s.worm.vx = speed;
  s.worm.momentum = momentum;
  return s;
}

function drive(s: SimState, seconds: number, i: DriverInput) {
  const log = { maxJump: 0, maxNose: 0, kinds: [] as ImpactKind[], shakes: 0, xs: [] as number[] };
  let seq = s.worm.impact.seq;
  for (let t = 0; t < Math.round(seconds / STEP); t++) {
    const bx = s.worm.x;
    const by = s.worm.y;
    stepMotion(s, i, STEP);
    stepBite(s, STEP);
    log.maxJump = Math.max(log.maxJump, Math.hypot(s.worm.x - bx, s.worm.y - by));
    log.maxNose = Math.max(log.maxNose, Math.abs(s.worm.heading));
    if (s.worm.shakeImpulse > 0) log.shakes++;
    if (s.worm.impact.seq !== seq) { log.kinds.push(s.worm.impact.kind); seq = s.worm.impact.seq; }
    log.xs.push(s.worm.x);
  }
  return log;
}

describe('bite too weak', () => {
  it('hits hard once, then rests against the rock instead of bouncing forever', () => {
    const s = facingRock(2, 25, 80);
    const log = drive(s, 4, input({ throttle: 1 }));
    expect(log.kinds.filter((k) => k === 'hit')).toHaveLength(1);
    expect(log.shakes).toBe(1);
    expect(log.maxJump).toBeLessThan(0.7);
    const tail = log.xs.slice(-60);
    expect(Math.max(...tail) - Math.min(...tail)).toBeLessThan(0.3);
    expect(s.worm.blocked).toBe(true);
  });

  it('recoils backward, keeps the nose facing forward and loses most momentum', () => {
    const s = facingRock(2, 25, 80);
    const log = drive(s, 0.7, input({ throttle: 1 }));
    expect(Math.min(...log.xs.slice(25))).toBeLessThan(Math.max(...log.xs) - 0.5);
    expect(log.maxNose).toBeLessThan(0.1);
    expect(s.worm.momentum).toBeLessThan(50);
  });

  it('a slow touch does not shake the crew', () => {
    const s = facingRock(2, 8, 0);
    s.worm.x = 209.1; // just short of contact, so it really arrives slowly
    const log = drive(s, 1.5, input());
    expect(log.shakes).toBe(0);
  });

  it('lets the player steer around the rock after the hit', () => {
    const s = facingRock(2, 25, 80);
    drive(s, 1, input({ throttle: 1 }));
    drive(s, 0.45, input({ throttle: 1, steer: -1 }));
    drive(s, 4, input({ throttle: 1 }));
    expect(s.worm.x).toBeGreaterThan(215 + 6);
    expect(s.obstacles[0]!.broken).toBe(false);
  });
});

describe('bite ok, momentum too low (gnaw)', () => {
  it('sinks into the rock steadily, without freezing or flipping the nose', () => {
    const s = facingRock(4, 18, 20);
    s.worm.vy = -0.3;
    const log = drive(s, 0.9, input({ throttle: 1 }));
    expect(log.kinds[0]).toBe('gnaw');
    expect(s.obstacles[0]!.broken).toBe(false);
    expect(s.worm.gnawProgress).toBeGreaterThan(0.2);
    const during = log.xs.slice(-20);
    for (let n = 1; n < during.length; n++) expect(during[n]!).toBeGreaterThan(during[n - 1]!);
    expect(log.maxNose).toBeLessThan(0.15);
  });

  it('bursts through with forward speed when the gnaw finishes', () => {
    const s = facingRock(4, 18, 20);
    const log = drive(s, 2, input({ throttle: 1 }));
    expect(log.kinds).toContain('break');
    expect(s.obstacles[0]!.broken).toBe(true);
    expect(s.worm.vx).toBeGreaterThan(10);
  });

  it('gnaws faster with more momentum', () => {
    const time = (momentum: number) => {
      const s = facingRock(4, 18, momentum);
      for (let t = 0; t < 600; t++) {
        stepMotion(s, input(), STEP);
        stepBite(s, STEP);
        if (s.obstacles[0]!.broken) return t;
      }
      return Infinity;
    };
    expect(time(55)).toBeLessThan(time(5));
  });

  it('lets go when the player brakes', () => {
    const s = facingRock(4, 18, 20);
    drive(s, 0.8, input({ throttle: 1 }));
    expect(s.worm.activeObstacleId).toBe(2);
    drive(s, 0.8, input({ throttle: -1 }));
    expect(s.worm.activeObstacleId).toBeNull();
    expect(s.obstacles[0]!.broken).toBe(false);
  });

  it('stops grinding if the heart is switched to a bite that is too weak', () => {
    const s = facingRock(4, 18, 20);
    drive(s, 0.6, input({ throttle: 1 }));
    expect(s.worm.activeObstacleId).toBe(2);
    s.worm.heart = { s: 4, r: 1, b: 1 };
    const log = drive(s, 2, input({ throttle: 1 }));
    expect(s.obstacles[0]!.broken).toBe(false);
    expect(s.worm.activeObstacleId).toBeNull();
    expect(log.maxJump).toBeLessThan(0.7);
  });

  it('smashes straight through at high momentum', () => {
    const s = facingRock(4, 25, SIM_CONFIG.momentumMax);
    const log = drive(s, 1, input({ throttle: 1 }));
    expect(log.kinds).toEqual(['break']);
    expect(s.worm.vx).toBeGreaterThan(18);
  });
});
