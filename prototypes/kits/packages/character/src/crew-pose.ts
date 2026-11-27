import * as THREE from 'three';
import type { Rig } from './rig.ts';
import { poseBody } from './locomotion.ts';
import { twoBoneIK } from './ik.ts';

export interface CrewPoseInput {
  x: number;
  y: number;
  z: number;
  yaw: number; // feet position in the rig's parent space, @hk/player yaw
  carry: { side: number; mass: number } | null; // crate edge length m, kg
  climb: number; // 0..1, 1 = floor steeper than the climb angle
  seated: { seatY: number; lean: number; bank: number } | null; // hip height m; lean/bank -1..1
  hook: { x: number; y: number; z: number; reel: boolean } | null; // target in rig parent space
  /** 0..1 lying flat (knocked down); optional, default 0 */
  prone?: number;
}

export interface CrewPoseState {
  walk: number;
  lastX: number;
  lastZ: number;
  t: number;
}

const stateMap = new WeakMap<Rig, CrewPoseState>();

export function crewPoseState(rig: Rig): CrewPoseState | undefined {
  return stateMap.get(rig);
}

// Reusable scratch vectors
const Lu = new THREE.Vector3(1, 0, 0);
const Ru = new THREE.Vector3(-1, 0, 0);
// Elbow poles in spine space (elbows out and back):
const poleL = new THREE.Vector3(1, -0.6, -0.3);
const poleR = new THREE.Vector3(-1, -0.6, -0.3);
const poleClimbL = new THREE.Vector3(1, 0.5, -0.2);
const poleClimbR = new THREE.Vector3(-1, 0.5, -0.2);

const Hu = new THREE.Vector3(0, -1, 0); // thigh/shin axis
const Uu = new THREE.Vector3(0, 0, 1);  // pole for legs

const _vTarget = new THREE.Vector3();
const _invSpine = new THREE.Matrix4();

export function handTip(rig: Rig, side: 'L' | 'R', out: THREE.Vector3): THREE.Vector3 {
  const forearm = rig.joints[`forearm.${side}`];
  // Forearm joint local pos is (+0.36, 0, 0) for L and (-0.36, 0, 0) for R.
  // The forearm bone extends 0.36m along that same direction to the wrist/hand tip.
  // the forearm is as long as the upper arm (twoBoneIK assumes equal bones): tip = elbow offset again
  out.copy(forearm.position);
  forearm.localToWorld(out);
  return out;
}

function solveArmIK(
  rig: Rig,
  side: 'L' | 'R',
  targetInSpineSpace: THREE.Vector3,
  pole: THREE.Vector3
): void {
  twoBoneIK(
    rig.joints[`upperarm.${side}`],
    rig.joints[`forearm.${side}`],
    targetInSpineSpace,
    pole,
    side === 'L' ? Lu : Ru
  );
}

export function poseCrew(rig: Rig, inp: CrewPoseInput, dt: number): void {
  let state = stateMap.get(rig);
  if (!state) {
    state = {
      walk: 0,
      lastX: inp.x,
      lastZ: inp.z,
      t: 0,
    };
    stateMap.set(rig, state);
  }

  // 1. Walk phase: dist = hypot(x - lastX, z - lastZ)
  const dist = Math.hypot(inp.x - state.lastX, inp.z - state.lastZ);
  if (dist < 2) {
    const factor = inp.carry ? Math.max(0.55, 1 - inp.carry.mass / 1600) : 1;
    state.walk += dist * 3.2 * factor;
  }
  state.lastX = inp.x;
  state.lastZ = inp.z;
  state.t += dt;

  // 2. Root: position.set(x, y, z), rotation.order = 'YXZ', rotation.y = yaw + Math.PI
  rig.root.position.set(inp.x, inp.y, inp.z);
  rig.root.rotation.order = 'YXZ';
  rig.root.rotation.y = inp.yaw + Math.PI;
  // knocked down: tip the whole body flat (Quarry Nine prone tip 1.45 rad, lifted 0.18 m)
  const pr = inp.seated ? 0 : Math.max(0, Math.min(1, inp.prone ?? 0));
  rig.root.rotation.x = 1.45 * pr;
  rig.root.position.y = inp.y + 0.18 * pr;

  const c = rig.joints;

  // 3 & 4. Seated or Not seated
  if (!inp.seated) {
    poseBody(
      rig,
      {
        walk: state.walk,
        cr: 0.35 * inp.climb * (1 - pr),
        pr,
        ln: 0,
        sp: false,
        sl: false,
        aim: false,
        pitch: 0.5 * inp.climb,
        gx: 0,
      },
      dt
    );
    rig.upper.rotation.x += 0.45 * inp.climb;
  } else {
    // Seated pose:
    // Hips joint local y set so hips sit at seatY above root
    c.hips.position.y = inp.seated.seatY;

    // Both thighs rotated to point forward (+z in rig space) and shins down (-y)
    for (const [side, n] of [['L', 1], ['R', -1]] as const) {
      const sideX = n * 0.13;
      const targetFoot = new THREE.Vector3(sideX, -0.42, 0.42);
      twoBoneIK(c[`thigh.${side}`], c[`shin.${side}`], targetFoot, Uu, Hu);
    }

    rig.upper.rotation.order = 'YXZ';
    rig.upper.rotation.x = 0.25 * inp.seated.lean;
    rig.upper.rotation.z = -0.2 * inp.seated.bank;
    rig.upper.rotation.y = 0;
    // the torso drops with the hips (rest pose: hips 0.9 m)
    rig.upper.position.set(0, inp.seated.seatY - 0.9, 0);

    c.spine.rotation.set(0, 0, 0);
    c.head.rotation.set(0, 0, 0);
  }

  // Hide hand (no held item) on every call
  rig.hand.visible = false;
  if (rig.held) {
    rig.held.visible = false;
  }

  // Update matrices for spine and rig so IK target transforms are exact
  rig.root.updateMatrix();
  rig.root.updateMatrixWorld(true);
  rig.upper.updateMatrix();
  rig.upper.updateMatrixWorld(true);
  c.spine.updateMatrix();
  c.spine.updateMatrixWorld(true);
  _invSpine.copy(c.spine.matrixWorld).invert();

  // 5. Arms (after 3/4), first match wins:
  if (inp.hook) {
    // hook: right hand IK toward the target, clamped to arm reach;
    // when reel, pull the target back toward the shoulder by 0.15 * (0.5 + 0.5 * sin(t * 12)).
    // Left arm keeps poseBody pose (or default).
    const hookWorld = new THREE.Vector3(inp.hook.x, inp.hook.y, inp.hook.z);
    if (rig.root.parent) {
      rig.root.parent.localToWorld(hookWorld);
    }

    // Shoulder (upperarm.R) world pos
    const shoulderRWorld = new THREE.Vector3();
    c['upperarm.R'].getWorldPosition(shoulderRWorld);

    if (inp.hook.reel) {
      const dirToShoulder = new THREE.Vector3().subVectors(shoulderRWorld, hookWorld).normalize();
      const pull = 0.15 * (0.5 + 0.5 * Math.sin(state.t * 12));
      hookWorld.addScaledVector(dirToShoulder, pull);
    }

    // Two bones each of length 0.36m => total arm reach = 0.72m
    const toTarget = new THREE.Vector3().subVectors(hookWorld, shoulderRWorld);
    const maxReach = 0.71;
    if (toTarget.length() > maxReach) {
      toTarget.setLength(maxReach);
      hookWorld.copy(shoulderRWorld).add(toTarget);
    }

    _vTarget.copy(hookWorld).applyMatrix4(_invSpine);
    solveArmIK(rig, 'R', _vTarget, poleR);
    rig.joints['upperarm.R'].updateMatrixWorld(true);
    rig.joints['forearm.R'].updateMatrixWorld(true);
  } else if (inp.carry) {
    // carry: both hands IK to the crate sides: crate center 0.45 m ahead of the chest at chest height
    // (1.2 m above feet), hands at ±(side/2) on the rig's x axis.
    const sideHalf = inp.carry.side / 2;
    // left shoulder is at +x in rig space
    const targetL_rig = new THREE.Vector3(sideHalf, 1.2, 0.45);
    const targetR_rig = new THREE.Vector3(-sideHalf, 1.2, 0.45);

    const targetL_world = targetL_rig.applyMatrix4(rig.root.matrixWorld);
    const targetR_world = targetR_rig.applyMatrix4(rig.root.matrixWorld);

    _vTarget.copy(targetL_world).applyMatrix4(_invSpine);
    solveArmIK(rig, 'L', _vTarget, poleL);

    _vTarget.copy(targetR_world).applyMatrix4(_invSpine);
    solveArmIK(rig, 'R', _vTarget, poleR);

    rig.joints['upperarm.L'].updateMatrixWorld(true);
    rig.joints['forearm.L'].updateMatrixWorld(true);
    rig.joints['upperarm.R'].updateMatrixWorld(true);
    rig.joints['forearm.R'].updateMatrixWorld(true);
  } else if (inp.climb > 0.5) {
    // climb > 0.5: hands reach up-forward (0.5 m ahead, 1.9 m up), alternating ±0.15 m in height with sin(walk).
    const walkSin = Math.sin(state.walk);
    const targetL_rig = new THREE.Vector3(0.2, 1.9 + 0.15 * walkSin, 0.5);
    const targetR_rig = new THREE.Vector3(-0.2, 1.9 - 0.15 * walkSin, 0.5);

    const targetL_world = targetL_rig.applyMatrix4(rig.root.matrixWorld);
    const targetR_world = targetR_rig.applyMatrix4(rig.root.matrixWorld);

    _vTarget.copy(targetL_world).applyMatrix4(_invSpine);
    solveArmIK(rig, 'L', _vTarget, poleClimbL);

    _vTarget.copy(targetR_world).applyMatrix4(_invSpine);
    solveArmIK(rig, 'R', _vTarget, poleClimbR);

    rig.joints['upperarm.L'].updateMatrixWorld(true);
    rig.joints['forearm.L'].updateMatrixWorld(true);
    rig.joints['upperarm.R'].updateMatrixWorld(true);
    rig.joints['forearm.R'].updateMatrixWorld(true);
  } else if (inp.seated) {
    // seated: both hands IK to points 0.45 m ahead of the chest, 0.25 m apart, at seatY + 0.35.
    const seatTargetY = inp.seated.seatY + 0.35;
    const targetL_rig = new THREE.Vector3(0.125, seatTargetY, 0.45);
    const targetR_rig = new THREE.Vector3(-0.125, seatTargetY, 0.45);

    const targetL_world = targetL_rig.applyMatrix4(rig.root.matrixWorld);
    const targetR_world = targetR_rig.applyMatrix4(rig.root.matrixWorld);

    _vTarget.copy(targetL_world).applyMatrix4(_invSpine);
    solveArmIK(rig, 'L', _vTarget, poleL);

    _vTarget.copy(targetR_world).applyMatrix4(_invSpine);
    solveArmIK(rig, 'R', _vTarget, poleR);

    rig.joints['upperarm.L'].updateMatrixWorld(true);
    rig.joints['forearm.L'].updateMatrixWorld(true);
    rig.joints['upperarm.R'].updateMatrixWorld(true);
    rig.joints['forearm.R'].updateMatrixWorld(true);
  }
}
