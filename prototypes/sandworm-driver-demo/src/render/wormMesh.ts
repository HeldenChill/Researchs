import * as THREE from 'three';
import type { WormState } from '../sim/types.ts';
import type { Pose } from './pose.ts';
import { VIEW_CONFIG } from './viewConfig.ts';

const SEGMENT_COUNT = 12;
/** Distance between recorded trail points. */
const TRAIL_RESOLUTION = 0.2;
/** Impact wave: how fast it dies out and how fast it swings. */
const WAVE_DECAY = 9;
const WAVE_SPEED = 18;

interface Point {
  x: number;
  y: number;
}

export class WormVisual {
  readonly group = new THREE.Group();
  private readonly segments: THREE.Mesh[] = [];
  /** Path the head has travelled, newest first. */
  private trail: Point[] = [];
  private readonly pingRing: THREE.Mesh;
  private impactAge = 99;
  private impactStrength = 0;

  constructor() {
    const headGeo = new THREE.ConeGeometry(1.5, 3.2, 10);
    headGeo.rotateZ(-Math.PI / 2);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffb35c, roughness: 0.55, emissive: 0x4a2000 });
    const head = new THREE.Mesh(headGeo, headMat);
    this.group.add(head);
    this.segments.push(head);

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd1844a, roughness: 0.7, emissive: 0x321300 });
    for (let i = 1; i < SEGMENT_COUNT; i++) {
      const r = Math.max(0.55, 1.35 - i * 0.065);
      const geo = new THREE.SphereGeometry(r, 10, 8);
      const seg = new THREE.Mesh(geo, bodyMat);
      this.group.add(seg);
      this.segments.push(seg);
    }

    const ringGeo = new THREE.RingGeometry(1.8, 2.2, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x64dfdf,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    this.pingRing = new THREE.Mesh(ringGeo, ringMat);
    this.group.add(this.pingRing);
  }

  /** Lay the body out straight behind the worm. Call on start and restart. */
  reset(worm: WormState): void {
    this.trail = [];
    this.impactAge = 99;
    for (let d = 0; d <= this.bodyLength(); d += TRAIL_RESOLUTION) {
      this.trail.push({ x: worm.x - Math.cos(worm.heading) * d, y: worm.y - Math.sin(worm.heading) * d });
    }
    this.segments[0]!.position.set(worm.x, worm.y, 0);
    this.segments[0]!.rotation.z = worm.heading;
    this.placeBody();
  }

  /** Squash the head now; the compression then travels down the body. */
  impact(strength: number): void {
    this.impactAge = 0;
    this.impactStrength = strength;
  }

  headScale(): THREE.Vector3 {
    return this.segments[0]!.scale;
  }

  segmentPositions(): Point[] {
    return this.segments.map((s) => ({ x: s.position.x, y: s.position.y }));
  }

  update(worm: WormState, pose: Pose, dt: number): void {
    if (this.trail.length === 0) this.reset(worm);
    this.impactAge += dt;

    const head = this.segments[0]!;
    head.position.set(pose.x, pose.y, 0);
    head.rotation.z = pose.heading;

    this.recordHead(pose);
    this.placeBody();
    this.applySquash();

    const ringMat = this.pingRing.material as THREE.MeshBasicMaterial;
    if (worm.pingTimer > 0) {
      const t = 1 - worm.pingTimer / 0.8;
      this.pingRing.position.set(head.position.x, head.position.y, 0);
      this.pingRing.scale.setScalar(1 + t * 4);
      ringMat.opacity = (1 - t) * 0.85;
    } else {
      ringMat.opacity = 0;
    }
  }

  /** Signed impact wave at segment i, 0 before it arrives. */
  private wave(i: number): number {
    const age = this.impactAge - i * VIEW_CONFIG.compressDelayPerSegment;
    if (age <= 0) return 0;
    return this.impactStrength * Math.exp(-WAVE_DECAY * age) * Math.cos(WAVE_SPEED * age);
  }

  private applySquash(): void {
    const head = VIEW_CONFIG.squashAmount * this.wave(0);
    this.segments[0]!.scale.set(1 - head, 1 + head * 0.6, 1 + head * 0.6);
    for (let i = 1; i < this.segments.length; i++) {
      this.segments[i]!.scale.setScalar(1 + VIEW_CONFIG.squashAmount * 0.5 * this.wave(i));
    }
  }

  private bodyLength(): number {
    return SEGMENT_COUNT * VIEW_CONFIG.segmentGap + 2;
  }

  private recordHead(pose: Pose): void {
    const fx = Math.cos(pose.heading);
    const fy = Math.sin(pose.heading);
    // Head moved backward: drop the path in front of it so the body retracts instead of folding.
    while (this.trail.length > 2) {
      const p = this.trail[0]!;
      if ((p.x - pose.x) * fx + (p.y - pose.y) * fy <= 1e-4) break;
      this.trail.shift();
    }

    const last = this.trail[0]!;
    if (Math.hypot(pose.x - last.x, pose.y - last.y) >= TRAIL_RESOLUTION) {
      this.trail.unshift({ x: pose.x, y: pose.y });
    }

    let length = 0;
    for (let i = 1; i < this.trail.length; i++) {
      length += Math.hypot(this.trail[i]!.x - this.trail[i - 1]!.x, this.trail[i]!.y - this.trail[i - 1]!.y);
      if (length > this.bodyLength()) {
        this.trail.length = i + 1;
        break;
      }
    }
  }

  /** Segment i sits at distance i * gap along the path, measured from the live head. */
  private placeBody(): void {
    let ax = this.segments[0]!.position.x;
    let ay = this.segments[0]!.position.y;
    let k = 0;
    let walked = 0;
    let want = 0;
    let dirX = -1;
    let dirY = 0;
    for (let i = 1; i < this.segments.length; i++) {
      want += VIEW_CONFIG.segmentGap * (1 - VIEW_CONFIG.compressAmount * Math.max(0, this.wave(i - 1)));
      const seg = this.segments[i]!;
      let placed = false;
      while (k < this.trail.length) {
        const b = this.trail[k]!;
        const len = Math.hypot(b.x - ax, b.y - ay);
        if (len > 1e-6) {
          dirX = (b.x - ax) / len;
          dirY = (b.y - ay) / len;
          if (walked + len >= want) {
            const t = (want - walked) / len;
            seg.position.set(ax + (b.x - ax) * t, ay + (b.y - ay) * t, 0);
            placed = true;
            break;
          }
          walked += len;
        }
        ax = b.x;
        ay = b.y;
        k++;
      }
      // Path shorter than the body (right after a recoil): continue straight past its end.
      if (!placed) seg.position.set(ax + dirX * (want - walked), ay + dirY * (want - walked), 0);
    }
  }
}
