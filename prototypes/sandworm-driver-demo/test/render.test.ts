import { describe, expect, it } from 'vitest';
import { stepsForFrame } from '@hk/loop';
import { createInitialState } from '../src/sim/state.ts';
import { stepSim } from '../src/sim/tick.ts';
import { WormVisual } from '../src/render/wormMesh.ts';
import { interpolatePose } from '../src/render/pose.ts';
import type { SimState } from '../src/sim/types.ts';

const STEP = 1 / 60;
const idle = { throttle: 0, steer: 0, boost: false, ping: false, preset: null };

function openField(): SimState {
  const s = createInitialState();
  s.obstacles = [];
  s.spawners = [];
  s.apocalypseX = -1e9;
  return s;
}

/** Mirrors the main loop: fixed sim steps, then render an interpolated pose. */
function runFrames(hz: number, seconds: number) {
  const s = openField();
  const v = new WormVisual();
  v.reset(s.worm);
  let acc = 0;
  let prev = { x: s.worm.x, y: s.worm.y, heading: s.worm.heading };
  const frames: Array<Array<{ x: number; y: number }>> = [];
  for (let i = 0; i < hz * seconds; i++) {
    const st = stepsForFrame(acc, 1 / hz, STEP, 5);
    acc = st.accumulator;
    for (let k = 0; k < st.steps; k++) {
      prev = { x: s.worm.x, y: s.worm.y, heading: s.worm.heading };
      stepSim(s, idle, STEP);
    }
    v.update(s.worm, interpolatePose(prev, s.worm, acc / STEP), 1 / hz);
    frames.push(v.segmentPositions());
  }
  return frames.slice(hz * 3); // skip speed ramp
}

describe('worm body smoothness', () => {
  for (const hz of [60, 144]) {
    it(`every segment moves every frame by a steady amount at ${hz} Hz`, () => {
      const frames = runFrames(hz, 6);
      for (const seg of [0, 1, 6, 11]) {
        const deltas = frames.slice(1).map((f, i) => f[seg]!.x - frames[i]![seg]!.x);
        const min = Math.min(...deltas);
        const max = Math.max(...deltas);
        expect(min).toBeGreaterThan(0);
        expect(max - min).toBeLessThan(max * 0.05);
      }
    });
  }

  it('keeps an even gap between neighbouring segments', () => {
    for (const f of runFrames(144, 5)) {
      const gaps = f.slice(1).map((p, i) => Math.hypot(f[i]!.x - p.x, f[i]!.y - p.y));
      expect(Math.max(...gaps) - Math.min(...gaps)).toBeLessThan(0.05);
    }
  });

  it('retracts along its own path when the head moves backward', () => {
    const s = openField();
    const v = new WormVisual();
    v.reset(s.worm);
    const pose = (x: number) => ({ x, y: -2, heading: 0 });
    for (let x = 0; x <= 40; x += 0.4) v.update(s.worm, pose(x), STEP);
    for (let x = 40; x >= 34; x -= 0.4) v.update(s.worm, pose(x), STEP);
    const p = v.segmentPositions();
    for (let i = 1; i < p.length; i++) expect(p[i]!.x).toBeLessThan(p[i - 1]!.x);
  });

  it('reset places the whole body behind the new head position', () => {
    const s = openField();
    const v = new WormVisual();
    v.reset(s.worm);
    v.update(s.worm, { x: 300, y: 5, heading: 0 }, STEP);
    v.reset(s.worm);
    for (const p of v.segmentPositions()) {
      expect(p.x).toBeLessThanOrEqual(s.worm.x + 1e-6);
      expect(p.x).toBeGreaterThan(s.worm.x - 30);
      expect(p.y).toBeCloseTo(s.worm.y, 5);
    }
  });
});

describe('impact squash and follow-through', () => {
  it('squashes the head, compresses the body in sequence, then recovers', () => {
    const s = openField();
    const v = new WormVisual();
    v.reset(s.worm);
    const pose = { x: s.worm.x, y: s.worm.y, heading: 0 };
    const gap = (a: number) => {
      const p = v.segmentPositions();
      return p[a]!.x - p[a + 1]!.x;
    };
    const restHead = gap(0);
    const restTail = gap(9);
    v.impact(1);
    v.update(s.worm, pose, STEP);
    expect(v.headScale().x).toBeLessThan(0.85);
    expect(v.headScale().y).toBeGreaterThan(1.1);
    expect(gap(0)).toBeLessThan(restHead * 0.85);
    expect(gap(9)).toBeCloseTo(restTail, 3); // the wave has not reached the tail yet
    for (let t = 0; t < 90; t++) v.update(s.worm, pose, STEP);
    expect(v.headScale().x).toBeCloseTo(1, 2);
    expect(gap(0)).toBeCloseTo(restHead, 2);
  });
});

describe('interpolatePose', () => {
  it('blends position and takes the short way round for angles', () => {
    const out = interpolatePose({ x: 0, y: 0, heading: 3.1 }, { x: 10, y: 4, heading: -3.1 }, 0.5);
    expect(out.x).toBeCloseTo(5);
    expect(out.y).toBeCloseTo(2);
    expect(Math.abs(out.heading)).toBeCloseTo(Math.PI, 2);
  });
});
