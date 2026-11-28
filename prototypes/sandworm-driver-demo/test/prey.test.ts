import { afterEach, describe, expect, it } from 'vitest';
import { createInitialState } from '../src/sim/state.ts';
import { SIM_CONFIG, resetSimConfig } from '../src/sim/config.ts';
import { bitePrey, playerBodyPoints, preyBodyPoints, stepLatch, stepPrey } from '../src/sim/prey.ts';
import { createStraightTrail } from '../src/sim/trail.ts';
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

function latchAt(j: number) {
  const s = createInitialState();
  const p = s.prey[0]!;
  p.mode = 'latched'; p.latchSegment = j; p.latchTimer = 4;
  p.wigglePhase = Math.PI / 2; p.latchMomentumStart = 80;
  s.worm.latchedPreyId = p.id;
  s.worm.momentum = 80; s.worm.heading = 0;
  return { s, p };
}

describe('latch', () => {
  it('tail latch turns more, head latch drains more', () => {
    const tail = latchAt(7); stepLatch(tail.s, idle, 0.05);
    const head = latchAt(1); stepLatch(head.s, idle, 0.05);
    expect(tail.s.worm.heading).toBeCloseTo(0.0525, 6);
    expect(head.s.worm.heading).toBeCloseTo(0.0075, 6);
    expect(80 - head.s.worm.momentum).toBeCloseTo(0.84375, 6);
    expect(80 - tail.s.worm.momentum).toBeCloseTo(0.50625, 6);
  });

  it('heading push capped on dt spike', () => {
    SIM_CONFIG.latchTurnGain = 1000;
    const { s } = latchAt(7);
    stepLatch(s, idle, 0.25);
    expect(Math.abs(s.worm.heading)).toBeLessThanOrEqual(5 * 0.25 + 1e-9);
  });

  it('latch ends on timer', () => {
    const { s, p } = latchAt(4);
    p.latchTimer = 0.01;
    stepLatch(s, idle, 0.05);
    expect(p.mode).toBe('recover');
    expect(s.worm.latchedPreyId).toBeNull();
  });

  it('hard brake shakes it off', () => {
    const { s, p } = latchAt(4);
    s.worm.momentum = 54;
    stepLatch(s, { ...idle, throttle: -1 }, 1 / 60);
    expect(p.mode).toBe('recover');
  });

  it('rock slam shakes it off', () => {
    const { s, p } = latchAt(3);
    const rock = s.obstacles[0]!;
    s.worm.x = rock.x + 3 * SIM_CONFIG.segmentSpacing; s.worm.y = rock.y;
    s.worm.trail = createStraightTrail(s.worm.x, s.worm.y, 0, 20, SIM_CONFIG.trailSampleSpacing);
    stepLatch(s, idle, 1 / 60);
    expect(p.mode).toBe('recover');
  });

  it('second prey cannot latch while one is latched', () => {
    const { s } = latchAt(4);
    const b = s.prey[1]!;
    const seg2 = playerBodyPoints(s)[2]!;
    b.mode = 'lunge'; b.modeTimer = 1; b.x = seg2.x; b.y = seg2.y;
    stepPrey(s, 1 / 60);
    expect(b.mode).not.toBe('latched');
    expect(s.worm.latchedPreyId).toBe(s.prey[0]!.id);
  });

  it('latch never touches health', () => {
    const { s } = latchAt(7);
    s.worm.health = 50;
    SIM_CONFIG.regenPerPoint = 0;
    for (let i = 0; i < 200; i++) stepLatch(s, idle, 1 / 60);
    expect(s.worm.health).toBe(50);
  });
});

describe('latch segment floor', () => {
  it('never latches at segment 1, where our head would auto-bite it', () => {
    const s = createInitialState();
    const p = s.prey[0]!;
    const seg1 = playerBodyPoints(s)[1]!;
    SIM_CONFIG.preySpeed = 0;
    p.mode = 'lunge'; p.modeTimer = 1; p.x = seg1.x; p.y = seg1.y;
    stepPrey(s, 1 / 60);
    expect(p.latchSegment).not.toBe(1);
    bitePrey(s);
    expect(p.alive).toBe(true); // latched prey sits beyond head bite reach
  });

  it('latches at segment 2 or later', () => {
    const s = createInitialState();
    const p = s.prey[0]!;
    const seg3 = playerBodyPoints(s)[3]!;
    SIM_CONFIG.preySpeed = 0;
    p.mode = 'lunge'; p.modeTimer = 1; p.x = seg3.x; p.y = seg3.y;
    stepPrey(s, 1 / 60);
    expect(p.mode).toBe('latched');
    expect(p.latchSegment).toBeGreaterThanOrEqual(2);
  });
});

describe('aggressive prey', () => {
  function sideOn(aggressive: boolean, dy: number) {
    const s = createInitialState();
    const p = s.prey[0]!;
    p.aggressive = aggressive;
    s.worm.x = p.x; s.worm.y = p.y + dy; s.worm.heading = 0; // prey straight above or below: side-on
    return { s, p };
  }

  it('stalks toward our body when side-on within stalkRadius', () => {
    const { s, p } = sideOn(true, -15); // worm underground below prey
    const nearBody = () => Math.min(...playerBodyPoints(s).slice(2).map((b) => Math.hypot(p.x - b.x, p.y - b.y)));
    const d0 = nearBody();
    stepPrey(s, 1 / 60);
    expect(p.mode).toBe('stalk');
    for (let i = 0; i < 60; i++) stepPrey(s, 1 / 60);
    expect(['stalk', 'lunge', 'latched']).toContain(p.mode);
    expect(nearBody()).toBeLessThan(d0 - 5);
  });

  it('flees instead when we face it', () => {
    const s = createInitialState();
    const p = s.prey[0]!;
    p.aggressive = true;
    s.worm.x = p.x - 20; s.worm.y = p.y; s.worm.heading = 0; // nose on
    stepPrey(s, 1 / 60);
    expect(p.mode).toBe('flee');
  });

  it('timid prey never stalks', () => {
    const { s, p } = sideOn(false, 20);
    stepPrey(s, 1 / 60);
    expect(p.mode).toBe('flee');
  });

  it('does not stalk while another prey is latched', () => {
    const { s, p } = sideOn(true, 20);
    s.worm.latchedPreyId = s.prey[1]!.id;
    stepPrey(s, 1 / 60);
    expect(p.mode).not.toBe('stalk');
  });

  it('every second prey spawns aggressive by default', () => {
    const s = createInitialState();
    expect(s.prey.slice(0, 4).map((q) => q.aggressive)).toEqual([true, false, true, false]);
  });
});

describe('latched prey pose', () => {
  it('body sticks out from our body instead of lying on it, and thrashes', () => {
    const s = createInitialState();
    const p = s.prey[0]!;
    s.worm.x = 100; s.worm.y = -14; s.worm.heading = 0;
    s.worm.trail = createStraightTrail(100, -14, 0, 20, SIM_CONFIG.trailSampleSpacing);
    const seg3 = playerBodyPoints(s)[3]!;
    p.x = seg3.x; p.y = seg3.y + 2; p.mode = 'lunge'; p.modeTimer = 1; // coming from above
    SIM_CONFIG.preySpeed = 0;
    stepPrey(s, 1 / 60);
    expect(p.mode).toBe('latched');
    const angles: number[] = [];
    for (let i = 0; i < 30; i++) {
      stepLatch(s, idle, 1 / 60);
      const tail = preyBodyPoints(p)[4]!;
      const gap = Math.min(...playerBodyPoints(s).map((b) => Math.hypot(tail.x - b.x, tail.y - b.y)));
      expect(gap).toBeGreaterThan(5);           // tail stands well clear of our body
      expect(tail.y).toBeGreaterThan(p.y);      // on the side it came from (above)
      angles.push(p.heading);
    }
    expect(Math.max(...angles) - Math.min(...angles)).toBeGreaterThan(0.6); // visible thrash
  });
});

describe('latched prey is a flexible chain', () => {
  it('links keep spacing but bend like a chain, not a rigid stick', () => {
    const s = createInitialState();
    const p = s.prey[0]!;
    s.worm.x = 100; s.worm.y = -14; s.worm.heading = 0;
    s.worm.trail = createStraightTrail(100, -14, 0, 20, SIM_CONFIG.trailSampleSpacing);
    const seg3 = playerBodyPoints(s)[3]!;
    p.x = seg3.x; p.y = seg3.y + 2; p.mode = 'lunge'; p.modeTimer = 1;
    SIM_CONFIG.preySpeed = 0;
    stepPrey(s, 1 / 60);
    let maxBend = 0;
    for (let i = 0; i < 60; i++) {
      stepLatch(s, idle, 1 / 60);
      const b = preyBodyPoints(p);
      for (let k = 1; k < b.length; k++) {
        expect(Math.hypot(b[k]!.x - b[k - 1]!.x, b[k]!.y - b[k - 1]!.y)).toBeCloseTo(SIM_CONFIG.segmentSpacing, 1);
      }
      const a1 = Math.atan2(b[1]!.y - b[0]!.y, b[1]!.x - b[0]!.x);
      const a4 = Math.atan2(b[4]!.y - b[3]!.y, b[4]!.x - b[3]!.x);
      maxBend = Math.max(maxBend, Math.abs(Math.atan2(Math.sin(a4 - a1), Math.cos(a4 - a1))));
    }
    expect(maxBend).toBeGreaterThan(0.3);
  });
});

describe('latched prey head is buried in our body', () => {
  function latched() {
    const s = createInitialState();
    const p = s.prey[0]!;
    p.mode = 'latched'; p.latchSegment = 3; p.latchTimer = 4;
    s.worm.latchedPreyId = p.id;
    stepLatch(s, idle, 1 / 60); // builds the chain
    return { s, p };
  }

  it('latched prey with only its head left cannot be eaten', () => {
    const { s, p } = latched();
    p.sections = 1;
    const head = preyBodyPoints(p)[0]!;
    s.worm.x = head.x; s.worm.y = head.y;
    bitePrey(s);
    expect(p.alive).toBe(true);
    expect(s.interior.mouthQueue).toBe(0);
    expect(s.worm.latchedPreyId).toBe(p.id);
  });

  it('cannot head-bite a latched prey', () => {
    const { s, p } = latched();
    const head = preyBodyPoints(p)[0]!;
    s.worm.x = head.x; s.worm.y = head.y;
    bitePrey(s);
    expect(p.alive).toBe(true); // never eaten whole
    // Our head here also touches link 1 (2.2 m out, inside 3 m reach): that is a body bite, at most 1 section.
    expect(s.interior.mouthQueue).toBeLessThanOrEqual(1);
  });

  it('can still bite its sticking-out body for one section', () => {
    const { s, p } = latched();
    const tail = preyBodyPoints(p)[4]!;
    s.worm.x = tail.x; s.worm.y = tail.y;
    bitePrey(s);
    expect(p.sections).toBe(4);
    expect(s.interior.mouthQueue).toBe(1);
    expect(s.worm.latchedPreyId).toBeNull();
  });
});
