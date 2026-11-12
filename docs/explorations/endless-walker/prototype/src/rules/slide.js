export function slideAccel(speed, slopeAlongDeg, grip, tucked, braking, config) {
  const downRad = -slopeAlongDeg * Math.PI / 180;
  const g = grip + (braking ? config.brakeGrip : 0);
  const k = tucked ? config.dragTucked : config.dragRelaxed;
  return 9.81 * (Math.sin(downRad) - g * Math.cos(downRad)) - k * speed * speed;
}

export function slide(state, actions, field, config, dt, terrain) {
  if (state.mode === 'Fallen') {
    const accel = slideAccel(state.speed, field.slopeAlongDeg, field.grip, false, false, config) - config.fallFriction;
    const speed = Math.max(0, state.speed + accel * dt);
    const slopeAlongRad = field.slopeAlongDeg * Math.PI / 180;
    const stepDist = speed * Math.cos(slopeAlongRad) * dt;

    const nextX = state.pos.x + stepDist * Math.sin(state.heading);
    const nextZ = state.pos.z + stepDist * Math.cos(state.heading);
    const nextY = terrain.heightAt(nextX, nextZ);

    let fallTimer = state.fallTimer - dt;
    if (fallTimer <= 0) {
      return {
        ...state,
        mode: 'OnFoot',
        modeTime: 0,
        pos: { x: nextX, y: nextY, z: nextZ },
        speed,
        heading: state.heading,
        balance: config.balanceMax,
        fallTimer: 0
      };
    }
    return {
      ...state,
      pos: { x: nextX, y: nextY, z: nextZ },
      speed,
      fallTimer
    };
  }

  const tucked = actions.sprint;
  const braking = actions.raw.y < -0.3;

  const steerDegPerSec = Math.max(config.steerMin, Math.min(config.steerMax, config.steerK / Math.max(state.speed, 0.1)));
  const heading = state.heading + actions.raw.x * steerDegPerSec * (Math.PI / 180) * dt;

  const accel = slideAccel(state.speed, field.slopeAlongDeg, field.grip, tucked, braking, config);
  const speed = Math.max(0, state.speed + accel * dt);

  const slopeAlongRad = field.slopeAlongDeg * Math.PI / 180;
  const stepDist = speed * Math.cos(slopeAlongRad) * dt;

  const nextX = state.pos.x + stepDist * Math.sin(heading);
  const nextZ = state.pos.z + stepDist * Math.cos(heading);
  const nextY = terrain.heightAt(nextX, nextZ);

  return {
    ...state,
    pos: { x: nextX, y: nextY, z: nextZ },
    speed,
    heading
  };
}
