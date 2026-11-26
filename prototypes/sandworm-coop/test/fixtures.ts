import type {Config} from '../src/types.ts';

// Small hand-checkable config used by the rule tests.
export function tiny(over: Partial<Config> = {}): Config {
  return {
    crewCount: 1, walkTicks: 2, acidCapacity: 1, neglectLimitTicks: 5, sealWorkTicks: 2, drainPerTick: 10,
    breachDamagePerTick: 7, hungerStart: 500, hungerMax: 2000, healthMax: 1000, timeLimitTicks: 1000,
    food: {id: 'meat', mass: 1, size: 1, digestTicks: 3, yieldHunger: 1000},
    carry: {heavyMassFrom: 2, heavyPercent: 25, lightPercent: 50},
    intake: {firstArrivalTick: 0, meanGapTicks: 100, jitterTicks: 0},
    ...over,
  };
}
