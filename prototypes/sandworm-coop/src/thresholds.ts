// Pre-registered numbers (spec section 7). The values live in thresholds.json.
export type Thresholds = {
  version: 1; approvedBy: string | null; approvedOn: string | null;
  warmupTicks: 600; seeds: 20; agree: 16; runawayGrowth: 2; runawayLoadPerCrew: 4; idleAbove: 0.6;
  idleBelowBounded: 0.15; boundedLoadPerCrew: 2; boundedGrowth: 1; p1Connected: 3; p2Share: 0.7; p3High: 0.8;
  p3Low: 0.2; p3Ratio: 1.25; p3Lines: 2; v1Start: 20000; v1Reach: 50000;
};

export function assertApproved(t: Thresholds): void {
  if (!t.approvedBy || !t.approvedOn) throw new Error('thresholds not approved');
}
