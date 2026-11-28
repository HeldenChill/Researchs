import type { PathTrail } from './trail.ts';

export type HeartPreset = 'fast' | 'balanced' | 'bite';

export interface HeartAllocation {
  s: number; // speed points
  r: number; // regen points
  b: number; // bite points
}

export interface WormState {
  x: number;
  y: number; // > 0 airborne/surface, <= 0 underground
  vx: number;
  vy: number;
  heading: number; // radians, 0 = +x
  health: number;
  hunger: number;
  momentum: number; // stored, 0..momentumMax. Sets speed and break power
  heart: HeartAllocation;
  preset: HeartPreset;
  gnawTimer: number;
  activeObstacleId: number | null;
  pingTimer: number;
  shakeImpulse: number;
  recoilTimer: number;
  blocked: boolean; // pressing against a rock it cannot bite
  braking: boolean;
  gnawProgress: number; // 0..1
  gnawFrom: { x: number; y: number; nx: number; ny: number }; // start point and rock normal
  impact: ImpactEvent;
  trail: PathTrail;
  latchedPreyId: number | null;
}

export type PreyMode = 'wander' | 'flee' | 'lunge' | 'latched' | 'recover';

export interface PreyWorm {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  heading: number;
  sections: number;          // 1..preySegments, segment 0 = head
  trail: PathTrail;
  mode: PreyMode;
  modeTimer: number;         // seconds left in lunge, recover or flee burst
  latchSegment: number;      // player segment index while latched, else -1
  latchTimer: number;
  latchMomentumStart: number;
  wigglePhase: number;
  alive: boolean;
}

export type ImpactKind = 'none' | 'hit' | 'bump' | 'gnaw' | 'break' | 'land' | 'surface';

export interface ImpactEvent {
  seq: number;
  kind: ImpactKind;
  strength: number; // 0..1
  x: number;
  y: number;
}

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  radius: number;
  tier: 1 | 2;
  requiredBite: number;
  broken: boolean;
}

export interface Spawner {
  id: number;
  x: number;
  y: number;
  radius: number;
  kind: 'small_meat' | 'large_meat' | 'tyre';
  yieldHunger: number;
  digestTime: number;
  eaten: boolean;
}

export interface InteriorDigestItem {
  yieldHunger: number;
  remaining: number;
  total: number;
}

export interface InteriorState {
  mouthQueue: number; // items waiting for simulated crew
  acidSlots: InteriorDigestItem[];
  breaches: number;
  crewStunTimer: number;
  crewWorkTimer: number;
  sealProgress: number;
  preySections: number; // queued items that came from prey
}

export type MatchOutcome = 'playing' | 'win' | 'loss_health' | 'loss_hunger' | 'loss_apocalypse';

export interface DriverInput {
  throttle: number; // 1 push (W) .. -1 brake (S)
  steer: number; // 1 counterclockwise (A) .. -1 clockwise (D)
  boost: boolean;
  ping: boolean;
  preset: HeartPreset | null;
}

export interface SimState {
  time: number;
  worm: WormState;
  obstacles: Obstacle[];
  spawners: Spawner[];
  prey: PreyWorm[];
  interior: InteriorState;
  apocalypseX: number;
  outcome: MatchOutcome;
}
