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
import {
  poseCrew,
  crewPoseState,
  handTip,
  type CrewPoseInput,
} from '../src/crew-pose.ts';

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

describe('crew poses in the kit', () => {
  let template: RigTemplate;
  let parent: THREE.Group;

  const baseInput = (): CrewPoseInput => ({
    x: 0,
    y: 0,
    z: 0,
    yaw: 0,
    carry: null,
    climb: 0,
    seated: null,
    hook: null,
  });

  const makeRig = () => {
    const mats = {
      head: new THREE.MeshBasicMaterial(),
      body: new THREE.MeshBasicMaterial(),
      arm: new THREE.MeshBasicMaterial(),
      leg: new THREE.MeshBasicMaterial(),
    };
    const rig = buildRig(template, mats);
    parent = new THREE.Group();
    parent.add(rig.root);
    return rig;
  };

  const expectAllJointsFinite = (rig: ReturnType<typeof makeRig>) => {
    for (const name of JOINT_NAMES) {
      const j = rig.joints[name];
      expect(Number.isFinite(j.position.x)).toBe(true);
      expect(Number.isFinite(j.position.y)).toBe(true);
      expect(Number.isFinite(j.position.z)).toBe(true);
      expect(Number.isFinite(j.quaternion.x)).toBe(true);
      expect(Number.isFinite(j.quaternion.y)).toBe(true);
      expect(Number.isFinite(j.quaternion.z)).toBe(true);
      expect(Number.isFinite(j.quaternion.w)).toBe(true);
    }
  };

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
    template = readRigTemplate(gltf.scene);
  });

  it('standing still does not advance walk', () => {
    const rig = makeRig();
    const inp = baseInput();
    for (let i = 0; i < 30; i++) {
      poseCrew(rig, inp, 1 / 60);
      parent.updateMatrixWorld(true);
    }
    expect(crewPoseState(rig)!.walk).toBe(0);
    expectAllJointsFinite(rig);
  });

  it('moving advances walk; teleport does not', () => {
    const rig = makeRig();
    const inp = baseInput();
    poseCrew(rig, inp, 1 / 60); // first call only creates the walk state at the start position
    for (let i = 0; i < 20; i++) {
      inp.z += 0.05;
      poseCrew(rig, inp, 1 / 60);
      parent.updateMatrixWorld(true);
    }
    expect(crewPoseState(rig)!.walk).toBeCloseTo(20 * 0.05 * 3.2, 5);

    const walkBefore = crewPoseState(rig)!.walk;
    inp.z += 5.0; // teleport
    poseCrew(rig, inp, 1 / 60);
    parent.updateMatrixWorld(true);
    expect(crewPoseState(rig)!.walk).toBe(walkBefore);
    expectAllJointsFinite(rig);
  });

  it('heavy carry walks slower', () => {
    const rig = makeRig();
    const inp = baseInput();
    inp.carry = { side: 0.8, mass: 800 };
    poseCrew(rig, inp, 1 / 60); // first call only creates the walk state at the start position
    for (let i = 0; i < 20; i++) {
      inp.z += 0.05;
      poseCrew(rig, inp, 1 / 60);
      parent.updateMatrixWorld(true);
    }
    // 20 * 0.05 * 3.2 * 0.55 = 1.76
    expect(crewPoseState(rig)!.walk).toBeCloseTo(1.76, 5);
    expectAllJointsFinite(rig);
  });

  it('carry puts both hands on the crate sides (Review Focus 1)', () => {
    const rig = makeRig();
    const inp = baseInput();
    inp.carry = { side: 0.8, mass: 200 };
    poseCrew(rig, inp, 1 / 60);
    parent.updateMatrixWorld(true);

    const tipL = handTip(rig, 'L', new THREE.Vector3());
    const tipR = handTip(rig, 'R', new THREE.Vector3());

    // rig space: left shoulder is at +x (upperarm.L local x = +0.28), the rig faces +z
    const targetL = new THREE.Vector3(0.4, 1.2, 0.45).applyMatrix4(rig.root.matrixWorld);
    const targetR = new THREE.Vector3(-0.4, 1.2, 0.45).applyMatrix4(rig.root.matrixWorld);

    expect(tipL.distanceTo(targetL)).toBeLessThan(0.12);
    expect(tipR.distanceTo(targetR)).toBeLessThan(0.12);
    expectAllJointsFinite(rig);
  });

  it('seated hips at seat height (Review Focus 2)', () => {
    const rig = makeRig();
    const inp = baseInput();
    inp.seated = { seatY: 0.55, lean: 0, bank: 0 };
    poseCrew(rig, inp, 1 / 60);
    parent.updateMatrixWorld(true);

    const hipsWorldPos = new THREE.Vector3();
    rig.joints.hips.getWorldPosition(hipsWorldPos);
    expect(Math.abs(hipsWorldPos.y - 0.55)).toBeLessThan(0.08);
    // the torso sits on the hips: spine stays 0.1 m above the hips as in the rest pose (hips 0.9, spine 1.0)
    const spinePos = new THREE.Vector3();
    rig.joints.spine.getWorldPosition(spinePos);
    expect(Math.abs(spinePos.y - hipsWorldPos.y - 0.1)).toBeLessThan(0.08);

    const shinLPos = new THREE.Vector3();
    const shinRPos = new THREE.Vector3();
    rig.joints['shin.L'].getWorldPosition(shinLPos);
    rig.joints['shin.R'].getWorldPosition(shinRPos);
    expect(shinLPos.y).toBeGreaterThanOrEqual(-0.02);
    expect(shinRPos.y).toBeGreaterThanOrEqual(-0.02);
    expectAllJointsFinite(rig);
  });

  it('hook points the right hand at the target', () => {
    const rig = makeRig();
    const inp = baseInput();
    // in front, inside reach of the right shoulder (rig space: shoulder R at (-0.28, 1.605, 0), arm 0.72 m;
    // this target is 0.64 m away). Root yaw is yaw + PI, so rig +z is world -z at yaw 0.
    poseCrew(rig, inp, 1 / 60);
    parent.updateMatrixWorld(true);
    const target = new THREE.Vector3(-0.15, 1.3, 0.55).applyMatrix4(rig.root.matrixWorld);
    inp.hook = { x: target.x, y: target.y, z: target.z, reel: false };
    poseCrew(rig, inp, 1 / 60);
    parent.updateMatrixWorld(true);

    const tipL = handTip(rig, 'L', new THREE.Vector3());
    const tipR = handTip(rig, 'R', new THREE.Vector3());

    expect(tipR.distanceTo(target)).toBeLessThan(tipL.distanceTo(target));
    expect(tipR.distanceTo(target)).toBeLessThan(0.3);
    expectAllJointsFinite(rig);
  });

  it('knocked down: the body lies flat (head near the floor)', () => {
    const rig = makeRig();
    const inp = baseInput();
    inp.prone = 1;
    poseCrew(rig, inp, 1 / 60);
    parent.updateMatrixWorld(true);
    const head = new THREE.Vector3();
    rig.joints.head.getWorldPosition(head);
    // standing head is about 1.7 m up; tipped 1.45 rad (83 deg) it ends well under 0.8 m
    expect(head.y).toBeLessThan(0.8);
    expectAllJointsFinite(rig);
  });
});
