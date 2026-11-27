import * as THREE from 'three';
import type { Rig } from './rig.ts';
import { twoBoneIK } from './ik.ts';

const Lu = new THREE.Vector3(1, 0, 0);
const Ru = new THREE.Vector3(-1, 0, 0);
const Hu = new THREE.Vector3(0, -1, 0);
const Uu = new THREE.Vector3(0, 0, 1);
const Ku = new THREE.Vector3();
const op = new THREE.Vector3();

/**
 * Procedural guard patrol / walking animation (port of lp walker branch from Quarry Nine).
 */
export function poseGuardWalk(rig: Rig, walk: number, look: number, dt: number): void {
  const an = (rig.anim ||= {
    sp: 0,
    sl: 0,
    aim: 0,
    mv: 0,
    kick: 0,
    t: Math.random() * 9,
    px: rig.root.position.x,
    pz: rig.root.position.z,
  });

  const px = rig.root.position.x;
  const pz = rig.root.position.z;
  const r = Math.hypot(px - an.px, pz - an.pz) / Math.max(dt, 0.001);
  an.px = px;
  an.pz = pz;

  const deltaWalk = an.walk !== undefined ? Math.abs(walk - an.walk) : 0;
  an.walk = walk;
  const walkSpeed = deltaWalk > 0 ? deltaWalk / (3.2 * Math.max(dt, 0.001)) : 0;
  const speed = Math.max(r, walkSpeed);

  if (speed < 15) {
    an.mv += (Math.min(1, speed / 1.8) - an.mv) * Math.min(1, dt * 6);
  }
  an.t += dt;

  const c = rig.joints;
  const l = rig.upper;
  const d = an.mv;
  const f = walk;

  const stride = 0.25 * d;
  const lift = 0.1 * d;
  const y = 0.9 - 0.05 + (Math.abs(Math.cos(f)) - 0.6) * 0.05 * d;
  c.hips.position.y = y;

  // Legs IK
  for (const [side, n, off] of [
    ['L', 1, 0],
    ['R', -1, Math.PI],
  ] as const) {
    const sw = Math.sin(f + off);
    const cw = Math.cos(f + off);
    const u = n * 0.14;
    const p = Math.max(0, cw) * lift;
    const m = sw * stride;
    op.set(u, p - y, m);
    Ku.copy(Uu);
    twoBoneIK(c[`thigh.${side}`], c[`shin.${side}`], op, Ku, Hu);
  }

  // Upper body rotation & position
  const b = 0.32 + 0.06 * Math.sin(an.t * 1.3) * (1 - d);
  l.rotation.order = 'YXZ';
  l.rotation.x = b;
  l.rotation.z = Math.sin(f) * 0.15 * d + Math.sin(an.t * 0.7) * 0.08 * (1 - d);
  l.updateMatrix();
  op.set(0, 0.9, 0).applyQuaternion(l.quaternion);
  l.position.set(-op.x, y - op.y, -op.z);

  // Spine & Head
  c.spine.rotation.order = 'YXZ';
  c.spine.rotation.x = 0;
  c.spine.rotation.y = Math.sin(f) * 0.1 * d;

  c.head.rotation.order = 'YXZ';
  c.head.rotation.x = -b * 0.55 - look * 0.8 + Math.sin(an.t * 0.9) * 0.12 * (1 - d);
  c.head.rotation.z = Math.sin(an.t * 0.6) * 0.32;
  c.head.rotation.y = Math.sin(an.t * 0.43) * 0.22 - c.spine.rotation.y * 0.5;

  // Arms
  for (const [side, rSign, oIdx] of [
    ['L', 1, 0],
    ['R', -1, 1],
  ] as const) {
    const lAng = f + (rSign > 0 ? 0 : Math.PI);
    op.set(
      rSign * -0.04 + Math.sin(an.t * 1.7 + oIdx) * 0.03,
      -0.1 + Math.sin(lAng) * 0.06 * d + Math.sin(an.t * 2.3 + oIdx * 2) * 0.025,
      0.5 + Math.cos(lAng) * 0.05 * d
    );
    op.add(c[`upperarm.${side}`].position);
    Ku.set(rSign, -0.8, -0.2);
    twoBoneIK(
      c[`upperarm.${side}`],
      c[`forearm.${side}`],
      op,
      Ku,
      rSign > 0 ? Lu : Ru
    );
  }
}
