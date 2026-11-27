import { describe, it, expect } from 'vitest';
import { boxWorld } from '../src/box-world';
import { norm } from './golden-util';
import goldenData from './golden.json';
import {
  newPlayerState,
  stepPlayer,
  noEvents,
  DEFAULT_MOVE,
  STATE_KEYS,
  type PlayerState,
} from '../src/player';

describe('player golden replay', () => {
  const world = boxWorld([
    [2, 0, -6, 3, 1, -4],
    [-1, 0, -6, 1, 3, -5.5],
  ]);

  for (const sc of goldenData.scenarios) {
    it(`matches golden trace for ${sc.name}`, () => {
      const s = newPlayerState(sc.start[0]!, sc.start[1]!, sc.start[2]!);
      sc.inputs.forEach(([buttons, yaw], i) => {
        const input = { seq: i, buttons: buttons!, yaw: yaw!, pitch: 0, viewTick: 0 };
        const ev = stepPlayer(s, input, DEFAULT_MOVE, world, noEvents());
        expect(norm(STATE_KEYS.map(k => s[k as keyof PlayerState]))).toEqual(norm(sc.states[i]!));
        expect(ev).toEqual(sc.events[i]!);
      });
    });
  }
});
