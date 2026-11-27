import type { ImpactKind, WormState } from './types.ts';

/** One-way message to the renderer. A counter, so no event is lost between frames. */
export function recordImpact(w: WormState, kind: ImpactKind, strength: number, x: number, y: number): void {
  w.impact = { seq: w.impact.seq + 1, kind, strength, x, y };
}
