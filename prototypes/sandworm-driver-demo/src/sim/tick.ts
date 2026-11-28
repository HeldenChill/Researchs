import { HEART_PRESETS, SIM_CONFIG } from './config.ts';
import { stepMotion } from './motion.ts';
import { bitePrey, pushPlayerTrail, stepLatch, stepPrey } from './prey.ts';
import { stepBite } from './bite.ts';
import { stepInteriorAndBody } from './interior.ts';
import type { DriverInput, MatchOutcome, SimState } from './types.ts';

export function checkOutcome(state: SimState): MatchOutcome {
  if (state.worm.x >= SIM_CONFIG.goalX) return 'win';
  if (state.worm.health <= 0) return 'loss_health';
  if (state.worm.hunger <= 0) return 'loss_hunger';
  if (state.apocalypseX >= state.worm.x) return 'loss_apocalypse';
  return 'playing';
}

export function stepSim(state: SimState, input: DriverInput, dt: number): void {
  if (state.outcome !== 'playing') return;

  if (input.preset && input.preset !== state.worm.preset) {
    state.worm.preset = input.preset;
    state.worm.heart = { ...HEART_PRESETS[input.preset] };
  }

  state.time += dt;
  stepMotion(state, input, dt);
  stepLatch(state, input, dt);
  pushPlayerTrail(state);
  stepPrey(state, dt);
  bitePrey(state);
  stepBite(state, dt);
  stepInteriorAndBody(state, input, dt);

  // O25 Apocalypse wall advances steadily
  state.apocalypseX += SIM_CONFIG.apocalypseSpeed * dt;

  state.outcome = checkOutcome(state);
}
