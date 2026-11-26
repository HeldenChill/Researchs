// Measures and run classes (spec section 7). They read states and events; they never write them.
import {outcome} from './boundary.ts';
import type {Policy} from './bots.ts';
import {initialState} from './state.ts';
import type {Thresholds} from './thresholds.ts';
import {step} from './tick.ts';
import type {Config, Outcome} from './types.ts';

export type RunClass = 'runaway' | 'idle' | 'bounded' | 'strained';
export type RunMetrics = {
  outcome: Outcome; ticks: number; idleShare: number; p95Load: number; growth: number;
  digested: number; breached: number; maxHunger: number;
};

export function p95(load: number[]): number {
  return [...load].sort((a, b) => a - b)[Math.ceil(0.95 * load.length) - 1];
}

export function growth(load: number[]): number {
  const third = Math.floor(load.length / 3);
  if (third === 0) return 0;
  const mean = (part: number[]) => part.reduce((sum, v) => sum + v, 0) / part.length;
  return mean(load.slice(-third)) - mean(load.slice(0, third));
}

export function runOne(c: Config, seed: number, policy: Policy, t: Thresholds): RunMetrics {
  let s = initialState(c, seed);
  const load: number[] = []; // floor items plus open breaches, sampled after each step
  const idle: number[] = []; // idle crew members on each step
  let digested = 0;
  let breached = 0;
  let maxHunger = s.hunger;
  while (outcome(s, c) === 'running') {
    const decision = policy(s, c);
    const result = step(s, c, decision.commands);
    s = result.state;
    load.push(s.items.filter(i => i.place.kind === 'floor').length + s.breaches.length);
    idle.push(decision.status.filter(x => x === 'idle').length);
    for (const e of result.events) {
      if (e.kind === 'digested') digested++;
      if (e.kind === 'breached') breached++;
    }
    maxHunger = Math.max(maxHunger, s.hunger);
  }
  // A run that ends before warm-up is measured from the start.
  const from = s.tick > t.warmupTicks ? t.warmupTicks : 0;
  const measured = load.slice(from);
  const idleTicks = idle.slice(from).reduce((sum, v) => sum + v, 0);
  return {
    outcome: outcome(s, c),
    ticks: s.tick,
    idleShare: idleTicks / (c.crewCount * measured.length),
    p95Load: p95(measured),
    growth: growth(measured),
    digested,
    breached,
    maxHunger,
  };
}

export function classify(m: RunMetrics, crew: number, t: Thresholds): RunClass {
  if (m.outcome === 'lost_health' || m.growth > t.runawayGrowth || m.p95Load > t.runawayLoadPerCrew * crew) return 'runaway';
  if (m.idleShare > t.idleAbove) return 'idle';
  const bounded = m.outcome === 'survived' && m.p95Load <= t.boundedLoadPerCrew * crew
    && m.growth <= t.boundedGrowth && m.idleShare >= t.idleBelowBounded;
  return bounded ? 'bounded' : 'strained';
}

export function pointClass(runs: RunClass[], t: Thresholds): RunClass | 'mixed' {
  for (const cls of ['runaway', 'idle', 'bounded', 'strained'] as const) {
    if (runs.filter(r => r === cls).length >= t.agree) return cls;
  }
  return 'mixed';
}
