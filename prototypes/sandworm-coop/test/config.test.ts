import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PLACEHOLDER_CONFIG, validateConfig} from '../src/config.ts';
import {tiny} from './fixtures.ts';

test('placeholder and tiny configs are valid', () => {
  assert.deepEqual(validateConfig(PLACEHOLDER_CONFIG), []);
  assert.deepEqual(validateConfig(tiny()), []);
});

test('food that can never fit the pit is refused', () => {
  assert.match(validateConfig(tiny({food: {...tiny().food, size: 2}})).join(), /acidCapacity/);
});

test('zero, fractional and unsafe jitter values are refused by name', () => {
  assert.match(validateConfig(tiny({walkTicks: 0})).join(), /walkTicks/);
  assert.match(validateConfig(tiny({drainPerTick: 1.5})).join(), /drainPerTick/);
  assert.match(validateConfig(tiny({intake: {firstArrivalTick: 0, meanGapTicks: 5, jitterTicks: 5}})).join(), /jitterTicks/);
});

test('start hunger above the maximum and carry percent above 100 are refused', () => {
  assert.match(validateConfig(tiny({hungerStart: 2001})).join(), /hungerStart/);
  assert.match(validateConfig(tiny({carry: {heavyMassFrom: 2, heavyPercent: 25, lightPercent: 101}})).join(), /lightPercent/);
});
