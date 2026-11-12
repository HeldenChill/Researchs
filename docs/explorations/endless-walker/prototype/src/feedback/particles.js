import * as THREE from 'three';

export function createParticles(scene) {
  const COUNT = 800;
  const positions = new Float32Array(COUNT * 3);
  const velocities = new Float32Array(COUNT * 3);
  const life = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    positions[i * 3 + 1] = -1000;
    life[i] = 0;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.35,
    transparent: true,
    opacity: 0.7,
    depthWrite: false
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // Lens flecks (60 points streaking past camera at speed > 10 m/s)
  const FLECKS_COUNT = 60;
  const fleckPos = new Float32Array(FLECKS_COUNT * 3);
  for (let i = 0; i < FLECKS_COUNT; i++) {
    fleckPos[i * 3] = (Math.random() - 0.5) * 6;
    fleckPos[i * 3 + 1] = (Math.random() - 0.5) * 4;
    fleckPos[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  const fleckGeo = new THREE.BufferGeometry();
  fleckGeo.setAttribute('position', new THREE.BufferAttribute(fleckPos, 3));

  const fleckMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.15,
    transparent: true,
    opacity: 0.6,
    depthWrite: false
  });

  const lensPoints = new THREE.Points(fleckGeo, fleckMat);
  scene.add(lensPoints);

  let poolIdx = 0;
  let spawnAcc = 0;
  let prevStepsInt = 0;
  let prevMode = 'OnFoot';
  let prevHeading = 0;
  let prevSpeed = 0;

  function spawnParticle(px, py, pz, vx, vy, vz, duration = 0.8) {
    const idx = poolIdx;
    poolIdx = (poolIdx + 1) % COUNT;

    positions[idx * 3] = px;
    positions[idx * 3 + 1] = py;
    positions[idx * 3 + 2] = pz;

    velocities[idx * 3] = vx;
    velocities[idx * 3 + 1] = vy;
    velocities[idx * 3 + 2] = vz;

    life[idx] = duration;
  }

  function spawnSpray(originX, originY, originZ, heading, count = 1) {
    for (let k = 0; k < count; k++) {
      const angle = heading + Math.PI + (Math.random() - 0.5) * 1.0;
      const spreadSpeed = 0.5 + Math.random() * 2.5;
      const px = originX + (Math.random() - 0.5) * 0.4;
      const py = originY + 0.1;
      const pz = originZ + (Math.random() - 0.5) * 0.4;
      const vx = Math.sin(angle) * spreadSpeed;
      const vy = 0.8 + Math.random() * 1.5;
      const vz = Math.cos(angle) * spreadSpeed;
      spawnParticle(px, py, pz, vx, vy, vz, 0.8);
    }
  }

  function spawnPuff(originX, originY, originZ, puffSize) {
    const pCount = 4;
    for (let k = 0; k < pCount; k++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (0.2 + Math.random() * 0.5) * puffSize;
      const px = originX + (Math.random() - 0.5) * 0.2;
      const py = originY + 0.05;
      const pz = originZ + (Math.random() - 0.5) * 0.2;
      const vx = Math.cos(angle) * spd;
      const vy = 0.3 + Math.random() * 0.4 * puffSize;
      const vz = Math.sin(angle) * spd;
      spawnParticle(px, py, pz, vx, vy, vz, 0.4);
    }
  }

  function spawnBurst(originX, originY, originZ, count = 25) {
    for (let k = 0; k < count; k++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      const spd = 1.0 + Math.random() * 3.0;
      const vx = Math.cos(phi) * Math.cos(theta) * spd;
      const vy = Math.abs(Math.sin(phi)) * spd + 0.5;
      const vz = Math.cos(phi) * Math.sin(theta) * spd;
      spawnParticle(originX, originY, originZ, vx, vy, vz, 0.6);
    }
  }

  return {
    points,
    lensPoints,
    update(state, config, dt, feel) {
      if (!feel || feel.vfxOn === 0) {
        points.visible = false;
        lensPoints.visible = false;
        prevMode = state.mode;
        prevHeading = state.heading;
        prevSpeed = state.speed;
        return;
      }
      points.visible = true;

      // Dynamic size scaling from feel
      const puffScale = feel.puffSize ?? 0.4;
      material.size = 0.35 * (puffScale / 0.4);

      // 1. Snow puff per footstep while OnFoot
      const currentStepsInt = Math.floor(state.steps);
      if (state.mode === 'OnFoot' && state.speed > 0.1 && currentStepsInt !== prevStepsInt) {
        spawnPuff(state.pos.x, state.pos.y, state.pos.z, puffScale);
      }
      prevStepsInt = currentStepsInt;

      // 2. Sliding spray plume
      if (state.mode === 'Sliding' && state.speed > 2) {
        const rateMult = feel.sprayRate ?? 1.0;
        let spawnRate = state.speed * 8 * rateMult;

        // Extra burst while braking or steering hard
        const steerRate = Math.abs(state.heading - prevHeading) / Math.max(dt, 0.001);
        const braking = prevSpeed - state.speed > 1.5 * dt;
        if (steerRate > 0.8 || braking) {
          spawnRate *= 2.0;
        }

        spawnAcc += spawnRate * dt;
        const toSpawn = Math.floor(spawnAcc);
        spawnAcc -= toSpawn;
        spawnSpray(state.pos.x, state.pos.y, state.pos.z, state.heading, toSpawn);
      }

      // 3. Anchor burst on entering Hooked
      if (prevMode !== 'Hooked' && state.mode === 'Hooked' && state.hookAnchor) {
        spawnBurst(state.hookAnchor.x, state.hookAnchor.y, state.hookAnchor.z, 25);
      }

      // 4. Small dust per climb move
      if (state.mode === 'OnWall' && state.speed > 0.2) {
        if (Math.random() < 0.25) {
          spawnPuff(state.pos.x, state.pos.y + 1.2, state.pos.z, puffScale * 0.5);
        }
      }

      // Update existing world particles
      let activeCount = 0;
      for (let i = 0; i < COUNT; i++) {
        if (life[i] > 0) {
          life[i] -= dt;
          if (life[i] <= 0) {
            positions[i * 3 + 1] = -1000;
          } else {
            positions[i * 3] += velocities[i * 3] * dt;
            positions[i * 3 + 1] += velocities[i * 3 + 1] * dt;
            positions[i * 3 + 2] += velocities[i * 3 + 2] * dt;
            velocities[i * 3 + 1] -= 9.8 * dt * 0.5;
            activeCount++;
          }
        }
      }

      if (activeCount > 0 || spawnAcc > 0) {
        geometry.attributes.position.needsUpdate = true;
      }

      // 5. Lens flecks: 60 near-camera points streaking past at slide/air/hook speed > 10 m/s
      let moveSpeed = state.speed;
      if (state.mode === 'InAir') {
        moveSpeed = Math.hypot(state.vel.x, state.vel.y, state.vel.z);
      }
      const isFast = (state.mode === 'Sliding' || state.mode === 'InAir' || state.mode === 'Hooked') && moveSpeed > 10;

      if (isFast && (feel.lensFlecks ?? 1.0) > 0) {
        lensPoints.visible = true;
        const flecksMult = feel.lensFlecks ?? 1.0;
        const activeFlecks = Math.floor(FLECKS_COUNT * Math.min(1, flecksMult));
        fleckMat.opacity = 0.6 * Math.min(1, flecksMult);

        // Center flecks container around walker chest
        lensPoints.position.set(state.pos.x, state.pos.y + 1.2, state.pos.z);

        const streakDirX = -Math.sin(state.heading) * moveSpeed * 1.5;
        const streakDirZ = -Math.cos(state.heading) * moveSpeed * 1.5;

        for (let i = 0; i < activeFlecks; i++) {
          fleckPos[i * 3] += streakDirX * dt;
          fleckPos[i * 3 + 2] += streakDirZ * dt;

          // Wrap boundaries in local space [-4, 4]
          if (fleckPos[i * 3] > 4) fleckPos[i * 3] -= 8;
          if (fleckPos[i * 3] < -4) fleckPos[i * 3] += 8;
          if (fleckPos[i * 3 + 2] > 4) fleckPos[i * 3 + 2] -= 8;
          if (fleckPos[i * 3 + 2] < -4) fleckPos[i * 3 + 2] += 8;
        }
        fleckGeo.attributes.position.needsUpdate = true;
      } else {
        lensPoints.visible = false;
      }

      prevMode = state.mode;
      prevHeading = state.heading;
      prevSpeed = state.speed;
    }
  };
}
