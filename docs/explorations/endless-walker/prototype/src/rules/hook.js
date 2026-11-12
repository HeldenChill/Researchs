export function raycastTerrain(origin, dir, maxDist, terrain) {
  const len = Math.hypot(dir.x, dir.y, dir.z);
  if (len === 0) return null;
  const dx = dir.x / len;
  const dy = dir.y / len;
  const dz = dir.z / len;
  const step = 0.5;
  let prevDist = 0;
  for (let d = step; d <= maxDist + 1e-6; d += step) {
    const x = origin.x + dx * d;
    const y = origin.y + dy * d;
    const z = origin.z + dz * d;
    if (y <= terrain.heightAt(x, z)) {
      let t0 = prevDist;
      let t1 = d;
      for (let b = 0; b < 8; b++) {
        const tm = (t0 + t1) * 0.5;
        const tx = origin.x + dx * tm;
        const ty = origin.y + dy * tm;
        const tz = origin.z + dz * tm;
        if (ty <= terrain.heightAt(tx, tz)) {
          t1 = tm;
        } else {
          t0 = tm;
        }
      }
      const hitT = (t0 + t1) * 0.5;
      return {
        x: origin.x + dx * hitT,
        y: origin.y + dy * hitT,
        z: origin.z + dz * hitT
      };
    }
    prevDist = d;
  }
  return null;
}

export function hook(state, actions, feel, dt, terrain, config) {
  const isHooked = state.mode === 'Hooked';

  if (!feel || !feel.hookEnabled) {
    if (isHooked) {
      return {
        ...state,
        mode: 'InAir',
        hookAnchor: null,
        modeTime: 0
      };
    }
    return null;
  }

  if (!isHooked) {
    if (!actions.hookFire || !actions.aim) {
      return null;
    }
    const hit = raycastTerrain(
      { x: actions.aim.ox, y: actions.aim.oy, z: actions.aim.oz },
      { x: actions.aim.dx, y: actions.aim.dy, z: actions.aim.dz },
      feel.hookRange,
      terrain
    );
    if (!hit) return null;

    let v;
    if (state.mode === 'OnFoot' || state.mode === 'Sliding') {
      v = {
        x: Math.sin(state.heading) * state.speed,
        y: 0,
        z: Math.cos(state.heading) * state.speed
      };
    } else if (state.mode === 'InAir' || state.mode === 'Hooked') {
      v = { ...state.vel };
    } else {
      v = { x: 0, y: 0, z: 0 };
    }

    // Launch kick (Attack on Titan style yank): up, plus a push toward the anchor.
    const kx = hit.x - state.pos.x, ky = hit.y - state.pos.y, kz = hit.z - state.pos.z;
    const kd = Math.hypot(kx, ky, kz) || 1;
    const launch = feel.hookLaunch ?? 0;
    v = {
      x: v.x + (kx / kd) * launch * 0.5,
      y: v.y + launch + (ky / kd) * launch * 0.5,
      z: v.z + (kz / kd) * launch * 0.5
    };

    return {
      ...state,
      mode: 'Hooked',
      hookAnchor: hit,
      modeTime: 0,
      vel: v
    };
  }

  // Currently Hooked
  if (!actions.hookFire) {
    return {
      ...state,
      mode: 'InAir',
      hookAnchor: null,
      modeTime: 0
    };
  }

  const anchor = state.hookAnchor;
  if (!anchor) {
    return {
      ...state,
      mode: 'InAir',
      hookAnchor: null,
      modeTime: 0
    };
  }

  const toAnchor = {
    x: anchor.x - state.pos.x,
    y: anchor.y - state.pos.y,
    z: anchor.z - state.pos.z
  };
  const d = Math.hypot(toAnchor.x, toAnchor.y, toAnchor.z);

  // Arrive check
  if (d < feel.hookArrive) {
    const isWall = actions.grab && terrain.slopeDegAt(anchor.x, anchor.z) > config.grabMinDeg;
    return {
      ...state,
      mode: isWall ? 'OnWall' : 'OnFoot',
      hookAnchor: null,
      vel: isWall ? { x: 0, y: 0, z: 0 } : state.vel,
      modeTime: 0
    };
  }

  // Pull toward a point lifted above the anchor so the path arcs off the ground.
  // The lift shrinks as the walker closes in, so the path still ends at the anchor.
  const lift = (feel.hookLift ?? 0) * Math.min(1, d / Math.max(1e-3, (feel.hookLift ?? 0) * 3));
  const tx = toAnchor.x, ty = toAnchor.y + lift, tz = toAnchor.z;
  const td = Math.hypot(tx, ty, tz) || 1;
  const ux = tx / td;
  const uy = ty / td;
  const uz = tz / td;
  const g = config.gravity * (feel.hookGravity ?? 1);

  let vx = state.vel.x + ux * feel.hookPull * dt;
  let vy = state.vel.y + uy * feel.hookPull * dt - g * dt;
  let vz = state.vel.z + uz * feel.hookPull * dt;

  const vMag = Math.hypot(vx, vy, vz);
  if (vMag > feel.hookMaxSpeed) {
    const scale = feel.hookMaxSpeed / vMag;
    vx *= scale;
    vy *= scale;
    vz *= scale;
  }

  let px = state.pos.x + vx * dt;
  let py = state.pos.y + vy * dt;
  let pz = state.pos.z + vz * dt;

  const groundH = terrain.heightAt(px, pz);
  if (py < groundH) {
    py = groundH;
    vy = Math.max(vy, 0);
  }

  const hSpeed = Math.hypot(vx, vz);
  let heading = state.heading;
  if (hSpeed > 0.5) {
    heading = Math.atan2(vx, vz);
  }

  const newD = Math.hypot(anchor.x - px, anchor.y - py, anchor.z - pz);
  if (newD < feel.hookArrive) {
    const isWall = actions.grab && terrain.slopeDegAt(anchor.x, anchor.z) > config.grabMinDeg;
    return {
      ...state,
      pos: { x: px, y: py, z: pz },
      vel: isWall ? { x: 0, y: 0, z: 0 } : { x: vx, y: vy, z: vz },
      speed: hSpeed,
      heading,
      mode: isWall ? 'OnWall' : 'OnFoot',
      hookAnchor: null,
      modeTime: 0
    };
  }

  return {
    ...state,
    pos: { x: px, y: py, z: pz },
    vel: { x: vx, y: vy, z: vz },
    speed: hSpeed,
    heading,
    modeTime: state.modeTime + dt
  };
}
