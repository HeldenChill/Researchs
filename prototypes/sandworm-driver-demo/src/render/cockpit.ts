import * as THREE from 'three';
import type { SimState } from '../sim/types.ts';
import type { CockpitState, MonitorId } from '../cockpit/cockpitState.ts';
import { CctvMonitorScreen, InteriorMonitorScreen } from './monitorTextures.ts';

interface CameraPose {
  pos: THREE.Vector3;
  look: THREE.Vector3;
}

const CAMERA_TRANSITION_DURATION = 0.45;

const CAMERA_POSES: Record<MonitorId, CameraPose> = {
  overview: { pos: new THREE.Vector3(0, 1.56, 3.25), look: new THREE.Vector3(0, 1.14, -0.05) },
  drive: { pos: new THREE.Vector3(0, 1.24, 1.15), look: new THREE.Vector3(0, 1.24, -0.31) },
  interior: { pos: new THREE.Vector3(-1.33, 1.18, 1.30), look: new THREE.Vector3(-1.96, 1.18, 0.20) },
  cctv: { pos: new THREE.Vector3(1.33, 1.18, 1.30), look: new THREE.Vector3(1.96, 1.18, 0.20) },
};

const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

interface MonitorRig {
  id: Exclude<MonitorId, 'overview'>;
  bezelMat: THREE.MeshStandardMaterial;
  ledMat: THREE.MeshBasicMaterial;
  screenMesh: THREE.Mesh;
}

export interface CockpitCallbacks {
  onSelectMonitor: (id: MonitorId) => void;
  onHoverMonitor: (id: MonitorId | null) => void;
}

export class CockpitRenderer {
  readonly driveTarget: THREE.WebGLRenderTarget;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly camPos = CAMERA_POSES.overview.pos.clone();
  private readonly currentLook = CAMERA_POSES.overview.look.clone();
  private readonly fromPos = CAMERA_POSES.overview.pos.clone();
  private readonly fromLook = CAMERA_POSES.overview.look.clone();
  private activeTarget: MonitorId = 'overview';
  private tweenElapsed = CAMERA_TRANSITION_DURATION;
  private readonly interiorScreen = new InteriorMonitorScreen();
  private readonly cctvScreen = new CctvMonitorScreen();
  private readonly rigs: MonitorRig[] = [];
  private readonly hitTargets: THREE.Object3D[] = [];
  private clock = 0;

  constructor(renderer: THREE.WebGLRenderer, callbacks: CockpitCallbacks) {
    this.renderer = renderer;
    this.driveTarget = new THREE.WebGLRenderTarget(1024, 640, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });

    const dom = renderer.domElement;
    this.camera = new THREE.PerspectiveCamera(52, Math.max(1, dom.clientWidth) / Math.max(1, dom.clientHeight), 0.1, 40);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.currentLook);

    this.scene.background = new THREE.Color(0x0d0a08);
    this.scene.fog = new THREE.Fog(0x0d0a08, 4, 14);

    const hemi = new THREE.HemisphereLight(0xffe1b8, 0x1c1410, 0.9);
    const key = new THREE.DirectionalLight(0xffdfb0, 1.15);
    key.position.set(1.5, 3.2, 2.5);
    const consoleGlow = new THREE.PointLight(0xe59a38, 1.1, 5);
    consoleGlow.position.set(0, 1.4, 0.8);
    this.scene.add(hemi, key, consoleGlow);

    this.buildCabin();

    // Center: Drive Monitor (live WebGLRenderTarget)
    this.rigs.push(
      this.createMonitor('drive', 2.15, 1.34, new THREE.Vector3(0, 1.24, -0.38), 0, this.driveTarget.texture),
    );
    // Left: Interior Minimap Monitor (CanvasTexture stub)
    this.rigs.push(
      this.createMonitor('interior', 1.52, 1.14, new THREE.Vector3(-1.92, 1.18, 0.14), 0.52, this.interiorScreen.texture),
    );
    // Right: Room CCTV Monitor (CanvasTexture stub)
    this.rigs.push(
      this.createMonitor('cctv', 1.52, 1.14, new THREE.Vector3(1.92, 1.18, 0.14), -0.52, this.cctvScreen.texture),
    );

    dom.addEventListener('pointermove', (e) => {
      const hit = this.pickMonitor(e, dom);
      dom.style.cursor = hit ? 'pointer' : 'default';
      callbacks.onHoverMonitor(hit);
    });

    dom.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      const hit = this.pickMonitor(e, dom);
      callbacks.onSelectMonitor(hit ?? 'overview');
    });

    window.addEventListener('resize', () => {
      const w = Math.max(1, dom.clientWidth);
      const h = Math.max(1, dom.clientHeight);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  private buildCabin(): void {
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x221b17, roughness: 0.85, metalness: 0.15 });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x3a2d24, roughness: 0.6, metalness: 0.35 });

    // Main curved-feel desk surface
    const desk = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.12, 1.6), deskMat);
    desk.position.set(0, 0.52, 0.12);
    this.scene.add(desk);

    // Front lip / instrument rail
    const rail = new THREE.Mesh(new THREE.BoxGeometry(5.84, 0.08, 0.08), trimMat);
    rail.position.set(0, 0.58, 0.9);
    this.scene.add(rail);

    // Back bulkhead wall
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(11, 5.2, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x15110f, roughness: 0.95 }),
    );
    wall.position.set(0, 2.0, -1.35);
    this.scene.add(wall);
  }

  private createMonitor(
    id: Exclude<MonitorId, 'overview'>,
    width: number,
    height: number,
    position: THREE.Vector3,
    rotY: number,
    map: THREE.Texture,
  ): MonitorRig {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.y = rotY;

    const bezelMat = new THREE.MeshStandardMaterial({
      color: 0x2b231e,
      roughness: 0.55,
      metalness: 0.35,
      emissive: new THREE.Color(0x000000),
    });

    const casing = new THREE.Mesh(new THREE.BoxGeometry(width + 0.12, height + 0.12, 0.14), bezelMat);
    casing.userData.monitorId = id;
    group.add(casing);

    const stand = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.5, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x1e1815, roughness: 0.7 }),
    );
    stand.position.set(0, -height / 2 - 0.25, -0.02);
    group.add(stand);

    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ map }),
    );
    screenMesh.position.z = 0.072;
    screenMesh.userData.monitorId = id;
    group.add(screenMesh);

    const ledMat = new THREE.MeshBasicMaterial({ color: 0x69c98a });
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 10), ledMat);
    led.position.set(width / 2 - 0.04, -height / 2 - 0.025, 0.075);
    group.add(led);

    this.scene.add(group);
    this.hitTargets.push(casing, screenMesh);

    return { id, bezelMat, ledMat, screenMesh };
  }

  private pickMonitor(e: PointerEvent, dom: HTMLElement): Exclude<MonitorId, 'overview'> | null {
    const rect = dom.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.hitTargets, false);
    const id = hits[0]?.object.userData.monitorId as Exclude<MonitorId, 'overview'> | undefined;
    return id ?? null;
  }

  render(state: SimState, cockpit: CockpitState, dt: number, shakeAmp: number): void {
    this.clock += dt;
    this.interiorScreen.update(state, dt);
    this.cctvScreen.update(state, cockpit.cctvRoom, dt);

    if (cockpit.activeMonitor !== this.activeTarget) {
      this.fromPos.copy(this.camPos);
      this.fromLook.copy(this.currentLook);
      this.activeTarget = cockpit.activeMonitor;
      this.tweenElapsed = 0;
    }

    const targetPose = CAMERA_POSES[this.activeTarget];
    this.tweenElapsed = Math.min(CAMERA_TRANSITION_DURATION, this.tweenElapsed + dt);
    const rawT = this.tweenElapsed / CAMERA_TRANSITION_DURATION;
    const t = easeInOutCubic(rawT);
    const arc = Math.sin(Math.PI * rawT) * 0.06;

    this.camPos.lerpVectors(this.fromPos, targetPose.pos, t);
    this.camPos.z += arc;
    this.camPos.y += arc * 0.35;
    this.currentLook.lerpVectors(this.fromLook, targetPose.look, t);

    const shake = shakeAmp * 0.025;
    this.camera.position.set(
      this.camPos.x + Math.sin(this.clock * 47) * shake,
      this.camPos.y + Math.cos(this.clock * 61) * shake,
      this.camPos.z,
    );
    this.camera.lookAt(this.currentLook);

    const hasAlert = state.interior.breaches > 0 || state.interior.crewStunTimer > 0;
    for (const rig of this.rigs) {
      const focused = cockpit.activeMonitor === rig.id;
      const hovered = cockpit.hoveredMonitor === rig.id;
      rig.bezelMat.emissive.setHex(focused ? 0x3a2612 : hovered ? 0x24190e : 0x000000);
      if (rig.id === 'interior' || rig.id === 'cctv') {
        rig.ledMat.color.setHex(hasAlert ? 0xdc5342 : 0x69c98a);
      } else {
        rig.ledMat.color.setHex(state.worm.blocked ? 0xdc5342 : 0xe59a38);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}
