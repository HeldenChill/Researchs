import { SIM_CONFIG } from './config.ts';
import { recordImpact } from './impact.ts';
import { MAX_NOSE_RATE, stepWormMotion } from './motion.ts';
import { collideObstacles } from './bite.ts';
import { createStraightTrail, pushTrail, segmentPositions, type Point } from './trail.ts';
import type { DriverInput, PreyWorm, SimState } from './types.ts';

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function wrapAngle(a: number): number {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

/** Segment 1 sits inside our head bite reach, so a prey latched there would be eaten next tick. */
const LATCH_MIN_SEGMENT = 2;
/** Prey AI steering: full key press when this many radians off target, or more. */
const AI_STEER_GAIN = 3;
/** How far a latched prey's body swings either side of straight out, rad. */
const LATCH_SWING = 0.6;
/** Phase delay of the wiggle per link, rad: makes the thrash travel down the body. */
const LATCH_WAVE_LAG = 0.7;
/** How fast each latched link moves toward its pose, 1/s. Lower is floppier. */
const LATCH_CHAIN_STIFF = 20;

/** Hand the latched chain back to the trail so the body keeps its shape after letting go. */
function releaseChain(p: PreyWorm): void {
  const chain = p.latchBody;
  if (chain.length === 0) return;
  const tail = chain[chain.length - 1]!;
  p.trail = createStraightTrail(tail.x, tail.y, p.heading, 0, SIM_CONFIG.trailSampleSpacing);
  for (let k = chain.length - 2; k >= 0; k--) {
    pushTrail(p.trail, chain[k]!.x, chain[k]!.y, SIM_CONFIG.trailSampleSpacing, (SIM_CONFIG.preySegments + 1) * SIM_CONFIG.segmentSpacing);
  }
  p.latchBody = [];
}

export function playerBodyPoints(state: SimState): Point[] {
  return segmentPositions(
    state.worm.trail,
    state.worm.x,
    state.worm.y,
    SIM_CONFIG.playerSegments,
    SIM_CONFIG.segmentSpacing,
  );
}

export function preyBodyPoints(p: PreyWorm): Point[] {
  if (p.mode === 'latched' && p.latchBody.length > 0) return p.latchBody.slice(0, p.sections);
  return segmentPositions(
    p.trail,
    p.x,
    p.y,
    p.sections,
    SIM_CONFIG.segmentSpacing,
  );
}

export function pushPlayerTrail(state: SimState): void {
  pushTrail(
    state.worm.trail,
    state.worm.x,
    state.worm.y,
    SIM_CONFIG.trailSampleSpacing,
    (SIM_CONFIG.playerSegments + 1) * SIM_CONFIG.segmentSpacing,
  );
}

export function stepPrey(state: SimState, dt: number): void {
  const w = state.worm;
  let cachedBody: Point[] | null = null;
  const getBody = (): Point[] => (cachedBody ??= playerBodyPoints(state));

  for (const p of state.prey) {
    if (!p.alive || p.mode === 'latched') continue;

    p.modeTimer = Math.max(0, p.modeTimer - dt);
    const d = Math.hypot(p.x - w.x, p.y - w.y);
    const angleOff = Math.abs(wrapAngle(Math.atan2(p.y - w.y, p.x - w.x) - w.heading));

    if (p.mode === 'recover' && p.modeTimer > 0) {
      // stay in recover
    } else if (p.mode === 'recover' && p.modeTimer === 0) {
      p.mode = 'flee';
    } else if (p.mode === 'lunge' && p.modeTimer === 0) {
      p.mode = 'flee';
    } else if (
      (p.mode === 'wander' || p.mode === 'flee' || p.mode === 'stalk') &&
      w.latchedPreyId === null &&
      d <= SIM_CONFIG.lungeRadius &&
      angleOff > SIM_CONFIG.lungeAngle
    ) {
      p.mode = 'lunge';
      p.modeTimer = SIM_CONFIG.lungeDuration;
    } else if (
      p.aggressive &&
      (p.mode === 'wander' || p.mode === 'flee' || p.mode === 'stalk') &&
      w.latchedPreyId === null &&
      d <= SIM_CONFIG.stalkRadius &&
      angleOff > SIM_CONFIG.stalkFearAngle
    ) {
      p.mode = 'stalk'; // not facing us: hunt our body
    } else if (p.mode === 'stalk') {
      p.mode = 'flee'; // we turned our mouth on it, someone else latched, or it lost us
    } else if (p.mode === 'wander' && d <= SIM_CONFIG.fleeRadius) {
      p.mode = 'flee';
    } else if (p.mode === 'flee' && d > SIM_CONFIG.fleeRadius * 1.5) {
      p.mode = 'wander';
    }

    // AI picks a heading and keys, like a driver; shared physics does the rest (ground, air, rocks).
    let targetH = p.heading;
    let throttle = 0;
    let boost = false;
    if (p.mode === 'wander') {
      // Drift around home depth; jumps come from chasing and fleeing, not idling.
      targetH = 0.3 * Math.sin(state.time * 0.5 + p.id) + clamp((p.homeY - p.y) * 0.15, -0.6, 0.6);
      throttle = -1; // brake to idle slowly; free rolling would cruise near our speed
    } else if (p.mode === 'flee') {
      targetH = Math.atan2(p.y - w.y, p.x - w.x) + 0.4 * Math.sin(state.time * 1.7 + p.id);
      throttle = 1;
      boost = p.modeTimer > 0; // burst after being bitten
    } else if (p.mode === 'lunge' || p.mode === 'stalk') {
      const body = getBody();
      // Stalkers aim at our tail so they come in from behind, away from our mouth.
      // Lunges aim at the nearest segment we can latch onto.
      let best = body[body.length - 1]!;
      let bestDist = Infinity;
      for (let j = LATCH_MIN_SEGMENT; p.mode === 'lunge' && j < body.length; j++) {
        const pt = body[j]!;
        const dj = Math.hypot(pt.x - p.x, pt.y - p.y);
        if (dj < bestDist) {
          bestDist = dj;
          best = pt;
        }
      }
      targetH = Math.atan2(best.y - p.y, best.x - p.x);
      throttle = 1;
      boost = true; // hunting: same boost we have
    }
    const steer = clamp(wrapAngle(targetH - p.heading) * AI_STEER_GAIN, -1, 1);
    stepWormMotion(p, { throttle, steer, boost, ping: false, preset: null }, dt);
    collideObstacles(p, state.obstacles, dt, SIM_CONFIG.preySegmentRadius);

    pushTrail(
      p.trail,
      p.x,
      p.y,
      SIM_CONFIG.trailSampleSpacing,
      (SIM_CONFIG.preySegments + 1) * SIM_CONFIG.segmentSpacing,
    );

    if (p.mode === 'lunge' && w.latchedPreyId === null) {
      const body = getBody();
      const latchReach = SIM_CONFIG.preySegmentRadius + SIM_CONFIG.playerSegmentRadius;
      for (let j = LATCH_MIN_SEGMENT; j < body.length; j++) {
        const pt = body[j]!;
        if (Math.hypot(p.x - pt.x, p.y - pt.y) <= latchReach) {
          p.mode = 'latched';
          p.latchSegment = j;
          p.latchBody = [];
          // Side it hit from: sign of cross(our body tangent at j, prey offset).
          const prev = body[j - 1]!;
          const cross = (prev.x - pt.x) * (p.y - pt.y) - (prev.y - pt.y) * (p.x - pt.x);
          p.latchSide = cross < 0 ? -1 : 1;
          p.x = pt.x; // snap onto our segment now, so bitePrey this tick sees it out of head reach
          p.y = pt.y;
          p.latchTimer = SIM_CONFIG.latchDuration;
          p.latchMomentumStart = w.momentum;
          p.wigglePhase = 0;
          w.latchedPreyId = p.id;
          break;
        }
      }
    }
  }
}

export function bitePrey(state: SimState): void {
  const w = state.worm;
  const reach = SIM_CONFIG.headRadius + SIM_CONFIG.preySegmentRadius;

  for (const p of state.prey) {
    if (!p.alive) continue;
    const pts = preyBodyPoints(p);
    // A latched prey's head is buried in our body: only its sticking-out body can be bitten.
    const buried = w.latchedPreyId === p.id;
    const headHit = !buried && Math.hypot(w.x - pts[0]!.x, w.y - pts[0]!.y) <= reach;
    let bodyHit = false;
    for (let k = 1; k < pts.length; k++) {
      if (Math.hypot(w.x - pts[k]!.x, w.y - pts[k]!.y) <= reach) {
        bodyHit = true;
        break;
      }
    }

    if (headHit || (bodyHit && p.sections <= 1)) {
      p.alive = false;
      state.interior.mouthQueue += p.sections;
      state.interior.preySections += p.sections;
      recordImpact(w, 'break', 0.8, p.x, p.y);
      if (w.latchedPreyId === p.id) w.latchedPreyId = null;
      return;
    }

    if (bodyHit) {
      p.sections -= 1;
      state.interior.mouthQueue += 1;
      state.interior.preySections += 1;
      p.mode = 'flee';
      p.modeTimer = SIM_CONFIG.preyBurstTime;
      recordImpact(w, 'gnaw', 0.5, p.x, p.y);
      if (w.latchedPreyId === p.id) {
        releaseChain(p);
        w.latchedPreyId = null;
        p.latchSegment = -1;
      }
      return;
    }
  }
}

export function stepLatch(state: SimState, input: DriverInput, dt: number): void {
  const w = state.worm;
  if (w.latchedPreyId === null) return;
  const p = state.prey.find((item) => item.id === w.latchedPreyId && item.alive);
  if (!p) {
    w.latchedPreyId = null;
    return;
  }

  const j = p.latchSegment;
  const L = j / SIM_CONFIG.playerSegments;
  const f = SIM_CONFIG.latchWiggleForce * Math.sin(p.wigglePhase);
  p.wigglePhase += SIM_CONFIG.latchWiggleFreq * 2 * Math.PI * dt;

  w.heading += clamp(
    f * L * SIM_CONFIG.latchTurnGain * dt,
    -MAX_NOSE_RATE * dt,
    MAX_NOSE_RATE * dt,
  );
  w.momentum = Math.max(
    0,
    w.momentum - SIM_CONFIG.latchMomentumDrain * (1 - 0.5 * L) * dt,
  );

  if (Math.abs(f) >= 0.95 * SIM_CONFIG.latchWiggleForce && SIM_CONFIG.latchWiggleForce > 0) {
    w.shakeImpulse = Math.max(w.shakeImpulse, 0.2);
  }

  const body = playerBodyPoints(state);
  const seg = body[j] ?? { x: w.x, y: w.y };
  p.x = seg.x;
  p.y = seg.y;
  // Chain sticking out from our body on the side it bit. Each link eases toward a thrashing pose
  // (wave travels down the body), then is held at segmentSpacing from the link before it.
  // Not the trail: pushing the pinned head into its trail made the body follow our path and sink into us.
  const ahead = body[j - 1] ?? { x: w.x, y: w.y };
  const outward = Math.atan2(ahead.y - seg.y, ahead.x - seg.x) + p.latchSide * (Math.PI / 2);
  const sp = SIM_CONFIG.segmentSpacing;
  if (p.latchBody.length !== p.sections) {
    p.latchBody = Array.from({ length: p.sections }, (_, k) => ({
      x: seg.x + Math.cos(outward) * sp * k,
      y: seg.y + Math.sin(outward) * sp * k,
    }));
  }
  const ease = 1 - Math.exp(-LATCH_CHAIN_STIFF * dt);
  p.latchBody[0] = { x: seg.x, y: seg.y };
  for (let k = 1; k < p.latchBody.length; k++) {
    const prevLink = p.latchBody[k - 1]!;
    const cur = p.latchBody[k]!;
    const dir = outward + LATCH_SWING * Math.sin(p.wigglePhase - k * LATCH_WAVE_LAG);
    const tx = cur.x + (prevLink.x + Math.cos(dir) * sp - cur.x) * ease;
    const ty = cur.y + (prevLink.y + Math.sin(dir) * sp - cur.y) * ease;
    const len = Math.hypot(tx - prevLink.x, ty - prevLink.y) || 1;
    p.latchBody[k] = { x: prevLink.x + ((tx - prevLink.x) / len) * sp, y: prevLink.y + ((ty - prevLink.y) / len) * sp };
  }
  const link1 = p.latchBody[1] ?? { x: seg.x - Math.cos(outward), y: seg.y - Math.sin(outward) };
  p.heading = Math.atan2(seg.y - link1.y, seg.x - link1.x); // head points into us

  p.latchTimer -= dt;
  const brakedOff =
    input.throttle < 0 && p.latchMomentumStart - w.momentum >= SIM_CONFIG.shakeOffBrake;
  const rockHit = state.obstacles.some(
    (obs) =>
      !obs.broken &&
      Math.hypot(seg.x - obs.x, seg.y - obs.y) <= obs.radius + SIM_CONFIG.preySegmentRadius,
  );

  if (p.latchTimer <= 0 || brakedOff || rockHit) {
    releaseChain(p);
    p.mode = 'recover';
    p.modeTimer = SIM_CONFIG.recoverTime;
    p.latchSegment = -1;
    w.latchedPreyId = null;

    const prev = body[j - 1] ?? seg;
    const dx = seg.x - prev.x;
    const dy = seg.y - prev.y;
    const len = Math.hypot(dx, dy);
    const nx = len === 0 ? 0 : -dy / len;
    const ny = len === 0 ? 1 : dx / len;
    p.x = seg.x + nx * 3;
    p.y = clamp(seg.y + ny * 3, SIM_CONFIG.maxDepth, 0);
  }
}
