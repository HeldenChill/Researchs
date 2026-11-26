import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sealFirst} from '../src/bots.ts';
import {PLACEHOLDER_CONFIG as P} from '../src/config.ts';
import {classify, growth, p95, pointClass, runOne, type RunClass, type RunMetrics} from '../src/metrics.ts';
import {assertApproved, type Thresholds} from '../src/thresholds.ts';
import {tiny} from './fixtures.ts';

const file = JSON.parse(readFileSync(new URL('../thresholds.json', import.meta.url), 'utf8')) as Thresholds;

// The pre-registered numbers (spec section 7). Approval fields belong to the owner and are not checked here.
test('thresholds file holds the pre-registered numbers', () => {
  const {approvedBy: _by, approvedOn: _on, _comment, ...numbers} = file as Thresholds & {_comment?: string};
  assert.deepEqual(numbers, {
    version: 1, warmupTicks: 600, seeds: 20, agree: 16, runawayGrowth: 2, runawayLoadPerCrew: 4, idleAbove: 0.6,
    idleBelowBounded: 0.15, boundedLoadPerCrew: 2, boundedGrowth: 1, p1Connected: 3, p2Share: 0.7, p3High: 0.8,
    p3Low: 0.2, p3Ratio: 1.25, p3Lines: 2, v1Start: 20000, v1Reach: 50000,
  });
});

test('p95 is the nearest-rank percentile', () => {
  assert.equal(p95([...Array(20).keys()]), 18);
  assert.equal(p95([...Array(20).keys()].reverse()), 18);
});

test('growth is last third minus first third', () => {
  assert.equal(growth([0, 0, 0, 1, 1, 1, 3, 3, 3]), 3);
  assert.equal(growth([5, 9]), 0);
});

const base: RunMetrics =
  {outcome: 'survived', ticks: 6000, idleShare: 0.3, p95Load: 6, growth: 1, digested: 0, breached: 0, maxHunger: 0};

const cases: [Partial<RunMetrics>, RunClass][] = [
  [{}, 'bounded'],
  [{outcome: 'lost_health'}, 'runaway'],
  [{growth: 3}, 'runaway'],
  [{p95Load: 13}, 'runaway'],
  [{idleShare: 0.7}, 'idle'],
  [{idleShare: 0.15}, 'bounded'],
  [{idleShare: 0.6}, 'bounded'],
  [{idleShare: 0.1}, 'strained'],
  [{p95Load: 7}, 'strained'],
  [{growth: 1.5}, 'strained'],
  [{outcome: 'lost_hunger'}, 'strained'],
];
for (const [change, expected] of cases) {
  test(`run with ${JSON.stringify(change)} is ${expected}`, () => {
    assert.equal(classify({...base, ...change}, 3, file), expected);
  });
}

test('a grid point needs sixteen of twenty seeds to agree', () => {
  const mix = (bounded: number): RunClass[] =>
    [...Array<RunClass>(bounded).fill('bounded'), ...Array<RunClass>(20 - bounded).fill('idle')];
  assert.equal(pointClass(mix(16), file), 'bounded');
  assert.equal(pointClass(mix(15), file), 'mixed');
});

test('approval needs both fields filled', () => {
  const signed = {approvedBy: 'owner', approvedOn: '2026-11-26'};
  for (const missing of [{approvedBy: null}, {approvedOn: null}, {approvedBy: ''}]) {
    assert.throws(() => assertApproved({...file, ...signed, ...missing}), /thresholds not approved/);
  }
  assert.doesNotThrow(() => assertApproved({...file, ...signed}));
});

// tiny: idle on step 1. Work on steps 2 to 9: pick, four moves, drop on step 7, then the walk back on
// steps 8 and 9 while the food digests. Idle on steps 10 to 20. So 12 of 20 crew-ticks are idle.
// The arrived food is on the floor only after step 1. The meal on step 9 leaves hunger 1410.
test('a hand-checked short run gives the expected metrics', () => {
  const m = runOne(tiny({timeLimitTicks: 20}), 1, sealFirst, file);
  assert.deepEqual(m, {outcome: 'survived', ticks: 20, idleShare: 0.6, p95Load: 0, growth: -1 / 6,
    digested: 1, breached: 0, maxHunger: 1410});
});

test('measures start after warm-up when the run is long enough', () => {
  const m = runOne(tiny({timeLimitTicks: 20}), 1, sealFirst, {...file, warmupTicks: 11} as unknown as Thresholds);
  assert.deepEqual([m.idleShare, m.growth, m.digested], [1, 0, 1]);
});

test('the same seed gives the same metrics', () => {
  assert.deepEqual(runOne(P, 3, sealFirst, file), runOne(P, 3, sealFirst, file));
});
