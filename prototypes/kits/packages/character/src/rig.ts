import * as THREE from 'three';
import type { LocoState } from './locomotion.ts';
import type { RagState } from './ragdoll.ts';

export type JointName =
  | 'hips'
  | 'spine'
  | 'neck'
  | 'head'
  | 'upperarm.L'
  | 'forearm.L'
  | 'upperarm.R'
  | 'forearm.R'
  | 'thigh.L'
  | 'shin.L'
  | 'thigh.R'
  | 'shin.R';

export interface RigTemplate {
  joints: Record<
    string,
    {
      pos: THREE.Vector3;
      parts: { geo: THREE.BufferGeometry; part: string; p: THREE.Vector3; q: THREE.Quaternion }[];
      parent: string | null;
    }
  >;
}

export const GRIP_HOME = new THREE.Vector3(0.06, 1.4, 0.3);
export const DEFAULT_GRIP = {
  main: [0, -0.105, 0.085] as [number, number, number],
  support: [0, -0.035, -0.33] as [number, number, number],
};

const normJointName = (name: string): string =>
  name.replace(/^(upperarm|forearm|thigh|shin)\.?([LR])$/, '$1.$2');

/**
 * Reads bone positions and mesh geometries from soldier.glb (port of Du).
 */
export function readRigTemplate(charModel: THREE.Object3D): RigTemplate {
  charModel.updateMatrixWorld(true);
  const rawJoints: Record<string, THREE.Object3D> = {};
  const tempPos = new THREE.Vector3();

  charModel.traverse((obj) => {
    if (
      !(obj as THREE.Mesh).isMesh &&
      /^(hips|spine|neck|head|upperarm|forearm|thigh|shin)/.test(obj.name)
    ) {
      rawJoints[normJointName(obj.name)] = obj;
    }
  });

  const joints: RigTemplate['joints'] = {};
  for (const [normName, obj] of Object.entries(rawJoints)) {
    obj.getWorldPosition(tempPos);
    const parts = obj.children
      .filter((c): c is THREE.Mesh => (c as THREE.Mesh).isMesh)
      .map((mesh) => {
        const p = new THREE.Vector3();
        const q = new THREE.Quaternion();
        const s = new THREE.Vector3();
        mesh.matrixWorld.decompose(p, q, s);
        p.sub(tempPos);
        return {
          geo: mesh.geometry,
          part: mesh.name.split('_')[0] ?? 'body',
          p,
          q,
        };
      });

    const parentName =
      obj.parent && rawJoints[normJointName(obj.parent.name)]
        ? normJointName(obj.parent.name)
        : null;

    joints[normName] = {
      pos: tempPos.clone(),
      parts,
      parent: parentName,
    };
  }

  return { joints };
}

export interface Rig {
  root: THREE.Group;
  upper: THREE.Group;
  joints: Record<JointName, THREE.Group>;
  hand: THREE.Group; // gp
  held: THREE.Object3D | null;
  grip: { main: THREE.Vector3; support: THREE.Vector3 };
  anim: LocoState | null;
  rag: RagState | null;
  meshes: THREE.Mesh[];
}

/**
 * Builds the hierarchical bone rig and meshes from template (port of Ou).
 */
export function buildRig(
  t: RigTemplate,
  mats: { head: THREE.Material; body: THREE.Material; arm: THREE.Material; leg: THREE.Material }
): Rig {
  const root = new THREE.Group();
  const upper = new THREE.Group();
  root.add(upper);

  const meshes: THREE.Mesh[] = [];
  const jointGroups: Partial<Record<JointName, THREE.Group>> = {};

  const getOrCreateJoint = (name: string): THREE.Group => {
    if (jointGroups[name as JointName]) {
      return jointGroups[name as JointName]!;
    }
    const def = t.joints[name];
    const group = new THREE.Group();
    jointGroups[name as JointName] = group;
    if (!def) return group;

    const parentDef = def.parent ? t.joints[def.parent] : null;
    const parentPos = name === 'spine' ? null : parentDef ? parentDef.pos : null;

    if (name === 'spine') {
      group.position.copy(def.pos);
      upper.add(group);
    } else if (def.parent && parentPos) {
      group.position.copy(def.pos).sub(parentPos);
      getOrCreateJoint(def.parent).add(group);
    } else {
      group.position.copy(def.pos);
      root.add(group);
    }

    const matMap = mats as Record<string, THREE.Material>;
    for (const part of def.parts) {
      const mat = matMap[part.part] ?? mats.body;
      const mesh = new THREE.Mesh(part.geo, mat);
      mesh.position.copy(part.p);
      mesh.quaternion.copy(part.q);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      meshes.push(mesh);
    }

    return group;
  };

  for (const name of Object.keys(t.joints)) {
    getOrCreateJoint(name);
  }

  // Initial rest pose arm rotations (from Ou)
  const setJointRot = (name: string, fromAxis: THREE.Vector3, toDir: THREE.Vector3) => {
    const group = jointGroups[name as JointName]!;
    const quat = new THREE.Quaternion().setFromUnitVectors(fromAxis, toDir.clone().normalize());
    const parentQuat = new THREE.Quaternion();
    group.parent!.getWorldQuaternion(parentQuat);
    group.quaternion.copy(parentQuat.invert().multiply(quat));
  };

  root.updateMatrixWorld(true);
  const axisX = new THREE.Vector3(1, 0, 0);
  const axisNegX = new THREE.Vector3(-1, 0, 0);

  setJointRot('upperarm.L', axisX, new THREE.Vector3(0, -0.8, 0.6));
  root.updateMatrixWorld(true);
  setJointRot('forearm.L', axisX, new THREE.Vector3(-0.5, 0, 0.85));
  setJointRot('upperarm.R', axisNegX, new THREE.Vector3(0.15, -0.7, 0.7));
  root.updateMatrixWorld(true);
  setJointRot('forearm.R', axisNegX, new THREE.Vector3(0.7, 0, 0.7));

  // Hand group for held items
  const hand = new THREE.Group();
  hand.position.copy(GRIP_HOME);
  upper.add(hand);

  return {
    root,
    upper,
    joints: jointGroups as Record<JointName, THREE.Group>,
    hand,
    held: null,
    grip: {
      main: new THREE.Vector3(...DEFAULT_GRIP.main),
      support: new THREE.Vector3(...DEFAULT_GRIP.support),
    },
    anim: null,
    rag: null,
    meshes,
  };
}

/**
 * Attaches a held item to the rig's hand group with appropriate grip offsets (port of qu).
 */
export function setHeld(
  rig: Rig,
  mesh: THREE.Object3D | null,
  grip?: { main: [number, number, number]; support: [number, number, number] }
): void {
  if (rig.held) {
    rig.hand.remove(rig.held);
    rig.held = null;
  }

  if (mesh) {
    mesh.rotation.y = Math.PI;
    mesh.position.set(0, 0, 0.2);
    rig.hand.add(mesh);
    rig.held = mesh;
    rig.hand.visible = true;

    if (grip) {
      rig.grip = {
        main: new THREE.Vector3(...grip.main),
        support: new THREE.Vector3(...grip.support),
      };
    } else {
      rig.grip = {
        main: new THREE.Vector3(...DEFAULT_GRIP.main),
        support: new THREE.Vector3(...DEFAULT_GRIP.support),
      };
    }
  } else {
    rig.hand.visible = false;
  }
}
