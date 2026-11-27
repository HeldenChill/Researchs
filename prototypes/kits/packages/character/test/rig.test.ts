import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  readRigTemplate,
  buildRig,
  type RigTemplate,
  type JointName,
} from '../src/rig.ts';
import { poseBody } from '../src/locomotion.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const glbPath = path.resolve(here, '../assets/soldier.glb');

const JOINT_NAMES: JointName[] = [
  'hips',
  'spine',
  'neck',
  'head',
  'upperarm.L',
  'forearm.L',
  'upperarm.R',
  'forearm.R',
  'thigh.L',
  'shin.L',
  'thigh.R',
  'shin.R',
];

describe('rig and locomotion smoke', () => {
  let template: RigTemplate;
  let charScene: THREE.Object3D;

  beforeAll(async () => {
    const buf = fs.readFileSync(glbPath);
    const loader = new GLTFLoader();
    const gltf = await new Promise<any>((resolve, reject) => {
      loader.parse(
        buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
        '',
        resolve,
        reject
      );
    });
    charScene = gltf.scene;
    template = readRigTemplate(charScene);
  });

  it('readRigTemplate finds all 12 JointNames', () => {
    const jointKeys = Object.keys(template.joints).sort();
    expect(jointKeys).toEqual([...JOINT_NAMES].sort());
    for (const name of JOINT_NAMES) {
      const j = template.joints[name];
      expect(j).toBeDefined();
      expect(j!.pos).toBeInstanceOf(THREE.Vector3);
    }
  });

  it('buildRig returns a rig whose meshes.length === 11', () => {
    const mats = {
      head: new THREE.MeshBasicMaterial(),
      body: new THREE.MeshBasicMaterial(),
      arm: new THREE.MeshBasicMaterial(),
      leg: new THREE.MeshBasicMaterial(),
    };
    const rig = buildRig(template, mats);
    expect(rig.meshes.length).toBe(11);
  });

  it('after poseBody every joint quaternion is finite', () => {
    const mats = {
      head: new THREE.MeshBasicMaterial(),
      body: new THREE.MeshBasicMaterial(),
      arm: new THREE.MeshBasicMaterial(),
      leg: new THREE.MeshBasicMaterial(),
    };
    const rig = buildRig(template, mats);
    poseBody(
      rig,
      {
        walk: 1,
        cr: 0,
        pr: 0,
        ln: 0,
        sp: false,
        sl: false,
        aim: false,
        pitch: 0,
        gx: 0,
      },
      1 / 60
    );

    for (const name of JOINT_NAMES) {
      const j = rig.joints[name];
      expect(Number.isFinite(j.quaternion.x)).toBe(true);
      expect(Number.isFinite(j.quaternion.y)).toBe(true);
      expect(Number.isFinite(j.quaternion.z)).toBe(true);
      expect(Number.isFinite(j.quaternion.w)).toBe(true);
    }
  });
});
