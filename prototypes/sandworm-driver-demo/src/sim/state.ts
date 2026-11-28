import { HEART_PRESETS, SIM_CONFIG } from './config.ts';
import { createStraightTrail } from './trail.ts';
import type { Obstacle, PreyWorm, SimState, Spawner } from './types.ts';

const PREY_SPAWNS = [
  { id: 201, x: 120, y: -8 },
  { id: 202, x: 250, y: -12 },
  { id: 203, x: 380, y: -6 },
  { id: 204, x: 500, y: -14 },
];

export function createInitialState(): SimState {
  const obstacles: Obstacle[] = [
    { id: 1, x: 95, y: 0, radius: 3.4, tier: 1, requiredBite: 2, broken: false },
    { id: 2, x: 215, y: -1, radius: 3.8, tier: 2, requiredBite: 4, broken: false },
    { id: 3, x: 345, y: 0, radius: 3.4, tier: 1, requiredBite: 2, broken: false },
    { id: 4, x: 470, y: -1, radius: 4.0, tier: 2, requiredBite: 4, broken: false },
  ];

  const spawners: Spawner[] = [
    { id: 101, x: 45, y: 1.5, radius: 2.2, kind: 'small_meat', yieldHunger: 16, digestTime: 2.2, eaten: false },
    { id: 102, x: 140, y: -4.5, radius: 2.6, kind: 'large_meat', yieldHunger: 28, digestTime: 3.6, eaten: false },
    { id: 103, x: 185, y: 2.0, radius: 2.2, kind: 'small_meat', yieldHunger: 16, digestTime: 2.2, eaten: false },
    { id: 104, x: 265, y: -5.0, radius: 2.4, kind: 'tyre', yieldHunger: 10, digestTime: 2.5, eaten: false },
    { id: 105, x: 310, y: 2.5, radius: 2.6, kind: 'large_meat', yieldHunger: 28, digestTime: 3.6, eaten: false },
    { id: 106, x: 410, y: -4.0, radius: 2.6, kind: 'large_meat', yieldHunger: 28, digestTime: 3.6, eaten: false },
    { id: 107, x: 520, y: 1.5, radius: 2.2, kind: 'small_meat', yieldHunger: 16, digestTime: 2.2, eaten: false },
  ];

  return {
    time: 0,
    worm: {
      x: 0,
      y: -2,
      vx: 14,
      vy: 0,
      heading: 0,
      health: SIM_CONFIG.maxHealth,
      hunger: SIM_CONFIG.maxHunger,
      momentum: 20,
      heart: { ...HEART_PRESETS.balanced },
      preset: 'balanced',
      gnawTimer: 0,
      activeObstacleId: null,
      pingTimer: 0,
      shakeImpulse: 0,
      recoilTimer: 0,
      blocked: false,
      braking: false,
      gnawProgress: 0,
      gnawFrom: { x: 0, y: 0, nx: -1, ny: 0 },
      impact: { seq: 0, kind: 'none', strength: 0, x: 0, y: 0 },
      trail: createStraightTrail(
        0,
        -2,
        0,
        (SIM_CONFIG.playerSegments + 1) * SIM_CONFIG.segmentSpacing,
        SIM_CONFIG.trailSampleSpacing,
      ),
      latchedPreyId: null,
    },
    obstacles,
    spawners,
    prey: PREY_SPAWNS.slice(0, SIM_CONFIG.preyCount).map((row): PreyWorm => ({
      id: row.id,
      x: row.x,
      y: row.y,
      vx: 0,
      vy: 0,
      heading: 0,
      sections: SIM_CONFIG.preySegments,
      trail: createStraightTrail(
        row.x,
        row.y,
        0,
        (SIM_CONFIG.preySegments + 1) * SIM_CONFIG.segmentSpacing,
        SIM_CONFIG.trailSampleSpacing,
      ),
      mode: 'wander',
      modeTimer: 0,
      latchSegment: -1,
      latchTimer: 0,
      latchMomentumStart: 0,
      wigglePhase: 0,
      alive: true,
    })),
    interior: {
      mouthQueue: 0,
      acidSlots: [],
      breaches: 0,
      crewStunTimer: 0,
      crewWorkTimer: 0,
      sealProgress: 0,
      preySections: 0,
    },
    apocalypseX: SIM_CONFIG.apocalypseStartX,
    outcome: 'playing',
  };
}
