export function balance(state, actions, field, config, dt) {
  const braking = actions.raw.y < -0.3;

  if (state.mode === 'Sliding') {
    if (state.speed <= config.safeSpeed || braking) {
      const newBal = Math.min(config.balanceMax, state.balance + config.balRecover * dt);
      return {
        ...state,
        balance: newBal
      };
    }

    const tilt = Math.abs(Math.sin(field.slopeAcrossDeg * Math.PI / 180));
    const steer = Math.abs(actions.raw.x);
    const dropRate =
      config.balDropPerMs * (state.speed - config.safeSpeed) +
      config.balDropTilt * tilt +
      config.balDropSteer * steer;

    let drop = dropRate * dt;
    let bumpDist = state.bumpDist + state.speed * dt;
    while (bumpDist >= config.bumpSpacing) {
      bumpDist -= config.bumpSpacing;
      drop += config.bumpHitMin + config.bumpHitExtra * field.bumpNorm;
    }

    const newBal = Math.max(0, state.balance - drop);
    return {
      ...state,
      balance: newBal,
      bumpDist
    };
  }

  const newBal = Math.min(config.balanceMax, state.balance + config.balRecover * dt);
  return {
    ...state,
    balance: newBal
  };
}
