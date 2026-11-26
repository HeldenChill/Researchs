// One tick of the space. The list below is the tick order (spec 5.5).
import {outcome} from './boundary.ts';
import {crewMotion} from './ops/crewMotion.ts';
import {digest} from './ops/digest.ts';
import {handle} from './ops/handle.ts';
import {hazardTick} from './ops/hazard.ts';
import {intake} from './ops/intake.ts';
import {metabolism} from './ops/metabolism.ts';
import {neglect} from './ops/neglect.ts';
import {seal} from './ops/seal.ts';
import type {Command, Config, SimEvent, SimState} from './types.ts';

type Operator = (s: SimState, c: Config, events: SimEvent[], commands: readonly Command[]) => void;

const TICK_ORDER: Operator[] = [intake, crewMotion, handle, seal, digest, neglect, metabolism, hazardTick];

export function step(s: SimState, c: Config, commands: readonly Command[]): {state: SimState; events: SimEvent[]} {
  if (outcome(s, c) !== 'running') throw new Error('the run has ended');
  const state = structuredClone(s);
  const events: SimEvent[] = [];
  for (const operator of TICK_ORDER) operator(state, c, events, commands);
  state.tick++;
  return {state, events};
}
