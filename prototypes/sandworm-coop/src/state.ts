import type {Config, Item, SimState} from './types.ts';

export function initialState(c: Config, seed: number): SimState {
  return {
    tick: 0,
    seed,
    rng: seed >>> 0,
    nextId: 1,
    nextArrivalTick: c.intake.firstArrivalTick,
    hunger: c.hungerStart,
    health: c.healthMax,
    items: [],
    breaches: [],
    crew: Array.from({length: c.crewCount}, (_, id) => ({id, pos: {kind: 'at', spot: 'mouth'}})),
  };
}

// Derived values: calculated from state and config, never stored.
export function heldItem(s: SimState, crew: number): Item | undefined {
  return s.items.find(i => i.place.kind === 'held' && i.place.crew === crew);
}

export function acidUsed(s: SimState, c: Config): number {
  return s.items.filter(i => i.place.kind === 'acid').length * c.food.size;
}

export function carryPercent(c: Config, mass: number): number {
  return mass >= c.carry.heavyMassFrom ? c.carry.heavyPercent : c.carry.lightPercent;
}
