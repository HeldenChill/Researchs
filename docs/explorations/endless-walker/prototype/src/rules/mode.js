export function modeTransitions(state, actions, field, config, terrain) {
  if (state.mode === 'OnFoot' || state.mode === 'InAir') {
    if (actions.grab && (field.aheadSlopeDeg > config.grabMinDeg || field.slopeDeg > config.grabMinDeg)) {
      return {
        ...state,
        mode: 'OnWall',
        modeTime: 0,
        speed: 0,
        vel: { x: 0, y: 0, z: 0 }
      };
    }
  }

  if (state.mode === 'OnFoot') {
    if (actions.jump) {
      const vx = Math.sin(state.heading) * state.speed;
      const vz = Math.cos(state.heading) * state.speed;
      return {
        ...state,
        mode: 'InAir',
        modeTime: 0,
        vel: { x: vx, y: config.jumpSpeed, z: vz }
      };
    }
    if (actions.crouch && field.slopeDeg > config.slideStartDeg) {
      return {
        ...state,
        mode: 'Sliding',
        modeTime: 0,
        speed: Math.max(state.speed, 1)
      };
    }
    if (field.slopeDeg > config.walkLimitDeg) {
      return {
        ...state,
        mode: 'Sliding',
        modeTime: 0
      };
    }
  }

  if (state.mode === 'OnWall') {
    if (!actions.grab) {
      return {
        ...state,
        mode: 'InAir',
        modeTime: 0,
        vel: {
          x: -field.uphill.x,
          y: 0,
          z: -field.uphill.z
        },
        speed: 0
      };
    }
    if (state.stamina <= 0) {
      return {
        ...state,
        mode: 'InAir',
        modeTime: 0,
        vel: { x: 0, y: 0, z: 0 },
        speed: 0
      };
    }
    if (field.slopeDeg < config.walkLimitDeg && field.aheadSlopeDeg <= config.grabMinDeg) {
      return {
        ...state,
        mode: 'OnFoot',
        modeTime: 0,
        speed: 0,
        vel: { x: 0, y: 0, z: 0 }
      };
    }
    if (actions.raw.y < 0 && field.slopeDeg < config.walkLimitDeg) {
      return {
        ...state,
        mode: 'OnFoot',
        modeTime: 0,
        speed: 0,
        vel: { x: 0, y: 0, z: 0 }
      };
    }
    if (terrain) {
      const movingUp = actions.raw.y > 0 || (state.lungeTimer > 0 && state.lungeDir.z > 0);
      const aheadX = state.pos.x + field.uphill.x * config.grabReach;
      const aheadZ = state.pos.z + field.uphill.z * config.grabReach;
      if (movingUp && terrain.slopeDegAt(aheadX, aheadZ) < config.walkLimitDeg) {
        return {
          ...state,
          mode: 'OnFoot',
          modeTime: 0,
          pos: { x: aheadX, y: terrain.heightAt(aheadX, aheadZ), z: aheadZ },
          speed: 0,
          vel: { x: 0, y: 0, z: 0 }
        };
      }
    }
  }

  if (state.mode === 'Sliding') {
    if (state.balance <= 0) {
      return {
        ...state,
        mode: 'Fallen',
        modeTime: 0,
        speed: state.speed * config.fallKeep,
        fallTimer: config.fallTumble + config.fallStand
      };
    }
    if (state.speed < config.slideEndSpeed && field.slopeDeg < config.slideEndDeg) {
      return {
        ...state,
        mode: 'OnFoot',
        modeTime: 0
      };
    }
    if (!actions.crouch && state.speed < config.slideReleaseSpeed && field.slopeDeg <= config.walkLimitDeg) {
      return {
        ...state,
        mode: 'OnFoot',
        modeTime: 0
      };
    }
  }

  return state;
}

export function land(state, field, config) {
  const hSpeed = Math.hypot(state.vel.x, state.vel.z);
  const vyDown = -state.vel.y;

  if (vyDown > config.hardLanding) {
    return {
      ...state,
      mode: 'Fallen',
      modeTime: 0,
      pos: { ...state.pos, y: field.height },
      vel: { x: 0, y: 0, z: 0 },
      speed: hSpeed * config.fallKeep,
      fallTimer: config.fallTumble + config.fallStand
    };
  }

  if (field.slopeDeg > config.walkLimitDeg) {
    return {
      ...state,
      mode: 'Sliding',
      modeTime: 0,
      pos: { ...state.pos, y: field.height },
      vel: { x: 0, y: 0, z: 0 },
      speed: hSpeed
    };
  }

  return {
    ...state,
    mode: 'OnFoot',
    modeTime: 0,
    pos: { ...state.pos, y: field.height },
    vel: { x: 0, y: 0, z: 0 },
    speed: hSpeed
  };
}
