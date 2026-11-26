import {test} from 'node:test';
import assert from 'node:assert/strict';
import {hazardTick} from '../src/ops/hazard.ts';
import {metabolism} from '../src/ops/metabolism.ts';
import {tiny} from './fixtures.ts';
import {breach, setup} from './helpers.ts';

test('hunger drains and stops at zero', () => {
  for (const [start, end] of [[500, 490], [5, 0]]) {
    const s = setup(tiny(), {hunger: start});
    metabolism(s, tiny(), []);
    assert.equal(s.hunger, end);
  }
});

test('each breach costs health and health stops at zero', () => {
  for (const [start, count, end] of [[1000, 2, 986], [1000, 0, 1000], [5, 1, 0]]) {
    const s = setup(tiny(), {health: start, breaches: Array.from({length: count}, (_, i) => breach(i + 1))});
    hazardTick(s, tiny(), []);
    assert.equal(s.health, end);
  }
});
