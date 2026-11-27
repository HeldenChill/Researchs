import * as THREE from 'three';

const Nu = new THREE.Vector3();
const Fu = new THREE.Vector3();
const Pu = new THREE.Vector3();
const Iu = new THREE.Vector3();
const Mu = new THREE.Vector3();
const Au = new THREE.Quaternion();

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Law-of-cosines two-bone inverse kinematics (port of Ju from Quarry Nine).
 * Solves the upper and lower joint orientations so lower reaches target.
 */
export function twoBoneIK(
  upper: THREE.Object3D,
  lower: THREE.Object3D,
  target: THREE.Vector3,
  pole: THREE.Vector3,
  axis: THREE.Vector3
): void {
  const a = upper.position;
  const o = lower.position.length();
  const s = o;
  Nu.subVectors(target, a);
  const dist = Nu.length();
  const c = Math.max(0.001, Math.min(dist, o + s));
  Nu.normalize();
  const l = dist >= o + s ? 0 : Math.acos(clamp((o * o + c * c - s * s) / (2 * o * c), -1, 1));
  Fu.copy(pole).addScaledVector(Nu, -pole.dot(Nu)).normalize();
  Pu.copy(Nu).multiplyScalar(Math.cos(l)).addScaledVector(Fu, Math.sin(l)).multiplyScalar(o).add(a);
  upper.quaternion.setFromUnitVectors(axis, Iu.subVectors(Pu, a).normalize());
  Mu.copy(a).addScaledVector(Nu, c);
  Au.setFromUnitVectors(axis, Iu.subVectors(Mu, Pu).normalize());
  lower.quaternion.copy(upper.quaternion).invert().multiply(Au);
}
