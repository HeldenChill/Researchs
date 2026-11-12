export function usableMax(load, config) {
  return Math.max(0, config.staminaMax - load);
}

export function stamina(state, actions, field, config, dt) {
  let currentLoad = state.load;
  if (actions.loadDelta) {
    currentLoad = Math.max(0, Math.min(config.loadMax, currentLoad + actions.loadDelta * config.loadStepSize));
  }
  const maxStam = usableMax(currentLoad, config);

  let drainRate = 0;
  if (state.mode === 'OnFoot') {
    if (actions.sprint && state.speed > config.walkSpeed) {
      drainRate += config.sprintDrain;
    }
    if (state.speed > 0.1 && field.slopeAlongDeg > 0) {
      const slopeRad = field.slopeAlongDeg * Math.PI / 180;
      drainRate += config.uphillDrainCoef * Math.sin(slopeRad);
    }
  } else if (state.mode === 'OnWall') {
    const rawMag = Math.hypot(actions.raw.x, actions.raw.y);
    if (rawMag > 0.1) {
      drainRate += config.climbDrainMove;
    } else {
      drainRate += config.climbDrainHang;
    }
  }

  let lungeDrain = 0;
  let lungeStarted = state.lungeStarted;
  if (lungeStarted) {
    lungeDrain = config.lungeCost;
    lungeStarted = false;
  }

  const totalDrain = drainRate * dt + lungeDrain;
  let sinceDrain = state.sinceDrain;
  if (totalDrain > 0) {
    sinceDrain = 0;
  } else {
    sinceDrain += dt;
  }

  let regainRate = 0;
  if (sinceDrain >= config.regainDelay && state.mode === 'OnFoot') {
    if (state.speed < 0.1) {
      regainRate = config.regainStand;
    } else if (field.slopeDeg < config.regainWalkMaxDeg) {
      regainRate = config.regainWalk;
    }
  }

  let nextStamina = state.stamina - totalDrain + regainRate * dt;
  nextStamina = Math.max(0, Math.min(maxStam, nextStamina));

  return {
    ...state,
    load: currentLoad,
    stamina: nextStamina,
    sinceDrain,
    lungeStarted
  };
}
