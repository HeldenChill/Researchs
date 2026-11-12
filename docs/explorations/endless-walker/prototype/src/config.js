export const CONFIG_SPEC = {
  // Locomotion
  walkSpeed: { value: 3.0, min: 0.5, max: 8, step: 0.1, group: 'Locomotion' },
  sprintSpeed: { value: 5.5, min: 1, max: 12, step: 0.1, group: 'Locomotion' },
  speedGain: { value: 6, min: 0.5, max: 30, step: 0.5, group: 'Locomotion' },
  speedLoss: { value: 8, min: 0.5, max: 30, step: 0.5, group: 'Locomotion' },
  turnRateWalk: { value: 360, min: 30, max: 1080, step: 10, group: 'Locomotion' },
  turnRateSprint: { value: 140, min: 30, max: 1080, step: 10, group: 'Locomotion' },
  uphillCoef: { value: 0.9, min: 0, max: 2, step: 0.05, group: 'Locomotion' },
  uphillMin: { value: 0.35, min: 0.05, max: 1, step: 0.05, group: 'Locomotion' },
  snowCoef: { value: 0.3, min: 0, max: 1, step: 0.05, group: 'Locomotion' },
  walkLimitDeg: { value: 45, min: 30, max: 60, step: 1, group: 'Locomotion' },
  gravity: { value: 15, min: 5, max: 30, step: 0.5, group: 'Locomotion' },
  jumpSpeed: { value: 5.5, min: 1, max: 12, step: 0.1, group: 'Locomotion' },
  hardLanding: { value: 9, min: 3, max: 30, step: 0.5, group: 'Locomotion' },

  // Stamina
  staminaMax: { value: 100, min: 50, max: 200, step: 1, group: 'Stamina' },
  loadMax: { value: 60, min: 0, max: 90, step: 1, group: 'Stamina' },
  loadStepSize: { value: 10, min: 1, max: 30, step: 1, group: 'Stamina' },
  sprintDrain: { value: 6, min: 0, max: 30, step: 0.5, group: 'Stamina' },
  uphillDrainCoef: { value: 2.5, min: 0, max: 10, step: 0.1, group: 'Stamina' },
  climbDrainMove: { value: 3, min: 0, max: 10, step: 0.1, group: 'Stamina' },
  climbDrainHang: { value: 1, min: 0, max: 10, step: 0.1, group: 'Stamina' },
  lungeCost: { value: 8, min: 0, max: 30, step: 1, group: 'Stamina' },
  regainStand: { value: 12, min: 0, max: 40, step: 0.5, group: 'Stamina' },
  regainWalk: { value: 6, min: 0, max: 40, step: 0.5, group: 'Stamina' },
  regainWalkMaxDeg: { value: 10, min: 0, max: 30, step: 1, group: 'Stamina' },
  regainDelay: { value: 0.8, min: 0, max: 3, step: 0.05, group: 'Stamina' },
  emptySpeedCap: { value: 1.2, min: 0.2, max: 3, step: 0.1, group: 'Stamina' },

  // Climb
  lungeDistance: { value: 2, min: 0.5, max: 5, step: 0.1, group: 'Climb' },
  grabMinDeg: { value: 50, min: 40, max: 80, step: 1, group: 'Climb' },
  grabReach: { value: 0.6, min: 0.2, max: 2, step: 0.05, group: 'Climb' },
  climbSpeed: { value: 1.2, min: 0.2, max: 4, step: 0.1, group: 'Climb' },
  lungeTime: { value: 0.25, min: 0.05, max: 1, step: 0.05, group: 'Climb' },

  // Slide
  slideStartDeg: { value: 8, min: 0, max: 30, step: 1, group: 'Slide' },
  dragRelaxed: { value: 0.015, min: 0.001, max: 0.05, step: 0.001, group: 'Slide' },
  dragTucked: { value: 0.0062, min: 0.001, max: 0.05, step: 0.0005, group: 'Slide' },
  brakeGrip: { value: 0.45, min: 0, max: 1, step: 0.05, group: 'Slide' },
  steerK: { value: 700, min: 100, max: 2000, step: 50, group: 'Slide' },
  steerMin: { value: 30, min: 5, max: 180, step: 5, group: 'Slide' },
  steerMax: { value: 90, min: 5, max: 360, step: 5, group: 'Slide' },
  slideEndSpeed: { value: 2, min: 0, max: 6, step: 0.1, group: 'Slide' },
  slideEndDeg: { value: 10, min: 0, max: 30, step: 1, group: 'Slide' },
  slideReleaseSpeed: { value: 4, min: 0, max: 10, step: 0.5, group: 'Slide' },

  // Balance
  balanceMax: { value: 100, min: 50, max: 200, step: 1, group: 'Balance' },
  safeSpeed: { value: 18, min: 5, max: 40, step: 0.5, group: 'Balance' },
  balDropPerMs: { value: 4, min: 0, max: 20, step: 0.5, group: 'Balance' },
  balDropTilt: { value: 25, min: 0, max: 100, step: 1, group: 'Balance' },
  balDropSteer: { value: 15, min: 0, max: 100, step: 1, group: 'Balance' },
  bumpSpacing: { value: 25, min: 5, max: 100, step: 1, group: 'Balance' },
  bumpHitMin: { value: 5, min: 0, max: 30, step: 1, group: 'Balance' },
  bumpHitExtra: { value: 5, min: 0, max: 30, step: 1, group: 'Balance' },
  balRecover: { value: 20, min: 0, max: 100, step: 1, group: 'Balance' },
  fallTumble: { value: 1.5, min: 0.2, max: 5, step: 0.1, group: 'Balance' },
  fallKeep: { value: 0.3, min: 0, max: 1, step: 0.05, group: 'Balance' },
  fallStand: { value: 1.0, min: 0.2, max: 5, step: 0.1, group: 'Balance' },
  fallFriction: { value: 4, min: 0, max: 20, step: 0.5, group: 'Balance' },

  // Camera
  camDistFoot: { value: 5.5, min: 2, max: 15, step: 0.5, group: 'Camera' },
  camDistSlide: { value: 4, min: 2, max: 15, step: 0.5, group: 'Camera' },
  camHeightFoot: { value: 1.8, min: 0, max: 6, step: 0.1, group: 'Camera' },
  camHeightSlide: { value: 1.0, min: 0, max: 6, step: 0.1, group: 'Camera' },
  fovFoot: { value: 60, min: 30, max: 100, step: 1, group: 'Camera' },
  fovSlideMax: { value: 80, min: 30, max: 110, step: 1, group: 'Camera' },
  fovSlideSpeed: { value: 24, min: 5, max: 50, step: 1, group: 'Camera' },
  camDelay: { value: 0.15, min: 0, max: 1, step: 0.01, group: 'Camera' }
};

export const config = {};
for (const [k, v] of Object.entries(CONFIG_SPEC)) {
  config[k] = v.value;
}
