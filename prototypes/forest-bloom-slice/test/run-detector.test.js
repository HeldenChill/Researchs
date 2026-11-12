import test from 'node:test';
import assert from 'node:assert/strict';
import { formatRevision } from '../tools/run-detector.js';

test('revision is marked dirty when the tree has uncommitted changes', () => {
  assert.equal(formatRevision('abc1234', ''), 'abc1234');
  assert.equal(formatRevision('abc1234', ' M src/config.js\n'), 'abc1234-dirty');
});
