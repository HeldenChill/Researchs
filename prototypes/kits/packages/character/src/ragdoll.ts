import * as THREE from 'three';
import type { Rig, JointName } from './rig.ts';

export const RAG_DT = 1 / 120;
export const RAG_R = 0.07;
const GRAVITY_PER_STEP = 0.0006805555555555556;
const DAMPING = 0.995;
const CONSTRAINT_PASSES = 6;
const SLEEP_TIME = 4;

const Zu: [string, string, string, string][] = [
  ['hips', 'hipL', 'hipR', 'spine'],
  ['spine', 'shL', 'shR', 'neck'],
];

const Qu: [string, string][] = [
  ['neck', 'top'],
  ['shL', 'elL'],
  ['elL', 'haL'],
  ['shR', 'elR'],
  ['elR', 'haR'],
  ['hipL', 'knL'],
  ['knL', 'ftL'],
  ['hipR', 'knR'],
  ['knR', 'ftR'],
];

const $u: [string, string, number][] = [
  ['hips', 'neck', 0.85],
  ['top', 'shL', 0.8],
  ['top', 'shR', 0.8],
  ['top', 'hips', 0.85],
  ['haL', 'shL', 0.35],
  ['haR', 'shR', 0.35],
  ['ftL', 'hipL', 0.45],
  ['ftR', 'hipR', 0.45],
  ['knL', 'knR', 0.5],
  ['ftL', 'ftR', 0.4],
  ['knL', 'spine', 0.7],
  ['knR', 'spine', 0.7],
];

export interface RagWorld {
  blocked(x: number, z: number, r: number, yLo: number, yHi: number): boolean;
  support(x: number, z: number, yTop: number): number;
}

export interface RagBone {
  j: THREE.Object3D;
  a?: string;
  b?: string;
  d0?: THREE.Vector3;
  q0?: THREE.Quaternion;
  at?: string;
  f?: [string, string, string, string];
  k?: THREE.Quaternion;
  off?: THREE.Vector3;
}

export interface RagState {
  P: Record<string, THREE.Vector3>;
  Q: Record<string, THREE.Vector3>;
  C: [string, string, number, number][];
  bones: RagBone[];
  undo: {
    rest: [THREE.Object3D, THREE.Object3D, THREE.Vector3, THREE.Quaternion, THREE.Vector3][];
    root: [THREE.Vector3, THREE.Quaternion, THREE.Vector3];
  };
  t: number;
  acc: number;
  sleep: boolean;
}

const nd = new THREE.Vector3();
const rd = new THREE.Vector3();
const id = new THREE.Vector3();
const ad = new THREE.Matrix4();
const od = new THREE.Quaternion();
const sd = new THREE.Vector3();

/**
 * Calculates a rotation basis from 4 points (port of cd).
 */
export function basisFrom(
  q: THREE.Quaternion,
  P: Record<string, THREE.Vector3>,
  n: string,
  r: string,
  i: string,
  a: string
): THREE.Quaternion {
  const pI = P[i];
  const pR = P[r];
  const pA = P[a];
  const pN = P[n];
  if (!pI || !pR || !pA || !pN) return q;

  nd.subVectors(pI, pR).normalize();
  rd.subVectors(pA, pN);
  rd.addScaledVector(nd, -rd.dot(nd)).normalize();
  id.crossVectors(nd, rd);
  ad.makeBasis(nd, rd, id);
  return q.setFromRotationMatrix(ad);
}

/**
 * Activates verlet ragdoll physics on the character rig (port of ld).
 */
export function startRagdoll(
  rig: Rig,
  push: THREE.Vector3 | null,
  hitPoint: THREE.Vector3 | null
): void {
  const joints = rig.joints;
  rig.root.updateMatrixWorld(true);

  const localToWorld = (j: THREE.Object3D, x = 0, y = 0, z = 0) =>
    j.localToWorld(new THREE.Vector3(x, y, z));

  const armLenL = joints['forearm.L'].position.length();
  const armLenR = joints['forearm.R'].position.length();
  const legLenL = joints['shin.L'].position.length();
  const legLenR = joints['shin.R'].position.length();
  const neckOrHead = joints.neck || joints.head;

  const P: Record<string, THREE.Vector3> = {
    hips: localToWorld(joints.hips),
    hipL: localToWorld(joints['thigh.L']),
    hipR: localToWorld(joints['thigh.R']),
    spine: localToWorld(joints.spine),
    shL: localToWorld(joints['upperarm.L']),
    shR: localToWorld(joints['upperarm.R']),
    neck: localToWorld(neckOrHead),
    top: localToWorld(joints.head, 0, 0.32, 0),
    elL: localToWorld(joints['forearm.L']),
    haL: localToWorld(joints['forearm.L'], armLenL, 0, 0),
    elR: localToWorld(joints['forearm.R']),
    haR: localToWorld(joints['forearm.R'], -armLenR, 0, 0),
    knL: localToWorld(joints['shin.L']),
    ftL: localToWorld(joints['shin.L'], 0, -legLenL, 0),
    knR: localToWorld(joints['shin.R']),
    ftR: localToWorld(joints['shin.R'], 0, -legLenR, 0),
  };

  const worldTransforms = Object.entries(joints).map(([name, j]) => {
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    j.matrixWorld.decompose(pos, quat, scale);
    return [name, j, pos, quat, scale] as const;
  });

  const undo = {
    rest: Object.values(joints).map((j) => [
      j,
      j.parent as THREE.Object3D,
      j.position.clone(),
      j.quaternion.clone(),
      j.scale.clone(),
    ] as [THREE.Object3D, THREE.Object3D, THREE.Vector3, THREE.Quaternion, THREE.Vector3]),
    root: [
      rig.root.position.clone(),
      rig.root.quaternion.clone(),
      rig.root.scale.clone(),
    ] as [THREE.Vector3, THREE.Quaternion, THREE.Vector3],
  };

  rig.root.position.set(0, 0, 0);
  rig.root.rotation.set(0, 0, 0);
  rig.root.scale.set(1, 1, 1);

  for (const [, j, pos, quat, scale] of worldTransforms) {
    rig.root.add(j);
    j.position.copy(pos);
    j.quaternion.copy(quat);
    j.scale.copy(scale);
  }

  if (rig.hand) {
    rig.hand.visible = false;
  }

  const bones: RagBone[] = [];
  const addDirBone = (name: JointName, a: string, b: string) => {
    const pA = P[a];
    const pB = P[b];
    if (joints[name] && pA && pB) {
      bones.push({
        j: joints[name],
        a,
        b,
        d0: sd.subVectors(pB, pA).normalize().clone(),
        q0: joints[name].quaternion.clone(),
      });
    }
  };

  addDirBone('upperarm.L', 'shL', 'elL');
  addDirBone('forearm.L', 'elL', 'haL');
  addDirBone('upperarm.R', 'shR', 'elR');
  addDirBone('forearm.R', 'elR', 'haR');
  addDirBone('thigh.L', 'hipL', 'knL');
  addDirBone('shin.L', 'knL', 'ftL');
  addDirBone('thigh.R', 'hipR', 'knR');
  addDirBone('shin.R', 'knR', 'ftR');

  const addBasisBone = (
    name: JointName,
    at: string,
    f: [string, string, string, string]
  ) => {
    const pAt = P[at];
    if (!joints[name] || !pAt) return;
    const aQuat = basisFrom(new THREE.Quaternion(), P, f[0], f[1], f[2], f[3]);
    const aInv = aQuat.clone().invert();
    bones.push({
      j: joints[name],
      at,
      f,
      k: aInv.clone().multiply(joints[name].quaternion),
      off: joints[name].position.clone().sub(pAt).applyQuaternion(aInv),
    });
  };

  addBasisBone('hips', 'hips', ['hips', 'hipR', 'hipL', 'spine']);
  addBasisBone('spine', 'spine', ['spine', 'shR', 'shL', 'neck']);
  if (joints.neck) {
    addBasisBone('neck', 'neck', ['neck', 'shR', 'shL', 'top']);
  }
  addBasisBone('head', 'neck', ['neck', 'shR', 'shL', 'top']);

  const C: [string, string, number, number][] = [];
  for (const group of Zu) {
    for (let t = 0; t < group.length; t++) {
      for (let n = t + 1; n < group.length; n++) {
        const aName = group[t];
        const bName = group[n];
        if (aName && bName && P[aName] && P[bName]) {
          C.push([aName, bName, P[aName]!.distanceTo(P[bName]!), 0]);
        }
      }
    }
  }
  for (const [e, t] of Qu) {
    if (P[e] && P[t]) {
      C.push([e, t, P[e]!.distanceTo(P[t]!), 0]);
    }
  }
  for (const [e, t, factor] of $u) {
    if (P[e] && P[t]) {
      C.push([e, t, P[e]!.distanceTo(P[t]!) * factor, 1]);
    }
  }

  const pushVec = push ? sd.copy(push).setY(Math.max(0, push.y)).normalize() : sd.set(0, 0, 0);
  let hitBone: string | null = null;
  let minDist = 1e9;
  if (hitPoint) {
    for (const name in P) {
      const pt = P[name];
      if (pt) {
        const dist = pt.distanceTo(hitPoint);
        if (dist < minDist) {
          minDist = dist;
          hitBone = name;
        }
      }
    }
  }

  const Q: Record<string, THREE.Vector3> = {};
  for (const name in P) {
    const pt = P[name];
    if (pt) {
      const rand = (Math.random() - 0.5) * 0.6; // u(-0.3, 0.3)
      const vel = pushVec.clone().multiplyScalar(1.4 + (name === hitBone ? 3.2 : 0) + rand);
      vel.y += 0.4;
      Q[name] = pt.clone().addScaledVector(vel, -RAG_DT);
    }
  }

  rig.rag = { P, Q, C, bones, undo, t: 0, acc: 0, sleep: false };
}

/**
 * Restores rig back from ragdoll state (port of ud).
 */
export function endRagdoll(rig: Rig): void {
  const rag = rig.rag;
  if (!rag) return;

  for (const [j, parent, pos, quat, scale] of rag.undo.rest) {
    parent.add(j);
    j.position.copy(pos);
    j.quaternion.copy(quat);
    j.scale.copy(scale);
  }

  rig.root.position.copy(rag.undo.root[0]);
  rig.root.quaternion.copy(rag.undo.root[1]);
  rig.root.scale.copy(rag.undo.root[2]);

  if (rig.hand) {
    rig.hand.visible = true;
  }
  rig.rag = null;
}

/**
 * Executes one verlet physics integration sub-step (port of dd).
 */
function verletStep(rag: RagState, w: RagWorld): void {
  const P = rag.P;
  const Q = rag.Q;

  // Integrate positions with damping and gravity
  for (const k in P) {
    const r = P[k];
    const i = Q[k];
    if (!r || !i) continue;
    const ax = (r.x - i.x) * DAMPING;
    const ay = (r.y - i.y) * DAMPING;
    const az = (r.z - i.z) * DAMPING;
    i.copy(r);
    r.x += ax;
    r.y += ay - GRAVITY_PER_STEP;
    r.z += az;
  }

  // Relaxation constraint passes
  for (let iter = 0; iter < CONSTRAINT_PASSES; iter++) {
    for (const [aName, bName, restDist, maxOnly] of rag.C) {
      const e = P[aName];
      const o = P[bName];
      if (!e || !o) continue;
      sd.subVectors(o, e);
      const dist = sd.length();
      if (dist < 1e-6 || (maxOnly && dist >= restDist)) continue;
      sd.multiplyScalar(((dist - restDist) / dist) * 0.5);
      e.add(sd);
      o.sub(sd);
    }

    // World collision against geometry
    for (const k in P) {
      const r = P[k];
      const i = Q[k];
      if (!r || !i) continue;
      if (w.blocked(r.x, r.z, RAG_R, r.y - 0.5, r.y - 0.5 + 0.01)) {
        r.x = i.x;
        r.z = i.z;
      }
      const floorY = w.support(r.x, r.z, r.y + 0.4) + RAG_R;
      if (r.y < floorY) {
        r.y = floorY;
        i.x += (r.x - i.x) * 0.25;
        i.z += (r.z - i.z) * 0.25;
      }
    }
  }
}

/**
 * Steps the ragdoll physics and updates bone transforms (port of fd).
 */
export function stepRagdoll(rig: Rig, w: RagWorld, dt: number): void {
  const rag = rig.rag;
  if (!rag || rag.sleep) return;

  rag.t += dt;
  rag.acc = Math.min(rag.acc + dt, 0.05);
  while (rag.acc >= RAG_DT) {
    rag.acc -= RAG_DT;
    verletStep(rag, w);
  }

  const P = rag.P;
  for (const bone of rag.bones) {
    if (bone.d0 && bone.a && bone.b && P[bone.a] && P[bone.b]) {
      const pA = P[bone.a]!;
      const pB = P[bone.b]!;
      bone.j.position.copy(pA);
      od.setFromUnitVectors(bone.d0, sd.subVectors(pB, pA).normalize());
      bone.j.quaternion.copy(od).multiply(bone.q0!);
    } else if (bone.f && bone.at && P[bone.at]) {
      basisFrom(od, P, bone.f[0], bone.f[1], bone.f[2], bone.f[3]);
      bone.j.quaternion.copy(od).multiply(bone.k!);
      bone.j.position.copy(bone.off!).applyQuaternion(od).add(P[bone.at]!);
    }
  }

  if (rag.t >= SLEEP_TIME - 1e-4) {
    rag.sleep = true;
  }
}
