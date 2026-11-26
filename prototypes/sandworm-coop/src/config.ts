import type {Config} from './types.ts';

export const WALK_SPEED = 100;

// Ten ticks are one second. Hunger and health use a scale where 100000 is full.
export const PLACEHOLDER_CONFIG: Config = {
  crewCount: 3, // PLACEHOLDER
  walkTicks: 40, // PLACEHOLDER
  acidCapacity: 2, // PLACEHOLDER
  neglectLimitTicks: 300, // PLACEHOLDER
  sealWorkTicks: 30, // PLACEHOLDER
  drainPerTick: 100, // PLACEHOLDER
  breachDamagePerTick: 50, // PLACEHOLDER
  hungerStart: 70000, // PLACEHOLDER
  hungerMax: 100000, // PLACEHOLDER
  healthMax: 100000, // PLACEHOLDER
  timeLimitTicks: 6000, // PLACEHOLDER
  food: {
    id: 'meat',
    mass: 1, // PLACEHOLDER
    size: 1, // PLACEHOLDER
    digestTicks: 60, // PLACEHOLDER
    yieldHunger: 8000, // PLACEHOLDER
  },
  carry: {
    heavyMassFrom: 2, // PLACEHOLDER
    heavyPercent: 45, // SOURCE: solo heavy carry
    lightPercent: 70, // PLACEHOLDER
  },
  intake: {
    firstArrivalTick: 0, // PLACEHOLDER
    meanGapTicks: 60, // PLACEHOLDER
    jitterTicks: 20, // PLACEHOLDER
  },
};

export function validateConfig(c: Config): string[] {
  const errors: string[] = [];
  const check = (name: string, value: number, min: number) => {
    if (!Number.isInteger(value) || value < min) errors.push(`${name} must be an integer of at least ${min}`);
  };
  for (const name of ['crewCount', 'walkTicks', 'acidCapacity', 'neglectLimitTicks', 'sealWorkTicks', 'drainPerTick',
    'breachDamagePerTick', 'hungerStart', 'hungerMax', 'healthMax', 'timeLimitTicks'] as const) check(name, c[name], 1);
  for (const name of ['mass', 'size', 'digestTicks', 'yieldHunger'] as const) check(name, c.food[name], 1);
  for (const name of ['heavyMassFrom', 'heavyPercent', 'lightPercent'] as const) check(name, c.carry[name], 1);
  check('firstArrivalTick', c.intake.firstArrivalTick, 0);
  check('meanGapTicks', c.intake.meanGapTicks, 1);
  check('jitterTicks', c.intake.jitterTicks, 0);
  if (c.intake.jitterTicks >= c.intake.meanGapTicks) errors.push('jitterTicks must be below meanGapTicks');
  if (c.hungerStart > c.hungerMax) errors.push('hungerStart must not exceed hungerMax');
  for (const name of ['heavyPercent', 'lightPercent'] as const) {
    if (c.carry[name] > 100) errors.push(`${name} must not exceed 100`);
  }
  if (c.food.size > c.acidCapacity) errors.push('acidCapacity must be at least the largest food size');
  return errors;
}
