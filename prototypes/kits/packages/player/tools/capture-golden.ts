import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  newPlayerState,
  stepPlayer,
  noEvents,
  DEFAULT_MOVE,
  Btn,
  STATE_KEYS,
  type PlayerState,
  type TickEvents,
  type MoveStats,
} from '../../../../FishingGame/packages/core/src/character/player.ts';
import { boxWorld } from '../src/box-world.ts';

interface ScenarioDef {
  name: string;
  start: [number, number, number];
  linePull?: { bx: number; bz: number; ten: number };
  inputs: Array<[number, number]>;
}

const world = boxWorld([
  [2, 0, -6, 3, 1, -4],
  [-1, 0, -6, 1, 3, -5.5],
]);

function rep(n: number, buttons: number, yaw = 0): Array<[number, number]> {
  return Array.from({ length: n }, () => [buttons, yaw]);
}

const goldenScenarios: ScenarioDef[] = [
  {
    name: 'walk-into-wall',
    start: [0, 0, 0],
    inputs: rep(120, Btn.Fwd),
  },
  {
    name: 'sprint-into-wall',
    start: [0, 0, 0],
    inputs: rep(120, Btn.Fwd | Btn.Sprint),
  },
  {
    name: 'slide',
    start: [0, 8, 0],
    inputs: [
      ...rep(60, Btn.Fwd | Btn.Sprint),
      ...rep(1, Btn.Fwd | Btn.Sprint | Btn.Crouch),
      ...rep(40, Btn.Fwd | Btn.Sprint),
    ],
  },
  {
    name: 'jump',
    start: [0, 8, 0],
    inputs: [
      ...rep(10, Btn.Fwd),
      ...rep(1, Btn.Fwd | Btn.Jump),
      ...rep(60, Btn.Fwd),
    ],
  },
  {
    name: 'mantle',
    start: [2.5, -2, 0],
    inputs: [
      ...rep(30, Btn.Fwd),
      ...rep(1, Btn.Fwd | Btn.Jump),
      ...rep(60, Btn.Fwd),
    ],
  },
  {
    name: 'prone',
    start: [0, 8, 0],
    inputs: [
      ...rep(1, Btn.Prone),
      ...rep(60, Btn.Fwd),
    ],
  },
  {
    name: 'crouch-toggle',
    start: [0, 8, 0],
    inputs: [
      ...rep(1, Btn.CrouchToggle),
      ...rep(60, Btn.Fwd),
    ],
  },
  {
    name: 'turning',
    start: [0, 8, 0],
    inputs: Array.from({ length: 120 }, (_, i) => [Btn.Fwd | Btn.Right, i * 0.02]),
  },
];

const linePullScenarios: ScenarioDef[] = [
  {
    name: 'linepull-forward',
    start: [0, 0, 0],
    linePull: { bx: 0, bz: -20, ten: 0.7 },
    inputs: [
      ...rep(60, Btn.Fwd),
      ...rep(30, 0),
      ...rep(30, Btn.Fwd),
    ],
  },
  {
    name: 'linepull-back',
    start: [0, 0, 0],
    linePull: { bx: 0, bz: -20, ten: 0.7 },
    inputs: rep(120, Btn.Back),
  },
];

function runScenarios(defs: ScenarioDef[]) {
  return defs.map(sc => {
    const s = newPlayerState(sc.start[0], sc.start[1], sc.start[2]);
    const stats: MoveStats = sc.linePull ? { ...DEFAULT_MOVE, linePull: sc.linePull } : DEFAULT_MOVE;
    const states: number[][] = [];
    const events: TickEvents[] = [];

    sc.inputs.forEach(([buttons, yaw], i) => {
      const input = { seq: i, buttons, yaw, pitch: 0, viewTick: 0 };
      const ev = stepPlayer(s, input, stats, world, noEvents());
      states.push(STATE_KEYS.map(k => s[k as keyof PlayerState]));
      events.push(ev);
    });

    return {
      name: sc.name,
      start: sc.start,
      ...(sc.linePull ? { linePull: sc.linePull } : {}),
      inputs: sc.inputs,
      states,
      events,
    };
  });
}

const goldenData = { scenarios: runScenarios(goldenScenarios) };
const linePullData = { scenarios: runScenarios(linePullScenarios) };

const goldenPath = fileURLToPath(new URL('../test/golden.json', import.meta.url));
const linePullPath = fileURLToPath(
  new URL('../../../../FishingGame/packages/core/test/fixtures/line-pull-golden.json', import.meta.url)
);

fs.mkdirSync(path.dirname(goldenPath), { recursive: true });
fs.writeFileSync(goldenPath, JSON.stringify(goldenData));
console.log(`Wrote ${goldenData.scenarios.length} scenarios to ${goldenPath}`);

fs.mkdirSync(path.dirname(linePullPath), { recursive: true });
fs.writeFileSync(linePullPath, JSON.stringify(linePullData));
console.log(`Wrote ${linePullData.scenarios.length} scenarios to ${linePullPath}`);

const walk = goldenData.scenarios.find(s => s.name === 'walk-into-wall')!;
const lastState = walk.states[walk.states.length - 1]!;
const zIndex = STATE_KEYS.indexOf('z');
console.log(`walk-into-wall final z: ${lastState[zIndex]}`);
