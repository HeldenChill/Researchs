import { SIM_CONFIG as C } from './config.ts';
import { recordImpact } from './impact.ts';
import type { DriverInput, SimState, WormState } from './types.ts';

const GNAW_BACKOUT_SPEED = 8;
/** Fastest the drawn nose may swing, rad/s. */
const MAX_NOSE_RATE = 5;

const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));
const ease = (rate: number, dt: number): number => 1 - Math.exp(-rate * dt);
const wrapAngle = (a: number): number => Math.atan2(Math.sin(a), Math.cos(a));

export function stepMotion(state: SimState, input: DriverInput, dt: number): void {
  const w = state.worm;
  const prevY = w.y;
  w.shakeImpulse = 0;
  w.braking = input.throttle < 0;

  if (w.pingTimer > 0) {
    w.pingTimer = Math.max(0, w.pingTimer - dt);
  }
  if (input.ping) {
    w.pingTimer = 0.8;
  }

  if (w.recoilTimer > 0) {
    stepRecoil(w, dt);
    return;
  }

  if (w.activeObstacleId !== null) {
    // The bite step moves the worm while it gnaws. Braking lets go.
    if (input.throttle >= 0) return;
    releaseGnaw(w);
    return;
  }

  // Only braking works against travel. Steering turns the travel direction itself, so it is free.
  if (w.braking) {
    w.momentum -= C.momentumReverseDrain * dt;
  }

  if (w.y <= 0) {
    stepGroundMomentum(w, input.throttle, input.boost && w.hunger > 5, dt);
    stepUnderground(w, input, dt);
  } else {
    stepAir(w, input, dt);
  }

  const startedUnderground = w.y <= 0;
  integrate(w, dt);
  if (startedUnderground) addDigMomentum(w, prevY - w.y);
  w.momentum = clamp(w.momentum, 0, C.momentumMax);

  // O3: Ground impact from airborne dive triggers interior shake impulse
  if (prevY > 0 && w.y <= 0 && w.vy < -C.impactSpeedThreshold) {
    w.shakeImpulse = Math.min(1, (-w.vy - C.impactSpeedThreshold) / 14 + 0.25);
    recordImpact(w, 'land', w.shakeImpulse, w.x, 0);
  } else if ((prevY > 0) !== (w.y > 0)) {
    recordImpact(w, 'surface', 0.25, w.x, 0);
  }

  if (Math.hypot(w.vx, w.vy) > 0.01) {
    const nose = wrapAngle(Math.atan2(w.vy, w.vx) - w.heading);
    w.heading = wrapAngle(w.heading + clamp(nose, -MAX_NOSE_RATE * dt, MAX_NOSE_RATE * dt));
  }
}

function stepUnderground(w: WormState, input: DriverInput, dt: number): void {
  const boosting = input.boost && w.hunger > 5;
  const fill = w.momentum / C.momentumMax;
  const top = (C.baseSpeed + w.heart.s * C.speedPerPoint) * C.topSpeedScale;
  const cruise = top * C.cruiseFraction;
  let target = input.throttle < 0 ? cruise * C.brakeSpeedFraction : cruise + (top - cruise) * fill;
  if (boosting) target *= C.boostMultiplier;
  target = Math.max(C.minSpeed, target);

  let speed = Math.hypot(w.vx, w.vy);
  // Against a rock only a sideways sliver of velocity is left, so the head decides the direction.
  let angle = speed > 1 && !w.blocked ? Math.atan2(w.vy, w.vx) : w.heading;

  // Extra speed from a dive fades slowly so the player can feel it.
  const rate = speed > target && input.throttle >= 0 ? C.overspeedDecay : C.speedResponse;
  speed += (target - speed) * ease(rate, dt);
  // Part of gravity still acts in loose sand: faster downhill, slower uphill.
  speed = Math.max(0, speed - Math.sin(angle) * C.gravity * C.slopeGravity * dt);

  const maxTurn = C.turnRate * (1 - C.turnHeaviness * fill) * dt;
  // Steering rotates the head, and the travel direction turns with it. No keys keeps both.
  angle = wrapAngle(angle + input.steer * maxTurn);

  w.vx = Math.cos(angle) * speed;
  w.vy = Math.sin(angle) * speed;
}

/** Pushing forward builds. With no push the worm never loses momentum here. */
function stepGroundMomentum(w: WormState, throttle: number, boosting: boolean, dt: number): void {
  if (throttle > 0) {
    // Snowball: builds faster the more there already is.
    const snowball = 0.5 + w.momentum / C.momentumMax;
    const boost = boosting ? C.momentumBoostBuildMult : 1;
    w.momentum += C.momentumBuildRate * snowball * boost * dt;
  } else if (throttle === 0 && w.momentum < C.momentumIdleLevel) {
    w.momentum = Math.min(C.momentumIdleLevel, w.momentum + C.momentumBuildRate * 0.3 * dt);
  }
}

/** Same idea as in the air: height dropped feeds momentum, height climbed spends it. */
function addDigMomentum(w: WormState, dropped: number): void {
  w.momentum += dropped * (dropped > 0 ? C.momentumDigGain : C.momentumDigClimbCost);
}

function stepAir(w: WormState, input: DriverInput, dt: number): void {
  // Steering rotates the flight direction. Push and brake act along it.
  const speed = Math.max(0, Math.hypot(w.vx, w.vy) + input.throttle * C.airThrottle * dt);
  const angle = Math.atan2(w.vy, w.vx) + input.steer * C.airTurnRate * dt;
  w.vx = Math.cos(angle) * speed;
  w.vy = Math.sin(angle) * speed - C.gravity * dt;
  w.vx -= w.vx * C.airDrag * dt;
  // Height turns into momentum on the way down and costs a little on the way up.
  if (w.vy < 0) {
    w.momentum += -w.vy * dt * C.momentumDiveGain;
  } else {
    w.momentum -= w.vy * dt * C.momentumClimbCost;
  }
}

/** Braking while gnawing: back out of the rock along the way in. */
function releaseGnaw(w: WormState): void {
  w.activeObstacleId = null;
  w.gnawTimer = 0;
  w.gnawProgress = 0;
  w.braking = false;
  w.vx = w.gnawFrom.nx * GNAW_BACKOUT_SPEED;
  w.vy = w.gnawFrom.ny * GNAW_BACKOUT_SPEED;
  w.recoilTimer = C.hitRecoilTime;
}

/** Short bounce after a hard hit: slides & reflects on angled hits, recoils straight back on head-on hits. */
function stepRecoil(w: WormState, dt: number): void {
  w.recoilTimer = Math.max(0, w.recoilTimer - dt);
  const speed = Math.hypot(w.vx, w.vy);
  const velAngle = speed > 0.01 ? Math.atan2(w.vy, w.vx) : w.heading;
  const slideReflect = speed > 0.5 && Math.abs(wrapAngle(velAngle - w.heading)) < 2.2;

  const damping = slideReflect ? C.hitRecoilDamping * 0.25 : C.hitRecoilDamping;
  const keep = Math.exp(-damping * dt);
  w.vx *= keep;
  w.vy *= keep;
  integrate(w, dt);

  if (slideReflect && Math.hypot(w.vx, w.vy) > 0.5) {
    const nose = wrapAngle(Math.atan2(w.vy, w.vx) - w.heading);
    w.heading = wrapAngle(w.heading + clamp(nose, -MAX_NOSE_RATE * dt, MAX_NOSE_RATE * dt));
  }

  if (w.recoilTimer === 0 && !slideReflect) {
    // Leftover head-on bounce velocity must not count as the new travel direction.
    w.vx = Math.cos(w.heading);
    w.vy = Math.sin(w.heading);
  }
}

function integrate(w: WormState, dt: number): void {
  w.x += w.vx * dt;
  w.y += w.vy * dt;

  if (w.y < C.maxDepth) {
    w.y = C.maxDepth;
    if (w.vy < 0) {
      const impactSpeed = -w.vy;
      if (impactSpeed > C.softHitSpeed && w.recoilTimer === 0) {
        const momRatio = w.momentum / C.momentumMax;
        w.vy = impactSpeed * C.hitRestitution * (0.4 + momRatio * 0.6);
        w.recoilTimer = C.hitRecoilTime;
        w.momentum *= C.hitMomentumKeep;
        w.shakeImpulse = Math.max(w.shakeImpulse, C.hitShake);
        recordImpact(w, 'hit', Math.min(1, impactSpeed / 25), w.x, C.maxDepth);
      } else {
        w.vy = 0;
      }
    }
  }
  if (w.y > C.maxAltitude) {
    w.y = C.maxAltitude;
    if (w.vy > 0) w.vy = 0;
  }
}
