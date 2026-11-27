import { describe, it, expect } from 'vitest';
import { boxWorld } from '../src/box-world';

describe('box-world', () => {
  it('blocked by wall', () => {
    const w = boxWorld([[-1, 0, -6, 1, 3, -5.5]]);
    expect(w.blocked(0, -5.4, 0.35, 0.26, 1.85)).toBe(true);
    expect(w.blocked(0, -4, 0.35, 0.26, 1.85)).toBe(false);
  });

  it('support picks highest reachable top', () => {
    const w = boxWorld([[0, 0, 0, 1, 1, 1], [0, 0, 0, 1, 2, 1]]);
    expect(w.support(0.5, 0.5, 1.5)).toBe(1);
    expect(w.support(0.5, 0.5, 3)).toBe(2);
    expect(w.support(5, 5, 3)).toBe(0);
  });
});
