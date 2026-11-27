import { Vector3 } from 'three';
import type { CollisionQuery, Contact, BoxTuple, Ramp } from './types';
import { rampSurf } from './types';

export const DEFAULT_SKIN = 0.002;

export interface CollisionOptions {
  skin?: number;
}

export interface MapBounds {
  x: number;
  z: number;
  ceil: number;
}

export function makeWorldCollision(
  boxes: readonly BoxTuple[],
  ramps: readonly Ramp[],
  bounds: MapBounds,
  options: CollisionOptions = {}
): CollisionQuery {
  return new GenericCollisionQuery(boxes, bounds, ramps, options.skin ?? DEFAULT_SKIN);
}

class GenericCollisionQuery implements CollisionQuery {
  private boxes: readonly BoxTuple[];
  private bounds: MapBounds;
  private ramps: readonly Ramp[];
  private skin: number;

  constructor(
    boxes: readonly BoxTuple[],
    bounds: MapBounds,
    ramps: readonly Ramp[] = [],
    skin: number = DEFAULT_SKIN
  ) {
    this.boxes = boxes;
    this.bounds = bounds;
    this.ramps = ramps;
    this.skin = skin;
  }

  narrow(lo: Vector3, hi: Vector3): CollisionQuery {
    const pad = 0.5;
    const x0 = lo.x - pad, x1 = hi.x + pad, z0 = lo.z - pad, z1 = hi.z + pad;
    const boxes = this.boxes.filter((b) => b[3] >= x0 && b[0] <= x1 && b[5] >= z0 && b[2] <= z1);
    const ramps = this.ramps.filter((r) => r.x1 >= x0 && r.x0 <= x1 && r.z1 >= z0 && r.z0 <= z1);
    return new GenericCollisionQuery(boxes, this.bounds, ramps, this.skin);
  }

  landingY(x: number, z: number, fromY: number): number {
    let best = -Infinity;
    for (const b of this.boxes) {
      if (x >= b[0] && x <= b[3] && z >= b[2] && z <= b[5]) {
        const top = b[4];
        if (top <= fromY + 1e-4 && top > best) {
          best = top;
        }
      }
    }
    for (const r of this.ramps) {
      if (x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1) {
        const top = rampSurf(r, x, z);
        if (top <= fromY + 1e-4 && top > best) {
          best = top;
        }
      }
    }

    if (best === -Infinity) {
      return 0; // virtual ground y0
    }
    return best;
  }

  sweep(from: Vector3, to: Vector3, radius: number, _includeWater = false): Contact | null {
    const r = radius;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dz = to.z - from.z;

    let earliestT = 1.0;
    let hitContact: Contact | null = null;

    const initial = this.project(from, radius);
    if (initial && initial.point.distanceToSquared(from) > 1e-16) {
      return { ...initial, fraction: 0 };
    }

    // Ceiling check
    if (this.bounds.ceil < Infinity && dy > 0) {
      const topY = this.bounds.ceil - r;
      if (from.y <= topY && to.y > topY) {
        const t = (topY - from.y) / dy;
        if (t >= 0 && t < earliestT) {
          earliestT = t;
          hitContact = {
            point: new Vector3(from.x + dx * t, this.bounds.ceil - radius, from.z + dz * t),
            normal: new Vector3(0, -1, 0),
            kind: 'solid',
            fraction: t,
          };
        }
      }
    }

    // Boundary faces (origin-centered: -bounds to +bounds)
    const bMinX = -this.bounds.x + r;
    const bMaxX = this.bounds.x - r;
    const bMinZ = -this.bounds.z + r;
    const bMaxZ = this.bounds.z - r;

    if (dx < 0 && from.x >= bMinX && to.x < bMinX) {
      const t = (bMinX - from.x) / dx;
      if (t >= 0 && t < earliestT) {
        earliestT = t;
        hitContact = {
          point: new Vector3(bMinX, from.y + dy * t, from.z + dz * t),
          normal: new Vector3(1, 0, 0),
          kind: 'solid',
          fraction: t,
        };
      }
    }
    if (dx > 0 && from.x <= bMaxX && to.x > bMaxX) {
      const t = (bMaxX - from.x) / dx;
      if (t >= 0 && t < earliestT) {
        earliestT = t;
        hitContact = {
          point: new Vector3(bMaxX, from.y + dy * t, from.z + dz * t),
          normal: new Vector3(-1, 0, 0),
          kind: 'solid',
          fraction: t,
        };
      }
    }
    if (dz < 0 && from.z >= bMinZ && to.z < bMinZ) {
      const t = (bMinZ - from.z) / dz;
      if (t >= 0 && t < earliestT) {
        earliestT = t;
        hitContact = {
          point: new Vector3(from.x + dx * t, from.y + dy * t, bMinZ),
          normal: new Vector3(0, 0, 1),
          kind: 'solid',
          fraction: t,
        };
      }
    }
    if (dz > 0 && from.z <= bMaxZ && to.z > bMaxZ) {
      const t = (bMaxZ - from.z) / dz;
      if (t >= 0 && t < earliestT) {
        earliestT = t;
        hitContact = {
          point: new Vector3(from.x + dx * t, from.y + dy * t, bMaxZ),
          normal: new Vector3(0, 0, -1),
          kind: 'solid',
          fraction: t,
        };
      }
    }

    // Boxes
    for (const b of this.boxes) {
      let x0 = b[0] - r;
      let y0 = b[1] - r;
      let z0 = b[2] - r;
      let x1 = b[3] + r;
      let y1 = b[4] + r;
      let z1 = b[5] + r;

      const res = sweepAABB(from.x, from.y, from.z, dx, dy, dz, x0, y0, z0, x1, y1, z1);
      if (res && res.t >= 0 && res.t < earliestT) {
        earliestT = res.t;
        hitContact = {
          point: new Vector3(
            from.x + dx * res.t + res.nx * (r - radius),
            from.y + dy * res.t + res.ny * (r - radius),
            from.z + dz * res.t + res.nz * (r - radius)
          ),
          normal: new Vector3(res.nx, res.ny, res.nz),
          kind: 'solid',
          fraction: res.t,
        };
      }
    }

    // Ramps
    for (const ramp of this.ramps) {
      const res = sweepRamp(from, to, dx, dy, dz, r, ramp);
      if (res && res.t >= 0 && res.t < earliestT) {
        earliestT = res.t;
        hitContact = {
          point: new Vector3(
            from.x + dx * res.t,
            from.y + dy * res.t,
            from.z + dz * res.t
          ),
          normal: res.normal,
          kind: 'solid',
          fraction: res.t,
        };
      }
    }

    return hitContact;
  }

  project(p: Vector3, radius: number): Contact | null {
    const skin = this.skin;
    const r = radius + skin;
    let deepestOverlap = 0;
    let bestContact: Contact | null = null;

    // Check ceiling
    if (this.bounds.ceil < Infinity && p.y + radius > this.bounds.ceil) {
      const overlap = p.y + radius - this.bounds.ceil;
      if (overlap > deepestOverlap) {
        deepestOverlap = overlap;
        bestContact = {
          point: new Vector3(p.x, this.bounds.ceil - radius, p.z),
          normal: new Vector3(0, -1, 0),
          kind: 'solid',
        };
      }
    }

    // Check boundary walls (origin-centered: -bounds to +bounds)
    if (p.x - radius < -this.bounds.x) {
      const overlap = -this.bounds.x - (p.x - radius);
      if (overlap > deepestOverlap) {
        deepestOverlap = overlap;
        bestContact = {
          point: new Vector3(-this.bounds.x + radius, p.y, p.z),
          normal: new Vector3(1, 0, 0),
          kind: 'solid',
        };
      }
    }
    if (p.x + radius > this.bounds.x) {
      const overlap = p.x + radius - this.bounds.x;
      if (overlap > deepestOverlap) {
        deepestOverlap = overlap;
        bestContact = {
          point: new Vector3(this.bounds.x - radius, p.y, p.z),
          normal: new Vector3(-1, 0, 0),
          kind: 'solid',
        };
      }
    }
    if (p.z - radius < -this.bounds.z) {
      const overlap = -this.bounds.z - (p.z - radius);
      if (overlap > deepestOverlap) {
        deepestOverlap = overlap;
        bestContact = {
          point: new Vector3(p.x, p.y, -this.bounds.z + radius),
          normal: new Vector3(0, 0, 1),
          kind: 'solid',
        };
      }
    }
    if (p.z + radius > this.bounds.z) {
      const overlap = p.z + radius - this.bounds.z;
      if (overlap > deepestOverlap) {
        deepestOverlap = overlap;
        bestContact = {
          point: new Vector3(p.x, p.y, this.bounds.z - radius),
          normal: new Vector3(0, 0, -1),
          kind: 'solid',
        };
      }
    }

    // Check boxes
    for (const b of this.boxes) {
      const x0 = b[0], y0 = b[1], z0 = b[2];
      const x1 = b[3], y1 = b[4], z1 = b[5];

      if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && p.z >= z0 && p.z <= z1) {
        const dLeft = p.x - x0;
        const dRight = x1 - p.x;
        const dBottom = p.y - y0;
        const dTop = y1 - p.y;
        const dBack = p.z - z0;
        const dFront = z1 - p.z;

        const minDist = Math.min(dLeft, dRight, dBottom, dTop, dBack, dFront);
        let nx = 0, ny = 0, nz = 0;
        let px = p.x, py = p.y, pz = p.z;

        if (minDist === dLeft) { nx = -1; px = x0 - radius; }
        else if (minDist === dRight) { nx = 1; px = x1 + radius; }
        else if (minDist === dBottom) { ny = -1; py = y0 - radius; }
        else if (minDist === dTop) { ny = 1; py = y1 + radius; }
        else if (minDist === dBack) { nz = -1; pz = z0 - radius; }
        else { nz = 1; pz = z1 + radius; }

        const overlap = minDist + radius;
        if (overlap > deepestOverlap) {
          deepestOverlap = overlap;
          bestContact = {
            point: new Vector3(px, py, pz),
            normal: new Vector3(nx, ny, nz),
            kind: 'solid',
          };
        }
      } else {
        const cx = Math.max(x0, Math.min(p.x, x1));
        const cy = Math.max(y0, Math.min(p.y, y1));
        const cz = Math.max(z0, Math.min(p.z, z1));
        const distSq = (p.x - cx) * (p.x - cx) + (p.y - cy) * (p.y - cy) + (p.z - cz) * (p.z - cz);
        if (distSq < r * r && distSq > 1e-12) {
          const dist = Math.sqrt(distSq);
          const overlap = radius - dist;
          if (overlap > deepestOverlap) {
            deepestOverlap = overlap;
            const nx = (p.x - cx) / dist;
            const ny = (p.y - cy) / dist;
            const nz = (p.z - cz) / dist;
            bestContact = {
              point: new Vector3(cx + nx * radius, cy + ny * radius, cz + nz * radius),
              normal: new Vector3(nx, ny, nz),
              kind: 'solid',
            };
          }
        }
      }
    }

    for (const ramp of this.ramps) {
      const planes = rampPlanes(ramp, radius);
      let face = planes[0]!;
      let closest = -Infinity;
      let inside = true;
      for (const plane of planes) {
        const signed = plane.n.dot(p) - plane.d;
        if (signed > 1e-10) { inside = false; break; }
        if (signed > closest) { closest = signed; face = plane; }
      }
      if (inside && -closest > deepestOverlap + 1e-10) {
        deepestOverlap = -closest;
        bestContact = { point: p.clone().addScaledVector(face.n, -closest), normal: face.n.clone(), kind: 'solid' };
      }
    }

    return bestContact;
  }

  segmentBlocked(a: Vector3, b: Vector3, radius: number): boolean {
    const contact = this.sweep(a, b, radius, false);
    return contact !== null;
  }

  segmentContact(a: Vector3, b: Vector3, radius: number): Contact | null {
    return this.sweep(a, b, radius, false);
  }
}

interface AABBSweepResult {
  t: number;
  nx: number;
  ny: number;
  nz: number;
}

function sweepAABB(
  ox: number, oy: number, oz: number,
  dx: number, dy: number, dz: number,
  x0: number, y0: number, z0: number,
  x1: number, y1: number, z1: number
): AABBSweepResult | null {
  let tmin = 0;
  let tmax = 1;
  let normX = 0, normY = 0, normZ = 0;

  // X slab
  if (Math.abs(dx) < 1e-9) {
    if (ox < x0 || ox > x1) return null;
  } else {
    let t1 = (x0 - ox) / dx;
    let t2 = (x1 - ox) / dx;
    let n1 = -1, n2 = 1;
    if (t1 > t2) {
      let tmp = t1; t1 = t2; t2 = tmp;
      n1 = 1; n2 = -1;
    }
    if (t1 >= tmin) {
      tmin = t1;
      normX = n1; normY = 0; normZ = 0;
    }
    if (t2 < tmax) tmax = t2;
    if (tmin > tmax) return null;
  }

  // Y slab
  if (Math.abs(dy) < 1e-9) {
    if (oy < y0 || oy > y1) return null;
  } else {
    let t1 = (y0 - oy) / dy;
    let t2 = (y1 - oy) / dy;
    let n1 = -1, n2 = 1;
    if (t1 > t2) {
      let tmp = t1; t1 = t2; t2 = tmp;
      n1 = 1; n2 = -1;
    }
    if (t1 >= tmin) {
      tmin = t1;
      normX = 0; normY = n1; normZ = 0;
    }
    if (t2 < tmax) tmax = t2;
    if (tmin > tmax) return null;
  }

  // Z slab
  if (Math.abs(dz) < 1e-9) {
    if (oz < z0 || oz > z1) return null;
  } else {
    let t1 = (z0 - oz) / dz;
    let t2 = (z1 - oz) / dz;
    let n1 = -1, n2 = 1;
    if (t1 > t2) {
      let tmp = t1; t1 = t2; t2 = tmp;
      n1 = 1; n2 = -1;
    }
    if (t1 >= tmin) {
      tmin = t1;
      normX = 0; normY = 0; normZ = n1;
    }
    if (t2 < tmax) tmax = t2;
    if (tmin > tmax) return null;
  }

  if (tmax <= 1e-10 || (normX === 0 && normY === 0 && normZ === 0)) return null;
  return { t: tmin, nx: normX, ny: normY, nz: normZ };
}

interface Plane { n: Vector3; d: number }

function rampPlanes(ramp: Ramp, radius: number): Plane[] {
  const slope = (ramp.h1 - ramp.h0) / (ramp.axis === 0 ? ramp.x1 - ramp.x0 : ramp.z1 - ramp.z0) * (ramp.dir > 0 ? 1 : -1);
  const normal = new Vector3(ramp.axis === 0 ? -slope : 0, 1, ramp.axis === 1 ? -slope : 0).normalize();
  const base = new Vector3(ramp.x0, rampSurf(ramp, ramp.x0, ramp.z0), ramp.z0);
  return [
    { n: new Vector3(-1, 0, 0), d: -ramp.x0 + radius },
    { n: new Vector3(1, 0, 0), d: ramp.x1 + radius },
    { n: new Vector3(0, 0, -1), d: -ramp.z0 + radius },
    { n: new Vector3(0, 0, 1), d: ramp.z1 + radius },
    { n: new Vector3(0, -1, 0), d: -ramp.y0 + radius },
    { n: normal, d: normal.dot(base) + radius },
  ];
}

function sweepRamp(from: Vector3, to: Vector3, dx: number, dy: number, dz: number, r: number, ramp: Ramp): { t: number; normal: Vector3 } | null {
  const velocity = new Vector3(dx, dy, dz);
  let enter = 0, exit = 1;
  let normal: Vector3 | null = null;
  for (const plane of rampPlanes(ramp, r)) {
    const signed = plane.n.dot(from) - plane.d;
    const rate = plane.n.dot(velocity);
    if (Math.abs(rate) < 1e-12) { if (signed > 1e-10) return null; continue; }
    const t = -signed / rate;
    if (rate < 0) { if (t >= enter) { enter = t; normal = plane.n; } }
    else exit = Math.min(exit, t);
    if (enter > exit + 1e-10) return null;
  }
  if (!normal || enter < 0 || enter > 1 || exit <= 1e-10) return null;
  return { t: enter, normal };
}
