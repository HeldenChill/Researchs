import * as THREE from 'three';
import type { Rig } from './rig.ts';
import { GRIP_HOME } from './rig.ts';
import { twoBoneIK } from './ik.ts';

export interface LocoInput {
  walk: number;
  cr: number;
  pr: number;
  ln: number;
  sp: boolean;
  sl: boolean;
  aim: boolean;
  pitch: number;
  gx: number;
}

export interface LocoState {
  sp: number;
  sl: number;
  aim: number;
  mv: number;
  kick: number;
  t: number;
  px: number;
  pz: number;
  cr?: number;
  ln?: number;
  walk?: number;
  lastX?: number;
  lastZ?: number;
}

const Lu = new THREE.Vector3(1, 0, 0);
const Ru = new THREE.Vector3(-1, 0, 0);
const zu = new THREE.Vector3(1, -0.6, -0.3);
const Bu = new THREE.Vector3(-1, -0.5, 0.2);
const Vu = new THREE.Vector3();
const Hu = new THREE.Vector3(0, -1, 0);
const Uu = new THREE.Vector3(0, 0, 1);
const Wu = new THREE.Vector3(1, -0.2, 0.9);
const Gu = new THREE.Vector3(-1, -0.2, 0.9);
const Ku = new THREE.Vector3();
const ju = new THREE.Matrix4();

/**
 * Procedural character locomotion (port of Xu from Quarry Nine).
 */
export function poseBody(rig: Rig, inp: LocoInput, dt: number): void {
  const r = (rig.anim ||= {
    sp: 0,
    sl: 0,
    aim: 0,
    mv: 0,
    kick: 0,
    t: Math.random() * 9,
    px: rig.root.position.x,
    pz: rig.root.position.z,
  });

  const ix = rig.root.position.x;
  const iz = rig.root.position.z;
  const distTravel = Math.hypot(ix - r.px, iz - r.pz) / Math.max(dt, 0.001);
  r.px = ix;
  r.pz = iz;

  const deltaWalk = r.walk !== undefined ? Math.abs(inp.walk - r.walk) : 0;
  r.walk = inp.walk;
  const walkSpeed = deltaWalk > 0 ? deltaWalk / (3.2 * Math.max(dt, 0.001)) : 0;
  const o = Math.max(distTravel, walkSpeed);

  const s = (factor: number) => Math.min(1, dt * factor);
  if (o < 15) {
    r.mv += (Math.min(1, o / 4.5) - r.mv) * s(6);
  }
  r.sp += (+!!inp.sp - r.sp) * s(7);
  r.sl += (+!!inp.sl - r.sl) * s(12);
  r.aim += (+!!inp.aim - r.aim) * s(8);
  r.kick = Math.max(0, r.kick - dt * 10);
  r.t += dt;
  r.cr = r.cr === undefined ? inp.cr : r.cr + (inp.cr - r.cr) * s(10);
  r.ln = r.ln === undefined ? inp.ln : r.ln + (inp.ln - r.ln) * s(10);

  const c = rig.joints;
  const l = rig.upper;
  const u = inp.pr || 0;
  const d = r.sl;
  const f = r.cr * (1 - d) * (1 - u);
  const p = r.mv * (1 - d) * (1 - u);
  const m = r.sp * (1 - d);
  const h = Math.sin(inp.walk);
  const g = Math.abs(Math.cos(inp.walk));
  const still = 1 - p;
  const v = f * (1 - Math.min(1, r.mv * 3));
  const y = (0.22 + 0.2 * m) * p * (1 - 0.3 * f);
  const b = (0.12 + 0.08 * m) * p * (1 - 0.5 * f);
  const x = 0.9 - 0.55 * f - 0.5 * d + (g - 0.6) * 0.05 * p;

  c.hips.position.y = x;

  for (const [side, n, off] of [
    ['L', 1, 0],
    ['R', -1, Math.PI],
  ] as const) {
    const sw = Math.sin(inp.walk + off);
    const cw = Math.cos(inp.walk + off);
    const sideX = n * (0.13 + 0.04 * f + 0.06 * u);
    let liftY = Math.max(0, cw) * b + Math.max(0, -sw) * Math.max(0, -cw) * 0.18 * m * p;
    let swingZ = sw * y;
    swingZ += n > 0 ? 0.38 * v + 0.12 * (f - v) + 0.75 * d : -0.42 * v + 0.15 * d;
    liftY += n > 0 ? 0.05 * d : 0.06 * v;

    Vu.set(sideX, liftY, swingZ);
    Vu.y = (Vu.y - x) * (1 - u) - 0.95 * u;
    Vu.z *= 1 - u;
    Ku.copy(Uu);
    if (n < 0) {
      Ku.y -= v * 1.5;
    }
    twoBoneIK(c[`thigh.${side}`], c[`shin.${side}`], Vu, Ku, Hu);
  }

  l.rotation.order = 'YXZ';
  l.rotation.x =
    (0.05 * p + 0.12 * m - 0.45 * d) * (1 - u) -
    (0.12 + 0.18 * r.aim) * u +
    Math.sin(r.t * 1.8) * 0.012 * still;
  l.rotation.z = r.ln * 0.28 + h * 0.035 * p;
  l.updateMatrix();
  Vu.set(0, 0.9, 0).applyQuaternion(l.quaternion);
  l.position.set(-Vu.x, x - Vu.y, -Vu.z);

  const S = 0.3 + 0.25 * r.aim * (1 - m) - 0.2 * m + h * 0.07 * p;
  c.spine.rotation.order = 'YXZ';
  const C = 0.4 * (1 - m) * (1 - u);
  c.spine.rotation.x = -(inp.pitch || 0) * C;
  c.spine.rotation.y = S;

  c.head.rotation.order = 'YXZ';
  c.head.rotation.y = -S;
  c.head.rotation.x =
    -(inp.pitch || 0) * (0.9 - C) -
    (1.05 + 0.15 * r.aim) * u +
    0.18 * r.aim * (1 - m) * (1 - u);
  c.head.rotation.z = -0.15 * r.aim * (1 - m);

  const w = r.aim * (1 - m);
  const T = r.kick * r.kick;
  const E = GRIP_HOME.y + 0.27 * w - 0.04 * m + h * 0.012 * p + Math.sin(r.t * 1.8) * 0.004;
  const D = GRIP_HOME.z - 0.1 * m - 0.06 * T;

  rig.hand.position.set(
    GRIP_HOME.x - 0.06 * m + 0.05 * w,
    E + (1.62 + 0.1 * r.aim - E) * u,
    D + (0.06 - 0.06 * T - 0.05 * r.aim - D) * u
  );
  rig.hand.rotation.set(
    (inp.pitch ? -inp.pitch * 0.9 : 0) * (1 - m) +
      0.3 * (1 - r.aim) * (1 - m) * (1 - 0.7 * u) +
      0.32 * m -
      0.12 * T +
      (inp.gx || 0) -
      l.rotation.x * u +
      0.22 * (1 - r.aim) * u +
      Math.cos(inp.walk * 2) * 0.02 * p,
    0.15 * m + h * 0.03 * p,
    -0.15 * m
  );

  rig.hand.updateMatrix();
  if (rig.held) {
    rig.held.updateMatrix();
  }
  c.spine.updateMatrix();
  ju.copy(c.spine.matrix).invert();

  Ku.copy(zu).lerp(Wu, u);
  handToGrip(rig, 'L', rig.grip.main, Ku);
  Ku.copy(Bu).lerp(Gu, u);
  handToGrip(rig, 'R', rig.grip.support, Ku);
}

/**
 * Positions arm chain to touch item grip point (port of Yu).
 */
export function handToGrip(
  rig: Rig,
  side: 'L' | 'R',
  gripPt: THREE.Vector3,
  pole: THREE.Vector3
): void {
  Vu.copy(gripPt);
  if (rig.held) {
    Vu.applyMatrix4(rig.held.matrix);
  }
  Vu.applyMatrix4(rig.hand.matrix).applyMatrix4(ju);
  twoBoneIK(
    rig.joints[`upperarm.${side}`],
    rig.joints[`forearm.${side}`],
    Vu,
    pole,
    side === 'L' ? Lu : Ru
  );
}
