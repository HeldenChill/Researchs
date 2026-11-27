import { SIM_CONFIG as C } from './config.ts';
import { recordImpact } from './impact.ts';
import type { Obstacle, SimState, WormState } from './types.ts';

/** Most a worm is pushed out of a rock in one step, so overlap resolves without a teleport. */
const MAX_PUSH_OUT = 0.5;

export function stepBite(state: SimState, dt: number): void {
  const w = state.worm;
  w.blocked = false;

  // Spawners: Driver bites food -> enters interior mouthQueue
  for (const sp of state.spawners) {
    if (sp.eaten) continue;
    const dist = Math.hypot(w.x - sp.x, w.y - sp.y);
    if (dist <= sp.radius + C.headRadius) {
      sp.eaten = true;
      state.interior.mouthQueue += 1;
    }
  }

  // Obstacles: Bite gate (O4)
  for (const obs of state.obstacles) {
    if (obs.broken) continue;
    if (w.activeObstacleId === obs.id) {
      if (w.heart.b >= obs.requiredBite) {
        gnaw(w, obs, dt);
        return;
      }
      // Heart switched to a weaker bite: let go, then collide with the rock as solid.
      w.activeObstacleId = null;
      w.gnawTimer = 0;
      w.gnawProgress = 0;
    }

    const dist = Math.hypot(w.x - obs.x, w.y - obs.y);
    const reach = obs.radius + C.headRadius;
    if (dist > reach) continue;
    // Normal points from the rock to the worm.
    const nx = dist > 1e-6 ? (w.x - obs.x) / dist : -1;
    const ny = dist > 1e-6 ? (w.y - obs.y) / dist : 0;

    if (w.heart.b >= obs.requiredBite && !w.braking) {
      if (obs.tier === 1 || w.momentum >= C.highMomentumThreshold) {
        smash(w, obs, 0.8);
        continue;
      }
      if (w.recoilTimer === 0) {
        startGnaw(w, obs, nx, ny);
        return;
      }
    }

    block(w, nx, ny, reach - dist, dt);
    return;
  }
}

/** Solid contact: push out along the normal. Fast arrivals bounce once, slow ones just rest and slide. */
function block(w: WormState, nx: number, ny: number, depth: number, dt: number): void {
  const push = Math.min(depth, MAX_PUSH_OUT);
  w.x += nx * push;
  w.y += ny * push;
  w.blocked = true;

  const inward = -(w.vx * nx + w.vy * ny);
  if (inward <= 0) return;

  if (inward > C.softHitSpeed && w.recoilTimer === 0) {
    const bounce = (1 + C.hitRestitution) * inward;
    w.vx += nx * bounce;
    w.vy += ny * bounce;
    w.recoilTimer = C.hitRecoilTime;
    w.momentum *= C.hitMomentumKeep;
    w.shakeImpulse = Math.max(w.shakeImpulse, C.hitShake);
    recordImpact(w, 'hit', Math.min(1, inward / 25), w.x - nx * C.headRadius, w.y - ny * C.headRadius);
    return;
  }

  // Remove only the part going into the rock, so steering slides around it.
  w.vx += nx * inward;
  w.vy += ny * inward;
  w.momentum = Math.max(0, w.momentum - C.blockedMomentumDrain * dt);
}

function startGnaw(w: WormState, obs: Obstacle, nx: number, ny: number): void {
  const charge = Math.min(1, w.momentum / C.highMomentumThreshold);
  w.activeObstacleId = obs.id;
  w.gnawTimer = C.gnawDuration * (1 - C.gnawMomentumSpeedup * charge);
  w.gnawProgress = 0;
  w.gnawFrom = { x: w.x, y: w.y, nx, ny };
  recordImpact(w, 'gnaw', Math.min(1, Math.hypot(w.vx, w.vy) / 25), w.x - nx * C.headRadius, w.y - ny * C.headRadius);
  w.vx = 0;
  w.vy = 0;
}

/** Grind into the rock: fast bite-in first, then steady progress until it gives way. */
function gnaw(w: WormState, obs: Obstacle, dt: number): void {
  const total = w.gnawProgress < 1 ? w.gnawTimer / (1 - w.gnawProgress) : dt;
  w.gnawTimer = Math.max(0, w.gnawTimer - dt);
  w.gnawProgress = w.gnawTimer <= 0 ? 1 : 1 - w.gnawTimer / total;

  const from = w.gnawFrom;
  const sunk = C.gnawSinkDepth * (w.gnawProgress * (2 - w.gnawProgress) * 0.6 + w.gnawProgress * 0.4);
  w.x = from.x - from.nx * sunk;
  w.y = from.y - from.ny * sunk;

  const turn = Math.atan2(-from.ny, -from.nx) - w.heading;
  w.heading += Math.atan2(Math.sin(turn), Math.cos(turn)) * Math.min(1, 8 * dt);

  if (w.gnawTimer <= 0) smash(w, obs, 1);
}

function smash(w: WormState, obs: Obstacle, strength: number): void {
  obs.broken = true;
  if (w.activeObstacleId === obs.id) {
    // Burst out the far side at cruise speed.
    const burst = (C.baseSpeed + w.heart.s * C.speedPerPoint) * C.topSpeedScale * C.cruiseFraction;
    w.vx = Math.cos(w.heading) * burst;
    w.vy = Math.sin(w.heading) * burst;
  }
  w.activeObstacleId = null;
  w.gnawTimer = 0;
  w.gnawProgress = 0;
  recordImpact(w, 'break', strength, obs.x, obs.y);
}
