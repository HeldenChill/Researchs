export function createRumble() {
  let prevStepInt = 0;

  function getActuator() {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return null;
    const pads = navigator.getGamepads();
    for (let i = 0; i < pads.length; i++) {
      const p = pads[i];
      if (p && p.connected && p.vibrationActuator && typeof p.vibrationActuator.playEffect === 'function') {
        return p.vibrationActuator;
      }
    }
    return null;
  }

  return {
    update(state, config, dt) {
      const actuator = getActuator();
      if (!actuator) return;

      const currentStepInt = Math.floor(state.steps);
      const isFootstep = currentStepInt !== prevStepInt && state.mode === 'OnFoot' && state.speed > 0.1;
      prevStepInt = currentStepInt;

      if (isFootstep) {
        // 60 ms pulse per footstep
        try {
          actuator.playEffect('dual-rumble', {
            startDelay: 0,
            duration: 60,
            weakMagnitude: 0.35,
            strongMagnitude: 0.2
          });
        } catch (_) {}
      } else if (state.mode === 'Sliding') {
        // Continuous strength 1 - balance/100 while sliding
        const strength = Math.max(0, Math.min(1, 1 - state.balance / 100));
        if (strength > 0.05) {
          try {
            actuator.playEffect('dual-rumble', {
              startDelay: 0,
              duration: 100,
              weakMagnitude: strength,
              strongMagnitude: strength * 0.7
            });
          } catch (_) {}
        }
      }
    }
  };
}
