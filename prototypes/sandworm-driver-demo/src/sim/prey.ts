import { SIM_CONFIG } from './config.ts';
import { recordImpact } from './impact.ts';
import { MAX_NOSE_RATE } from './motion.ts';
import { pushTrail, segmentPositions, type Point } from './trail.ts';
import type { DriverInput, PreyWorm, SimState } from './types.ts';

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function wrapAngle(a: number): number {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
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
      (p.mode === 'wander' || p.mode === 'flee') &&
      w.latchedPreyId === null &&
      d <= SIM_CONFIG.lungeRadius &&
      angleOff > SIM_CONFIG.lungeAngle
    ) {
      p.mode = 'lunge';
      p.modeTimer = SIM_CONFIG.lungeDuration;
    } else if (p.mode === 'wander' && d <= SIM_CONFIG.fleeRadius) {
      p.mode = 'flee';
    } else if (p.mode === 'flee' && d > SIM_CONFIG.fleeRadius * 1.5) {
      p.mode = 'wander';
    }

    let targetH = p.heading;
    let speed = 0;
    if (p.mode === 'wander') {
      targetH = 0.6 * Math.sin(state.time * 0.5 + p.id);
      speed = 0.5 * SIM_CONFIG.preySpeed;
    } else if (p.mode === 'flee') {
      targetH = Math.atan2(p.y - w.y, p.x - w.x) + 0.4 * Math.sin(state.time * 1.7 + p.id);
      speed = SIM_CONFIG.preySpeed * (p.modeTimer > 0 ? 1.4 : 1);
    } else if (p.mode === 'recover') {
      targetH = p.heading;
      speed = 0.5 * SIM_CONFIG.preySpeed;
    } else if (p.mode === 'lunge') {
      const body = getBody();
      let best = body[1] ?? body[0]!;
      let bestDist = Infinity;
      for (let j = 1; j < body.length; j++) {
        const pt = body[j]!;
        const dj = Math.hypot(pt.x - p.x, pt.y - p.y);
        if (dj < bestDist) {
          bestDist = dj;
          best = pt;
        }
      }
      targetH = Math.atan2(best.y - p.y, best.x - p.x);
      speed = 1.3 * SIM_CONFIG.preySpeed;
    }

    p.heading += clamp(
      wrapAngle(targetH - p.heading),
      -SIM_CONFIG.preyTurnRate * dt,
      SIM_CONFIG.preyTurnRate * dt,
    );

    p.vx = Math.cos(p.heading) * speed;
    p.vy = Math.sin(p.heading) * speed;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    if (p.y > 0) {
      p.y = 0;
      p.heading = -Math.abs(p.heading);
    }
    if (p.y < SIM_CONFIG.maxDepth) {
      p.y = SIM_CONFIG.maxDepth;
      p.heading = Math.abs(p.heading);
    }

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
      for (let j = 1; j < body.length; j++) {
        const pt = body[j]!;
        if (Math.hypot(p.x - pt.x, p.y - pt.y) <= latchReach) {
          p.mode = 'latched';
          p.latchSegment = j;
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
    const headHit = Math.hypot(w.x - pts[0]!.x, w.y - pts[0]!.y) <= reach;
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
  pushTrail(
    p.trail,
    p.x,
    p.y,
    SIM_CONFIG.trailSampleSpacing,
    (SIM_CONFIG.preySegments + 1) * SIM_CONFIG.segmentSpacing,
  );

  p.latchTimer -= dt;
  const brakedOff =
    input.throttle < 0 && p.latchMomentumStart - w.momentum >= SIM_CONFIG.shakeOffBrake;
  const rockHit = state.obstacles.some(
    (obs) =>
      !obs.broken &&
      Math.hypot(seg.x - obs.x, seg.y - obs.y) <= obs.radius + SIM_CONFIG.preySegmentRadius,
  );

  if (p.latchTimer <= 0 || brakedOff || rockHit) {
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
