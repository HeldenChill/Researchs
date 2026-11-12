export function uphillFactor(slopeAlongDeg, config) {
  const slopeAlongRad = Math.max(0, slopeAlongDeg) * Math.PI / 180;
  return Math.max(config.uphillMin, 1 - config.uphillCoef * Math.sin(slopeAlongRad));
}

export function targetSpeed(state, actions, field, config) {
  const upF = uphillFactor(field.slopeAlongDeg, config);
  const snowF = 1 - config.snowCoef * field.softness;
  const base = (actions.sprint && state.stamina > 0) ? config.sprintSpeed : config.walkSpeed;
  let tgt = actions.move.mag * base * upF * snowF;
  if (state.stamina <= 0) {
    tgt = Math.min(tgt, config.emptySpeedCap);
  }
  return tgt;
}

export function locomotion(state, actions, field, config, dt, terrain) {
  const tgt = targetSpeed(state, actions, field, config);
  let speed = state.speed;

  if (speed < tgt) {
    speed = Math.min(tgt, speed + config.speedGain * dt);
  } else if (speed > tgt) {
    speed = Math.max(tgt, speed - config.speedLoss * dt);
  }

  let heading = state.heading;
  if (actions.move.mag > 0) {
    const targetHeading = Math.atan2(actions.move.x, actions.move.z);
    let t = (speed - config.walkSpeed) / (config.sprintSpeed - config.walkSpeed);
    t = Math.max(0, Math.min(1, t));
    const turnRateDeg = config.turnRateWalk + t * (config.turnRateSprint - config.turnRateWalk);
    const turnRateRad = (turnRateDeg * Math.PI / 180) * dt;

    let diff = (targetHeading - heading) % (Math.PI * 2);
    if (diff > Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;

    if (Math.abs(diff) <= turnRateRad) {
      heading = targetHeading;
    } else {
      heading += Math.sign(diff) * turnRateRad;
    }
  }

  const stepDist = speed * dt;
  const nextX = state.pos.x + stepDist * Math.sin(heading);
  const nextZ = state.pos.z + stepDist * Math.cos(heading);
  const nextH = terrain.heightAt(nextX, nextZ);
  const nextSlope = terrain.slopeDegAt(nextX, nextZ);

  if (stepDist > 0 && nextSlope > config.walkLimitDeg) {
    if (nextH >= state.pos.y) {
      // Wall stop: do not move, speed 0
      return {
        ...state,
        pos: { ...state.pos },
        speed: 0,
        heading
      };
    } else {
      // Walk off edge: InAir with horizontal velocity
      return {
        ...state,
        mode: 'InAir',
        modeTime: 0,
        pos: { x: nextX, y: state.pos.y, z: nextZ },
        vel: {
          x: speed * Math.sin(heading),
          y: 0,
          z: speed * Math.cos(heading)
        },
        speed,
        heading
      };
    }
  }

  const stride = 0.7 + 0.25 * (speed / config.sprintSpeed);
  const steps = state.steps + (speed * dt) / stride;

  return {
    ...state,
    pos: { x: nextX, y: nextH, z: nextZ },
    speed,
    heading,
    steps
  };
}
