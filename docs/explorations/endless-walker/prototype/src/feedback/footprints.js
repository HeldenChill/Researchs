import * as THREE from 'three';
import { heightAt } from '../terrain.js';

export function createFootprints(scene) {
  const MAX_PRINTS = 600;
  // 0.12 wide, 0.25 long quad lying flat on XZ plane
  const geometry = new THREE.PlaneGeometry(0.12, 0.25);
  geometry.rotateX(-Math.PI / 2);

  const material = new THREE.MeshBasicMaterial({
    color: 0x22334d,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.InstancedMesh(geometry, material, MAX_PRINTS);
  mesh.count = 0;
  scene.add(mesh);

  // Circular storage for up to MAX_PRINTS prints
  const ring = new Array(MAX_PRINTS);
  for (let i = 0; i < MAX_PRINTS; i++) {
    ring[i] = new THREE.Matrix4();
  }
  let head = 0;
  let totalStored = 0;

  let prevStepsInt = 0;
  let footSide = 1;
  let slideDistAcc = 0;

  const dummy = new THREE.Object3D();

  function addPrint(x, y, z, heading, scaleX = 1, scaleZ = 1) {
    dummy.position.set(x, y + 0.02, z);
    dummy.rotation.set(0, heading, 0);
    dummy.scale.set(scaleX, 1, scaleZ);
    dummy.updateMatrix();

    ring[head].copy(dummy.matrix);
    head = (head + 1) % MAX_PRINTS;
    if (totalStored < MAX_PRINTS) totalStored++;
  }

  return {
    mesh,
    update(state, feel, dt) {
      if (!feel || feel.vfxOn === 0) {
        mesh.visible = false;
        return;
      }
      mesh.visible = true;

      // 1. Footprints on foot
      const currentStepsInt = Math.floor(state.steps);
      if (state.mode === 'OnFoot' && state.speed > 0.1) {
        if (currentStepsInt !== prevStepsInt) {
          const diff = Math.min(5, Math.abs(currentStepsInt - prevStepsInt));
          for (let s = 0; s < diff; s++) {
            footSide = -footSide;
            const perpX = Math.cos(state.heading) * 0.15 * footSide;
            const perpZ = -Math.sin(state.heading) * 0.15 * footSide;
            const px = state.pos.x + perpX;
            const pz = state.pos.z + perpZ;
            const py = heightAt(px, pz);
            addPrint(px, py, pz, state.heading, 1, 1);
          }
        }
      }
      prevStepsInt = currentStepsInt;

      // 2. Groove while sliding (one every 0.5 m)
      if (state.mode === 'Sliding' && state.speed > 1) {
        slideDistAcc += state.speed * dt;
        while (slideDistAcc >= 0.5) {
          slideDistAcc -= 0.5;
          const py = heightAt(state.pos.x, state.pos.z);
          addPrint(state.pos.x, py, state.pos.z, state.heading, 1.2, 2.0);
        }
      } else {
        slideDistAcc = 0;
      }

      // 3. Update active instance matrices
      const maxAllowed = Math.max(0, Math.min(MAX_PRINTS, Math.floor(feel.footprintCount ?? 200)));
      const activeCount = Math.min(totalStored, maxAllowed);
      mesh.count = activeCount;

      if (activeCount > 0) {
        // Retrieve newest activeCount entries from ring buffer
        for (let i = 0; i < activeCount; i++) {
          const idx = (head - 1 - i + MAX_PRINTS) % MAX_PRINTS;
          mesh.setMatrixAt(i, ring[idx]);
        }
        mesh.instanceMatrix.needsUpdate = true;
      }
    }
  };
}
