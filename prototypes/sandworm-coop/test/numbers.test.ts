import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PLACEHOLDER_CONFIG as P} from '../src/config.ts';
import {primaryGrid, renderSheet, sheet} from '../src/numbers.ts';

const gap = (meanGapTicks: number) => ({...P, intake: {...P.intake, meanGapTicks}});

test('placeholder haul cycle is 100 ticks and the point is ok', () => {
  assert.equal(sheet(P).haulCycleTicks, 100);
  assert.equal(sheet(P).verdict, 'ok');
});

test('arrival gap moves the verdict between overload, ok and starve', () => {
  assert.equal(sheet(gap(30)).verdict, 'overload');
  assert.equal(sheet(gap(80)).verdict, 'ok');
  assert.equal(sheet(gap(120)).verdict, 'starve');
});

test('one crew member cannot meet demand', () => {
  assert.equal(sheet({...P, crewCount: 1}).verdict, 'incapable');
});

test('primary grid has 162 points and meets the rung 0 pass condition', () => {
  assert.equal(primaryGrid(P).length, 162);
  const verdicts = new Set(primaryGrid(P).map(c => sheet(c).verdict));
  assert.ok(verdicts.has('ok') && verdicts.size > 1);
});

test('primary grid jitter is a third of the mean gap', () => {
  for (const c of primaryGrid(P)) assert.equal(c.intake.jitterTicks, Math.floor(c.intake.meanGapTicks / 3));
});

test('rendered sheet labels inputs, states the pass result and repeats exactly', () => {
  const text = renderSheet(P);
  assert.match(text, /PLACEHOLDER/);
  assert.match(text, /SOURCE/);
  assert.match(text, /Rung 0 pass condition: PASS/);
  assert.equal(renderSheet(P), text);
});
