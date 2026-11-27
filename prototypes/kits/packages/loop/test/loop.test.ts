import { describe, it, expect } from 'vitest';
import { smoothing, lerp, stepsForFrame } from '../src/loop';

describe('loop', () => {
  it('smoothing is frame-rate independent', () => {
    expect(Math.abs((1 - (1 - smoothing(5, 1 / 60)) ** 2) - smoothing(5, 2 / 60))).toBeLessThan(1e-12);
  });

  it('lerp ends', () => {
    expect(lerp(2, 6, 0)).toBe(2);
    expect(lerp(2, 6, 1)).toBe(6);
    expect(lerp(2, 6, 0.25)).toBe(3);
  });

  it('one frame one step', () => {
    const r = stepsForFrame(0, 1 / 60);
    expect(r.steps).toBe(1);
    expect(r.accumulator).toBeLessThan(1e-9);
  });

  it('long frame capped', () => {
    expect(stepsForFrame(0, 0.5)).toEqual({ steps: 5, accumulator: 0 });
    expect(stepsForFrame(0, 1e9)).toEqual({ steps: 5, accumulator: 0 });
  });

  it('remainder kept', () => {
    const r = stepsForFrame(0.01, 0.01);
    expect(r.steps).toBe(1);
    expect(Math.abs(r.accumulator - 0.003333333333333334)).toBeLessThan(1e-6);
  });

  it('bad frame time', () => {
    expect(stepsForFrame(0.005, NaN)).toEqual({ steps: 0, accumulator: 0.005 });
    expect(stepsForFrame(0.005, -1)).toEqual({ steps: 0, accumulator: 0.005 });
    expect(stepsForFrame(0, Infinity)).toEqual({ steps: 0, accumulator: 0 });
  });
});
