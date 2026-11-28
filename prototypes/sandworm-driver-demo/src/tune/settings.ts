import { DEFAULT_SIM_CONFIG, SIM_CONFIG, resetSimConfig } from '../sim/config.ts';
import { VIEW_CONFIG } from '../render/viewConfig.ts';

/** One row of the tuning popup. Pure data: ui/tuning.ts turns rows into lil-gui controls. */
export interface SettingRow {
  key: string;
  folder: string;
  label: string;
  min: number;
  max: number;
  step: number;
  help: string;
}

const row = (folder: string, key: string, label: string, min: number, max: number, step: number, help: string): SettingRow =>
  ({ folder, key, label, min, max, step, help });

export const SETTINGS: SettingRow[] = [
  row('Momentum', 'momentumBuildRate', 'Build rate', 5, 100, 1, 'How fast momentum fills while holding W underground. It snowballs: faster when already high. 31 fills from empty in about 3.5 s.'),
  row('Momentum', 'momentumMax', 'Maximum', 50, 200, 5, 'Size of the momentum meter. Speed goes from cruise at zero to top speed at maximum.'),
  row('Momentum', 'highMomentumThreshold', 'Break threshold', 10, 200, 1, 'Momentum needed to smash a tier 2 rock without grinding.'),
  row('Momentum', 'momentumBoostBuildMult', 'Boost build multiplier', 1, 4, 0.1, 'Build rate multiplier while boosting with Space.'),
  row('Momentum', 'momentumIdleLevel', 'Free rolling level', 0, 100, 1, 'Without W or S, momentum below this slowly rises up to it. Momentum above it is kept.'),
  row('Momentum', 'momentumReverseDrain', 'Brake drain per s', 0, 200, 5, 'Momentum lost per second while braking with S. Steering costs nothing.'),
  row('Momentum', 'momentumDigGain', 'Dig down gain per m', 0, 12, 0.25, 'Momentum gained for each metre dug downward underground.'),
  row('Momentum', 'momentumDigClimbCost', 'Dig up cost per m', 0, 12, 0.25, 'Momentum lost for each metre dug upward. Keep it near the dig gain, or weaving up and down farms free momentum.'),
  row('Momentum', 'momentumDiveGain', 'Dive gain per m', 0, 12, 0.25, 'Momentum gained for each metre fallen through the air.'),
  row('Momentum', 'momentumClimbCost', 'Climb cost per m', 0, 12, 0.25, 'Momentum lost for each metre risen through the air.'),

  row('Speed', 'baseSpeed', 'Base speed', 5, 50, 0.5, 'Speed before heart speed points are added.'),
  row('Speed', 'speedPerPoint', 'Speed per heart point', 0, 12, 0.5, 'Extra speed for each heart speed point.'),
  row('Speed', 'topSpeedScale', 'Top speed scale', 0.5, 2.5, 0.05, 'Multiplies base plus heart speed to get the speed at full momentum.'),
  row('Speed', 'cruiseFraction', 'Cruise fraction', 0.2, 1, 0.01, 'Speed at zero momentum, as a share of top speed. Lower makes momentum feel stronger.'),
  row('Speed', 'brakeSpeedFraction', 'Brake speed fraction', 0.1, 1, 0.01, 'Speed while braking with S, as a share of cruise. Braking also makes turns tighter.'),
  row('Speed', 'minSpeed', 'Minimum speed', 0, 20, 0.5, 'The worm never targets a speed below this.'),
  row('Speed', 'speedResponse', 'Speed response', 0.5, 12, 0.1, 'How quickly speed reaches its target. Lower feels heavier, higher feels snappier.'),
  row('Speed', 'overspeedDecay', 'Dive burst fade', 0.1, 8, 0.1, 'How quickly extra speed from a dive fades. Lower keeps the burst longer.'),
  row('Speed', 'boostMultiplier', 'Boost multiplier', 1, 3, 0.05, 'Target speed multiplier while boosting.'),
  row('Speed', 'boostHungerCost', 'Boost hunger cost', 0, 20, 0.2, 'Extra hunger lost per second while boosting.'),

  row('Steering and air', 'turnRate', 'Turn rate (rad per s)', 0.5, 8, 0.1, 'How fast A and D rotate the head and travel direction underground.'),
  row('Steering and air', 'turnHeaviness', 'Heaviness at full momentum', 0, 0.9, 0.01, 'Share of turn rate lost at full momentum, so a fast worm feels heavy.'),
  row('Steering and air', 'gravity', 'Gravity', 5, 60, 1, 'Fall acceleration in the air.'),
  row('Steering and air', 'slopeGravity', 'Gravity in sand', 0, 2, 0.05, 'Share of gravity that speeds the worm up digging down and slows it digging up. 0 turns it off.'),
  row('Steering and air', 'airDrag', 'Air drag', 0, 2, 0.05, 'Forward speed lost in the air.'),
  row('Steering and air', 'airTurnRate', 'Air turn rate (rad per s)', 0, 6, 0.1, 'How fast A and D rotate the head and flight direction in the air. 0 gives a pure ballistic jump.'),
  row('Steering and air', 'airThrottle', 'Air throttle', 0, 30, 0.5, 'How much W adds or S removes speed along the flight direction in the air.'),
  row('Steering and air', 'maxDepth', 'Depth limit (m)', -60, -6, 1, 'Lowest the worm can dig. It levels out just above this.'),
  row('Steering and air', 'maxAltitude', 'Height limit (m)', 5, 50, 1, 'Highest the worm can jump.'),
  row('Steering and air', 'impactSpeedThreshold', 'Hard landing speed', 5, 60, 1, 'Falling faster than this into the sand shakes the crew and can open a breach.'),

  row('Collision', 'headRadius', 'Head radius', 0.5, 5, 0.1, 'Size of the worm head for rocks and food.'),
  row('Collision', 'softHitSpeed', 'Soft hit speed', 0, 50, 1, 'Hitting a too-hard rock faster than this bounces and shakes. Slower just rests against it.'),
  row('Collision', 'hitRestitution', 'Bounce strength', 0, 1.5, 0.05, 'How much of the hit speed comes back as recoil.'),
  row('Collision', 'hitShake', 'Crew shake on hit', 0, 1, 0.05, 'Shake sent inside on a hard hit. 0.45 or more opens a breach.'),
  row('Collision', 'hitRecoilTime', 'Recoil time (s)', 0, 2, 0.05, 'How long steering is locked after a hard hit.'),
  row('Collision', 'hitRecoilDamping', 'Recoil damping', 0, 20, 0.5, 'How quickly the bounce dies out.'),
  row('Collision', 'hitMomentumKeep', 'Momentum kept on hit', 0, 1, 0.05, 'Share of momentum left after a hard hit.'),
  row('Collision', 'blockedMomentumDrain', 'Pushing drain per s', 0, 200, 5, 'Momentum lost per second while pushing against a rock.'),
  row('Collision', 'gnawDuration', 'Grind time (s)', 0.1, 5, 0.05, 'Time to grind through a tier 2 rock with no momentum.'),
  row('Collision', 'gnawMomentumSpeedup', 'Momentum grind speedup', 0, 0.95, 0.05, 'Share of grind time removed when momentum is near the break threshold.'),
  row('Collision', 'gnawSinkDepth', 'Grind sink depth (m)', 0, 4, 0.1, 'How far the head sinks into the rock while grinding.'),

  row('Visual feel', 'segmentGap', 'Segment gap', 0.6, 3, 0.05, 'Distance between body segments.'),
  row('Visual feel', 'squashAmount', 'Squash on impact', 0, 0.8, 0.01, 'How much the head and body flatten on a hit.'),
  row('Visual feel', 'compressAmount', 'Body compression', 0, 0.8, 0.01, 'How much segments bunch together after a hit.'),
  row('Visual feel', 'compressDelayPerSegment', 'Wave delay per segment (s)', 0, 0.15, 0.005, 'Delay before the hit wave reaches the next segment. Longer shows the wave travelling more.'),
  row('Visual feel', 'cameraStiffness', 'Camera stiffness', 1, 30, 0.5, 'How tightly the camera follows. Lower floats more.'),
  row('Visual feel', 'cameraLead', 'Camera lead (m)', -5, 25, 0.5, 'How far ahead of the head the camera looks.'),
  row('Visual feel', 'cameraShake', 'Camera shake', 0, 4, 0.1, 'Strength of screen shake on hits and grinding. 0 turns it off.'),
  row('Visual feel', 'dustAmount', 'Dust amount', 0, 3, 0.1, 'How many sand and rock chips fly on impacts.'),

  row('Visual feel', 'undergroundGlow', 'Worm light underground', 0, 3, 0.1, 'Strength of the warm light on the ground around the worm head. 0 turns it off.'),

  row('Run', 'goalX', 'Goal distance (m)', 100, 12000, 100, 'Distance to the safe pocket. Level content repeats every 600 m up to it; applies on restart.'),
  row('Run', 'apocalypseSpeedStart', 'Storm speed, phase 1', 0, 50, 0.5, 'Storm speed while it is in the first part of the run.'),
  row('Run', 'apocalypseSpeedMid', 'Storm speed, phase 2', 0, 50, 0.5, 'Storm speed in the middle part of the run.'),
  row('Run', 'apocalypseSpeedEnd', 'Storm speed, phase 3', 0, 50, 0.5, 'Storm speed in the last part, near the goal.'),
  row('Run', 'apocalypsePhase2At', 'Phase 2 starts at', 0, 1, 0.05, 'Share of the goal distance the storm must reach before phase 2.'),
  row('Run', 'apocalypsePhase3At', 'Phase 3 starts at', 0, 1, 0.05, 'Share of the goal distance the storm must reach before phase 3.'),
  row('Run', 'apocalypseStartX', 'Storm start (m)', -300, -10, 5, 'Where the storm wall starts. Applies on restart.'),

  row('Body and crew', 'maxHealth', 'Max health', 10, 500, 10, 'Full health. Applies fully on restart.'),
  row('Body and crew', 'maxHunger', 'Max hunger', 10, 500, 10, 'Full hunger meter. Applies fully on restart.'),
  row('Body and crew', 'acidCapacity', 'Acid slots', 1, 8, 1, 'How many items can digest at the same time.'),
  row('Body and crew', 'breachDps', 'Damage per breach', 0, 30, 0.5, 'Health lost per second for each open breach.'),
  row('Body and crew', 'crewCarryTime', 'Crew carry time (s)', 0.2, 10, 0.1, 'Time for the crew to move one item into the acid.'),
  row('Body and crew', 'crewSealTime', 'Crew seal time (s)', 0.2, 15, 0.1, 'Time for the crew to seal one breach.'),
  row('Body and crew', 'hungerBaseDrain', 'Hunger drain per s', 0, 10, 0.1, 'Hunger always lost per second.'),
  row('Body and crew', 'hungerDrainPerSpeedPt', 'Drain per speed point', 0, 3, 0.05, 'Extra hunger lost per second for each heart speed point.'),
  row('Body and crew', 'regenPerPoint', 'Heal per regen point', 0, 10, 0.1, 'Health healed per second for each heart regen point.'),

  row('Prey', 'trailSampleSpacing', 'Trail sample spacing (m)', 0.1, 2, 0.05, 'Distance between recorded head samples along each worm path.'),
  row('Prey', 'segmentSpacing', 'Segment spacing (m)', 0.5, 5, 0.1, 'Arc distance between adjacent body segments.'),
  row('Prey', 'playerSegments', 'Player segments', 2, 16, 1, 'Number of segments in the player worm body.'),
  row('Prey', 'playerSegmentRadius', 'Player segment radius (m)', 0.5, 4, 0.1, 'Collision radius of each player body segment.'),
  row('Prey', 'preySegments', 'Prey segments', 1, 12, 1, 'Starting number of segments for each prey worm.'),
  row('Prey', 'preySegmentRadius', 'Prey segment radius (m)', 0.3, 3, 0.1, 'Collision and visual radius of each prey segment.'),
  row('Prey', 'preySpeed', 'Prey speed (m/s)', 0, 50, 0.5, 'Base flee speed of prey worms.'),
  row('Prey', 'preyTurnRate', 'Prey turn rate (rad/s)', 0.5, 10, 0.1, 'Maximum steering rate of prey worms.'),
  row('Prey', 'fleeRadius', 'Flee radius (m)', 5, 100, 1, 'Distance at which wandering prey starts fleeing.'),
  row('Prey', 'lungeRadius', 'Lunge radius (m)', 1, 30, 0.5, 'Distance within which side-on prey can lunge.'),
  row('Prey', 'lungeAngle', 'Lunge angle (rad)', 0, 3.1, 0.05, 'Minimum off-nose angle required for prey to lunge.'),
  row('Prey', 'lungeDuration', 'Lunge duration (s)', 0.2, 5, 0.1, 'Maximum time a prey lunge lasts before fleeing again.'),
  row('Prey', 'latchDuration', 'Latch duration (s)', 0.5, 15, 0.5, 'Time before a latched prey lets go on its own.'),
  row('Prey', 'latchWiggleForce', 'Latch wiggle force', 0, 5, 0.05, 'Amplitude of the wiggle force applied while latched.'),
  row('Prey', 'latchWiggleFreq', 'Latch wiggle freq (Hz)', 0.2, 8, 0.1, 'Oscillation frequency of a latched prey wiggle.'),
  row('Prey', 'latchTurnGain', 'Latch turn gain', 0, 1000, 0.1, 'How strongly a latched prey pushes player heading.'),
  row('Prey', 'latchMomentumDrain', 'Latch momentum drain', 0, 100, 1, 'Momentum lost per second while a prey is latched.'),
  row('Prey', 'shakeOffBrake', 'Shake off brake', 1, 100, 1, 'Momentum drop while braking needed to shake off a latched prey.'),
  row('Prey', 'recoverTime', 'Prey recover time (s)', 0, 10, 0.1, 'Cooldown after escaping a latch before fleeing again.'),
  row('Prey', 'preyBurstTime', 'Prey burst time (s)', 0, 5, 0.1, 'Speed burst duration after losing a body section.'),
  row('Prey', 'preyCount', 'Prey count', 0, 4, 1, 'Prey per 600 m block (repeats along the run). Only takes effect on restart.'),
  row('Prey', 'preyYieldPerSection', 'Prey hunger per section', 0, 50, 1, 'Hunger restored for each digested prey section.'),
];

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const STORE_KEY = 'sandworm-driver.tuning.v1';

type Bag = Record<string, number>;

const DEFAULTS: Bag = { ...DEFAULT_SIM_CONFIG, ...VIEW_CONFIG };

/** The live object that owns a key. */
export function targetOf(key: string): Bag {
  return (key in VIEW_CONFIG ? VIEW_CONFIG : SIM_CONFIG) as unknown as Bag;
}

export function valueOf(key: string): number {
  return targetOf(key)[key]!;
}

/** Take values from untrusted data: known keys, finite numbers, clamped to the row range. */
export function applyValues(values: Record<string, unknown>): void {
  for (const s of SETTINGS) {
    const v = values[s.key];
    if (typeof v !== 'number' || !Number.isFinite(v)) continue;
    targetOf(s.key)[s.key] = Math.max(s.min, Math.min(s.max, v));
  }
}

/** Only values that differ from the defaults, so later default changes still reach the player. */
export function changedValues(): Bag {
  const out: Bag = {};
  for (const s of SETTINGS) {
    if (valueOf(s.key) !== DEFAULTS[s.key]) out[s.key] = valueOf(s.key);
  }
  return out;
}

export function exportValues(): string {
  return JSON.stringify(changedValues(), null, 2);
}

export function resetValues(): void {
  resetSimConfig();
  for (const key of Object.keys(VIEW_CONFIG)) targetOf(key)[key] = DEFAULTS[key]!;
}

export function saveValues(store: KeyValueStore | null): void {
  try {
    store?.setItem(STORE_KEY, JSON.stringify(changedValues()));
  } catch {
    /* storage full or blocked: keep playing */
  }
}

export function loadValues(store: KeyValueStore | null): void {
  try {
    const parsed: unknown = JSON.parse(store?.getItem(STORE_KEY) ?? 'null');
    if (parsed && typeof parsed === 'object') applyValues(parsed as Record<string, unknown>);
  } catch {
    /* broken data or blocked storage: use defaults */
  }
}

export function clearValues(store: KeyValueStore | null): void {
  try {
    store?.removeItem(STORE_KEY);
  } catch {
    /* ignore */
  }
}
