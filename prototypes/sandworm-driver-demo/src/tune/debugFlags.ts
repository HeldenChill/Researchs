import { SIM_CONFIG } from '../sim/config.ts';
import type { SimState } from '../sim/types.ts';

/** Testing switches. Not saved: every reload starts with a normal game. */
export const DEBUG_FLAGS = {
  timeScale: 1,
  invincible: false,
  freezeStorm: false,
  showHitboxes: false,
};

/** Call after each sim step with the storm position from before that step. */
export function applyDebugFlags(state: SimState, stormBefore: number): void {
  if (DEBUG_FLAGS.invincible) {
    state.worm.health = SIM_CONFIG.maxHealth;
    state.worm.hunger = SIM_CONFIG.maxHunger;
    state.interior.breaches = 0;
  }
  if (DEBUG_FLAGS.freezeStorm) {
    state.apocalypseX = stormBefore;
  }
}
