import * as THREE from 'three';

const CAPACITY = 400;
const HIDDEN_Y = -999;

/** Small pool of sand and rock chips. Oldest chips are reused first. */
export class Dust {
  readonly points: THREE.Points;
  private readonly positions = new Float32Array(CAPACITY * 3).fill(HIDDEN_Y);
  private readonly colors = new Float32Array(CAPACITY * 3);
  private readonly velocity = new Float32Array(CAPACITY * 2);
  private readonly life = new Float32Array(CAPACITY);
  private next = 0;

  constructor() {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    const mat = new THREE.PointsMaterial({ size: 0.45, vertexColors: true });
    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
  }

  burst(x: number, y: number, count: number, color: number, speed: number): void {
    const c = new THREE.Color(color);
    for (let n = 0; n < Math.round(count); n++) {
      const i = this.next;
      this.next = (this.next + 1) % CAPACITY;
      const angle = Math.random() * Math.PI * 2;
      const v = speed * (0.35 + Math.random() * 0.65);
      this.positions.set([x, y, (Math.random() - 0.5) * 3], i * 3);
      this.colors.set([c.r, c.g, c.b], i * 3);
      this.velocity[i * 2] = Math.cos(angle) * v;
      this.velocity[i * 2 + 1] = Math.abs(Math.sin(angle)) * v;
      this.life[i] = 0.35 + Math.random() * 0.5;
    }
  }

  update(dt: number): void {
    for (let i = 0; i < CAPACITY; i++) {
      if (this.life[i]! <= 0) continue;
      this.life[i]! -= dt;
      if (this.life[i]! <= 0) {
        this.positions[i * 3 + 1] = HIDDEN_Y;
        continue;
      }
      this.velocity[i * 2 + 1]! -= 24 * dt;
      this.positions[i * 3]! += this.velocity[i * 2]! * dt;
      this.positions[i * 3 + 1]! += this.velocity[i * 2 + 1]! * dt;
    }
    this.points.geometry.attributes['position']!.needsUpdate = true;
    this.points.geometry.attributes['color']!.needsUpdate = true;
  }

  clear(): void {
    this.life.fill(0);
    this.positions.fill(HIDDEN_Y);
  }
}
