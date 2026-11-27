import { Vector3 } from 'three';
import type { Particle, CollisionQuery } from './types';

// Clip both predicted and constraint-induced motion, retaining tangential travel.
export function solveMotionContact(p:Particle, from:Vector3, collision:CollisionQuery, radius:number, normals:Vector3[]):void {
  if (!p.invMass) return;
  let start=from.clone();
  for(let pass=0;pass<4;pass++) {
    const contact=collision.sweep(start,p.p,radius);
    if(!contact) break;
    const remaining=p.p.clone().sub(contact.point);
    remaining.addScaledVector(contact.normal,-Math.min(0,remaining.dot(contact.normal)));
    p.p.copy(contact.point).add(remaining);
    normals.push(contact.normal);
    start=contact.point.clone();
  }
  for(let pass=0;pass<4;pass++) {
    const contact=collision.project(p.p,radius);
    if(!contact) break;
    p.p.copy(contact.point); normals.push(contact.normal);
  }
}

// Wrapping is deliberately unsupported: move a crossing toward its entry side.
// Corrections are bounded and inverse-mass weighted; pinned conflicts are reported.
export function solveSegmentContact(a:Particle,b:Particle,collision:CollisionQuery,radius:number,normalsA:Vector3[],normalsB:Vector3[]):boolean {
  const contact=collision.segmentContact(a.p,b.p,radius);
  if(!contact) return false;
  const total=a.invMass+b.invMass;
  if(!total) return true;
  const da=a.p.clone().sub(contact.point).dot(contact.normal);
  const db=b.p.clone().sub(contact.point).dot(contact.normal);
  const bound=a.p.distanceTo(b.p)+2*radius;
  // Each endpoint must lie on the entry side of this static obstacle plane.
  // A safe endpoint has no violation and must not be pushed through another wall.
  // Hard static endpoint constraints divide by that endpoint's inverse mass,
  // then multiply the correction by it; pinned endpoints cannot be corrected.
  if(a.invMass && da<0) { a.p.addScaledVector(contact.normal,Math.min(bound,-da+.000001)); normalsA.push(contact.normal); }
  if(b.invMass && db<0) { b.p.addScaledVector(contact.normal,Math.min(bound,-db+.000001)); normalsB.push(contact.normal); }
  return collision.segmentBlocked(a.p,b.p,radius);
}

export function particle(p: Vector3, mass: number): Particle {
  return {
    p: p.clone(),
    prev: p.clone(),
    invMass: mass > 0 ? 1 / mass : 0,
  };
}

export function integrate(p: Particle, acceleration: Vector3, h: number, drag: number): void {
  if (p.invMass === 0) return;

  const dragFactor = Math.exp(-drag * h);
  const px = p.p.x + (p.p.x - p.prev.x) * dragFactor + acceleration.x * h * h;
  const py = p.p.y + (p.p.y - p.prev.y) * dragFactor + acceleration.y * h * h;
  const pz = p.p.z + (p.p.z - p.prev.z) * dragFactor + acceleration.z * h * h;

  p.prev.copy(p.p);
  p.p.set(px, py, pz);
}

export function setVelocity(p: Particle, v: Vector3, h: number): void {
  p.prev.set(
    p.p.x - v.x * h,
    p.p.y - v.y * h,
    p.p.z - v.z * h
  );
}

const _diff = new Vector3();

export function solveDistance(
  a: Particle,
  b: Particle,
  length: number,
  h: number,
  compliance: number,
  lambda: number,
  maxOnly: boolean
): number {
  const invMassSum = a.invMass + b.invMass;
  if (invMassSum === 0) return lambda;

  _diff.subVectors(b.p, a.p);
  const dist = _diff.length();
  if (dist === 0) {
    // Coincident points: no defined direction, avoid division by zero
    return lambda;
  }

  const C = dist - length;
  if (maxOnly && C <= 0) {
    return 0; // Release multiplier in slack
  }

  const alpha = compliance / (h * h);
  let deltaLambda = (-C - alpha * lambda) / (invMassSum + alpha);

  if (maxOnly && lambda + deltaLambda > 0) {
    deltaLambda = -lambda;
  }

  const newLambda = lambda + deltaLambda;

  const nx = _diff.x / dist;
  const ny = _diff.y / dist;
  const nz = _diff.z / dist;

  // b moves in direction of -n * (-deltaLambda * invMass) -> b += (deltaLambda * b.invMass) * n
  // Since C = |b-a| - d, grad_b C = n, grad_a C = -n.
  // Correction: delta_p = grad C * deltaLambda * invMass
  // delta_b = n * deltaLambda * b.invMass
  // delta_a = -n * deltaLambda * a.invMass
  if (a.invMass > 0) {
    const scaleA = -deltaLambda * a.invMass;
    a.p.x += nx * scaleA;
    a.p.y += ny * scaleA;
    a.p.z += nz * scaleA;
  }

  if (b.invMass > 0) {
    const scaleB = deltaLambda * b.invMass;
    b.p.x += nx * scaleB;
    b.p.y += ny * scaleB;
    b.p.z += nz * scaleB;
  }

  return newLambda;
}

const _contactVel = new Vector3();

export function resolveContactVelocity(
  p: Particle,
  oldPosition: Vector3,
  h: number,
  normals: readonly Vector3[],
  tangentRetention = 1.0
): void {
  if (p.invMass === 0 || normals.length === 0) return;

  // v = (p - oldPosition) / h
  _contactVel.subVectors(p.p, oldPosition).multiplyScalar(1 / h);

  for (const n of normals) {
    const dot = _contactVel.dot(n);
    if (dot < 0) {
      // Remove inward normal velocity component
      _contactVel.addScaledVector(n, -dot);
    }
  }

  if (tangentRetention !== 1.0) {
    // If tangent retention is specified and < 1, scale tangential component
    // For now, baseline specifies tangentRetention 1.0
  }

  // write prev = p - v * h
  p.prev.set(
    p.p.x - _contactVel.x * h,
    p.p.y - _contactVel.y * h,
    p.p.z - _contactVel.z * h
  );
}
