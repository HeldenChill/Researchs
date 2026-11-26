// mulberry32. The cursor is a uint32 so it can be saved with the state.
export function nextRandom(rng: number): {value: number; rng: number} {
  const next = (rng + 0x6d2b79f5) >>> 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return {value: (t ^ (t >>> 14)) >>> 0, rng: next};
}
