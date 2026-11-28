import type { HeartAllocation, HeartPreset } from './types.ts';

export const DEFAULT_SIM_CONFIG = Object.freeze({
  // run
  goalX: 6000,
  maxHealth: 100,
  maxHunger: 100,
  heartPoints: 6,
  apocalypseStartX: -65,
  // storm phases, by storm position as a share of goalX
  apocalypseSpeedStart: 9,
  apocalypseSpeedMid: 13.5,
  apocalypseSpeedEnd: 19,
  apocalypsePhase2At: 0.4,
  apocalypsePhase3At: 0.75,

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

  // prey
  trailSampleSpacing: 0.5,
  segmentSpacing: 2.2,
  playerSegments: 8,
  playerSegmentRadius: 1.8,
  preySegments: 5,
  preySegmentRadius: 1.0,
  preySpeedScale: 0.85,
  preyTurnScale: 1.4,
  fleeRadius: 30,
  lungeRadius: 8,
  lungeAngle: 1.0,
  lungeDuration: 1.2,
  latchDuration: 4,
  latchWiggleForce: 1.0,
  latchWiggleFreq: 2.5,
  latchTurnGain: 1.2,
  latchMomentumDrain: 18,
  shakeOffBrake: 25,
  recoverTime: 2.5,
  preyBurstTime: 1.0,
  preyCount: 4,
  preyYieldPerSection: 15,
  preyAggressiveEvery: 2,
  stalkRadius: 45,
  stalkFearAngle: 0.45,
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
