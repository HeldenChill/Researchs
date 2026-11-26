import {initialState} from '../src/state.ts';
import type {Breach, Config, CrewPos, Item, Place, SimState, Spot} from '../src/types.ts';

export const floor = (spot: Spot): Place => ({kind: 'floor', spot});
export const held = (crew: number): Place => ({kind: 'held', crew});
export const acid: Place = {kind: 'acid'};
export const at = (spot: Spot): CrewPos => ({kind: 'at', spot});
export const walking = (to: Spot, left: number): CrewPos => ({kind: 'walking', to, left});

export const item = (id: number, place: Place, over: Partial<Item> = {}): Item =>
  ({id, row: 'meat', place, ageTicks: 0, progressTicks: 0, ...over});

export const breach = (id: number, spot: Spot = 'mouth', sealTicks = 0): Breach => ({id, spot, sealTicks});

// A start state with chosen contents; no arrival unless a test asks for one.
export function setup(c: Config, over: Partial<SimState> = {}): SimState {
  return {...initialState(c, 1), nextArrivalTick: 999, nextId: 100, ...over};
}
