import * as THREE from 'three';
import { lerp, smoothing } from '@hk/loop';
import { SIM_CONFIG } from '../sim/config.ts';
import type { SimState } from '../sim/types.ts';
import { WormVisual } from './wormMesh.ts';
import { Dust } from './dust.ts';
import { Underground } from './underground.ts';
import { CAMERA_LOOK_DROP, cameraTargetX, cameraTargetY } from './camera.ts';
import { VIEW_CONFIG } from './viewConfig.ts';
import type { Pose } from './pose.ts';
import { DEBUG_FLAGS } from '../tune/debugFlags.ts';
import type { ImpactKind } from '../sim/types.ts';

const SAND = 0xc99a5f;
const ROCK = 0x9aa0a6;

/** What each sim event looks like: body squash, camera shake, chip count, colour, chip speed. */
const IMPACT_LOOK: Record<ImpactKind, { squash: number; shake: number; chips: number; color: number; speed: number }> = {
  none: { squash: 0, shake: 0, chips: 0, color: SAND, speed: 0 },
  hit: { squash: 1, shake: 1, chips: 40, color: ROCK, speed: 14 },
  bump: { squash: 0.4, shake: 0.2, chips: 10, color: ROCK, speed: 8 },
  gnaw: { squash: 0.7, shake: 0.35, chips: 18, color: ROCK, speed: 9 },
  break: { squash: 0.5, shake: 0.8, chips: 90, color: ROCK, speed: 20 },
  land: { squash: 0.8, shake: 0.9, chips: 60, color: SAND, speed: 15 },
  surface: { squash: 0, shake: 0, chips: 20, color: SAND, speed: 10 },
};

export class WorldRenderer {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly wormVisual = new WormVisual();
  private readonly obstacleMeshes = new Map<number, THREE.Mesh>();
  private readonly spawnerMeshes = new Map<number, THREE.Mesh>();
  private readonly apocalypseMesh: THREE.Mesh;
  private readonly goalMesh: THREE.Mesh;
  private readonly hitboxes = new Map<number, THREE.Mesh>();
  private readonly dust = new Dust();
  private readonly underground = new Underground();
  private lastImpactSeq = 0;
  private shake = 0;
  private clock = 0;
  private readonly follow = new THREE.Vector2();

  constructor(container: HTMLElement, initialState: SimState) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.prepend(this.renderer.domElement);

    this.scene.background = new THREE.Color(0x1b1512);
    this.scene.fog = new THREE.Fog(0x1b1512, 45, 130);

    this.camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.5, 250);
    this.camera.position.set(0, 6, 36);

    const hemi = new THREE.HemisphereLight(0xffdfb0, 0x3b2618, 1.1);
    const dir = new THREE.DirectionalLight(0xfff0d4, 1.4);
    dir.position.set(20, 40, 25);
    this.scene.add(hemi, dir);

    // Cutaway of the ground: surface, layers and bedrock
    this.scene.add(this.underground.mesh);

    // Safe pocket goal beacon
    const goalGeo = new THREE.CylinderGeometry(2.5, 2.5, 76, 16);
    const goalMat = new THREE.MeshBasicMaterial({ color: 0x52b788, transparent: true, opacity: 0.45 });
    const goal = new THREE.Mesh(goalGeo, goalMat);
    this.goalMesh = goal;
    this.scene.add(goal);

    // Apocalypse wall
    const apocGeo = new THREE.BoxGeometry(8, 100, 8);
    const apocMat = new THREE.MeshBasicMaterial({ color: 0xd62828, transparent: true, opacity: 0.75 });
    this.apocalypseMesh = new THREE.Mesh(apocGeo, apocMat);
    this.scene.add(this.apocalypseMesh);

    this.scene.add(this.wormVisual.group, this.dust.points);
    this.reset(initialState);

    window.addEventListener('resize', () => {
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    });
  }

  private syncEntities(state: SimState): void {
    for (const obs of state.obstacles) {
      if (!this.obstacleMeshes.has(obs.id)) {
        const geo = new THREE.DodecahedronGeometry(obs.radius);
        const mat = new THREE.MeshStandardMaterial({
          color: obs.tier === 2 ? 0x6c757d : 0x8d6e63,
          roughness: 0.85,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(obs.x, obs.y, 0);
        this.scene.add(mesh);
        this.obstacleMeshes.set(obs.id, mesh);
      }
      this.obstacleMeshes.get(obs.id)!.visible = !obs.broken;
    }

    for (const sp of state.spawners) {
      if (!this.spawnerMeshes.has(sp.id)) {
        const geo = new THREE.BoxGeometry(sp.radius * 1.4, sp.radius * 1.4, sp.radius * 1.4);
        const color = sp.kind === 'tyre' ? 0x343a40 : sp.kind === 'large_meat' ? 0xe05a47 : 0xf4a261;
        const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(sp.x, sp.y, 0);
        this.scene.add(mesh);
        this.spawnerMeshes.set(sp.id, mesh);
      }
      this.spawnerMeshes.get(sp.id)!.visible = !sp.eaten;
    }
  }

  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  getShake(): number {
    return this.shake * VIEW_CONFIG.cameraShake;
  }

  /** Snap visuals to a fresh state. Call on restart and teleport. */
  reset(state: SimState): void {
    this.syncEntities(state);
    this.wormVisual.reset(state.worm);
    this.dust.clear();
    this.lastImpactSeq = state.worm.impact.seq;
    this.shake = 0;
    this.follow.set(cameraTargetX(state.worm.x, state.worm.heading), cameraTargetY(state.worm.y));
  }

  private updateScene(state: SimState, pose: Pose, dt: number): void {
    this.clock += dt;
    this.syncEntities(state);
    this.playImpact(state);
    this.wormVisual.update(state.worm, pose, dt);
    this.animateGrind(state, pose, dt);
    this.updateHitboxes(state);
    this.dust.update(dt);
    this.apocalypseMesh.position.set(state.apocalypseX, 2, 0);
    this.goalMesh.position.set(SIM_CONFIG.goalX, 0, 0);

    const k = smoothing(VIEW_CONFIG.cameraStiffness, dt);
    this.follow.x = lerp(this.follow.x, cameraTargetX(pose.x, pose.heading), k);
    this.follow.y = lerp(this.follow.y, cameraTargetY(pose.y), k);
    this.shake *= Math.exp(-7 * dt);
    const amp = this.shake * VIEW_CONFIG.cameraShake;
    this.camera.position.x = this.follow.x + Math.sin(this.clock * 47) * amp;
    this.camera.position.y = this.follow.y + Math.cos(this.clock * 61) * amp;
    this.camera.lookAt(this.camera.position.x, this.camera.position.y - CAMERA_LOOK_DROP, 0);
    this.underground.update(this.camera.position.x, pose, this.clock);
  }

  render(state: SimState, pose: Pose, dt: number): void {
    this.updateScene(state, pose, dt);
    this.renderer.render(this.scene, this.camera);
  }

  renderToTarget(state: SimState, pose: Pose, dt: number, target: THREE.WebGLRenderTarget): void {
    this.camera.aspect = target.width / target.height;
    this.camera.updateProjectionMatrix();
    this.updateScene(state, pose, dt);
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
  }

  private playImpact(state: SimState): void {
    const hit = state.worm.impact;
    if (hit.seq === this.lastImpactSeq) return;
    this.lastImpactSeq = hit.seq;
    const look = IMPACT_LOOK[hit.kind];
    const power = 0.4 + 0.6 * hit.strength;
    if (look.squash > 0) this.wormVisual.impact(look.squash * power);
    this.shake = Math.max(this.shake, look.shake * power);
    this.dust.burst(hit.x, hit.y, look.chips * power * VIEW_CONFIG.dustAmount, look.color, look.speed);
  }

  /** While grinding: rock trembles and shrinks, head chatters, chips keep flying. */
  private animateGrind(state: SimState, pose: Pose, dt: number): void {
    const w = state.worm;
    for (const obs of state.obstacles) {
      const mesh = this.obstacleMeshes.get(obs.id)!;
      const grinding = w.activeObstacleId === obs.id;
      const tremble = grinding ? 0.08 + 0.22 * w.gnawProgress : 0;
      mesh.position.set(obs.x + Math.sin(this.clock * 83) * tremble, obs.y + Math.cos(this.clock * 71) * tremble, 0);
      mesh.scale.setScalar(grinding ? 1 - 0.18 * w.gnawProgress : 1);
      (mesh.material as THREE.MeshStandardMaterial).emissive.setRGB(grinding ? 0.35 * w.gnawProgress : 0, 0, 0);
    }
    if (w.activeObstacleId === null) return;
    this.shake = Math.max(this.shake, 0.12 + 0.2 * w.gnawProgress);
    const mouthX = pose.x - w.gnawFrom.nx * SIM_CONFIG.headRadius;
    const mouthY = pose.y - w.gnawFrom.ny * SIM_CONFIG.headRadius;
    if (Math.random() < dt * 40 * VIEW_CONFIG.dustAmount) this.dust.burst(mouthX, mouthY, 2, ROCK, 11);
  }

  private updateHitboxes(state: SimState): void {
    for (const obs of state.obstacles) {
      let box = this.hitboxes.get(obs.id);
      if (!box) {
        const mat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.35 });
        box = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), mat);
        box.position.set(obs.x, obs.y, 0);
        this.scene.add(box);
        this.hitboxes.set(obs.id, box);
      }
      box.visible = DEBUG_FLAGS.showHitboxes && !obs.broken;
      // Contact happens when the head centre reaches this sphere.
      box.scale.setScalar(obs.radius + SIM_CONFIG.headRadius);
    }
  }
}
