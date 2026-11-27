import { HEART_PRESETS, SIM_CONFIG } from './config.ts';
import type { Obstacle, SimState, Spawner } from './types.ts';

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
    },
    obstacles,
    spawners,
    interior: {
      mouthQueue: 0,
      acidSlots: [],
      breaches: 0,
      crewStunTimer: 0,
      crewWorkTimer: 0,
      sealProgress: 0,
    },
    apocalypseX: SIM_CONFIG.apocalypseStartX,
    outcome: 'playing',
  };
}
