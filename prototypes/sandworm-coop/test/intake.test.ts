import {test} from 'node:test';
import assert from 'node:assert/strict';
import {intake} from '../src/ops/intake.ts';
import {initialState} from '../src/state.ts';
import type {SimEvent} from '../src/types.ts';
import {tiny} from './fixtures.ts';
import {floor, item} from './helpers.ts';

test('an arrival adds one food at the mouth and schedules the next', () => {
  const s = initialState(tiny(), 1);
  const events: SimEvent[] = [];
  intake(s, tiny(), events);
  assert.deepEqual(s.items, [item(1, floor('mouth'))]);
  assert.equal(s.nextId, 2);
  assert.equal(s.nextArrivalTick, 100);
  assert.notEqual(s.rng, 1); // one draw even with jitter 0
  assert.deepEqual(events, [{tick: 0, kind: 'arrived', id: 1}]);

  s.tick = 1;
  intake(s, tiny(), events);
  assert.equal(s.items.length, 1);
});

test('gaps are whole numbers covering mean plus or minus jitter', () => {
  const c = tiny({intake: {firstArrivalTick: 0, meanGapTicks: 60, jitterTicks: 20}});
  const s = initialState(c, 1);
  const gaps: number[] = [];
  for (let i = 0; i < 1000; i++) {
    s.tick = s.nextArrivalTick;
    intake(s, c, []);
    gaps.push(s.nextArrivalTick - s.tick);
  }
  assert.ok(gaps.every(g => Number.isInteger(g) && g >= 40 && g <= 80));
  assert.ok(gaps.some(g => g <= 45));
  assert.ok(gaps.some(g => g >= 75));
});
