import type { HeartAllocation, HeartPreset } from './types.ts';

export const DEFAULT_SIM_CONFIG = Object.freeze({
  // run
  goalX: 600,
  maxHealth: 100,
  maxHunger: 100,
  heartPoints: 6,
  apocalypseStartX: -65,
  apocalypseSpeed: 13.5,

  // speed
  baseSpeed: 18,
  speedPerPoint: 3.5,
  topSpeedScale: 1.2,
  cruiseFraction: 0.55,
  brakeSpeedFraction: 0.45,
  minSpeed: 4,
  speedResponse: 3,
  overspeedDecay: 1.2,
  boostMultiplier: 1.45,
  boostHungerCost: 2.8,

  // stored momentum, 0..momentumMax
  momentumMax: 100,
  momentumBuildRate: 31,
  momentumBoostBuildMult: 1.5,
  momentumIdleLevel: 35,
  momentumReverseDrain: 60,
  momentumDiveGain: 3,
  momentumClimbCost: 1,
  momentumDigGain: 3,
  momentumDigClimbCost: 2,
  slopeGravity: 0.5,
  highMomentumThreshold: 70,

  // steering and air
  turnRate: 2.6,
  turnHeaviness: 0.35,
  gravity: 22,
  airDrag: 0.25,
  airTurnRate: 1.4,
  airThrottle: 6,
  maxDepth: -28,
  maxAltitude: 18,
  impactSpeedThreshold: 20,

  // collision
  headRadius: 2,
  softHitSpeed: 12,
  hitRestitution: 0.4,
  hitShake: 0.5,
  hitRecoilTime: 0.35,
  hitRecoilDamping: 5,
  hitMomentumKeep: 0.25,
  blockedMomentumDrain: 60,
  gnawDuration: 1.25,
  gnawMomentumSpeedup: 0.5,
  gnawSinkDepth: 1.4,

  // body and crew
  acidCapacity: 2,
  breachDps: 4.5,
  crewCarryTime: 1.8,
  crewSealTime: 3.0,
  hungerBaseDrain: 1.2,
  hungerDrainPerSpeedPt: 0.25,
  regenPerPoint: 1.1,
});

export type SimConfig = { -readonly [K in keyof typeof DEFAULT_SIM_CONFIG]: number };

/** Live values. The tuning popup edits this object while the game runs. */
export const SIM_CONFIG: SimConfig = { ...DEFAULT_SIM_CONFIG };

export function resetSimConfig(): void {
  Object.assign(SIM_CONFIG, DEFAULT_SIM_CONFIG);
}

export const HEART_PRESETS: Record<HeartPreset, HeartAllocation> = {
  fast: { s: 4, r: 1, b: 1 },
  balanced: { s: 2, r: 2, b: 2 },
  bite: { s: 1, r: 1, b: 4 },
};
