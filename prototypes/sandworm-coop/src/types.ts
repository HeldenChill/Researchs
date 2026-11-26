export type Spot = 'mouth' | 'acid';
export type FoodRow = {id: string; mass: number; size: number; digestTicks: number; yieldHunger: number};
export type Config = {
  crewCount: number; walkTicks: number; acidCapacity: number; neglectLimitTicks: number; sealWorkTicks: number;
  drainPerTick: number; breachDamagePerTick: number; hungerStart: number; hungerMax: number; healthMax: number;
  timeLimitTicks: number;
  food: FoodRow;
  carry: {heavyMassFrom: number; heavyPercent: number; lightPercent: number};
  intake: {firstArrivalTick: number; meanGapTicks: number; jitterTicks: number};
};
export type Place = {kind: 'floor'; spot: Spot} | {kind: 'held'; crew: number} | {kind: 'acid'};
export type Item = {id: number; row: string; place: Place; ageTicks: number; progressTicks: number};
export type Breach = {id: number; spot: Spot; sealTicks: number};
export type CrewPos = {kind: 'at'; spot: Spot} | {kind: 'walking'; to: Spot; left: number};
export type Crew = {id: number; pos: CrewPos};
export type SimState = {
  tick: number; seed: number; rng: number; nextId: number; nextArrivalTick: number;
  hunger: number; health: number; items: Item[]; breaches: Breach[]; crew: Crew[];
};
export type Command = {kind: 'wait'} | {kind: 'move'; to: Spot} | {kind: 'pick'; itemId: number}
  | {kind: 'drop'} | {kind: 'seal'; breachId: number};
export type SimEvent = {
  tick: number; kind: 'arrived' | 'picked' | 'dropped' | 'acidFull' | 'digested' | 'breached' | 'sealed' | 'rejected';
  id?: number; crew?: number;
};
export type Outcome = 'running' | 'survived' | 'lost_health' | 'lost_hunger';
