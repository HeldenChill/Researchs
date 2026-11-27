import type { Vector3 } from 'three';

export type BoxTuple = [number, number, number, number, number, number];

export interface Particle {
  p: Vector3;
  prev: Vector3;
  invMass: number;
}

export interface Contact {
  point: Vector3;
  normal: Vector3;
  kind: string;
  fraction?: number;
}

export interface CollisionQuery {
  sweep(from: Vector3, to: Vector3, radius: number, includeWater?: boolean): Contact | null;
  project(p: Vector3, radius: number): Contact | null;
  segmentBlocked(a: Vector3, b: Vector3, radius: number): boolean;
  segmentContact(a: Vector3, b: Vector3, radius: number): Contact | null;
  landingY(x: number, z: number, fromY: number): number;
  narrow?(lo: Vector3, hi: Vector3): CollisionQuery;
}

export interface Ramp {
  x0: number;
  z0: number;
  x1: number;
  z1: number;
  y0: number;
  h0: number;
  h1: number;
  axis: number;
  dir: number;
  top: number;
}

/** Height of a ramp's surface at (x, z) (clamped to its ends). */
export function rampSurf(r: Ramp, x: number, z: number): number {
  let t = r.axis === 0 ? (x - r.x0) / (r.x1 - r.x0) : (z - r.z0) / (r.z1 - r.z0);
  if (r.dir < 0) t = 1 - t;
  return r.h0 + (r.h1 - r.h0) * (t < 0 ? 0 : t > 1 ? 1 : t);
}
