export const FEEL_SPEC = {
  // Walk feel
  bobHeight: { value: 0.05, min: 0, max: 0.3, group: 'Walk feel' },
  bobLoadGain: { value: 1.0, min: 0, max: 3, group: 'Walk feel' },
  swayRollDeg: { value: 0.6, min: 0, max: 5, group: 'Walk feel' },
  uphillCamDrop: { value: 0.5, min: 0, max: 2, group: 'Walk feel' },
  tiredSway: { value: 0.03, min: 0, max: 0.2, group: 'Walk feel' },

  // Slide feel
  slideShakeFrom: { value: 6, min: 0, max: 40, group: 'Slide feel' },
  slideShakeAmp: { value: 0.06, min: 0, max: 0.4, group: 'Slide feel' },
  carveRollDeg: { value: 6, min: 0, max: 25, group: 'Slide feel' },

  // Screen FX
  vignetteMax: { value: 0.55, min: 0, max: 1, group: 'Screen FX' },
  desatEmpty: { value: 0.5, min: 0, max: 1, group: 'Screen FX' },
  speedFxFrom: { value: 6, min: 0, max: 40, group: 'Screen FX' },
  speedFxMax: { value: 0.8, min: 0, max: 1, group: 'Screen FX' },
  blurStrength: { value: 0.6, min: 0, max: 2, group: 'Screen FX' },
  flashTime: { value: 0.15, min: 0, max: 1, group: 'Screen FX' },

  // VFX
  footprintCount: { value: 200, min: 0, max: 600, step: 10, group: 'VFX' },
  puffSize: { value: 0.4, min: 0, max: 2, group: 'VFX' },
  sprayRate: { value: 1.0, min: 0, max: 4, group: 'VFX' },
  lensFlecks: { value: 1.0, min: 0, max: 3, group: 'VFX' },

  // Hook
  hookEnabled: { value: 1, min: 0, max: 1, step: 1, group: 'Hook' },
  hookRange: { value: 120, min: 10, max: 150, group: 'Hook' },
  hookLaunch: { value: 9, min: 0, max: 25, group: 'Hook' },
  hookLift: { value: 4, min: 0, max: 15, group: 'Hook' },
  hookGravity: { value: 0.5, min: 0, max: 1, group: 'Hook' },
  hookPull: { value: 40, min: 5, max: 120, group: 'Hook' },
  hookMaxSpeed: { value: 35, min: 5, max: 80, group: 'Hook' },
  hookArrive: { value: 1.5, min: 0.5, max: 5, group: 'Hook' },
  hookFovKick: { value: 10, min: 0, max: 30, group: 'Hook' },
  hookPunch: { value: 0.3, min: 0, max: 1, group: 'Hook' },

  // Sound
  masterVolume: { value: 0.8, min: 0, max: 1, group: 'Sound' },
  stepVolume: { value: 0.7, min: 0, max: 1, group: 'Sound' },
  breathVolume: { value: 0.5, min: 0, max: 1, group: 'Sound' },
  windVolume: { value: 0.7, min: 0, max: 1, group: 'Sound' },
  hookVolume: { value: 0.7, min: 0, max: 1, group: 'Sound' },

  // Scenery
  sunIntensity: { value: 2.2, min: 0, max: 5, group: 'Scenery' },
  fillIntensity: { value: 0.45, min: 0, max: 2, group: 'Scenery' },
  fogNear: { value: 700, min: 0, max: 3000, group: 'Scenery' },
  fogFar: { value: 3800, min: 500, max: 6000, group: 'Scenery' },

  // Toggles
  camFxOn: { value: 1, min: 0, max: 1, step: 1, group: 'Toggles' },
  screenFxOn: { value: 1, min: 0, max: 1, step: 1, group: 'Toggles' },
  vfxOn: { value: 1, min: 0, max: 1, step: 1, group: 'Toggles' },
  soundOn: { value: 1, min: 0, max: 1, step: 1, group: 'Toggles' }
};

export const feel = Object.fromEntries(
  Object.entries(FEEL_SPEC).map(([k, s]) => [k, s.value])
);
