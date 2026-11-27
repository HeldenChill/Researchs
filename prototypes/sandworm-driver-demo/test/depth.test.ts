import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialState } from '../src/sim/state.ts';
import { stepMotion } from '../src/sim/motion.ts';
import { SIM_CONFIG, resetSimConfig } from '../src/sim/config.ts';
import { CAMERA_LOOK_DROP, cameraTargetY } from '../src/render/camera.ts';

beforeEach(() => resetSimConfig());

describe('deeper map', () => {
  it('lets the worm dig twice as deep as the first version, which stopped at 14 m', () => {
    const s = createInitialState();
    let lowest = 0;
    for (let t = 0; t < 60 * 6; t++) {
      stepMotion(s, { throttle: 1, steer: t < 24 ? -1 : 0, boost: false, ping: false, preset: null }, 1 / 60);
      lowest = Math.min(lowest, s.worm.y);
    }
    expect(lowest).toBeLessThan(-26);
    expect(lowest).toBeGreaterThanOrEqual(-28);
  });

  it('keeps the worm well inside the view at every height it can reach', () => {
    for (let y = SIM_CONFIG.maxDepth; y <= SIM_CONFIG.maxAltitude; y += 1) {
      const viewCentre = cameraTargetY(y) - CAMERA_LOOK_DROP;
      expect(Math.abs(y - viewCentre), `height ${y}`).toBeLessThan(12);
    }
  });
});
