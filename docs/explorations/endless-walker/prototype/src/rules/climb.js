export function climb(state, actions, field, config, dt, terrain) {
  let speed = config.climbSpeed;
  let dirX = actions.raw.x;
  let dirY = actions.raw.y;
  let lungeTimer = state.lungeTimer;
  let lungeStarted = state.lungeStarted;
  let lungeDir = state.lungeDir;

  if (actions.jump && state.stamina >= config.lungeCost && lungeTimer <= 0) {
    lungeTimer = config.lungeTime;
    let lx = actions.raw.x;
    let ly = actions.raw.y;
    if (Math.hypot(lx, ly) === 0) {
      lx = 0;
      ly = 1;
    } else {
      const len = Math.hypot(lx, ly);
      lx /= len;
      ly /= len;
    }
    lungeDir = { x: lx, z: ly };
    lungeStarted = true;
  }

  if (lungeTimer > 0) {
    lungeTimer -= dt;
    speed = config.lungeDistance / config.lungeTime;
    dirX = lungeDir.x;
    dirY = lungeDir.z;
  }

  let heading = state.heading;
  if (Math.hypot(field.uphill.x, field.uphill.z) > 0) {
    heading = Math.atan2(field.uphill.x, field.uphill.z);
  }

  const slopeRad = field.slopeDeg * Math.PI / 180;
  const upDist = speed * dt * Math.cos(slopeRad) * dirY;
  const sideDist = speed * dt * dirX;

  const upVec = field.uphill;
  const sideVec = { x: field.uphill.z, z: -field.uphill.x };

  const nextX = state.pos.x + upDist * upVec.x + sideDist * sideVec.x;
  const nextZ = state.pos.z + upDist * upVec.z + sideDist * sideVec.z;
  const nextY = terrain.heightAt(nextX, nextZ);

  // Check top out
  const movingUp = dirY > 0;
  const checkX = nextX + upVec.x * config.grabReach;
  const checkZ = nextZ + upVec.z * config.grabReach;

  if (movingUp && terrain.slopeDegAt(checkX, checkZ) < config.walkLimitDeg) {
    const topOutX = checkX;
    const topOutZ = checkZ;
    return {
      ...state,
      mode: 'OnFoot',
      modeTime: 0,
      pos: { x: topOutX, y: terrain.heightAt(topOutX, topOutZ), z: topOutZ },
      speed: 0,
      vel: { x: 0, y: 0, z: 0 },
      heading,
      lungeTimer: 0,
      lungeStarted,
      lungeDir
    };
  }

  // Reach gentle ground while moving down
  if (dirY < 0 && terrain.slopeDegAt(nextX, nextZ) < config.walkLimitDeg) {
    return {
      ...state,
      mode: 'OnFoot',
      modeTime: 0,
      pos: { x: nextX, y: nextY, z: nextZ },
      speed: 0,
      vel: { x: 0, y: 0, z: 0 },
      heading,
      lungeTimer: 0,
      lungeStarted,
      lungeDir
    };
  }

  return {
    ...state,
    pos: { x: nextX, y: nextY, z: nextZ },
    speed: 0,
    vel: { x: 0, y: 0, z: 0 },
    heading,
    lungeTimer: Math.max(0, lungeTimer),
    lungeStarted,
    lungeDir
  };
}
